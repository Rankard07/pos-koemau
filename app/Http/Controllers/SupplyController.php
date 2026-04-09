<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplyRequest;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Supply;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SupplyController extends Controller
{
    /**
     * Halaman daftar/history semua supply yang pernah dicatat.
     * Mirip buku besar pembelian — setiap baris adalah satu transaksi beli stok.
     */
    public function index(): Response
    {
        // Ambil semua supply, urutkan dari yang terbaru.
        // with('product') = eager loading — ambil data produk sekaligus
        // supaya tidak terjadi N+1 query (query berulang yang memperlambat).
        $supplies = Supply::query()
            ->with('product')
            ->latest('supply_date')
            ->paginate(15);

        // Format data supaya lebih mudah dibaca di frontend
        $formattedSupplies = $supplies->map(function ($supply) {
            $source = $supply->note === 'Auto dari + Beli Produk' ? 'Produk' : 'Supply Manual';

            return [
                'id' => $supply->id,
                'tanggal' => $supply->supply_date->format('d M Y'),
                'waktu_lalu' => $supply->created_at->diffForHumans(),
                'supplier_name' => $supply->supplier_name,
                'product_name' => $supply->product->product_name,
                'quantity' => $supply->quantity,
                'purchase_price' => (float) $supply->purchase_price,
                'total_amount' => (float) $supply->total_amount,
                'note' => $supply->note ?? '-',
                'source' => $source,
            ];
        });

        return Inertia::render('supply/index', [
            'title' => 'History Supply',
            'supplies' => $formattedSupplies,
        ]);
    }

    /**
     * Halaman form untuk mencatat supply baru.
     * Mengirimkan daftar produk ke frontend untuk pilihan dropdown.
     */
    public function create(): Response
    {
        return Inertia::render('supply/create', [
            'title' => 'Catat Supply Baru',
            // Kirim hanya kolom yang dibutuhkan form — hemat bandwidth
            'products' => Product::query()
                ->orderBy('product_name')
                ->get(['id', 'product_name', 'purchase_price', 'stock']),
        ]);
    }

    /**
     * Simpan supply baru ke database.
     *
     * Saat supply berhasil disimpan, dua hal terjadi otomatis:
     * 1. Stok produk bertambah sebesar quantity yang dibeli.
     * 2. Pengeluaran (Expense) otomatis tercatat agar laporan keuangan akurat.
     *
     * Kita gunakan DB::transaction() untuk memastikan SEMUA operasi berhasil
     * atau SEMUA dibatalkan — tidak boleh setengah-setengah.
     * Bayangkan seperti: kalau stok naik tapi pengeluaran gagal dicatat → data kacau.
     */
    public function store(StoreSupplyRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Hitung total sebelum masuk transaksi
        $validated['total_amount'] = $validated['quantity'] * $validated['purchase_price'];

        try {
            DB::transaction(function () use ($validated) {
                // 1. Simpan record supply
                $supply = Supply::create($validated);

                // 2. Tambah stok produk yang dibeli
                Product::findOrFail($validated['product_id'])
                    ->increment('stock', $validated['quantity']);

                // 3. Catat otomatis sebagai Pengeluaran
                // Ini supaya Dashboard bisa menampilkan pengeluaran bulan ini dengan akurat
                $productName = $supply->product->product_name;
                Expense::create([
                    'description' => "Supply {$productName} dari {$validated['supplier_name']}",
                    'amount' => $validated['total_amount'],
                    'date' => $validated['supply_date'],
                    'category' => 'pembelian_stok',
                ]);
            });
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['message' => 'Terjadi kesalahan: '.$e->getMessage()]);
        }

        return redirect()->route('supply.index')
            ->with('success', 'Supply berhasil dicatat! Stok produk telah diperbarui.');
    }

    /**
     * Detail satu transaksi supply (untuk referensi di masa depan).
     * Belum digunakan saat ini tapi tersedia sebagai resource route.
     */
    public function show(Supply $supply): Response
    {
        $supply->load('product');

        return Inertia::render('supply/show', [
            'supply' => [
                'id' => $supply->id,
                'tanggal' => $supply->supply_date->format('d F Y'),
                'waktu_lalu' => $supply->created_at->diffForHumans(),
                'supplier_name' => $supply->supplier_name,
                'product' => $supply->product,
                'quantity' => $supply->quantity,
                'purchase_price' => (float) $supply->purchase_price,
                'total_amount' => (float) $supply->total_amount,
                'note' => $supply->note,
            ],
        ]);
    }
}
