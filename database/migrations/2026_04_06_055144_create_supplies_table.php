<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel ini menyimpan setiap transaksi pembelian stok dari supplier.
     * Setiap kali Bunda beli produk baru, dicatat di sini — mirip nota/bon.
     *
     * Efek samping saat supply dicatat:
     * - Stok produk bertambah (dihandle di SupplyController)
     * - Pengeluaran otomatis tercatat (agar laporan keuangan akurat)
     */
    public function up(): void
    {
        Schema::create('supplies', function (Blueprint $table) {
            $table->id();

            // Nama supplier/distributor tempat beli stok
            // Contoh: "Pak Budi", "CV Maju Jaya", "Pasar Induk"
            $table->string('supplier_name');

            // Produk apa yang dibeli — menghubungkan ke tabel products
            // onDelete('restrict') = tidak bisa hapus produk kalau masih ada supply-nya
            $table->foreignId('product_id')->constrained()->onDelete('restrict');

            // Berapa unit yang dibeli
            $table->integer('quantity');

            // Harga beli per unit saat transaksi ini terjadi
            // Disimpan sendiri karena harga bisa berubah di masa depan
            $table->decimal('purchase_price', 12, 2);

            // Total = quantity × purchase_price, dihitung otomatis di controller
            $table->decimal('total_amount', 12, 2);

            // Tanggal pembelian (bisa berbeda dari tanggal input ke sistem)
            $table->date('supply_date');

            // Catatan opsional — misal "beli karena stok hampir habis"
            $table->string('note')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplies');
    }
};
