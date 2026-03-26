<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'product_name',   // Sebelumnya 'name'
        'purchase_price', // Sebelumnya 'buy_price'
        'selling_price',  // Sebelumnya 'sell_price'
        'stock',          // Tetap sama
        'image'           // Sebelumnya 'product_image'
    ];
}
