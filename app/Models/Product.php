<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'buy_price',
        'sell_price',
        'stock',
        'product_image'
    ];
}
