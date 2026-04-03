// resources/js/pages/products/index.tsx
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Zap, History } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

// ─────────────────────────────────────────────────────────
// BREADCRUMBS
// ─────────────────────────────────────────────────────────
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produk',
        href: route('products.index'),
    },
];

// ─────────────────────────────────────────────────────────
// TIPE DATA
// ─────────────────────────────────────────────────────────
export interface Product {
    id: number;
    product_name: string;
    purchase_price: number;
    selling_price: number;
    stock: number;
    image: string | null;
}

interface IndexProps {
    title: string;
    products: Product[];
}

// ─────────────────────────────────────────────────────────
// HELPER: Format angka ke Rupiah
// Contoh: 175000 → "Rp 175.000,00"
// Menggunakan Intl.NumberFormat dengan locale Indonesia (id-ID)
// dan mata uang IDR sehingga titik/koma sudah benar secara otomatis.
// ─────────────────────────────────────────────────────────
function formatRupiah(angka: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2, // selalu tampilkan 2 angka desimal
        maximumFractionDigits: 2,
    }).format(angka);
}

// ─────────────────────────────────────────────────────────
// HELPER: Hitung keuntungan dari harga beli dan jual
// Mengembalikan: nominal (angka), percent (string seperti "17.1")
// ─────────────────────────────────────────────────────────
function hitungKeuntungan(hargaBeli: number, hargaJual: number) {
    const nominal = hargaJual - hargaBeli;
    // Hindari pembagian dengan 0 jika harga beli belum diisi (= 0)
    const percent =
        hargaBeli > 0 ? ((nominal / hargaBeli) * 100).toFixed(1) : '0.0';

    return { nominal, percent };
}

// ─────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────
export default function Index({ title, products }: IndexProps) {
    // State untuk modal konfirmasi hapus.
    // Menyimpan ID produk yang akan dihapus (atau null kalau modal tutup).
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (productId: number) => {
        setShowDeleteConfirm(productId);
    };

    const handleDeleteConfirm = (productId: number) => {
        setIsDeleting(true);
        router.delete(route('products.destroy', productId), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDeleteConfirm(null);
            },
        });
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(null);
    };

    // const isDisabled = true; // Contoh kondisi untuk tombol "Pecah" (bisa disesuaikan dengan kebutuhan)

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
                            Kelola semua stok frozen food KoeMau di sini.
                        </p>
                    </div>

                    {/* Tombol aksi header */}
                    <div className="flex items-center gap-3">
                        <Button asChild variant="koemau">
                            <Link href={route('products.create')} prefetch>
                                <Plus className="mr-1 h-4 w-4" />
                                Tambah Produk
                            </Link>
                        </Button>

                        <Button
                            variant="customSpecial"
                            asChild
                            size="sm"
                            className="gap-2"
                        >
                            <Link href={route('product-split.index')} prefetch>
                                <History className="h-4 w-4" />
                                History Pecah Produk
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Garis pemisah setelah header */}
                <hr className="mb-6 border-border" />

                {/* ── TABEL PRODUK ── */}
                <div className="overflow-hidden rounded-xl border border-border">
                    {products.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            Belum ada produk. Klik "Tambah Produk" untuk membuat
                            yang baru.
                        </div>
                    ) : (
                        <table className="w-full border-collapse">
                            {/* ── HEADER KOLOM ── */}
                            <thead>
                                <tr className="border-b border-border bg-muted/60">
                                    {/* Setiap <th> punya border-r agar ada garis pemisah kolom */}
                                    <th className="border-r border-border px-4 py-3 text-left text-sm font-semibold text-foreground">
                                        Gambar
                                    </th>
                                    <th className="border-r border-border px-4 py-3 text-left text-sm font-semibold text-foreground">
                                        Nama Produk
                                    </th>
                                    <th className="border-r border-border px-4 py-3 text-left text-sm font-semibold text-foreground">
                                        Harga Beli
                                    </th>
                                    <th className="border-r border-border px-4 py-3 text-left text-sm font-semibold text-foreground">
                                        Harga Jual
                                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                                            (+ Keuntungan)
                                        </span>
                                    </th>
                                    <th className="border-r border-border px-4 py-3 text-center text-sm font-semibold text-foreground">
                                        Stok
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            {/* ── ISI TABEL ── */}
                            <tbody>
                                {products.map((product, index) => {
                                    // Hitung keuntungan per baris
                                    const untung = hitungKeuntungan(
                                        product.purchase_price,
                                        product.selling_price,
                                    );

                                    return (
                                        <tr
                                            key={product.id}
                                            className={`border-b border-border transition-colors hover:bg-muted/30 ${
                                                index % 2 === 0
                                                    ? 'bg-card'
                                                    : 'bg-muted/10'
                                            }`}
                                        >
                                            {/* Gambar */}
                                            <td className="border-r border-border px-4 py-3">
                                                {product.image ? (
                                                    <img
                                                        src={`/storage/${product.image}`}
                                                        alt={
                                                            product.product_name
                                                        }
                                                        className="h-16 w-16 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                                                        No img
                                                    </div>
                                                )}
                                            </td>

                                            {/* Nama Produk */}
                                            <td className="border-r border-border px-4 py-3">
                                                <span className="text-base font-medium text-foreground">
                                                    {product.product_name}
                                                </span>
                                            </td>

                                            {/* Harga Beli */}
                                            <td className="border-r border-border px-4 py-3">
                                                <span className="font-mono text-sm text-muted-foreground">
                                                    {formatRupiah(
                                                        product.purchase_price,
                                                    )}
                                                </span>
                                            </td>

                                            {/* Harga Jual + Info Keuntungan */}
                                            <td className="border-r border-border px-4 py-3">
                                                <div>
                                                    {/* Harga jual utama */}
                                                    <span className="font-mono text-sm font-semibold text-foreground">
                                                        {formatRupiah(
                                                            product.selling_price,
                                                        )}
                                                    </span>

                                                    {/* Badge keuntungan — hanya tampil jika harga beli > 0 */}
                                                    {product.purchase_price >
                                                        0 && (
                                                        <div className="mt-1 flex items-center gap-1">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                    untung.nominal >=
                                                                    0
                                                                        ? 'bg-green-500/15 text-green-500'
                                                                        : 'bg-red-500/15 text-red-500'
                                                                }`}
                                                            >
                                                                {/* Tanda + atau - */}
                                                                {untung.nominal >=
                                                                0
                                                                    ? '+'
                                                                    : ''}
                                                                {formatRupiah(
                                                                    untung.nominal,
                                                                )}
                                                            </span>
                                                            <span
                                                                className={`text-xs font-medium ${
                                                                    untung.nominal >=
                                                                    0
                                                                        ? 'text-green-500'
                                                                        : 'text-red-500'
                                                                }`}
                                                            >
                                                                (
                                                                {untung.percent}
                                                                %)
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Stok — merah jika ≤5, oranye jika ≤10 */}
                                            <td className="border-r border-border px-4 py-3 text-center">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                                                        product.stock === 0
                                                            ? 'bg-red-500/15 text-red-500'
                                                            : product.stock <= 5
                                                              ? 'bg-orange-500/15 text-orange-500'
                                                              : 'bg-foreground/5 text-foreground'
                                                    }`}
                                                >
                                                    {product.stock}
                                                    {product.stock === 0 && (
                                                        <span className="ml-1 text-xs">
                                                            (Habis)
                                                        </span>
                                                    )}
                                                </span>
                                            </td>

                                            {/* Tombol Aksi */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* Edit */}
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'products.edit',
                                                                product.id,
                                                            )}
                                                            prefetch
                                                        >
                                                            <Edit2 className="h-3.5 w-3.5" />
                                                            Edit
                                                        </Link>
                                                    </Button>

                                                    {/* Pecah — disabled saat stok 0 */}
                                                    {product.stock > 0 ? (
                                                        <span
                                                            className="inline-block"
                                                            title="Stok Tersedia"
                                                        >
                                                            <Button
                                                                asChild
                                                                size="sm"
                                                                variant="customSpecial"
                                                                className="gap-1"
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'product-split.create',
                                                                        {
                                                                            product_id:
                                                                                product.id,
                                                                        },
                                                                    )}
                                                                    prefetch
                                                                >
                                                                    <Zap className="h-3.5 w-3.5" />
                                                                    Pecah
                                                                </Link>
                                                            </Button>
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className="inline-block cursor-not-allowed"
                                                            title="Stok kurang untuk dipecah"
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="customSpecial"
                                                                className="pointer-events-none gap-1 opacity-50"
                                                                disabled
                                                            >
                                                                <Zap className="h-3.5 w-3.5" />
                                                                Pecah
                                                            </Button>
                                                        </span>
                                                    )}

                                                    {/* Hapus */}
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="gap-1"
                                                        onClick={() =>
                                                            handleDeleteClick(
                                                                product.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ── MODAL KONFIRMASI HAPUS ── */}
            {showDeleteConfirm !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="mx-4 max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <h3 className="mb-2 text-lg font-semibold text-foreground">
                            Hapus Produk?
                        </h3>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Produk akan dihapus secara permanen beserta
                            gambarnya. Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={handleDeleteCancel}
                                disabled={isDeleting}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() =>
                                    handleDeleteConfirm(showDeleteConfirm)
                                }
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Menghapus...' : 'Hapus'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
