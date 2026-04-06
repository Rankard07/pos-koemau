// resources/js/pages/supply/index.tsx
//
// Halaman ini menampilkan HISTORY semua transaksi pembelian stok dari supplier.
// Analoginya: seperti laci tempat Bunda menyimpan semua nota/bon pembelian,
// tapi sudah terorganisir dan bisa dicari dengan mudah.
//
// Setiap baris tabel = satu kali beli stok dari supplier.

import { Head, Link } from '@inertiajs/react';
import { Plus, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

// ─────────────────────────────────────────────────────────
// TIPE DATA — mendeskripsikan bentuk satu baris di tabel
// ─────────────────────────────────────────────────────────

interface Supply {
    id: number;
    tanggal: string; // sudah diformat: "06 Apr 2026"
    waktu_lalu: string; // relatif: "2 hari yang lalu"
    supplier_name: string;
    product_name: string;
    quantity: number;
    purchase_price: number;
    total_amount: number;
    note: string;
}

interface IndexProps {
    title: string;
    supplies: Supply[];
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
// BREADCRUMBS
// ─────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Supply', href: route('supply.index') },
];

// ─────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────

export default function Index({ title, supplies }: IndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="px-4 py-6">
                {/* ── HEADER ── */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
                            <Truck className="h-6 w-6 text-orange-500" />
                            {title}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Catatan semua pembelian stok produk dari supplier.
                            Setiap baris = satu nota pembelian.
                        </p>
                    </div>

                    {/* Tombol catat supply baru */}
                    <Button asChild variant="koemau">
                        <Link href={route('supply.create')}>
                            <Plus className="mr-1 h-4 w-4" />
                            Catat Supply Baru
                        </Link>
                    </Button>
                </div>

                <hr className="mb-6 border-border" />

                {/* ── TABEL HISTORY SUPPLY ── */}
                <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full border-collapse">
                        {/* Header kolom */}
                        <thead>
                            <tr className="border-b border-border bg-muted/60">
                                <th className="border-r border-border px-4 py-3 text-left text-sm font-semibold text-foreground">
                                    Tanggal
                                </th>
                                <th className="border-r border-border px-4 py-3 text-left text-sm font-semibold text-foreground">
                                    Supplier
                                </th>
                                <th className="border-r border-border px-4 py-3 text-left text-sm font-semibold text-foreground">
                                    Produk
                                </th>
                                <th className="border-r border-border px-4 py-3 text-center text-sm font-semibold text-foreground">
                                    Qty
                                </th>
                                <th className="border-r border-border px-4 py-3 text-right text-sm font-semibold text-foreground">
                                    Harga/Unit
                                </th>
                                <th className="border-r border-border px-4 py-3 text-right text-sm font-semibold text-foreground">
                                    Total
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                    Catatan
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {/* ── Jika belum ada data ── */}
                            {supplies.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-16 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <Truck className="h-10 w-10 text-muted-foreground/40" />
                                            <p className="text-sm text-muted-foreground">
                                                Belum ada supply yang dicatat.
                                            </p>
                                            <Link
                                                href={route('supply.create')}
                                                className="text-sm font-medium text-orange-500 hover:underline"
                                            >
                                                Catat supply pertama →
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                /* ── Baris data ── */
                                supplies.map((supply, index) => (
                                    <tr
                                        key={supply.id}
                                        className={`border-b border-border transition-colors hover:bg-muted/30 ${
                                            index % 2 === 0
                                                ? 'bg-card'
                                                : 'bg-muted/10'
                                        }`}
                                    >
                                        {/* Tanggal + waktu relatif */}
                                        <td className="border-r border-border px-4 py-3">
                                            <p className="text-sm font-medium text-foreground">
                                                {supply.tanggal}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {supply.waktu_lalu}
                                            </p>
                                        </td>

                                        {/* Nama supplier */}
                                        <td className="border-r border-border px-4 py-3">
                                            <p className="text-sm font-medium text-foreground">
                                                {supply.supplier_name}
                                            </p>
                                        </td>

                                        {/* Nama produk */}
                                        <td className="border-r border-border px-4 py-3">
                                            <p className="text-sm text-foreground">
                                                {supply.product_name}
                                            </p>
                                        </td>

                                        {/* Jumlah beli — dengan badge biru */}
                                        <td className="border-r border-border px-4 py-3 text-center">
                                            <span className="inline-flex items-center rounded-full bg-blue-500/15 px-3 py-0.5 text-sm font-bold text-blue-500">
                                                +{supply.quantity}
                                            </span>
                                        </td>

                                        {/* Harga per unit */}
                                        <td className="border-r border-border px-4 py-3 text-right">
                                            <span className="font-mono text-sm text-muted-foreground">
                                                {formatRupiah(
                                                    supply.purchase_price,
                                                )}
                                            </span>
                                        </td>

                                        {/* Total harga — ditebalkan karena ini yang paling penting */}
                                        <td className="border-r border-border px-4 py-3 text-right">
                                            <span className="font-mono text-sm font-semibold text-orange-500">
                                                {formatRupiah(
                                                    supply.total_amount,
                                                )}
                                            </span>
                                        </td>

                                        {/* Catatan */}
                                        <td className="px-4 py-3">
                                            <p className="line-clamp-1 text-sm text-muted-foreground">
                                                {supply.note}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── TOTAL RINGKASAN (jika ada data) ── */}
                {supplies.length > 0 && (
                    <div className="mt-4 flex justify-end">
                        <div className="rounded-xl border border-border bg-card px-5 py-3">
                            <p className="text-xs text-muted-foreground">
                                Total pengeluaran supply ({supplies.length}{' '}
                                transaksi)
                            </p>
                            <p className="text-right text-lg font-bold text-orange-500">
                                {formatRupiah(
                                    supplies.reduce(
                                        (sum, s) => sum + s.total_amount,
                                        0,
                                    ),
                                )}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
