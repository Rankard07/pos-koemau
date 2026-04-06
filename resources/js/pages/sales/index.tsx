// resources/js/pages/sales/index.tsx
//
// Halaman KASIR — tempat Bunda mencatat setiap penjualan ke pelanggan.
// Cara kerjanya mirip mesin kasir di minimarket:
// 1. Pelanggan memilih produk → klik "Tambah" → masuk keranjang (kanan)
// 2. Setelah semua produk dipilih → klik "Checkout"
// 3. Stok produk otomatis berkurang, pemasukan otomatis tercatat
//
// BUG YANG DIPERBAIKI:
// Sebelumnya, kode `return <AppLayout>...</AppLayout>` diletakkan di DALAM
// fungsi handleCheckout, bukan di badan utama komponen. Akibatnya,
// halaman tidak pernah menampilkan apapun saat dibuka.
// Perbaikan: pindahkan return ke luar handleCheckout.

import { Head, router } from '@inertiajs/react';
import { CheckCircle, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
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
    selling_price: number;
    stock: number;
    image: string | null;
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface SalesIndexProps {
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
    { title: 'Kasir Penjualan', href: route('sales.index') },
];

// ─────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────

export default function SalesIndex({ title, products }: SalesIndexProps) {
    // State keranjang belanja — menyimpan produk yang dipilih + jumlahnya
    const [cart, setCart] = useState<CartItem[]>([]);
    const [note, setNote] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // ── Tambah produk ke keranjang ──
    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find(
                (item) => item.product.id === product.id,
            );

            if (existing) {
                // Sudah ada di keranjang — tambah quantity (tapi tidak melebihi stok)
                if (existing.quantity >= product.stock) {
                    return prev;
                }

                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }

            // Belum ada — tambahkan baru
            return [...prev, { product, quantity: 1 }];
        });
    };

    // ── Kurangi quantity di keranjang ──
    const decreaseQuantity = (productId: number) => {
        setCart(
            (prev) =>
                prev
                    .map((item) =>
                        item.product.id === productId
                            ? { ...item, quantity: item.quantity - 1 }
                            : item,
                    )
                    .filter((item) => item.quantity > 0), // hapus jika quantity jadi 0
        );
    };

    // ── Hapus produk dari keranjang ──
    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
    };

    // ── Hitung total harga semua item di keranjang ──
    const totalHarga = cart.reduce(
        (total, item) => total + item.product.selling_price * item.quantity,
        0,
    );

    // ── Cek berapa quantity produk tertentu di keranjang ──
    const quantityInCart = (productId: number): number => {
        return (
            cart.find((item) => item.product.id === productId)?.quantity ?? 0
        );
    };

    // ── Submit transaksi ke backend ──
    // SEBELUMNYA: kondisinya `if (cart.length === 0)` yang terbalik!
    // PERBAIKAN: `if (cart.length > 0)` — hanya submit jika keranjang tidak kosong
    const handleCheckout = () => {
        if (cart.length === 0) {
            return;
        } // jangan lanjut kalau keranjang kosong

        setIsProcessing(true);

        router.post(
            route('sales.store'),
            {
                items: cart.map((item) => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                })),
                note,
            },
            {
                onSuccess: () => {
                    setCart([]);
                    setNote('');
                    setShowSuccess(true);
                    // Sembunyikan notifikasi sukses setelah 3 detik
                    setTimeout(() => setShowSuccess(false), 3000);
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    // ════════════════════════════════════════════════════════════
    // RETURN — INI YANG SEBELUMNYA SALAH POSISI (di dalam handleCheckout)
    // Sekarang sudah dipindah ke badan utama komponen — ini posisi yang benar!
    // ════════════════════════════════════════════════════════════

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="px-4 py-6">
                {/* ── Notifikasi sukses ── */}
                {showSuccess && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-5 w-5 shrink-0" />
                        <span className="font-medium">
                            Transaksi berhasil dicatat! Stok produk telah
                            dikurangi.
                        </span>
                    </div>
                )}

                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* ══════════════════════════════════════
                        KIRI: Grid Produk yang bisa dipilih
                    ══════════════════════════════════════ */}
                    <div className="flex-1">
                        <h1 className="mb-4 text-xl font-semibold text-foreground">
                            {title}
                        </h1>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Klik produk untuk menambahkan ke keranjang. Produk
                            dengan stok 0 tidak ditampilkan.
                        </p>

                        {products.length === 0 ? (
                            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
                                Semua produk stoknya habis.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                                {products.map((product) => {
                                    const qty = quantityInCart(product.id);

                                    return (
                                        <div
                                            key={product.id}
                                            className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
                                        >
                                            {/* Gambar produk */}
                                            <div className="aspect-square bg-muted">
                                                {product.image ? (
                                                    <img
                                                        src={`/storage/${product.image}`}
                                                        alt={
                                                            product.product_name
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <span className="text-xs text-muted-foreground">
                                                            No img
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info produk */}
                                            <div className="flex flex-1 flex-col gap-2 p-3">
                                                <p className="text-sm leading-tight font-medium text-foreground">
                                                    {product.product_name}
                                                </p>
                                                <p className="text-sm font-semibold text-orange-500">
                                                    {formatRupiah(
                                                        product.selling_price,
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Stok: {product.stock}
                                                </p>

                                                {/* Kontrol: Tambah atau kurangi jumlah */}
                                                {qty === 0 ? (
                                                    /* Tombol tambah pertama kali */
                                                    <button
                                                        onClick={() =>
                                                            addToCart(product)
                                                        }
                                                        className="mt-auto w-full rounded-lg bg-orange-500 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-600"
                                                    >
                                                        + Tambah
                                                    </button>
                                                ) : (
                                                    /* Kontrol +/- setelah produk ada di keranjang */
                                                    <div className="mt-auto flex items-center justify-between">
                                                        <button
                                                            onClick={() =>
                                                                decreaseQuantity(
                                                                    product.id,
                                                                )
                                                            }
                                                            className="rounded-lg bg-muted p-1 hover:bg-muted/80"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <span className="text-sm font-bold">
                                                            {qty}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                addToCart(
                                                                    product,
                                                                )
                                                            }
                                                            disabled={
                                                                qty >=
                                                                product.stock
                                                            }
                                                            className="rounded-lg bg-muted p-1 hover:bg-muted/80 disabled:opacity-40"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ══════════════════════════════════════
                        KANAN: Panel Keranjang / Checkout
                        Sticky = tetap terlihat saat scroll
                    ══════════════════════════════════════ */}
                    <div className="w-full shrink-0 lg:w-80">
                        <div className="sticky top-4 rounded-xl border border-border bg-card p-4">
                            {/* Header keranjang */}
                            <div className="mb-4 flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-orange-500" />
                                <h2 className="font-semibold text-foreground">
                                    Keranjang
                                </h2>
                                {cart.length > 0 && (
                                    <span className="ml-auto rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
                                        {cart.reduce(
                                            (sum, i) => sum + i.quantity,
                                            0,
                                        )}{' '}
                                        item
                                    </span>
                                )}
                            </div>

                            {cart.length === 0 ? (
                                /* Pesan kalau keranjang masih kosong */
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Belum ada produk dipilih.
                                    <br />
                                    Klik produk di sebelah kiri.
                                </p>
                            ) : (
                                <>
                                    {/* Daftar item di keranjang */}
                                    <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
                                        {cart.map((item) => (
                                            <div
                                                key={item.product.id}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-foreground">
                                                        {
                                                            item.product
                                                                .product_name
                                                        }
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.quantity} ×{' '}
                                                        {formatRupiah(
                                                            item.product
                                                                .selling_price,
                                                        )}
                                                    </p>
                                                </div>
                                                <p className="shrink-0 font-semibold text-orange-500">
                                                    {formatRupiah(
                                                        item.product
                                                            .selling_price *
                                                            item.quantity,
                                                    )}
                                                </p>
                                                {/* Tombol hapus dari keranjang */}
                                                <button
                                                    onClick={() =>
                                                        removeFromCart(
                                                            item.product.id,
                                                        )
                                                    }
                                                    className="text-destructive hover:opacity-70"
                                                    title="Hapus dari keranjang"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <hr className="mb-3 border-border" />

                                    {/* Total harga */}
                                    <div className="mb-3 flex justify-between text-base font-bold">
                                        <span className="text-foreground">
                                            Total
                                        </span>
                                        <span className="text-orange-500">
                                            {formatRupiah(totalHarga)}
                                        </span>
                                    </div>

                                    {/* Catatan opsional */}
                                    <textarea
                                        value={note}
                                        onChange={(e) =>
                                            setNote(e.target.value)
                                        }
                                        placeholder="Catatan (opsional)..."
                                        rows={2}
                                        className="mb-3 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                    />

                                    {/* Tombol checkout */}
                                    <button
                                        onClick={handleCheckout}
                                        disabled={
                                            isProcessing || cart.length === 0
                                        }
                                        className="w-full rounded-full bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isProcessing
                                            ? 'Memproses...'
                                            : '✓ Checkout'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
