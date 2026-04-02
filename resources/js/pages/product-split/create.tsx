import {
    Head,
    // Form,
    Link,
    router,
} from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Daftar Produk',
        href: route('products.index'),
    },
    {
        title: 'Pecah Produk',
        href: route('product-split.index'),
    },
];

interface SplitProps {
    title: string;
}

interface Product {
    id: number;
    product_name: string;
    stock: number;
    selling_price: number;
}

interface SplitItem {
    product_id_to: string | number;
    quantity: string | number;
    selling_price: string | number;
    id?: string; // Unique ID untuk React key
}

export default function Create({
    title,
    products,
}: SplitProps & { products: Product[] }) {
    const [parentProductId, setParentProductId] = useState<string | number>('');
    const [note, setNote] = useState('');
    const [splitItems, setSplitItems] = useState<SplitItem[]>([
        { product_id_to: '', quantity: '', selling_price: '', id: '1' },
    ]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    // Get selected parent product
    const parentProduct = products.find(
        (p) => p.id === Number(parentProductId),
    );

    // Calculate total quantity
    const totalSplitQty = splitItems.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0,
    );

    // Add new split item row
    const addSplitItem = () => {
        setSplitItems([
            ...splitItems,
            {
                product_id_to: '',
                quantity: '',
                selling_price: '',
                id: Date.now().toString(),
            },
        ]);
    };

    // Remove split item row
    const removeSplitItem = (index: number) => {
        setSplitItems(splitItems.filter((_, i) => i !== index));
    };

    // Update split item field
    const updateSplitItem = (index: number, field: string, value: any) => {
        const newItems = [...splitItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setSplitItems(newItems);
    };

    // Handle parent product change
    const handleParentProductChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        setParentProductId(e.target.value);
        setErrors({});
    };

    // Handle form submit
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        // Prepare data
        const data = {
            product_id_from: Number(parentProductId),
            note: note || null,
            split_items: splitItems.map((item) => ({
                product_id_to: Number(item.product_id_to),
                quantity: Number(item.quantity),
                selling_price: Number(item.selling_price),
            })),
        };

        // Submit via router
        router.post(route('product-split.store'), data, {
            onError: (error: Record<string, string>) => {
                setErrors(error);
                setProcessing(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="mb-2 text-3xl font-bold text-blue-400">
                            Pecah Produk
                        </h1>
                        <p className="text-gray-400">
                            Pecah 1 produk induk menjadi beberapa produk hasil
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Messages */}
                        {errors.message && (
                            <div className="rounded border border-red-600 bg-red-900/30 p-4">
                                <p className="text-red-400">{errors.message}</p>
                            </div>
                        )}

                        {/* Section 1: Produk Induk */}
                        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                            <h2 className="mb-4 text-xl font-bold text-blue-400">
                                Produk Induk (yang akan dipecah)
                            </h2>

                            {/* Parent Product Dropdown */}
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Pilih Produk Induk *
                                </label>
                                <select
                                    value={parentProductId}
                                    onChange={handleParentProductChange}
                                    className="w-full rounded border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    disabled={processing}
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
                                {errors['product_id_from'] && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {errors['product_id_from']}
                                    </p>
                                )}
                            </div>

                            {/* Display Parent Product Info */}
                            {parentProduct && (
                                <div className="grid grid-cols-3 gap-4 rounded bg-gray-700 p-4">
                                    <div>
                                        <p className="text-sm text-gray-400">
                                            Stok Saat Ini
                                        </p>
                                        <p className="text-2xl font-bold text-green-400">
                                            {parentProduct.stock}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">
                                            Harga Jual
                                        </p>
                                        <p className="text-2xl font-bold text-blue-400">
                                            Rp
                                            {parentProduct.selling_price.toLocaleString(
                                                'id-ID',
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">
                                            Stok Akan Berkurang
                                        </p>
                                        <p className="text-2xl font-bold text-orange-400">
                                            {totalSplitQty}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 2: Produk Hasil */}
                        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                            <h2 className="mb-4 text-xl font-bold text-blue-400">
                                Produk Hasil Pecahan
                            </h2>

                            {/* Split Items List */}
                            <div className="mb-4 space-y-4">
                                {splitItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="rounded border border-gray-600 bg-gray-700 p-4"
                                    >
                                        <div className="grid grid-cols-12 gap-4">
                                            {/* Product Dropdown */}
                                            <div className="col-span-6">
                                                <label className="mb-1 block text-sm font-medium text-gray-300">
                                                    Produk Hasil *
                                                </label>
                                                <select
                                                    value={item.product_id_to}
                                                    onChange={(e) =>
                                                        updateSplitItem(
                                                            index,
                                                            'product_id_to',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded border border-gray-500 bg-gray-600 px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                                                    disabled={processing}
                                                >
                                                    <option value="">
                                                        -- Pilih Produk --
                                                    </option>
                                                    {products.map((product) => (
                                                        <option
                                                            key={product.id}
                                                            value={product.id}
                                                        >
                                                            {
                                                                product.product_name
                                                            }
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors[
                                                    `split_items.${index}.product_id_to`
                                                ] && (
                                                    <p className="mt-1 text-xs text-red-400">
                                                        {
                                                            errors[
                                                                `split_items.${index}.product_id_to`
                                                            ]
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            {/* Quantity Input */}
                                            <div className="col-span-3">
                                                <label className="mb-1 block text-sm font-medium text-gray-300">
                                                    Quantity *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updateSplitItem(
                                                            index,
                                                            'quantity',
                                                            e.target.value,
                                                        )
                                                    }
                                                    min="1"
                                                    className="w-full rounded border border-gray-500 bg-gray-600 px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                                                    disabled={processing}
                                                />
                                                {errors[
                                                    `split_items.${index}.quantity`
                                                ] && (
                                                    <p className="mt-1 text-xs text-red-400">
                                                        {
                                                            errors[
                                                                `split_items.${index}.quantity`
                                                            ]
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            {/* Delete Button */}
                                            <div className="col-span-3 flex items-end">
                                                {splitItems.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeSplitItem(
                                                                index,
                                                            )
                                                        }
                                                        className="w-full rounded bg-red-600 px-3 py-2 font-medium text-white transition hover:bg-red-700"
                                                        disabled={processing}
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Price Input */}
                                        <div className="mt-3 grid grid-cols-12 gap-4">
                                            <div className="col-span-9">
                                                <label className="mb-1 block text-sm font-medium text-gray-300">
                                                    Harga Jual (Rp) *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.selling_price}
                                                    onChange={(e) =>
                                                        updateSplitItem(
                                                            index,
                                                            'selling_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    min="0"
                                                    className="w-full rounded border border-gray-500 bg-gray-600 px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                                                    disabled={processing}
                                                />
                                                {errors[
                                                    `split_items.${index}.selling_price`
                                                ] && (
                                                    <p className="mt-1 text-xs text-red-400">
                                                        {
                                                            errors[
                                                                `split_items.${index}.selling_price`
                                                            ]
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Button */}
                            <button
                                type="button"
                                onClick={addSplitItem}
                                className="mb-4 w-full rounded bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
                                disabled={processing}
                            >
                                + Tambah Produk Hasil
                            </button>

                            {errors['split_items'] && (
                                <p className="text-sm text-red-400">
                                    {errors['split_items']}
                                </p>
                            )}
                        </div>

                        {/* Section 3: Keterangan */}
                        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                            <label className="mb-2 block text-sm font-medium text-gray-300">
                                Keterangan (Opsional)
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="h-24 w-full rounded border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                placeholder="Catatan tentang pemecahan produk (misal: 1 pack isi 100 menjadi 2 pack isi 50)"
                                disabled={processing}
                            />
                        </div>

                        {/* Summary */}
                        {parentProduct && totalSplitQty > 0 && (
                            <div className="rounded-lg border border-blue-600 bg-blue-900/30 p-6">
                                <h3 className="mb-3 font-bold text-blue-400">
                                    Ringkasan Perubahan Stok
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">
                                            {parentProduct.product_name}
                                        </span>
                                        <span className="font-bold text-red-400">
                                            -{totalSplitQty} unit
                                        </span>
                                    </div>
                                    {totalSplitQty > parentProduct.stock && (
                                        <div className="mt-2 text-sm text-red-400">
                                            ⚠️ Perhatian: Stok tidak cukup!
                                            Produk hanya punya{' '}
                                            {parentProduct.stock} unit
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <Link
                                href={route('product-split.index')}
                                className="flex-1 rounded bg-gray-600 px-6 py-3 text-center font-medium text-white transition hover:bg-gray-700"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || !parentProductId}
                                className="flex-1 rounded bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-600"
                            >
                                {processing ? 'Memproses...' : 'Pecah Produk'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
