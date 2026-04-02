import { Link } from '@inertiajs/react';

interface ProductResult {
    id: number;
    product_name: string;
    harga_jual: number;
    image?: string;
    stok_bertambah: number;
}

interface SplitData {
    id: number;
    tanggal_pemecahan: string;
    waktu_pemecahan: string;
    waktu_lalu: string;
    produk_induk: {
        id: number;
        product_name: string;
        harga_jual: number;
        image?: string;
        stok_berkurang: number;
    };
    produk_hasil: ProductResult[];
    note?: string;
}

interface StockSummary {
    product_name: string;
    stok_awal: number;
    perubahan: string;
    stok_akhir: number;
}

export default function Show({
    split,
    stockSummary,
}: {
    split: SplitData;
    stockSummary: StockSummary[];
}) {
    return (
        <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-blue-400">
                        Detail Pemecahan Produk
                    </h1>
                    <p className="text-gray-400">ID Pemecahan: #{split.id}</p>
                </div>

                {/* Metadata */}
                <div className="mb-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-400">
                                Tanggal Pemecahan
                            </p>
                            <p className="text-lg font-bold text-white">
                                {split.tanggal_pemecahan}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Waktu</p>
                            <p className="text-lg font-bold text-white">
                                {split.waktu_pemecahan}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Waktu Lalu</p>
                            <p className="text-lg font-bold text-white">
                                {split.waktu_lalu}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Produk Induk (Dikurangi) */}
                <div className="mb-8 rounded-lg border border-red-700/30 bg-gray-800 p-6">
                    <h2 className="mb-4 text-xl font-bold text-red-400">
                        Produk Induk (Dikurangi)
                    </h2>
                    <div className="flex gap-6">
                        {split.produk_induk.image && (
                            <img
                                /* src={
                                    `/storage/${split.produk_induk.image}` ||
                                    '/images/no-image.png'
                                } */
                                src={
                                    split.produk_induk.image ??
                                    '/images/no-image.png'
                                }
                                alt={split.produk_induk.product_name}
                                className="h-32 w-32 rounded object-cover"
                            />
                        )}
                        <div className="flex-1">
                            <p className="mb-1 text-sm text-gray-400">
                                Nama Produk
                            </p>
                            <p className="mb-4 text-2xl font-bold text-white">
                                {split.produk_induk.product_name}
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-400">
                                        Harga Jual
                                    </p>
                                    <p className="text-lg font-bold text-blue-400">
                                        Rp
                                        {split.produk_induk.harga_jual.toLocaleString(
                                            'id-ID',
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">
                                        Stok Berkurang
                                    </p>
                                    <p className="text-3xl font-bold text-red-400">
                                        -{split.produk_induk.stok_berkurang}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Produk Hasil (Bertambah) */}
                <div className="mb-8 rounded-lg border border-green-700/30 bg-gray-800 p-6">
                    <h2 className="mb-4 text-xl font-bold text-green-400">
                        Produk Hasil (Bertambah)
                    </h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {split.produk_hasil.map((item) => (
                            <div
                                key={item.id}
                                className="rounded border border-gray-600 bg-gray-700 p-4"
                            >
                                {item.image && (
                                    <img
                                        /* src={
                                            `/storage/${item.image}` ||
                                            '/images/no-image.png'
                                        } */
                                        src={
                                            split.produk_induk.image ??
                                            '/images/no-image.png'
                                        }
                                        alt={item.product_name}
                                        className="mb-3 h-32 w-full rounded object-cover"
                                    />
                                )}
                                <p className="mb-1 text-sm text-gray-400">
                                    Nama Produk
                                </p>
                                <p className="mb-3 text-lg font-bold text-white">
                                    {item.product_name}
                                </p>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-400">
                                            Harga Jual
                                        </span>
                                        <span className="font-bold text-blue-400">
                                            Rp
                                            {item.harga_jual.toLocaleString(
                                                'id-ID',
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-600 pt-2">
                                        <span className="text-sm text-gray-400">
                                            Stok Bertambah
                                        </span>
                                        <span className="text-2xl font-bold text-green-400">
                                            +{item.stok_bertambah}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Catatan */}
                {split.note && (
                    <div className="mb-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
                        <h3 className="mb-2 text-lg font-bold text-gray-300">
                            Catatan
                        </h3>
                        <p className="text-gray-300">{split.note}</p>
                    </div>
                )}

                {/* Stock Summary Table */}
                <div className="mb-8 overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
                    <div className="border-b border-gray-700 p-6">
                        <h3 className="text-lg font-bold text-gray-300">
                            Ringkasan Perubahan Stok
                        </h3>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-600 bg-gray-700">
                                <th className="px-6 py-3 text-left font-semibold text-gray-300">
                                    Nama Produk
                                </th>
                                <th className="px-6 py-3 text-center font-semibold text-gray-300">
                                    Stok Awal
                                </th>
                                <th className="px-6 py-3 text-center font-semibold text-gray-300">
                                    Perubahan
                                </th>
                                <th className="px-6 py-3 text-center font-semibold text-gray-300">
                                    Stok Akhir
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockSummary.map((row, idx) => (
                                <tr
                                    key={idx}
                                    className="border-b border-gray-700 transition hover:bg-gray-700/50"
                                >
                                    <td className="px-6 py-4 font-medium text-white">
                                        {row.product_name}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-300">
                                        {row.stok_awal}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={
                                                row.perubahan.startsWith('+')
                                                    ? 'font-bold text-green-400'
                                                    : 'font-bold text-red-400'
                                            }
                                        >
                                            {row.perubahan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-white">
                                        {row.stok_akhir}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Link
                        href={route('product-split.index')}
                        className="flex-1 rounded bg-gray-600 px-6 py-3 text-center font-medium text-white transition hover:bg-gray-700"
                    >
                        ← Kembali ke History
                    </Link>
                    <Link
                        href={route('products.index')}
                        className="flex-1 rounded bg-blue-600 px-6 py-3 text-center font-medium text-white transition hover:bg-blue-700"
                    >
                        Lihat Semua Produk
                    </Link>
                </div>
            </div>
        </div>
    );
}
