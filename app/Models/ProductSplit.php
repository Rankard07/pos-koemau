<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductSplit extends Model
{
    protected $fillable = [
        'product_id_from',
        'note',
    ];

    /**
     * Get the parent product (produk induk yang dipecah)
     */
    public function parentProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id_from');
    }

    /**
     * Get all result items from this split
     */
    public function splitItems(): HasMany
    {
        return $this->hasMany(ProductSplitItem::class);
    }
}
