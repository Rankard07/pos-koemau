// resources/js/pages/product-split/show.tsx
// Halaman Detail satu transaksi pemecahan produk.
// Sebelumnya tidak punya AppLayout — sekarang ditambahkan agar tampil
// dengan sidebar dan header yang konsisten dengan halaman lain.
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

// ─────────────────────────────────────────────────────────
// TIPE DATA
// ─────────────────────────────────────────────────────────
interface ProductResult {
    id: number;
    product_name: string;
    harga_jual: number;
    image?: string;
    stok_bertambah: number;
}

interface SplitData {
    id: number;
    tanggal_pemecahan: string;
    waktu_pemecahan: string;
    waktu_lalu: string;
    produk_induk: {
        id: number;
        product_name: string;
        harga_jual: number;
        image?: string;
        stok_berkurang: number;
    };
    produk_hasil: ProductResult[];
    note?: string;
}

interface StockSummary {
    product_name: string;
    stok_awal: number;
    perubahan: string;
    stok_akhir: number;
}

interface ShowProps {
    split: SplitData;
    stockSummary: StockSummary[];
}

// ─────────────────────────────────────────────────────────
// HELPER: Format Rupiah
// ─────────────────────────────────────────────────────────
function formatRupiah(angka: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(angka);
}

// ─────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────
export default function Show({ split, stockSummary }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Daftar Produk', href: route('products.index') },
        { title: 'History Pecah Produk', href: route('product-split.index') },
        {
            title: `Detail #${split.id}`,
            href: route('product-split.show', split.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Pemecahan #${split.id}`} />

            <div className="px-4 py-6">
                {/* ── HEADER ── */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-foreground">
                        Detail Pemecahan Produk
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        ID Transaksi: #{split.id}
                    </p>
                </div>

                <hr className="mb-6 border-border" />

                {/* ── METADATA: Tanggal dan waktu ── */}
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                        { label: 'Tanggal', value: split.tanggal_pemecahan },
                        { label: 'Waktu', value: split.waktu_pemecahan },
                        {
                            label: 'Dilakukan',
                            value: split.waktu_lalu,
                        },
                    ].map(({ label, value }) => (
                        <div
                            key={label}
                            className="rounded-xl border border-border bg-card p-4"
                        >
                            <p className="mb-1 text-xs text-muted-foreground">
                                {label}
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── PRODUK INDUK (dikurangi) ── */}
                <div className="mb-5 rounded-xl border border-destructive/30 bg-card p-5">
                    <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-destructive">
                        <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs">
                            DIKURANGI
                        </span>
                        Produk Induk
                    </h2>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        {/* Gambar produk (jika ada) */}
                        {split.produk_induk.image && (
                            <img
                                src={`/storage/${split.produk_induk.image}`}
                                alt={split.produk_induk.product_name}
                                className="h-28 w-28 rounded-xl object-cover"
                            />
                        )}

                        <div className="flex-1">
                            <p className="mb-3 text-xl font-bold text-foreground">
                                {split.produk_induk.product_name}
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Harga Jual
                                    </p>
                                    <p className="text-base font-semibold text-blue-400">
                                        {formatRupiah(
                                            split.produk_induk.harga_jual,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Stok Berkurang
                                    </p>
                                    <p className="text-2xl font-bold text-destructive">
                                        −{split.produk_induk.stok_berkurang}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── PRODUK HASIL (bertambah) ── */}
                <div className="mb-5 rounded-xl border border-green-500/30 bg-card p-5">
                    <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-green-500">
                        <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs">
                            BERTAMBAH
                        </span>
                        Produk Hasil
                    </h2>

                    {/* Grid produk hasil — maksimal 2 kolom */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {split.produk_hasil.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4"
                            >
                                {/* Gambar produk hasil */}
                                {item.image ? (
                                    <img
                                        src={`/storage/${item.image}`}
                                        alt={item.product_name}
                                        className="h-16 w-16 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                                        No img
                                    </div>
                                )}

                                <div className="flex-1">
                                    <p className="mb-2 text-sm font-semibold text-foreground">
                                        {item.product_name}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            Harga Jual
                                        </span>
                                        <span className="text-sm font-medium text-blue-400">
                                            {formatRupiah(item.harga_jual)}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            Stok Bertambah
                                        </span>
                                        <span className="text-xl font-bold text-green-500">
                                            +{item.stok_bertambah}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CATATAN (jika ada) ── */}
                {split.note && (
                    <div className="mb-5 rounded-xl border border-border bg-card p-4">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                            Catatan
                        </p>
                        <p className="text-sm text-foreground">{split.note}</p>
                    </div>
                )}

                {/* ── RINGKASAN PERUBAHAN STOK ── */}
                <div className="mb-6 overflow-hidden rounded-xl border border-border">
                    <div className="border-b border-border bg-muted/60 px-4 py-3">
                        <h3 className="text-sm font-semibold text-foreground">
                            Ringkasan Perubahan Stok
                        </h3>
                    </div>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="border-r border-border px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                                    Nama Produk
                                </th>
                                <th className="border-r border-border px-4 py-2 text-center text-xs font-semibold text-muted-foreground">
                                    Stok Awal
                                </th>
                                <th className="border-r border-border px-4 py-2 text-center text-xs font-semibold text-muted-foreground">
                                    Perubahan
                                </th>
                                <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground">
                                    Stok Akhir
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockSummary.map((row, idx) => (
                                <tr
                                    key={idx}
                                    className={`border-b border-border ${
                                        idx % 2 === 0
                                            ? 'bg-card'
                                            : 'bg-muted/10'
                                    }`}
                                >
                                    <td className="border-r border-border px-4 py-3 text-sm font-medium text-foreground">
                                        {row.product_name}
                                    </td>
                                    <td className="border-r border-border px-4 py-3 text-center text-sm text-muted-foreground">
                                        {row.stok_awal}
                                    </td>
                                    <td className="border-r border-border px-4 py-3 text-center">
                                        <span
                                            className={`text-sm font-bold ${
                                                row.perubahan.startsWith('+')
                                                    ? 'text-green-500'
                                                    : 'text-destructive'
                                            }`}
                                        >
                                            {row.perubahan}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm font-bold text-foreground">
                                        {row.stok_akhir}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── TOMBOL AKSI ── */}
                <div className="flex gap-3">
                    <Link
                        href={route('product-split.index')}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                        ← Kembali ke History
                    </Link>
                    <Link
                        href={route('products.index')}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
                    >
                        Lihat Semua Produk
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
