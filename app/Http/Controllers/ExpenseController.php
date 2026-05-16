<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExpenseRequest;
use App\Models\Expense;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(): Response
    {
        $now = CarbonImmutable::now();

        // ────────────────────────────────────────────────
        // SUMMARY CARDS
        // ────────────────────────────────────────────────

        $totalKeseluruhan = Expense::sum('amount');

        $totalTahunIni = Expense::whereYear('date', $now->year)
            ->sum('amount');

        $totalBulanIni = Expense::whereYear('date', $now->year)
            ->whereMonth('date', $now->month)
            ->sum('amount');

        $totalMingguIni = Expense::whereBetween('date', [
            $now->startOfWeek(),
            $now->endOfWeek(),
        ])->sum('amount');

        // ────────────────────────────────────────────────
        // CHART DATA — Bisa filter berdasarkan range
        // ────────────────────────────────────────────────

        $range = request()->query('range', 'tahun');
        $chartData = [];

        if ($range === 'minggu') {
            // 7 hari terakhir
            for ($i = 6; $i >= 0; $i--) {
                $date = $now->subDays($i);
                $amount = Expense::whereDate('date', $date)->sum('amount');
                $chartData[] = [
                    'bulan' => $date->translatedFormat('d'),
                    'amount' => (float) $amount,
                ];
            }
        } elseif ($range === 'bulan') {
            // Hari-hari dalam bulan ini
            $daysInMonth = $now->daysInMonth;
            for ($i = 1; $i <= $daysInMonth; $i++) {
                $date = $now->setDay($i);
                $amount = Expense::whereDate('date', $date)->sum('amount');
                $chartData[] = [
                    'bulan' => $date->translatedFormat('d'),
                    'amount' => (float) $amount,
                ];
            }
        } elseif ($range === 'keseluruhan') {
            // Data dari awal sampai sekarang, grouped by bulan
            $allExpenses = Expense::orderBy('date')->get();
            $grouped = collect();

            foreach ($allExpenses as $expense) {
                $key = $expense->date->translatedFormat('M Y');
                $grouped[$key] = ($grouped[$key] ?? 0) + $expense->amount;
            }

            foreach ($grouped as $bulan => $amount) {
                $chartData[] = [
                    'bulan' => $bulan,
                    'amount' => (float) $amount,
                ];
            }
        } else {
            // default: 12 bulan terakhir (tahun)
            for ($i = 11; $i >= 0; $i--) {
                $bulan = $now->subMonths($i);

                $amount = Expense::whereYear('date', $bulan->year)
                    ->whereMonth('date', $bulan->month)
                    ->sum('amount');

                $chartData[] = [
                    'bulan' => $bulan->translatedFormat('M Y'),
                    'amount' => (float) $amount,
                ];
            }
        }

        // ────────────────────────────────────────────────
        // DAFTAR PENGELUARAN SESUAI RANGE
        // ────────────────────────────────────────────────

        $query = Expense::query();

        if ($range === 'minggu') {
            $query->whereBetween('date', [
                $now->startOfWeek(),
                $now->endOfWeek(),
            ]);
        } elseif ($range === 'bulan') {
            $query->whereYear('date', $now->year)
                ->whereMonth('date', $now->month);
        } elseif ($range === 'tahun') {
            $query->whereYear('date', $now->year);
        }
        // else: keseluruhan tidak ada filter

        $expenses = $query->latest('date')->paginate(15);

        $formattedExpenses = $expenses->map(fn ($exp) => [
            'id' => $exp->id,
            'description' => $exp->description,
            'amount' => (float) $exp->amount,
            'date' => $exp->date->format('d M Y'),
            'category' => $exp->category,
        ]);

        return Inertia::render('expenses/index', [
            'title' => 'Pengeluaran',
            'totalKeseluruhan' => (float) $totalKeseluruhan,
            'totalTahunIni' => (float) $totalTahunIni,
            'totalBulanIni' => (float) $totalBulanIni,
            'totalMingguIni' => (float) $totalMingguIni,
            'chartData' => $chartData,
            'expenses' => $formattedExpenses,
            'currentRange' => $range,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('expenses/create', [
            'title' => 'Catat Pengeluaran Baru',
        ]);
    }

    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        Expense::create($request->validated());

        return redirect()->route('expenses.index')
            ->with('success', 'Pengeluaran berhasil dicatat!');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $expense->delete();

        return redirect()->route('expenses.index')
            ->with('success', 'Pengeluaran berhasil dihapus!');
    }

    public function bulkDelete(): RedirectResponse
    {
        $ids = request()->input('ids', []);

        if (! is_array($ids) || empty($ids)) {
            return redirect()->route('expenses.index')
                ->with('error', 'Tidak ada data yang dipilih!');
        }

        Expense::whereIn('id', $ids)->delete();

        return redirect()->route('expenses.index')
            ->with('success', count($ids).' pengeluaran berhasil dihapus!');
    }

    public function reset(): RedirectResponse
    {
        Expense::truncate();

        return redirect()->route('expenses.index')
            ->with('success', 'Semua data pengeluaran berhasil direset!');
    }
}
