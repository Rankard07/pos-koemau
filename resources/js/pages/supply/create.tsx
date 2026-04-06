// resources/js/pages/supply/create.tsx
//
// Halaman ini adalah FORM untuk mencatat supply baru.
// Analoginya: Bunda baru saja terima kiriman 50 pack Dimsum dari Pak Budi,
// lalu membuka form ini untuk mencatat: dari siapa, produk apa, berapa unit,
// harga berapa, dan tanggal berapa.
//
// Setelah disubmit:
// - Stok produk yang dipilih akan NAIK otomatis
// - Pengeluaran otomatis tercatat di laporan keuangan

import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

// ─────────────────────────────────────────────────────────
// TIPE DATA
// ─────────────────────────────────────────────────────────

interface Product {
    id: number;
    product_name: string;
    purchase_price: number; // harga beli terakhir — untuk pre-fill form
    stock: number; // stok saat ini — ditampilkan sebagai informasi
}

interface CreateProps {
    title: string;
    products: Product[];
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
    { title: 'Catat Supply Baru', href: route('supply.create') },
];

// ─────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────

export default function Create({ title, products }: CreateProps) {
    // ── State form — semua nilai input disimpan di sini ──
    const [supplierName, setSupplierName] = useState('');
    const [productId, setProductId] = useState<string | number>('');
    const [quantity, setQuantity] = useState<string | number>('');
    const [purchasePrice, setPurchasePrice] = useState<string | number>('');
    const [supplyDate, setSupplyDate] = useState(
        // Default: tanggal hari ini dalam format YYYY-MM-DD yang diterima oleh input type="date"
        new Date().toISOString().split('T')[0],
    );
    const [note, setNote] = useState('');

    // State untuk error dari backend dan loading state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    // ── Produk yang sedang dipilih di dropdown ──
    // Kita cari objek produk-nya supaya bisa menampilkan stok & harga saat ini
    const selectedProduct = products.find((p) => p.id === Number(productId));

    // ── Kalkulasi total secara real-time ──
    // Setiap kali quantity atau purchasePrice berubah, total otomatis terhitung
    const totalAmount =
        Number(quantity) > 0 && Number(purchasePrice) > 0
            ? Number(quantity) * Number(purchasePrice)
            : 0;

    // ── Handler: saat produk dipilih dari dropdown ──
    // Pre-fill harga beli dengan harga terakhir produk tersebut
    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setProductId(id);
        setErrors({}); // bersihkan error saat user mulai memilih ulang

        // Auto-isi harga beli dari data produk — tapi user tetap bisa mengubahnya
        const product = products.find((p) => p.id === Number(id));

        if (product) {
            setPurchasePrice(product.purchase_price);
        } else {
            setPurchasePrice('');
        }
    };

    // ── Handler: submit form ──
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post(
            route('supply.store'),
            {
                supplier_name: supplierName,
                product_id: Number(productId),
                quantity: Number(quantity),
                purchase_price: Number(purchasePrice),
                supply_date: supplyDate,
                note: note || null,
            },
            {
                onError: (errs: Record<string, string>) => {
                    setErrors(errs);
                    setProcessing(false);
                },
            },
        );
    };

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
                            Isi formulir di bawah untuk mencatat pembelian stok
                            baru. Stok produk akan otomatis bertambah setelah
                            disimpan.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={route('supply.index')}>
                            ← Kembali ke History
                        </Link>
                    </Button>
                </div>

                <hr className="mb-6 border-border" />

                {/* Error umum dari backend */}
                {errors.message && (
                    <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                        {errors.message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* ════════════════════════════════════════
                            KOLOM KIRI (2/3 lebar): Field utama form
                        ════════════════════════════════════════ */}
                        <div className="space-y-5 lg:col-span-2">
                            {/* ── Nama Supplier ── */}
                            <div className="rounded-xl border border-border bg-card p-5">
                                <h2 className="mb-4 text-base font-semibold text-foreground">
                                    Informasi Supplier
                                </h2>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                                        Nama Supplier{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Pak Budi, CV Maju Jaya, Pasar Induk"
                                        value={supplierName}
                                        onChange={(e) =>
                                            setSupplierName(e.target.value)
                                        }
                                        disabled={processing}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                    />
                                    {errors.supplier_name && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.supplier_name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* ── Produk yang dibeli ── */}
                            <div className="rounded-xl border border-border bg-card p-5">
                                <h2 className="mb-4 text-base font-semibold text-foreground">
                                    Produk yang Dibeli
                                </h2>

                                {/* Dropdown pilih produk */}
                                <div className="mb-4">
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                                        Pilih Produk{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </label>
                                    <select
                                        value={productId}
                                        onChange={handleProductChange}
                                        disabled={processing}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                    >
                                        <option value="">
                                            -- Pilih Produk --
                                        </option>
                                        {products.map((product) => (
                                            <option
                                                key={product.id}
                                                value={product.id}
                                            >
                                                {product.product_name} (Stok:{' '}
                                                {product.stock})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.product_id && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.product_id}
                                        </p>
                                    )}
                                </div>

                                {/* Info stok saat ini — muncul setelah produk dipilih */}
                                {selectedProduct && (
                                    <div className="mb-4 flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-400">
                                        <span>ℹ️</span>
                                        <span>
                                            Stok{' '}
                                            <strong>
                                                {selectedProduct.product_name}
                                            </strong>{' '}
                                            saat ini:{' '}
                                            <strong>
                                                {selectedProduct.stock} unit
                                            </strong>
                                            . Setelah supply disimpan, stok akan
                                            bertambah.
                                        </span>
                                    </div>
                                )}

                                {/* Jumlah dan harga dalam satu baris */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Jumlah yang dibeli */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Jumlah Beli (unit){' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Contoh: 50"
                                            value={quantity}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) =>
                                                setQuantity(e.target.value)
                                            }
                                            disabled={processing}
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                        />
                                        {errors.quantity && (
                                            <p className="mt-1 text-xs text-destructive">
                                                {errors.quantity}
                                            </p>
                                        )}
                                    </div>

                                    {/* Harga beli per unit — pre-filled, tapi bisa diubah */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Harga Beli/Unit (Rp){' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Contoh: 180000"
                                            value={purchasePrice}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) =>
                                                setPurchasePrice(e.target.value)
                                            }
                                            disabled={processing}
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                        />
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Harga sudah otomatis diisi dari data
                                            produk, tapi bisa kamu ubah jika
                                            berbeda.
                                        </p>
                                        {errors.purchase_price && (
                                            <p className="mt-1 text-xs text-destructive">
                                                {errors.purchase_price}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── Tanggal dan Catatan ── */}
                            <div className="rounded-xl border border-border bg-card p-5">
                                <h2 className="mb-4 text-base font-semibold text-foreground">
                                    Detail Tambahan
                                </h2>

                                {/* Tanggal supply */}
                                <div className="mb-4">
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                                        Tanggal Pembelian{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="date"
                                        value={supplyDate}
                                        onChange={(e) =>
                                            setSupplyDate(e.target.value)
                                        }
                                        disabled={processing}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Default hari ini. Ubah jika kamu baru
                                        mencatat pembelian yang sudah lama.
                                    </p>
                                    {errors.supply_date && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.supply_date}
                                        </p>
                                    )}
                                </div>

                                {/* Catatan opsional */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                                        Catatan{' '}
                                        <span className="font-normal text-muted-foreground">
                                            (opsional)
                                        </span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Contoh: Beli karena stok menipis, harga naik dari biasanya, dll."
                                        value={note}
                                        onChange={(e) =>
                                            setNote(e.target.value)
                                        }
                                        disabled={processing}
                                        className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ════════════════════════════════════════
                            KOLOM KANAN (1/3 lebar): Ringkasan & Aksi
                        ════════════════════════════════════════ */}
                        <div className="space-y-5">
                            {/* Ringkasan kalkulasi — mirip struk kasir */}
                            <div className="sticky top-4 rounded-xl border border-border bg-card p-5">
                                <h2 className="mb-4 text-base font-semibold text-foreground">
                                    Ringkasan
                                </h2>

                                <div className="space-y-3 text-sm">
                                    {/* Nama produk */}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Produk
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {selectedProduct
                                                ? selectedProduct.product_name
                                                : '—'}
                                        </span>
                                    </div>

                                    {/* Supplier */}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Dari
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {supplierName || '—'}
                                        </span>
                                    </div>

                                    {/* Jumlah */}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Jumlah
                                        </span>
                                        <span className="font-bold text-blue-500">
                                            {quantity
                                                ? `+${quantity} unit`
                                                : '—'}
                                        </span>
                                    </div>

                                    {/* Stok setelah supply */}
                                    {selectedProduct &&
                                        Number(quantity) > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Stok setelah
                                                </span>
                                                <span className="font-medium text-green-500">
                                                    {selectedProduct.stock +
                                                        Number(quantity)}{' '}
                                                    unit
                                                </span>
                                            </div>
                                        )}

                                    <hr className="border-border" />

                                    {/* Harga per unit */}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Harga/unit
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {purchasePrice
                                                ? formatRupiah(
                                                      Number(purchasePrice),
                                                  )
                                                : '—'}
                                        </span>
                                    </div>

                                    {/* Total — ini yang paling besar */}
                                    <div className="flex justify-between rounded-lg bg-orange-500/10 px-3 py-2">
                                        <span className="font-semibold text-foreground">
                                            Total
                                        </span>
                                        <span className="text-base font-bold text-orange-500">
                                            {totalAmount > 0
                                                ? formatRupiah(totalAmount)
                                                : '—'}
                                        </span>
                                    </div>
                                </div>

                                {/* Info otomatis tercatat sebagai pengeluaran */}
                                {totalAmount > 0 && (
                                    <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-600 dark:text-yellow-400">
                                        💡 Total ini akan otomatis tercatat
                                        sebagai pengeluaran (pembelian stok) di
                                        laporan keuangan.
                                    </div>
                                )}

                                {/* Tombol submit */}
                                <div className="mt-5 space-y-2">
                                    <button
                                        type="submit"
                                        disabled={
                                            processing ||
                                            !supplierName ||
                                            !productId ||
                                            !quantity ||
                                            Number(quantity) <= 0 ||
                                            !purchasePrice ||
                                            !supplyDate
                                        }
                                        className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing
                                            ? 'Menyimpan...'
                                            : '✓ Simpan Supply'}
                                    </button>
                                    <Link
                                        href={route('supply.index')}
                                        className="block w-full rounded-full border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition hover:bg-muted"
                                    >
                                        Batal
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
