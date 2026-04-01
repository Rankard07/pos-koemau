<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSplitItem extends Model
{
    protected $fillable = [
        'product_split_id',
        'product_id_to',
        'quantity',
        'selling_price',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'selling_price' => 'decimal:2',
    ];

    /**
     * Get the parent split transaction
     */
    public function productSplit(): BelongsTo
    {
        return $this->belongsTo(ProductSplit::class);
    }

    /**
     * Get the result product (produk hasil)
     */
    public function resultProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id_to');
    }
}
