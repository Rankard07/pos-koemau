<?php
// app/Models/ProductSplit.php
// SALIN SELURUH isi ini dan ganti file yang lama.
// Perubahan: tambah 'qty_from' ke $fillable

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductSplit extends Model
{
    protected $fillable = [
        'product_id_from',
        'qty_from',   // <-- BARU: berapa unit induk yang berkurang
        'note',
    ];

    /**
     * Produk induk yang dipecah.
     */
    public function parentProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id_from');
    }

    /**
     * Semua produk hasil dari pemecahan ini.
     */
    public function splitItems(): HasMany
    {
        return $this->hasMany(ProductSplitItem::class);
    }
}
