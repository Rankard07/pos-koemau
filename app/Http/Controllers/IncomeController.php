<?php

namespace App\Http\Controllers;

use App\Models\Income;
use App\Http\Requests\StoreIncomeRequest;
use App\Http\Requests\UpdateIncomeRequest;
use Carbon\CarbonImmutable;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

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
        // CHART DATA — Trend pemasukan 12 bulan terakhir
        // ────────────────────────────────────────────────

        $chartData = [];

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

        // ────────────────────────────────────────────────
        // DAFTAR PEMASUKAN BULAN INI
        // ────────────────────────────────────────────────

        $incomes = Income::whereYear('date', $now->year)
            ->whereMonth('date', $now->month)
            ->latest('date')
            ->paginate(15);

        $formattedIncomes = $incomes->map(fn($inc) => [
            'id'          => $inc->id,
            'description' => $inc->description,
            'amount'      => (float) $inc->amount,
            'date'        => $inc->date->format('d M Y'),
            'source'      => $inc->source,
        ]);

        return Inertia::render('income/index', [
            'title'                 => 'Pemasukan',
            'totalKeseluruhan'      => (float) $totalKeseluruhan,
            'totalTahunIni'         => (float) $totalTahunIni,
            'totalBulanIni'         => (float) $totalBulanIni,
            'totalMingguIni'        => (float) $totalMingguIni,
            'chartData'             => $chartData,
            'incomes'               => $formattedIncomes,
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
}
