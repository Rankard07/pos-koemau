import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produk Baru',
        href: route('products.create'),
    },
];

interface CreateProps {
    title: string;
}

export default function Create({ title }: CreateProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="px-4 py-6">
                <label className="text-2xl font-semibold">{title}</label>
                <p className="text-muted-foreground">
                    Silahkan isi formulir di bawah untuk menambah stok baru.
                </p>
                <div className="mt-6 rounded-xl border bg-card p-6">
                    {/* Form Anda akan ada di sini nantinya */}

                    <div>
                        <label className="text-2xl font-semibold">
                            Nama Produk
                        </label>
                        <input type="text" />
                    </div>

                    <div>
                        <label className="text-2xl font-semibold">
                            Harga Beli
                        </label>
                    </div>
                    <div>
                        <label className="text-2xl font-semibold">
                            Harga Jual
                        </label>
                    </div>
                    <div>
                        <label className="text-2xl font-semibold">Stok</label>
                    </div>

                    {/* Untuk Gambar */}
                </div>
            </div>
        </AppLayout>
    );
}
