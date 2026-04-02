<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductSplitRequest;
use App\Models\Product;
use App\Models\ProductSplit;
use App\Models\ProductSplitItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductSplitController extends Controller
{
    /**
     * Display a listing of product splits (history)
     */
    public function index()
    {
        // Fetch all splits with eager loaded relationships, sorted by latest first
        $splitsPaginated = ProductSplit::query()
            ->with(['parentProduct', 'splitItems.resultProduct'])
            ->latest('created_at')
            ->paginate(15);

        // Get pagination links before mapping (map converts Paginator to Collection)
        // $pagination = $splitsPaginated->getLinks();

        // Format splits for display
        $formattedSplits = $splitsPaginated->map(function ($split) {
            return [
                'id' => $split->id,
                'tanggal' => $split->created_at->format('d/m/Y H:i'),
                'waktu_lalu' => $split->created_at->diffForHumans(),
                'produk_induk' => $split->parentProduct->product_name,
                'stok_berkurang' => $split->parentProduct->stock + collect($split->splitItems)->sum('quantity'),
                'produk_hasil' => $split->splitItems->map(fn($item) => $item->resultProduct->product_name)->join(', '),
                'stok_bertambah' => collect($split->splitItems)->sum('quantity'),
                'keterangan' => $split->note ?? '-',
            ];
        });

        return Inertia::render('product-split/index', [
            'title' => 'History Pecah Produk',
            'splits' => $formattedSplits,
            // 'pagination' => $pagination,
        ]);
    }

    /**
     * Show the form for creating a new product split
     */
    public function create()
    {
        // Get all products for dropdown (exclude very small stock products as optional)
        $products = Product::query()
            ->select('id', 'product_name', 'stock', 'selling_price')
            ->where('stock', '>', 0)
            ->get();

        return Inertia::render('product-split/create', [
            'products' => $products,
            'title' => 'Pecah Produk',
        ]);
    }

    /**
     * Store a newly created product split in storage
     */
    public function store(StoreProductSplitRequest $request)
    {
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            // Create ProductSplit record
            $split = ProductSplit::create([
                'product_id_from' => $validated['product_id_from'],
                'note' => $validated['note'] ?? null,
            ]);

            // Get parent product to update stock
            $parentProduct = Product::findOrFail($validated['product_id_from']);
            $totalSplitQty = 0;

            // Create ProductSplitItem records and collect result product IDs
            foreach ($validated['split_items'] as $item) {
                ProductSplitItem::create([
                    'product_split_id' => $split->id,
                    'product_id_to' => $item['product_id_to'],
                    'quantity' => $item['quantity'],
                    'selling_price' => $item['selling_price'],
                ]);

                $totalSplitQty += $item['quantity'];

                // Update result product stock
                $resultProduct = Product::findOrFail($item['product_id_to']);
                $resultProduct->increment('stock', $item['quantity']);
            }

            // Update parent product stock (decrease)
            $parentProduct->decrement('stock', $totalSplitQty);

            DB::commit();

            return redirect()->route('product-split.show', $split->id)
                ->with('success', "Produk '{$parentProduct->product_name}' berhasil dipecah!");
        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->withInput()
                ->withErrors(['message' => 'Terjadi kesalahan saat memecah produk: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified product split detail
     */
    public function show(ProductSplit $productSplit)
    {
        // Eager load relationships
        $split = $productSplit->load(['parentProduct', 'splitItems.resultProduct']);

        // Format data for frontend
        $formattedData = [
            'id' => $split->id,
            'tanggal_pemecahan' => $split->created_at->format('d F Y'),
            'waktu_pemecahan' => $split->created_at->format('H:i:s'),
            'waktu_lalu' => $split->created_at->diffForHumans(),
            'produk_induk' => [
                'id' => $split->parentProduct->id,
                'product_name' => $split->parentProduct->product_name,
                'harga_jual' => $split->parentProduct->selling_price,
                'image' => $split->parentProduct->image,
                'stok_berkurang' => collect($split->splitItems)->sum('quantity'),
            ],
            'produk_hasil' => $split->splitItems->map(function ($item) {
                return [
                    'id' => $item->resultProduct->id,
                    'product_name' => $item->resultProduct->product_name,
                    'harga_jual' => $item->selling_price,
                    'image' => $item->resultProduct->image,
                    'stok_bertambah' => $item->quantity,
                ];
            })->toArray(),
            'note' => $split->note,
        ];

        // Build stock change summary
        $stockSummary = [];

        // Add parent product
        $stockSummary[] = [
            'product_name' => $split->parentProduct->product_name,
            'stok_awal' => $split->parentProduct->stock + collect($split->splitItems)->sum('quantity'),
            'perubahan' => '-' . collect($split->splitItems)->sum('quantity'),
            'stok_akhir' => $split->parentProduct->stock,
        ];

        // Add result products
        foreach ($split->splitItems as $item) {
            $stockSummary[] = [
                'product_name' => $item->resultProduct->product_name,
                'stok_awal' => $item->resultProduct->stock - $item->quantity,
                'perubahan' => '+' . $item->quantity,
                'stok_akhir' => $item->resultProduct->stock,
            ];
        }

        return Inertia::render('product-split/show', [
            'split' => $formattedData,
            'stockSummary' => $stockSummary,
        ]);
    }
}
