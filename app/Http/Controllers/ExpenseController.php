<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use Carbon\CarbonImmutable;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

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
        // CHART DATA — Trend pengeluaran 12 bulan terakhir
        // ────────────────────────────────────────────────

        $chartData = [];

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

        // ────────────────────────────────────────────────
        // DAFTAR PENGELUARAN BULAN INI
        // ────────────────────────────────────────────────

        $expenses = Expense::whereYear('date', $now->year)
            ->whereMonth('date', $now->month)
            ->latest('date')
            ->paginate(15);

        $formattedExpenses = $expenses->map(fn($exp) => [
            'id'          => $exp->id,
            'description' => $exp->description,
            'amount'      => (float) $exp->amount,
            'date'        => $exp->date->format('d M Y'),
            'category'    => $exp->category,
        ]);

        return Inertia::render('expenses/index', [
            'title'                 => 'Pengeluaran',
            'totalKeseluruhan'      => (float) $totalKeseluruhan,
            'totalTahunIni'         => (float) $totalTahunIni,
            'totalBulanIni'         => (float) $totalBulanIni,
            'totalMingguIni'        => (float) $totalMingguIni,
            'chartData'             => $chartData,
            'expenses'              => $formattedExpenses,
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
}
