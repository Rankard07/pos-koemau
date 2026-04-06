<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Supply extends Model
{
    /**
     * Kolom yang boleh diisi melalui form (mass assignment).
     * Ini penting untuk keamanan — kolom yang tidak ada di sini
     * tidak bisa diisi secara massal dari request.
     */
    protected $fillable = [
        'supplier_name',
        'product_id',
        'quantity',
        'purchase_price',
        'total_amount',
        'supply_date',
        'note',
    ];

    /**
     * Cast = konversi tipe data secara otomatis.
     * Misal: purchase_price di database disimpan sebagai string "180000.00"
     * tapi saat diakses di PHP sudah menjadi float 180000.00
     */
    protected function casts(): array
    {
        return [
            'purchase_price' => 'decimal:2',
            'total_amount'   => 'decimal:2',
            'supply_date'    => 'date',   // otomatis jadi objek Carbon/CarbonImmutable
        ];
    }

    /**
     * Relasi ke model Product.
     * Supply ini milik satu produk — artinya kita bisa panggil:
     * $supply->product->product_name
     * untuk mendapatkan nama produk yang dibeli.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
