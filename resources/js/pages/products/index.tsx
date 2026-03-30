import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produk',
        href: route('products.index'),
    },
];

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

export default function Index({ title, products }: IndexProps) {
    // State management
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    // Handler untuk delete product
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="px-4 py-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            {title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola semua stok frozen food KoeMau di sini.
                        </p>
                    </div>

                    <Button asChild variant="koemau">
                        <Link href={route('products.create')} prefetch>
                            <Plus className="mr-1 h-4 w-4" />
                            Tambah Produk
                        </Link>
                    </Button>
                </div>

                <hr className="my-6 border-border" />

                {/* Products Table */}
                <div className="overflow-hidden rounded-lg border border-border">
                    {products.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-muted-foreground">
                                Belum ada produk. Klik "Tambah Produk" untuk
                                membuat yang baru.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            {/* Table Header */}
                            <thead className="border-b border-border bg-neutral-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                                        Gambar
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                                        Nama Produk
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                                        Harga Beli
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                                        Harga Jual
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                                        Stok
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                                {products.map((product, index) => (
                                    <tr
                                        key={product.id}
                                        className={`border-b border-border ${
                                            index % 2 === 0
                                                ? 'bg-muted'
                                                : 'bg-muted/30'
                                        } transition hover:bg-muted/50`}
                                    >
                                        {/* Thumbnail Column */}
                                        <td className="px-6 py-4">
                                            {product.image ? (
                                                <img
                                                    src={`/storage/${product.image}`}
                                                    alt={product.product_name}
                                                    className="h-50 w-50 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200">
                                                    <span className="text-xs text-gray-400">
                                                        No img
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Product Name */}
                                        <td className="px-6 py-4 text-xl font-medium text-foreground">
                                            {product.product_name}
                                        </td>

                                        {/* Purchase Price */}
                                        <td className="px-6 py-4 text-xl text-muted-foreground">
                                            Rp
                                            {product.purchase_price.toLocaleString(
                                                'id-ID',
                                            )}
                                        </td>

                                        {/* Selling Price */}
                                        <td className="px-6 py-4 text-xl text-muted-foreground">
                                            Rp
                                            {product.selling_price.toLocaleString(
                                                'id-ID',
                                            )}
                                        </td>

                                        {/* Stock */}
                                        <td className="px-6 py-4 text-xl text-muted-foreground">
                                            {product.stock}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                {/* Edit Button */}
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
                                                        <Edit2 className="h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </Button>

                                                {/* Delete Button */}
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
                                                    <Trash2 className="h-4 w-4" />
                                                    Hapus
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog/Modal */}
            {showDeleteConfirm !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="mx-4 max-w-sm rounded-lg bg-muted p-6 shadow-lg">
                        <h3 className="mb-2 text-lg font-semibold text-foreground">
                            Hapus Produk?
                        </h3>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Produk akan dihapus secara permanen beserta
                            gambarnya. Tindakan ini tidak dapat dibatalkan.
                        </p>

                        {/* Dialog Actions */}
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
