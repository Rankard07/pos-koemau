<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'description' => 'required|string|max:255',
            'amount'      => 'required|numeric|min:0.01',
            'date'        => 'required|date',
            'category'    => 'required|string|in:pembelian_stok,operasional,lainnya',
        ];
    }

    public function messages(): array
    {
        return [
            'description.required' => 'Deskripsi pengeluaran harus diisi.',
            'amount.required'      => 'Nominal pengeluaran harus diisi.',
            'amount.numeric'       => 'Nominal harus berupa angka.',
            'date.required'        => 'Tanggal pengeluaran harus diisi.',
            'date.date'            => 'Format tanggal tidak valid.',
            'category.required'    => 'Kategori pengeluaran harus dipilih.',
        ];
    }
}
