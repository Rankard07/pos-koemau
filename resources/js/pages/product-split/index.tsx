import {
    Head,
    Link,
    // router
} from '@inertiajs/react';
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

export default function Index({
    title,
    splits,
    // pagination,
}: SplitProps & {
    splits: Split[];
    pagination: any;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-blue-400">
                                History Pemecahan Produk
                            </h1>
                            <p className="text-gray-400">
                                Riwayat semua transaksi pemecahan produk
                            </p>
                        </div>
                        <Link
                            href={route('product-split.create')}
                            className="rounded bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
                        >
                            + Pecah Produk Baru
                        </Link>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-600 bg-gray-700">
                                    <th className="px-6 py-4 text-left font-semibold text-gray-300">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-gray-300">
                                        Produk Induk
                                    </th>
                                    <th className="px-6 py-4 text-center font-semibold text-gray-300">
                                        Stok -
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-gray-300">
                                        Produk Hasil
                                    </th>
                                    <th className="px-6 py-4 text-center font-semibold text-gray-300">
                                        Stok +
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-gray-300">
                                        Keterangan
                                    </th>
                                    <th className="px-6 py-4 text-center font-semibold text-gray-300">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {splits.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-8 text-center text-gray-400"
                                        >
                                            Belum ada riwayat pemecahan produk
                                        </td>
                                    </tr>
                                ) : (
                                    splits.map((split) => (
                                        <tr
                                            key={split.id}
                                            className="border-b border-gray-700 transition hover:bg-gray-700/50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="font-medium text-white">
                                                        {split.tanggal}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {split.waktu_lalu}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-white">
                                                    {split.produk_induk}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="rounded bg-red-900/30 px-3 py-1 text-sm font-bold text-red-400">
                                                    -{split.stok_berkurang}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="line-clamp-2 text-sm text-gray-300">
                                                    {split.produk_hasil}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="rounded bg-green-900/30 px-3 py-1 text-sm font-bold text-green-400">
                                                    +{split.stok_bertambah}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="truncate text-sm text-gray-400">
                                                    {split.keterangan}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Link
                                                    href={route(
                                                        'product-split.show',
                                                        split.id,
                                                    )}
                                                    className="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                                >
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Back Button */}
                    <div className="mt-8">
                        <Link
                            href={route('products.index')}
                            className="inline-block rounded bg-gray-600 px-6 py-3 font-medium text-white transition hover:bg-gray-700"
                        >
                            ← Kembali ke Produk
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
