<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductSplitController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SupplyController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canLogin' => Route::has('login'),
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard — sekarang pakai DashboardController agar bisa kirim data nyata
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // CRUD Produk
    Route::resource('products', ProductController::class, /* [
        'names' => [
            'index' => 'products.index',
            'create' => 'products.create',
            'store' => 'products.store',
            'edit' => 'products.edit',
            'update' => 'products.update',
            'destroy' => 'products.destroy',
        ],
    ] */);

    // Pecah Produk (Product Split)
    /* Route::get('produk-split', [ProductSplitController::class, 'index'])->name('product-split.index');
    Route::get('produk-split/create', [ProductSplitController::class, 'create'])->name('product-split.create');
    Route::post('produk-split', [ProductSplitController::class, 'store'])->name('product-split.store');
    Route::get('produk-split/{productSplit}', [ProductSplitController::class, 'show'])->name('product-split.show'); */

    // Pecah Produk (Product Split) - Jauh lebih ringkas
    Route::resource('product-split', ProductSplitController::class)->only(['index', 'create', 'store', 'show']);

    // Penjualan — kasir + riwayat
    /* Route::get('sales', [SaleController::class, 'index'])->name('sales.index');
    Route::post('sales', [SaleController::class, 'store'])->name('sales.store');
    Route::get('sales/history', [SaleController::class, 'history'])->name('sales.history'); */

    // Penjualan - Gabungan Resource + Manual
    Route::get('sales/history', [SaleController::class, 'history'])->name('sales.history');
    Route::resource('sales', SaleController::class)->only(['index', 'store']);

    // Supply, Pengeluaran, Pemasukan
    Route::resource('supply', SupplyController::class);
    Route::resource('expenses', ExpenseController::class);
    Route::resource('income', IncomeController::class);
});

require __DIR__ . '/settings.php';
