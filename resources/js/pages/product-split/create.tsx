// resources/js/pages/product-split/create.tsx
//
// PERUBAHAN UTAMA dari versi sebelumnya:
// - "Stok Induk Berkurang" TIDAK lagi ada per baris produk hasil.
//   Alasannya: dari 1 unit Dimsum 100, bisa menghasilkan 1 Dimsum 50
//   DAN 2 Dimsum 25 sekaligus — jadi induk berkurang cukup 1, bukan 1+2=3.
// - Sekarang ada 1 input tunggal "Jumlah induk yang digunakan" di bagian
//   Ringkasan, yang dikirim ke backend sebagai `qty_from`.
// - Backend akan menggunakan nilai ini untuk mengurangi stok induk
//   (bukan lagi sum dari semua result quantities).

import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

// ─────────────────────────────────────────────────────────
// TIPE DATA
// ─────────────────────────────────────────────────────────
interface Product {
    id: number;
    product_name: string;
    stock: number;
    selling_price: number;
}

interface SplitItem {
    id: string; // key unik React, bukan dari DB
    product_id_to: string | number;
    quantity: string | number;
}

interface CreateProps {
    title: string;
    products: Product[];
    selectedProduct?: Product | null;
}

// ─────────────────────────────────────────────────────────
// HELPER
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
    { title: 'Daftar Produk', href: route('products.index') },
    { title: 'Pecah Produk', href: route('product-split.create') },
];

// ─────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────
export default function Create({
    title,
    products,
    selectedProduct = null,
}: CreateProps) {
    // ── State produk induk
    const [parentProductId, setParentProductId] = useState<string | number>(
        selectedProduct ? selectedProduct.id : '',
    );

    const [note, setNote] = useState('');

    // ── Baris-baris produk hasil (tanpa field stok induk berkurang per baris)
    const [splitItems, setSplitItems] = useState<SplitItem[]>([
        { id: '1', product_id_to: '', quantity: '' },
    ]);

    // ── qty_from: berapa unit produk INDUK yang digunakan / berkurang
    //    Ini field tunggal — user yang mengisi, bukan otomatis dari sum result
    const [qtyFrom, setQtyFrom] = useState<string | number>('');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    // ── Produk induk yang aktif
    const parentProduct = selectedProduct
        ? selectedProduct
        : products.find((p) => p.id === Number(parentProductId));

    // ── Stok induk setelah pemecahan
    const stockAfterSplit = parentProduct
        ? parentProduct.stock - (Number(qtyFrom) || 0)
        : 0;

    // ── Apakah stok tidak cukup?
    const isStockInsufficient =
        parentProduct !== undefined &&
        Number(qtyFrom) > 0 &&
        Number(qtyFrom) > parentProduct.stock;

    // ─────────────────────────────────────────────────────
    // HANDLER: Tambah baris produk hasil
    // ─────────────────────────────────────────────────────
    const addSplitItem = () => {
        setSplitItems([
            ...splitItems,
            { id: Date.now().toString(), product_id_to: '', quantity: '' },
        ]);
    };

    // ─────────────────────────────────────────────────────
    // HANDLER: Hapus baris produk hasil
    // ─────────────────────────────────────────────────────
    const removeSplitItem = (id: string) => {
        setSplitItems(splitItems.filter((item) => item.id !== id));
    };

    // ─────────────────────────────────────────────────────
    // HANDLER: Update field di baris produk hasil
    // ─────────────────────────────────────────────────────
    const updateSplitItem = (
        id: string,
        field: keyof Omit<SplitItem, 'id'>,
        value: string | number,
    ) => {
        setSplitItems(
            splitItems.map((item) =>
                item.id === id ? { ...item, [field]: value } : item,
            ),
        );
    };

    // ─────────────────────────────────────────────────────
    // HANDLER: Submit form
    // ─────────────────────────────────────────────────────
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const data = {
            product_id_from: Number(parentProductId),
            // qty_from = berapa unit induk yang digunakan
            // Backend akan menggunakan ini untuk mengurangi stok induk
            qty_from: Number(qtyFrom),
            note: note || null,
            split_items: splitItems.map((item) => ({
                product_id_to: Number(item.product_id_to),
                quantity: Number(item.quantity),
                // selling_price tidak lagi wajib per row di versi ini
                // karena tidak tampil di form; backend akan menggunakan
                // harga jual produk hasil yang sudah ada di database
                selling_price: 0,
            })),
        };

        router.post(route('product-split.store'), data, {
            onError: (errs: Record<string, string>) => {
                setErrors(errs);
                setProcessing(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="px-4 py-6">
                {/* ── HEADER ── */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-foreground">
                        {title}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pecah satu produk induk menjadi beberapa produk hasil.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error umum dari backend */}
                    {errors.message && (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                            {errors.message}
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════
                        SECTION 1: PRODUK INDUK
                    ═══════════════════════════════════════════════════ */}
                    <div className="rounded-xl border border-border bg-card p-5">
                        <h2 className="mb-4 text-base font-semibold text-foreground">
                            Produk Induk{' '}
                            <span className="font-normal text-muted-foreground">
                                (yang akan dipecah)
                            </span>
                        </h2>

                        {/* ── Mode TERKUNCI: selectedProduct datang dari tombol Pecah ── */}
                        {selectedProduct ? (
                            <div>
                                <p className="mb-2 text-xs text-muted-foreground">
                                    Produk induk sudah dipilih dan tidak dapat
                                    diubah.
                                </p>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {/* Nama Produk */}
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                            Nama Produk
                                        </label>
                                        <div className="flex h-9 items-center rounded-lg border border-border bg-muted/40 px-3 text-sm font-semibold text-foreground">
                                            {selectedProduct.product_name}
                                        </div>
                                    </div>
                                    {/* Stok Saat Ini */}
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                            Stok Saat Ini
                                        </label>
                                        <div className="flex h-9 items-center rounded-lg border border-border bg-muted/40 px-3 text-sm font-semibold text-orange-500">
                                            {selectedProduct.stock} unit
                                        </div>
                                    </div>
                                    {/* Harga Jual */}
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                            Harga Jual
                                        </label>
                                        <div className="flex h-9 items-center rounded-lg border border-border bg-muted/40 px-3 text-sm font-semibold text-blue-400">
                                            {formatRupiah(
                                                selectedProduct.selling_price,
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ── Mode DROPDOWN: user memilih sendiri ── */
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">
                                    Pilih Produk Induk{' '}
                                    <span className="text-destructive">*</span>
                                </label>
                                <select
                                    value={parentProductId}
                                    onChange={(e) => {
                                        setParentProductId(e.target.value);
                                        setErrors({});
                                    }}
                                    disabled={processing}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                >
                                    <option value="">-- Pilih Produk --</option>
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
                                {errors.product_id_from && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {errors.product_id_from}
                                    </p>
                                )}

                                {/* Info produk setelah dipilih dari dropdown */}
                                {parentProduct && (
                                    <div className="mt-3 grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                Stok Saat Ini
                                            </label>
                                            <div className="flex h-9 items-center rounded-lg border border-border bg-muted/40 px-3 text-sm font-semibold text-orange-500">
                                                {parentProduct.stock} unit
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                Harga Jual
                                            </label>
                                            <div className="flex h-9 items-center rounded-lg border border-border bg-muted/40 px-3 text-sm font-semibold text-blue-400">
                                                {formatRupiah(
                                                    parentProduct.selling_price,
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ═══════════════════════════════════════════════════
                        SECTION 2: KETERANGAN
                    ═══════════════════════════════════════════════════ */}
                    <div className="rounded-xl border border-border bg-card p-5">
                        <label className="mb-2 block text-sm font-medium text-foreground">
                            Keterangan{' '}
                            <span className="font-normal text-muted-foreground">
                                (opsional)
                            </span>
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            disabled={processing}
                            rows={3}
                            placeholder="Contoh: Pecahan dari 1 pack isi 100 menjadi 2 pack isi 50"
                            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    {/* ═══════════════════════════════════════════════════
                        SECTION 3: PRODUK HASIL PEMECAHAN
                        Hanya: Produk Hasil + Jumlah Hasil + tombol hapus.
                        TIDAK ada "Stok Induk Berkurang" per baris.
                    ═══════════════════════════════════════════════════ */}
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-foreground">
                                Produk Hasil Pemecahan
                            </h2>
                            <button
                                type="button"
                                onClick={addSplitItem}
                                disabled={processing}
                                className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                            >
                                + Tambah Produk
                            </button>
                        </div>

                        {/* Header kolom — 2 kolom: Produk Hasil | Jumlah Hasil */}
                        <div className="mb-2 grid grid-cols-12 gap-2 px-1">
                            <span className="col-span-7 text-xs font-medium text-muted-foreground">
                                Produk Hasil
                            </span>
                            <span className="col-span-4 text-xs font-medium text-muted-foreground">
                                Jumlah Hasil
                                <br />
                                <span className="font-normal">
                                    (stok bertambah)
                                </span>
                            </span>
                            <span className="col-span-1" />
                        </div>

                        {/* Baris-baris produk hasil */}
                        <div className="space-y-2">
                            {splitItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-12 items-center gap-2 rounded-lg border border-border bg-muted/20 p-3"
                                >
                                    {/* Dropdown produk hasil (7 kolom) */}
                                    <div className="col-span-7">
                                        <select
                                            value={item.product_id_to}
                                            onChange={(e) =>
                                                updateSplitItem(
                                                    item.id,
                                                    'product_id_to',
                                                    e.target.value,
                                                )
                                            }
                                            disabled={processing}
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                        >
                                            <option value="">
                                                -- Pilih Produk --
                                            </option>
                                            {products.map((product) => (
                                                <option
                                                    key={product.id}
                                                    value={product.id}
                                                >
                                                    {product.product_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Input jumlah hasil (4 kolom) */}
                                    <div className="col-span-4">
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Contoh: 2"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                updateSplitItem(
                                                    item.id,
                                                    'quantity',
                                                    e.target.value,
                                                )
                                            }
                                            disabled={processing}
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                        />
                                    </div>

                                    {/* Tombol hapus baris (1 kolom) */}
                                    <div className="col-span-1 flex items-center justify-center">
                                        {splitItems.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeSplitItem(item.id)
                                                }
                                                disabled={processing}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/20 text-destructive transition hover:bg-destructive/30"
                                                title="Hapus baris ini"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    {/* Error per baris */}
                                    {errors[
                                        `split_items.${splitItems.indexOf(item)}.product_id_to`
                                    ] && (
                                        <div className="col-span-12 text-xs text-destructive">
                                            {
                                                errors[
                                                    `split_items.${splitItems.indexOf(item)}.product_id_to`
                                                ]
                                            }
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {errors.split_items && (
                            <p className="mt-2 text-sm text-destructive">
                                {errors.split_items}
                            </p>
                        )}
                    </div>

                    {/* ═══════════════════════════════════════════════════
                        SECTION 4: RINGKASAN PEMECAHAN
                        Di sini ada 1 input "Stok Induk Berkurang"
                        yang user isi sendiri — bukan per baris.
                        Contoh: 1 Dimsum 100 menghasilkan 1 Dimsum 50 + 2 Dimsum 25
                        → stok induk berkurang hanya 1.
                    ═══════════════════════════════════════════════════ */}
                    <div className="rounded-xl border border-border bg-card p-5">
                        <h2 className="mb-4 text-base font-semibold text-foreground">
                            Ringkasan Pemecahan
                        </h2>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {/* ── Input: berapa unit induk yang digunakan ── */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">
                                    Total Stok Produk Induk akan berkurang{' '}
                                    <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Contoh: 1"
                                    value={qtyFrom}
                                    onChange={(e) => setQtyFrom(e.target.value)}
                                    disabled={processing || !parentProduct}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                                        isStockInsufficient
                                            ? 'border-destructive/50 bg-destructive/10 text-destructive focus:border-destructive focus:ring-destructive'
                                            : 'border-input bg-background text-foreground focus:border-primary focus:ring-primary'
                                    }`}
                                />
                                {errors.qty_from && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {errors.qty_from}
                                    </p>
                                )}
                                {/* Penjelasan singkat untuk user pemula */}
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Isi berapa unit produk induk yang dipecah.{' '}
                                    {parentProduct && (
                                        <span>
                                            Stok saat ini: {parentProduct.stock}{' '}
                                            unit.
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* ── Read-only: stok setelah pemecahan ── */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">
                                    Stok Produk Induk setelah pemecahan
                                </label>
                                <div
                                    className={`flex h-9 items-center rounded-lg border px-3 text-base font-bold ${
                                        isStockInsufficient
                                            ? 'border-destructive/50 bg-destructive/10 text-destructive'
                                            : Number(qtyFrom) > 0 &&
                                                parentProduct
                                              ? 'border-border bg-muted/40 text-foreground'
                                              : 'border-border bg-muted/40 text-muted-foreground'
                                    }`}
                                >
                                    {parentProduct && Number(qtyFrom) > 0
                                        ? stockAfterSplit
                                        : parentProduct
                                          ? parentProduct.stock
                                          : '—'}
                                </div>
                            </div>
                        </div>

                        {/* Peringatan stok tidak cukup */}
                        {isStockInsufficient && (
                            <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                ⚠️ Stok tidak cukup! Produk induk hanya memiliki{' '}
                                {parentProduct?.stock} unit.
                            </div>
                        )}

                        {/* Pesan info saat sudah valid */}
                        {!isStockInsufficient &&
                            Number(qtyFrom) > 0 &&
                            parentProduct && (
                                <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-400">
                                    ℹ️ Pastikan total stok produk hasil ≤ stok
                                    produk induk yang akan berkurang.
                                </div>
                            )}
                    </div>

                    {/* ── TOMBOL AKSI ── */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Link
                            href={route('products.index')}
                            className="inline-flex h-9 items-center rounded-full border border-border bg-transparent px-5 text-sm font-medium text-foreground transition hover:bg-muted"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={
                                processing ||
                                !parentProductId ||
                                !qtyFrom ||
                                Number(qtyFrom) <= 0 ||
                                isStockInsufficient
                            }
                            className="inline-flex h-9 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Memproses...' : 'Pecah Produk'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
