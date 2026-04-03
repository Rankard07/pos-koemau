// resources/js/pages/product-split/index.tsx
// Halaman History Pemecahan Produk.
// Menggunakan CSS variables (bg-card, text-foreground, dll) agar tema otomatis
// mengikuti light/dark mode app, tidak perlu hardcode bg-gray-900.
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

// ─────────────────────────────────────────────────────────
// BREADCRUMBS
// ─────────────────────────────────────────────────────────
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Daftar Produk', href: route('products.index') },
    { title: 'History Pecah Produk', href: route('product-split.index') },
];

// ─────────────────────────────────────────────────────────
// TIPE DATA — satu baris di tabel history
// ─────────────────────────────────────────────────────────
interface Split {
    id: number;
    tanggal: string;
    waktu_lalu: string;
    produk_induk: string;
    stok_berkurang: number;
    produk_hasil: string;
    stok_bertambah: number;
    keterangan: string;
}

interface IndexProps {
    title: string;
    splits: Split[];
}

// ─────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────
export default function Index({ title, splits }: IndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="px-4 py-6">
                {/* ── HEADER ── */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            {title}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Riwayat semua transaksi pemecahan produk.
                        </p>
                    </div>

                    {/* Tombol buat pemecahan baru */}
                    <Link
                        href={route('product-split.create')}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
                    >
                        + Pecah Produk Baru
                    </Link>
                </div>

                <hr className="mb-6 border-border" />

                {/* ── TABEL HISTORY ── */}
                <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full border-collapse">
                        {/* Header kolom */}
                        <thead>
                            <tr className="border-b border-border bg-muted/60">
                                <th className="border-r border-border px-4 py-3 text-left text-sm font-semibold text-foreground">
                                    Tanggal
                                </th>
                                <th className="border-r border-border px-4 py-3 text-left text-sm font-semibold text-foreground">
                                    Produk Induk
                                </th>
                                <th className="border-r border-border px-4 py-3 text-center text-sm font-semibold text-foreground">
                                    Stok&nbsp;−
                                </th>
                                <th className="border-r border-border px-4 py-3 text-left text-sm font-semibold text-foreground">
                                    Produk Hasil
                                </th>
                                <th className="border-r border-border px-4 py-3 text-center text-sm font-semibold text-foreground">
                                    Stok&nbsp;+
                                </th>
                                <th className="border-r border-border px-4 py-3 text-left text-sm font-semibold text-foreground">
                                    Keterangan
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {/* ── Pesan kosong jika belum ada data ── */}
                            {splits.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                                    >
                                        Belum ada riwayat pemecahan produk.{' '}
                                        <Link
                                            href={route('product-split.create')}
                                            className="text-primary underline"
                                        >
                                            Buat yang pertama.
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                /* ── Baris data ── */
                                splits.map((split, index) => (
                                    <tr
                                        key={split.id}
                                        className={`border-b border-border transition-colors hover:bg-muted/30 ${
                                            index % 2 === 0
                                                ? 'bg-card'
                                                : 'bg-muted/10'
                                        }`}
                                    >
                                        {/* Tanggal + waktu relatif */}
                                        <td className="border-r border-border px-4 py-3">
                                            <p className="text-sm font-medium text-foreground">
                                                {split.tanggal}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {split.waktu_lalu}
                                            </p>
                                        </td>

                                        {/* Produk induk */}
                                        <td className="border-r border-border px-4 py-3 text-sm font-medium text-foreground">
                                            {split.produk_induk}
                                        </td>

                                        {/* Stok berkurang — merah */}
                                        <td className="border-r border-border px-4 py-3 text-center">
                                            <span className="inline-flex items-center rounded-full bg-destructive/15 px-3 py-0.5 text-sm font-bold text-destructive">
                                                −{split.stok_berkurang}
                                            </span>
                                        </td>

                                        {/* Nama produk hasil */}
                                        <td className="border-r border-border px-4 py-3 text-sm text-muted-foreground">
                                            {split.produk_hasil}
                                        </td>

                                        {/* Stok bertambah — hijau */}
                                        <td className="border-r border-border px-4 py-3 text-center">
                                            <span className="inline-flex items-center rounded-full bg-green-500/15 px-3 py-0.5 text-sm font-bold text-green-500">
                                                +{split.stok_bertambah}
                                            </span>
                                        </td>

                                        {/* Keterangan */}
                                        <td className="border-r border-border px-4 py-3 text-sm text-muted-foreground">
                                            <span
                                                className="line-clamp-1"
                                                title={split.keterangan}
                                            >
                                                {split.keterangan}
                                            </span>
                                        </td>

                                        {/* Tombol detail */}
                                        <td className="px-4 py-3 text-center">
                                            <Link
                                                href={route(
                                                    'product-split.show',
                                                    split.id,
                                                )}
                                                className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/10"
                                            >
                                                👁 Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Tombol kembali ── */}
                <div className="mt-6">
                    <Link
                        href={route('products.index')}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                        ← Kembali ke Produk
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
