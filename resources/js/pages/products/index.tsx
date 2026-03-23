import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout'; // Pastikan path ini sesuai dengan starter kit kamu
import { route } from 'ziggy-js';

interface ProdukProps {
    title: string;
}

export default function Produk({ title }: ProdukProps) {
    return (
        <AppLayout>
            {/* 1. Menampilkan title di Tab Browser */}
            <Head title={title} />

            <div className="px-4 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        {/* 2. Menampilkan title di dalam halaman */}
                        <h1 className="text-2xl font-semibold text-foreground">
                            {title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola semua stok frozen food KoeMau di sini.
                        </p>
                    </div>

                    {/* Tombol aksi (contoh) */}
                    <Link
                        href={route('products.create')}
                        className="rounded-md bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600"
                    >
                        Tambah Produk
                    </Link>
                </div>

                <hr className="my-6 border-border" />

                {/* Tempat Tabel Produk Nantinya */}
                <div className="rounded-xl border border-dashed border-border p-20 text-center">
                    <p className="text-muted-foreground">
                        Daftar produk akan muncul di sini setelah kita buat
                        tabelnya.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
