<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIncomeRequest;
use App\Models\Income;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class IncomeController extends Controller
{
    public function index(): Response
    {
        $now = CarbonImmutable::now();

        // ────────────────────────────────────────────────
        // SUMMARY CARDS
        // ────────────────────────────────────────────────

        $totalKeseluruhan = Income::sum('amount');

        $totalTahunIni = Income::whereYear('date', $now->year)
            ->sum('amount');

        $totalBulanIni = Income::whereYear('date', $now->year)
            ->whereMonth('date', $now->month)
            ->sum('amount');

        $totalMingguIni = Income::whereBetween('date', [
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
                $amount = Income::whereDate('date', $date)->sum('amount');
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
                $amount = Income::whereDate('date', $date)->sum('amount');
                $chartData[] = [
                    'bulan' => $date->translatedFormat('d'),
                    'amount' => (float) $amount,
                ];
            }
        } elseif ($range === 'keseluruhan') {
            // Data dari awal sampai sekarang, grouped by bulan
            $allIncomes = Income::orderBy('date')->get();
            $grouped = collect();

            foreach ($allIncomes as $income) {
                $key = $income->date->translatedFormat('M Y');
                $grouped[$key] = ($grouped[$key] ?? 0) + $income->amount;
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

                $amount = Income::whereYear('date', $bulan->year)
                    ->whereMonth('date', $bulan->month)
                    ->sum('amount');

                $chartData[] = [
                    'bulan' => $bulan->translatedFormat('M Y'),
                    'amount' => (float) $amount,
                ];
            }
        }

        // ────────────────────────────────────────────────
        // DAFTAR PEMASUKAN SESUAI RANGE
        // ────────────────────────────────────────────────

        $query = Income::query();

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

        $incomes = $query->latest('date')->paginate(15);

        $formattedIncomes = $incomes->map(fn ($inc) => [
            'id' => $inc->id,
            'description' => $inc->description,
            'amount' => (float) $inc->amount,
            'date' => $inc->date->format('d M Y'),
            'source' => $inc->source,
        ]);

        return Inertia::render('income/index', [
            'title' => 'Pemasukan',
            'totalKeseluruhan' => (float) $totalKeseluruhan,
            'totalTahunIni' => (float) $totalTahunIni,
            'totalBulanIni' => (float) $totalBulanIni,
            'totalMingguIni' => (float) $totalMingguIni,
            'chartData' => $chartData,
            'incomes' => $formattedIncomes,
            'currentRange' => $range,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('income/create', [
            'title' => 'Catat Pemasukan Baru',
        ]);
    }

    public function store(StoreIncomeRequest $request): RedirectResponse
    {
        Income::create($request->validated());

        return redirect()->route('income.index')
            ->with('success', 'Pemasukan berhasil dicatat!');
    }

    public function destroy(Income $income): RedirectResponse
    {
        $income->delete();

        return redirect()->route('income.index')
            ->with('success', 'Pemasukan berhasil dihapus!');
    }

    public function bulkDelete(): RedirectResponse
    {
        $ids = request()->input('ids', []);

        if (! is_array($ids) || empty($ids)) {
            return redirect()->route('income.index')
                ->with('error', 'Tidak ada data yang dipilih!');
        }

        Income::whereIn('id', $ids)->delete();

        return redirect()->route('income.index')
            ->with('success', count($ids).' pemasukan berhasil dihapus!');
    }

    public function reset(): RedirectResponse
    {
        Income::truncate();

        return redirect()->route('income.index')
            ->with('success', 'Semua data pemasukan berhasil direset!');
    }
}
