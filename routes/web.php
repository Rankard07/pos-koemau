<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SupplyController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\SaleController;


Route::inertia('/', 'welcome', [
    'canLogin' => Route::has('login'),
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    /* Route::inertia('/produk', 'produk')->name('products.index');
    Route::inertia('/supply', 'supply')->name('supply.index');
    Route::inertia('/pengeluaran', 'pengeluaran')->name('expenses.index');
    Route::inertia('/pemasukan', 'pemasukan')->name('income.index');
    Route::inertia('/penjualan', 'penjualan')->name('sales.index'); */

    // Route::resource routes untuk CRUD otomatis menjadi seperti products.index, products.create, dll.
    Route::resource(
        'products',
        ProductController::class,
        ['names' => [
            'index' => 'products.index',
            'create' => 'products.create',
            'store' => 'products.store',
            'edit' => 'products.edit',
            'update' => 'products.update',
            'destroy' => 'products.destroy',
        ]]
    );
    Route::resource('supply', SupplyController::class);
    Route::resource('expenses', ExpenseController::class);
    Route::resource('income', IncomeController::class);
    Route::resource('sales', SaleController::class);
});

/* //
Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
 */
/* Route::middleware('auth')->group(function () {
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::get('/products', [ProductController::class, 'edit'])->name('products.edit');
    Route::patch('/products', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products', [ProductController::class, 'destroy'])->name('products.destroy');
}); */

require __DIR__ . '/settings.php';
