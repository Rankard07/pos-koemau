<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_split_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_split_id')->constrained('product_splits')->onDelete('cascade');
            $table->foreignId('product_id_to')->constrained('products')->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('selling_price', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_split_items');
    }
};
