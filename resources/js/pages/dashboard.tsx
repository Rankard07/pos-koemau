import { Head, Link } from '@inertiajs/react';
import {
    TrendingUp,
    TrendingDown,
    Package,
    AlertTriangle,
    ShoppingCart,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

// ─────────────────────────────────────────────────────────────
// TIPE DATA — mendeskripsikan bentuk data yang dikirim dari PHP
// ─────────────────────────────────────────────────────────────

interface ChartItem {
    bulan: string;
    pemasukan: number;
    pengeluaran: number;
}

interface TransaksiItem {
    id: number;
    total_amount: number;
    jumlah_item: number;
    tanggal: string;
}

interface ProdukMenipisItem {
    id: number;
    product_name: string;
    stock: number;
}

interface DashboardProps {
    title: string;
    pemasukanBulanIni: number;
    pengeluaranBulanIni: number;
    labaBersih: number;
    totalProduk: number;
    stokMenipis: number;
    chartData: ChartItem[];
    transaksiTerbaru: TransaksiItem[];
    produkStokMenipis: ProdukMenipisItem[];
}

// ─────────────────────────────────────────────────────────────
// HELPER — format angka jadi Rupiah
// Contoh: 150000 → "Rp150.000"
// ─────────────────────────────────────────────────────────────

function formatRupiah(angka: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(angka);
}

// ─────────────────────────────────────────────────────────────
// KOMPONEN: Summary Card
// Digunakan untuk 3 kartu di baris pertama dashboard
// ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    colorClass: string; // warna background icon
    subLabel?: string;
}

function SummaryCard({
    label,
    value,
    icon,
    colorClass,
    subLabel,
}: SummaryCardProps) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClass}`}
            >
                {icon}
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-xl font-semibold text-foreground">{value}</p>
                {subLabel && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {subLabel}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// KOMPONEN: Bar Chart sederhana (tanpa library tambahan)
// Menampilkan perbandingan pemasukan vs pengeluaran per bulan
// ─────────────────────────────────────────────────────────────

function SimpleBarChart({ data }: { data: ChartItem[] }) {
    // Cari nilai terbesar dari semua data untuk menentukan skala bar
    const maxValue = Math.max(
        ...data.map((d) => Math.max(d.pemasukan, d.pengeluaran)),
        1, // hindari pembagian dengan 0 jika semua data kosong
    );

    return (
        <div className="space-y-3">
            {/* Legend */}
            <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-sm bg-green-500" />
                    <span className="text-muted-foreground">Pemasukan</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-sm bg-red-400" />
                    <span className="text-muted-foreground">Pengeluaran</span>
                </div>
            </div>

            {/* Bar Groups */}
            <div className="flex h-40 items-end gap-3">
                {data.map((item) => (
                    <div
                        key={item.bulan}
                        className="flex flex-1 flex-col items-center gap-1"
                    >
                        {/* Dua bar: hijau (pemasukan) dan merah (pengeluaran) */}
                        <div className="flex h-32 w-full items-end justify-center gap-0.5">
                            {/* Bar Pemasukan */}
                            <div
                                className="min-h-[2px] flex-1 rounded-t-sm bg-green-500 transition-all duration-500"
                                style={{
                                    height: `${(item.pemasukan / maxValue) * 100}%`,
                                }}
                                title={`Pemasukan: ${formatRupiah(item.pemasukan)}`}
                            />
                            {/* Bar Pengeluaran */}
                            <div
                                className="min-h-[2px] flex-1 rounded-t-sm bg-red-400 transition-all duration-500"
                                style={{
                                    height: `${(item.pengeluaran / maxValue) * 100}%`,
                                }}
                                title={`Pengeluaran: ${formatRupiah(item.pengeluaran)}`}
                            />
                        </div>
                        {/* Label bulan di bawah bar */}
                        <span className="text-center text-xs leading-tight text-muted-foreground">
                            {item.bulan}
                        </span>
                    </div>
                ))}
            </div>

            {/* Catatan jika semua data masih 0 */}
            {maxValue === 1 && (
                <p className="py-2 text-center text-sm text-muted-foreground">
                    Belum ada data pemasukan & pengeluaran
                </p>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// BREADCRUMBS — navigasi di bagian atas halaman
// ─────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
];

// ─────────────────────────────────────────────────────────────
// HALAMAN UTAMA DASHBOARD
// ─────────────────────────────────────────────────────────────

export default function Dashboard({
    title,
    pemasukanBulanIni,
    pengeluaranBulanIni,
    labaBersih,
    totalProduk,
    stokMenipis,
    chartData,
    transaksiTerbaru,
    produkStokMenipis,
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="space-y-6 px-4 py-6">
                {/* ── JUDUL ── */}
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Dashboard KoeMau
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Ringkasan bisnis frozen food KoeMau bulan ini.
                    </p>
                </div>

                {/* ── PERINGATAN STOK MENIPIS ── */}
                {stokMenipis > 0 && (
                    <div className="flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>
                            <strong>{stokMenipis} produk</strong> stoknya hampir
                            habis (≤ 5 pcs).{' '}
                            <Link
                                href={route('products.index')}
                                className="underline hover:no-underline"
                            >
                                Lihat produk
                            </Link>
                        </span>
                    </div>
                )}

                {/* ── BARIS 1: 3 SUMMARY CARDS ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <SummaryCard
                        label="Pemasukan Bulan Ini"
                        value={formatRupiah(pemasukanBulanIni)}
                        icon={<TrendingUp className="h-6 w-6 text-white" />}
                        colorClass="bg-green-500"
                        subLabel="Total dari penjualan & pemasukan lain"
                    />
                    <SummaryCard
                        label="Pengeluaran Bulan Ini"
                        value={formatRupiah(pengeluaranBulanIni)}
                        icon={<TrendingDown className="h-6 w-6 text-white" />}
                        colorClass="bg-red-500"
                        subLabel="Total pembelian stok & operasional"
                    />
                    <SummaryCard
                        label="Laba Bersih"
                        value={formatRupiah(labaBersih)}
                        icon={
                            labaBersih >= 0 ? (
                                <TrendingUp className="h-6 w-6 text-white" />
                            ) : (
                                <TrendingDown className="h-6 w-6 text-white" />
                            )
                        }
                        colorClass={
                            labaBersih >= 0 ? 'bg-orange-500' : 'bg-gray-500'
                        }
                        subLabel="Pemasukan dikurangi pengeluaran"
                    />
                </div>

                {/* ── BARIS 2: Kartu Produk + Penjualan Cepat ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SummaryCard
                        label="Total Produk"
                        value={`${totalProduk} produk`}
                        icon={<Package className="h-6 w-6 text-white" />}
                        colorClass="bg-blue-500"
                        subLabel={
                            stokMenipis > 0
                                ? `${stokMenipis} hampir habis`
                                : 'Semua stok aman'
                        }
                    />
                    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Penjualan Baru?
                            </p>
                            <p className="mt-0.5 text-base font-medium text-foreground">
                                Catat transaksi penjualan
                            </p>
                        </div>
                        <Link
                            href={route('sales.index')}
                            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Buka Kasir
                        </Link>
                    </div>
                </div>

                {/* ── BARIS 3: Grafik + Tabel ── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* Grafik — 2/3 lebar */}
                    <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
                        <h2 className="mb-4 text-base font-semibold text-foreground">
                            Pemasukan vs Pengeluaran (6 Bulan Terakhir)
                        </h2>
                        <SimpleBarChart data={chartData} />
                    </div>

                    {/* Stok Menipis — 1/3 lebar */}
                    <div className="rounded-xl border border-border bg-card p-5">
                        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Stok Menipis
                        </h2>
                        {produkStokMenipis.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Semua stok produk aman 👍
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {produkStokMenipis.map((produk) => (
                                    <li
                                        key={produk.id}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="max-w-[60%] truncate text-sm text-foreground">
                                            {produk.product_name}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                produk.stock === 0
                                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}
                                        >
                                            {produk.stock === 0
                                                ? 'Habis'
                                                : `${produk.stock} pcs`}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Link
                            href={route('products.index')}
                            className="mt-4 block text-xs text-orange-500 hover:underline"
                        >
                            Lihat semua produk →
                        </Link>
                    </div>
                </div>

                {/* ── BARIS 4: Transaksi Terbaru ── */}
                <div className="rounded-xl border border-border bg-card p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-semibold text-foreground">
                            Transaksi Terbaru
                        </h2>
                        <Link
                            href={route('sales.index')}
                            className="text-xs text-orange-500 hover:underline"
                        >
                            Lihat semua →
                        </Link>
                    </div>

                    {transaksiTerbaru.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            Belum ada transaksi penjualan.{' '}
                            <Link
                                href={route('sales.index')}
                                className="text-orange-500 hover:underline"
                            >
                                Catat penjualan pertama
                            </Link>
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-muted-foreground">
                                    <th className="pb-2 font-medium">ID</th>
                                    <th className="pb-2 font-medium">
                                        Tanggal
                                    </th>
                                    <th className="pb-2 font-medium">
                                        Jumlah Item
                                    </th>
                                    <th className="pb-2 text-right font-medium">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transaksiTerbaru.map((t) => (
                                    <tr
                                        key={t.id}
                                        className="border-b border-border/50 last:border-0"
                                    >
                                        <td className="py-2.5 text-muted-foreground">
                                            #{t.id}
                                        </td>
                                        <td className="py-2.5">{t.tanggal}</td>
                                        <td className="py-2.5">
                                            {t.jumlah_item} pcs
                                        </td>
                                        <td className="py-2.5 text-right font-medium text-green-600 dark:text-green-400">
                                            {formatRupiah(t.total_amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
