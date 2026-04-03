<?php
// BUAT FILE BARU ini di: database/migrations/
// Nama file: 2026_04_XX_000001_add_qty_from_to_product_splits_table.php
// (ganti XX dengan tanggal hari ini, misalnya 03)
//
// Lalu jalankan: php artisan migrate

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom qty_from ke tabel product_splits.
     *
     * qty_from menyimpan berapa unit produk induk yang digunakan/berkurang
     * dalam satu transaksi pemecahan. Nilainya diisi oleh user secara eksplisit
     * (bukan otomatis dari sum of result quantities).
     *
     * Contoh: 1 Dimsum 100 → 1 Dimsum 50 + 2 Dimsum 25
     * qty_from = 1 (hanya 1 unit induk yang dipakai)
     */
    public function up(): void
    {
        Schema::table('product_splits', function (Blueprint $table) {
            // Tambah setelah kolom product_id_from
            // Default 1 agar data lama tidak error
            $table->unsignedInteger('qty_from')->default(1)->after('product_id_from');
        });
    }

    public function down(): void
    {
        Schema::table('product_splits', function (Blueprint $table) {
            $table->dropColumn('qty_from');
        });
    }
};
