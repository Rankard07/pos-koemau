<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductSplitRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'product_id_from' => [
                'required',
                'integer',
                'exists:products,id',
            ],
            'note' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'split_items' => [
                'required',
                'array',
                'min:1',
            ],
            'split_items.*.product_id_to' => [
                'required',
                'integer',
                'exists:products,id',
                Rule::notIn([$this->input('product_id_from')]),
            ],
            'split_items.*.quantity' => [
                'required',
                'integer',
                'min:1',
            ],
            'split_items.*.selling_price' => [
                'required',
                'numeric',
                'min:0',
            ],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'product_id_from.required' => 'Produk induk harus dipilih',
            'product_id_from.exists' => 'Produk induk tidak ditemukan',
            'split_items.required' => 'Minimal harus ada 1 produk hasil',
            'split_items.min' => 'Minimal harus ada 1 produk hasil',
            'split_items.*.product_id_to.required' => 'Produk hasil harus dipilih',
            'split_items.*.product_id_to.exists' => 'Produk hasil tidak ditemukan',
            'split_items.*.product_id_to.not_in' => 'Produk hasil tidak boleh sama dengan produk induk',
            'split_items.*.quantity.required' => 'Quantity harus diisi',
            'split_items.*.quantity.integer' => 'Quantity harus berupa angka',
            'split_items.*.quantity.min' => 'Quantity minimal 1 unit',
            'split_items.*.selling_price.required' => 'Harga jual harus diisi',
            'split_items.*.selling_price.numeric' => 'Harga jual harus berupa angka',
            'split_items.*.selling_price.min' => 'Harga jual minimal 0',
        ];
    }

    /**
     * Custom validation after basic rules pass
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $parentProduct = \App\Models\Product::find($this->input('product_id_from'));

            if ($parentProduct) {
                // Calculate total quantity from all split items
                $totalSplitQty = collect($this->input('split_items', []))->sum('quantity');

                // Check if parent product has enough stock
                if ($totalSplitQty > $parentProduct->stock) {
                    $validator->errors()->add(
                        'split_items',
                        "Stok produk induk ({$parentProduct->product_name}) hanya tersisa {$parentProduct->stock} unit, "
                            . "namun Anda mencoba memecah {$totalSplitQty} unit."
                    );
                }
            }
        });
    }
}
