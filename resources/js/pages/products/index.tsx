import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout'; // Pastikan path ini sesuai dengan starter kit kamu
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
    name: string;
    purchase_price: number; // Sesuaikan dengan database/model
    selling_price: number; // Sesuaikan dengan database/model
    stock: number;
    image: string | null; // Sesuaikan dengan database/model
}

interface ProdukProps {
    title: string;
    products: Product[];
}

export default function Index({ title, products }: ProdukProps) {
    /* const { products }: { products: Product[] } = usePage().props; // Ambil data produk dari props Inertia

    interface Product {
        id: number;
        name: string;
        buy_price: number;
        sell_price: number;
        stock: number;
        product_image: string;
    }
 */
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
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

                    <Button
                        asChild
                        variant="koemau"
                        // className="rounded-md bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600"
                    >
                        <Link
                            href={route('products.create')}
                            // href="/products/create"
                            // className="rounded-md bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600"
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            Tambah Produk
                        </Link>
                    </Button>
                </div>

                <hr className="my-6 border-border" />

                {/* Tempat Tabel Produk Nantinya */}
                <div className="rounded-xl border border-dashed border-border p-20 text-center">
                    <p className="text-muted-foreground">
                        Daftar produk akan muncul di sini setelah kita buat
                        tabelnya.
                    </p>
                    <ul>
                        {products.map((product: Product) => (
                            <li key={product.id}>
                                {product.name}
                                <Link href={route('products.edit', product.id)}>
                                    Edit
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
