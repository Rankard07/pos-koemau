import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldContent,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
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
    images?: string[]; // Gunakan tanda tanya (?) karena data ini opsional/belum dikirim dari controller
}

/* interface ImagePreview {
    images: string[];
} */

/* export default function Create(
    { title }: CreateProps,
    { images }: ImagePreview,
) */
export default function Create({ title, images = [] }: CreateProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="px-4 py-6">
                <form action="">
                    <div className="flex flex-row items-center justify-between">
                        <label className="text-2xl font-semibold">
                            {title}
                        </label>
                        <Button
                            asChild
                            variant="koemau"
                            // className="rounded-md bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600"
                        >
                            <Link
                                href={route('products.index')}
                                // href="/products/create"
                                // className="rounded-md bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600"
                                prefetch
                            >
                                <Plus className="mr-1 h-4 w-4" />
                                KEmbali ke Daftar Produk
                            </Link>
                        </Button>
                    </div>
                    <p className="text-muted-foreground">
                        Silahkan isi formulir di bawah untuk menambah stok baru.
                    </p>

                    {/* Form Anda akan ada di sini nantinya */}
                    <FieldGroup className="mt-6 grid grid-cols-1 gap-8 rounded-xl border bg-card p-6 md:grid-cols-2">
                        {/* KOLOM KIRI: Data Produk */}
                        <div className="space-y-4">
                            <Field>
                                <FieldLabel htmlFor="product_name">
                                    Nama Produk
                                </FieldLabel>
                                <FieldContent>
                                    <input
                                        id="product_name"
                                        type="text"
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Nama Produk"
                                    />
                                </FieldContent>
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel htmlFor="purchase_price">
                                        Harga Beli
                                    </FieldLabel>
                                    <FieldContent>
                                        <input
                                            id="purchase_price"
                                            type="number"
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="selling_price">
                                        Harga Jual
                                    </FieldLabel>
                                    <FieldContent>
                                        <input
                                            id="selling_price"
                                            type="number"
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </FieldContent>
                                </Field>
                            </div>

                            <Field>
                                <FieldLabel htmlFor="stock">Stok</FieldLabel>
                                <FieldContent>
                                    <input
                                        id="stock"
                                        type="number"
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </FieldContent>
                            </Field>
                        </div>

                        {/* KOLOM KANAN: Upload Gambar */}
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6">
                            <Field className="w-full">
                                <FieldLabel
                                    className="mb-4 text-center"
                                    htmlFor="product_image"
                                >
                                    Gambar Produk
                                </FieldLabel>
                                <FieldContent>
                                    {/* Area Preview Gambar bisa diletakkan di sini nanti */}
                                    <div className="mb-4 flex aspect-square w-full max-w-[200px] items-center justify-center rounded bg-muted">
                                        <span className="text-xs text-muted-foreground">
                                            Preview Gambar
                                        </span>
                                    </div>
                                    <input
                                        id="product_image"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        className="w-full cursor-pointer rounded-4xl border-2 text-sm transition-all file:mr-4 file:rounded-full file:border-0 file:bg-orange-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-orange-700"
                                        multiple
                                    />
                                </FieldContent>
                            </Field>
                        </div>
                    </FieldGroup>
                </form>
            </div>
        </AppLayout>
    );
}
