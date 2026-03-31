<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Income;
use App\Models\Product;
use App\Models\Sale;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now = CarbonImmutable::now();

        // ────────────────────────────────────────────────
        // SUMMARY CARDS
        // ────────────────────────────────────────────────

        // Total pemasukan bulan ini
        $pemasukanBulanIni = Income::query()
            ->whereYear('date', $now->year)
            ->whereMonth('date', $now->month)
            ->sum('amount');

        // Total pengeluaran bulan ini
        $pengeluaranBulanIni = Expense::query()
            ->whereYear('date', $now->year)
            ->whereMonth('date', $now->month)
            ->sum('amount');

        // Laba bersih bulan ini
        $labaBersih = $pemasukanBulanIni - $pengeluaranBulanIni;

        // Total produk & stok menipis (stok <= 5)
        $totalProduk = Product::query()->count();
        $stokMenipis = Product::query()->where('stock', '<=', 5)->count();

        // ────────────────────────────────────────────────
        // CHART DATA — Pemasukan vs Pengeluaran 6 bulan terakhir
        // ────────────────────────────────────────────────

        $chartData = [];

        for ($i = 5; $i >= 0; $i--) {
            $bulan = $now->subMonths($i);

            $pemasukan = Income::query()
                ->whereYear('date', $bulan->year)
                ->whereMonth('date', $bulan->month)
                ->sum('amount');

            $pengeluaran = Expense::query()
                ->whereYear('date', $bulan->year)
                ->whereMonth('date', $bulan->month)
                ->sum('amount');

            $chartData[] = [
                'bulan' => $bulan->translatedFormat('M Y'), // misal: Jan 2026
                'pemasukan' => (float) $pemasukan,
                'pengeluaran' => (float) $pengeluaran,
            ];
        }

        // ────────────────────────────────────────────────
        // TRANSAKSI TERBARU (5 penjualan terakhir)
        // ────────────────────────────────────────────────

        $transaksiTerbaru = Sale::query()
            ->with('items.product')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($sale) => [
                'id' => $sale->id,
                'total_amount' => $sale->total_amount,
                'jumlah_item' => $sale->items->sum('quantity'),
                'tanggal' => $sale->created_at->format('d M Y, H:i'),
            ]);

        // ────────────────────────────────────────────────
        // PRODUK STOK MENIPIS (untuk peringatan)
        // ────────────────────────────────────────────────

        $produkStokMenipis = Product::query()
            ->where('stock', '<=', 5)
            ->orderBy('stock')
            ->take(5)
            ->get(['id', 'product_name', 'stock']);

        return Inertia::render('dashboard', [
            'title' => 'Dashboard KoeMau',

            // Summary Cards
            'pemasukanBulanIni' => (float) $pemasukanBulanIni,
            'pengeluaranBulanIni' => (float) $pengeluaranBulanIni,
            'labaBersih' => (float) $labaBersih,
            'totalProduk' => $totalProduk,
            'stokMenipis' => $stokMenipis,

            // Chart & Tabel
            'chartData' => $chartData,
            'transaksiTerbaru' => $transaksiTerbaru,
            'produkStokMenipis' => $produkStokMenipis,
        ]);
    }
}
