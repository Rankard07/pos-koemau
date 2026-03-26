<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;


class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Memanggil file 'resources/js/Pages/produk.tsx'
        return inertia('products/index', [
            'title' => 'Daftar Produk KoeMau',
            'products' => Product::all(), // Mengirim data ke React
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('products/create', [
            'title' => 'Tambah Produk Baru',
            'products' => Product::all(), // Mengirim data ke React
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'buy_price' => 'required|numeric',
            'sell_price' => 'required|numeric',
            'stock' => 'required|integer',
            'product_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $file_path = null;
        if ($request->hasFile('product_image')) {
            $file_path = $request->file('product_image')->store('products', 'public');
        }

        Product::create([
            'name' => $request->name,
            'purchase_price' => $request->buy_price, // Masukkan request 'buy_price' ke kolom 'purchase_price'
            'selling_price' => $request->sell_price, // Masukkan request 'sell_price' ke kolom 'selling_price'
            'stock' => $request->stock,
            'image' => $file_path,                   // Masukkan path ke kolom 'image'
        ]);

        return redirect()->route('products.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        //
    }
}
