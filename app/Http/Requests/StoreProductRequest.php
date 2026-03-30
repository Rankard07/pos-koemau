<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_name' => 'required|string|max:255',
            'purchase_price' => 'required|numeric|',
            'selling_price' => 'required|numeric|',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'image_file' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'product_name.required' => 'Nama produk harus diisi.',
            'product_name.string' => 'Nama produk harus berupa teks.',
            'product_name.max' => 'Nama produk maksimal 255 karakter.',
            'purchase_price.required' => 'Harga beli harus diisi.',
            'purchase_price.numeric' => 'Harga beli harus berupa angka.',
            'purchase_price.min' => 'Harga beli tidak boleh negatif.',
            'selling_price.required' => 'Harga jual harus diisi.',
            'selling_price.numeric' => 'Harga jual harus berupa angka.',
            'selling_price.min' => 'Harga jual tidak boleh negatif.',
            'stock.required' => 'Stok harus diisi.',
            'stock.integer' => 'Stok harus berupa angka bulat.',
            'stock.min' => 'Stok tidak boleh negatif.',
            'image.image' => 'File harus berupa gambar.',
            'image.mimes' => 'Format gambar harus: jpg, jpeg, png, atau webp.',
            'image.max' => 'Ukuran gambar maksimal 2MB.',
            'image_file.string' => 'Pilihan gambar tidak valid.',
        ];
    }
}
