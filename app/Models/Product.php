<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'product_name',   // Sebelumnya 'name'
        'purchase_price', // Sebelumnya 'buy_price'
        'selling_price',  // Sebelumnya 'sell_price'
        'stock',          // Tetap sama
        'image'           // Sebelumnya 'product_image'
    ];

    /**
     * Get all splits where this product is the parent (produk induk)
     */
    public function productSplitsAsParent(): HasMany
    {
        return $this->hasMany(ProductSplit::class, 'product_id_from');
    }

    /**
     * Get all split items where this product is a result (produk hasil)
     */
    public function productSplitItemsAsResult(): HasMany
    {
        return $this->hasMany(ProductSplitItem::class, 'product_id_to');
    }
}
