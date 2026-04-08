<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreIncomeRequest extends FormRequest
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
            'source'      => 'required|string|in:penjualan,lainnya',
        ];
    }

    public function messages(): array
    {
        return [
            'description.required' => 'Deskripsi pemasukan harus diisi.',
            'amount.required'      => 'Nominal pemasukan harus diisi.',
            'amount.numeric'       => 'Nominal harus berupa angka.',
            'date.required'        => 'Tanggal pemasukan harus diisi.',
            'date.date'            => 'Format tanggal tidak valid.',
            'source.required'      => 'Sumber pemasukan harus dipilih.',
        ];
    }
}
