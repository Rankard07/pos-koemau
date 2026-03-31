<?php

namespace App\Http\Controllers;

use App\Models\Income;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    /**
     * Halaman kasir — tampilkan semua produk untuk dipilih pembeli.
     */
    public function index(): Response
    {
        return Inertia::render('sales/index', [
            'title' => 'Kasir Penjualan',
            'products' => Product::query()
                ->where('stock', '>', 0)
                ->orderBy('product_name')
                ->get(['id', 'product_name', 'selling_price', 'stock', 'image']),
        ]);
    }

    /**
     * Simpan transaksi penjualan.
     *
     * Menerima array keranjang dari React, lalu:
     * 1. Membuat record Sale
     * 2. Membuat SaleItem untuk tiap produk
     * 3. Mengurangi stok produk
     * 4. Membuat record Income otomatis
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'note' => 'nullable|string|max:255',
        ]);

        // Gunakan DB transaction agar jika ada error,
        // semua perubahan dibatalkan (tidak setengah-setengah)
        DB::transaction(function () use ($request) {
            $totalAmount = 0;

            // Hitung total dan validasi stok
            $itemsData = [];

            foreach ($request->input('items') as $item) {
                $product = Product::query()->lockForUpdate()->findOrFail($item['product_id']);

                // Cek apakah stok cukup
                abort_if(
                    $product->stock < $item['quantity'],
                    422,
                    "Stok {$product->product_name} tidak cukup (tersisa {$product->stock})"
                );

                $subtotal = $product->selling_price * $item['quantity'];
                $totalAmount += $subtotal;

                $itemsData[] = [
                    'product' => $product,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->selling_price,
                    'subtotal' => $subtotal,
                ];
            }

            // Buat record penjualan
            $sale = Sale::create([
                'total_amount' => $totalAmount,
                'note' => $request->input('note'),
            ]);

            // Buat item & kurangi stok
            foreach ($itemsData as $data) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $data['product']->id,
                    'quantity' => $data['quantity'],
                    'unit_price' => $data['unit_price'],
                    'subtotal' => $data['subtotal'],
                ]);

                // Kurangi stok produk
                $data['product']->decrement('stock', $data['quantity']);
            }

            // Catat otomatis sebagai Pemasukan
            Income::create([
                'description' => "Penjualan #" . $sale->id,
                'amount' => $totalAmount,
                'date' => now()->toDateString(),
                'source' => 'penjualan',
                'sale_id' => $sale->id,
            ]);
        });

        return redirect()->route('sales.index')
            ->with('success', 'Transaksi berhasil dicatat!');
    }

    /**
     * Riwayat penjualan — tampilkan semua transaksi.
     */
    public function history(): Response
    {
        $sales = Sale::query()
            ->with('items.product')
            ->latest()
            ->paginate(15);

        return Inertia::render('sales/history', [
            'title' => 'Riwayat Penjualan',
            'sales' => $sales,
        ]);
    }
}
