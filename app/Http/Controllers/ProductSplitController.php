<?php
// app/Http/Controllers/ProductSplitController.php
// SALIN SELURUH isi file ini dan ganti file yang lama.
//
// Perubahan dari versi sebelumnya:
// - Method store() sekarang menggunakan $validated['qty_from'] untuk
//   mengurangi stok produk induk, bukan lagi sum dari semua result quantities.
// - Method create() menerima ?product_id dari URL untuk pre-fill form.

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductSplitRequest;
use App\Models\Product;
use App\Models\ProductSplit;
use App\Models\ProductSplitItem;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductSplitController extends Controller
{
    /**
     * History semua transaksi pemecahan produk.
     */
    public function index()
    {
        $splitsPaginated = ProductSplit::query()
            ->with(['parentProduct', 'splitItems.resultProduct'])
            ->latest('created_at')
            ->paginate(15);

        $formattedSplits = $splitsPaginated->map(function ($split) {
            return [
                'id'             => $split->id,
                'tanggal'        => $split->created_at->format('d/m/Y H:i'),
                'waktu_lalu'     => $split->created_at->diffForHumans(),
                'produk_induk'   => $split->parentProduct->product_name,
                // stok_berkurang sekarang disimpan di kolom qty_from di product_splits
                'stok_berkurang' => $split->qty_from,
                'produk_hasil'   => $split->splitItems
                    ->map(fn($item) => $item->resultProduct->product_name)
                    ->join(', '),
                'stok_bertambah' => $split->splitItems->sum('quantity'),
                'keterangan'     => $split->note ?? '-',
            ];
        });

        return Inertia::render('product-split/index', [
            'title'  => 'History Pecah Produk',
            'splits' => $formattedSplits,
        ]);
    }

    /**
     * Form membuat pemecahan produk baru.
     * Menerima ?product_id=X untuk pre-fill produk induk (dari tombol Pecah).
     */
    public function create()
    {
        $products = Product::query()
            ->select('id', 'product_name', 'stock', 'selling_price')
            // ->where('stock', '>', 0)
            ->get();

        $selectedProductId = request()->integer('product_id', 0);
        $selectedProduct   = $selectedProductId > 0
            ? Product::select('id', 'product_name', 'stock', 'selling_price')->find($selectedProductId)
            : null;

        return Inertia::render('product-split/create', [
            'products'        => $products,
            'title'           => 'Pecah Produk',
            'selectedProduct' => $selectedProduct,
        ]);
    }

    /**
     * Simpan transaksi pemecahan produk.
     *
     * LOGIKA STOK:
     * - Produk induk berkurang sebesar qty_from (bukan sum of split_items.quantity)
     * - Setiap produk hasil bertambah sesuai quantity-nya masing-masing
     * Contoh: 1 Dimsum 100 (qty_from=1) → 1 Dimsum 50 + 2 Dimsum 25
     * Dimsum 100: -1, Dimsum 50: +1, Dimsum 25: +2
     */
    public function store(StoreProductSplitRequest $request)
    {
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            // Buat record ProductSplit (termasuk qty_from)
            $split = ProductSplit::create([
                'product_id_from' => $validated['product_id_from'],
                'qty_from'        => $validated['qty_from'],
                'note'            => $validated['note'] ?? null,
            ]);

            // Ambil produk induk
            $parentProduct = Product::findOrFail($validated['product_id_from']);

            // Proses setiap produk hasil
            foreach ($validated['split_items'] as $item) {
                ProductSplitItem::create([
                    'product_split_id' => $split->id,
                    'product_id_to'    => $item['product_id_to'],
                    'quantity'         => $item['quantity'],
                    // Gunakan harga jual produk hasil yang sudah ada di DB
                    'selling_price'    => Product::find($item['product_id_to'])->selling_price ?? 0,
                ]);

                // Tambah stok produk hasil
                Product::findOrFail($item['product_id_to'])->increment('stock', $item['quantity']);
            }

            // Kurangi stok produk induk sebesar qty_from (BUKAN sum of result quantities)
            $parentProduct->decrement('stock', $validated['qty_from']);

            DB::commit();

            return redirect()->route('product-split.show', $split->id)
                ->with('success', "Produk '{$parentProduct->product_name}' berhasil dipecah!");
        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->withInput()
                ->withErrors(['message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    /**
     * Detail satu transaksi pemecahan.
     */
    public function show(ProductSplit $productSplit)
    {
        $split = $productSplit->load(['parentProduct', 'splitItems.resultProduct']);

        // qty_from: berapa unit induk yang berkurang (disimpan di tabel product_splits)
        $qtyFrom = $split->qty_from ?? $split->splitItems->sum('quantity');

        $formattedData = [
            'id'                => $split->id,
            'tanggal_pemecahan' => $split->created_at->format('d F Y'),
            'waktu_pemecahan'   => $split->created_at->format('H:i:s'),
            'waktu_lalu'        => $split->created_at->diffForHumans(),
            'produk_induk'      => [
                'id'            => $split->parentProduct->id,
                'product_name'  => $split->parentProduct->product_name,
                'harga_jual'    => $split->parentProduct->selling_price,
                'image'         => $split->parentProduct->image,
                'stok_berkurang' => $qtyFrom,
            ],
            'produk_hasil' => $split->splitItems->map(function ($item) {
                return [
                    'id'            => $item->resultProduct->id,
                    'product_name'  => $item->resultProduct->product_name,
                    'harga_jual'    => $item->selling_price,
                    'image'         => $item->resultProduct->image,
                    'stok_bertambah' => $item->quantity,
                ];
            })->toArray(),
            'note' => $split->note,
        ];

        // Tabel ringkasan perubahan stok
        $stockSummary = [];

        // Baris produk induk
        $stockSummary[] = [
            'product_name' => $split->parentProduct->product_name,
            'stok_awal'    => $split->parentProduct->stock + $qtyFrom,
            'perubahan'    => '-' . $qtyFrom,
            'stok_akhir'   => $split->parentProduct->stock,
        ];

        // Baris setiap produk hasil
        foreach ($split->splitItems as $item) {
            $stockSummary[] = [
                'product_name' => $item->resultProduct->product_name,
                'stok_awal'    => $item->resultProduct->stock - $item->quantity,
                'perubahan'    => '+' . $item->quantity,
                'stok_akhir'   => $item->resultProduct->stock,
            ];
        }

        return Inertia::render('product-split/show', [
            'split'        => $formattedData,
            'stockSummary' => $stockSummary,
        ]);
    }
}
