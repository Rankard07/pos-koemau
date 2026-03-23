import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function Create({ title }: { title: string }) {
    return (
        <AppLayout>
            <Head title={title} />
            <div className="px-4 py-6">
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="text-muted-foreground">
                    Silahkan isi formulir di bawah untuk menambah stok baru.
                </p>

                <div className="mt-6 rounded-xl border bg-card p-6">
                    {/* Form Anda akan ada di sini nantinya */}
                    <p>Formulir Input Produk KoeMau</p>
                </div>
            </div>
        </AppLayout>
    );
}
