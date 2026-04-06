<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSupplyRequest extends FormRequest
{
    /**
     * authorize() menentukan apakah user boleh mengirim request ini.
     * return true = semua user yang sudah login boleh mencatat supply.
     *
     * PENTING: File aslinya return false, artinya semua request ditolak (403)!
     * Ini adalah nilai default yang sengaja dikosongkan agar developer mengisi sendiri.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Aturan validasi untuk setiap field di form supply.
     * Laravel akan mengecek semua aturan ini SEBELUM data sampai ke controller.
     * Kalau ada yang gagal, otomatis redirect kembali ke form dengan pesan error.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Nama supplier wajib diisi, harus teks, maksimal 255 karakter
            'supplier_name'  => 'required|string|max:255',

            // Produk wajib dipilih dan harus ada di tabel products
            'product_id'     => 'required|integer|exists:products,id',

            // Jumlah minimal 1 unit
            'quantity'       => 'required|integer|min:1',

            // Harga beli per unit, minimal 0 (gratis/hibah tetap valid)
            'purchase_price' => 'required|numeric|min:0',

            // Tanggal pembelian wajib diisi dan harus format tanggal yang valid
            'supply_date'    => 'required|date',

            // Catatan opsional, kalau ada maksimal 1000 karakter
            'note'           => 'nullable|string|max:1000',
        ];
    }

    /**
     * Pesan error dalam Bahasa Indonesia.
     * Tanpa ini, Laravel akan menampilkan pesan dalam Bahasa Inggris.
     */
    public function messages(): array
    {
        return [
            'supplier_name.required'  => 'Nama supplier harus diisi.',
            'supplier_name.max'       => 'Nama supplier maksimal 255 karakter.',
            'product_id.required'     => 'Produk harus dipilih.',
            'product_id.exists'       => 'Produk yang dipilih tidak ditemukan.',
            'quantity.required'       => 'Jumlah harus diisi.',
            'quantity.integer'        => 'Jumlah harus berupa angka bulat.',
            'quantity.min'            => 'Jumlah minimal 1 unit.',
            'purchase_price.required' => 'Harga beli harus diisi.',
            'purchase_price.numeric'  => 'Harga beli harus berupa angka.',
            'purchase_price.min'      => 'Harga beli tidak boleh negatif.',
            'supply_date.required'    => 'Tanggal supply harus diisi.',
            'supply_date.date'        => 'Format tanggal tidak valid.',
        ];
    }
}
