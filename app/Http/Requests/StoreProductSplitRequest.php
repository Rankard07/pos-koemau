<?php
// app/Http/Requests/StoreProductSplitRequest.php
// SALIN SELURUH isi file ini dan ganti file yang lama.
//
// Perubahan dari versi sebelumnya:
// - Tambah validasi `qty_from`: berapa unit induk yang digunakan/berkurang
// - Validasi custom: qty_from tidak boleh melebihi stok induk

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductSplitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id_from' => [
                'required',
                'integer',
                'exists:products,id',
            ],
            // qty_from = berapa unit produk induk yang berkurang/digunakan
            // Ini field BARU, terpisah dari jumlah produk hasil.
            'qty_from' => [
                'required',
                'integer',
                'min:1',
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
            // selling_price tetap diterima (bisa 0) tapi tidak wajib valid
            'split_items.*.selling_price' => [
                'required',
                'numeric',
                'min:0',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id_from.required' => 'Produk induk harus dipilih',
            'product_id_from.exists'   => 'Produk induk tidak ditemukan',

            'qty_from.required' => 'Jumlah produk induk yang digunakan harus diisi',
            'qty_from.integer'  => 'Jumlah harus berupa angka bulat',
            'qty_from.min'      => 'Jumlah minimal 1 unit',

            'split_items.required'                      => 'Minimal harus ada 1 produk hasil',
            'split_items.min'                           => 'Minimal harus ada 1 produk hasil',
            'split_items.*.product_id_to.required'      => 'Produk hasil harus dipilih',
            'split_items.*.product_id_to.exists'        => 'Produk hasil tidak ditemukan',
            'split_items.*.product_id_to.not_in'        => 'Produk hasil tidak boleh sama dengan produk induk',
            'split_items.*.quantity.required'           => 'Quantity harus diisi',
            'split_items.*.quantity.integer'            => 'Quantity harus berupa angka',
            'split_items.*.quantity.min'                => 'Quantity minimal 1 unit',
            'split_items.*.selling_price.required'      => 'Harga jual harus diisi',
            'split_items.*.selling_price.numeric'       => 'Harga jual harus berupa angka',
            'split_items.*.selling_price.min'           => 'Harga jual minimal 0',
        ];
    }

    /**
     * Validasi bisnis setelah rules dasar lolos:
     * - qty_from tidak boleh melebihi stok produk induk
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $parentProduct = \App\Models\Product::find($this->input('product_id_from'));

            if ($parentProduct) {
                $qtyFrom = (int) $this->input('qty_from', 0);

                if ($qtyFrom > $parentProduct->stock) {
                    $validator->errors()->add(
                        'qty_from',
                        "Stok produk induk ({$parentProduct->product_name}) hanya tersisa "
                            . "{$parentProduct->stock} unit, tetapi Anda mencoba menggunakan {$qtyFrom} unit."
                    );
                }
            }
        });
    }
}
