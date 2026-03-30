import { Head, Link } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldContent,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

interface ImageOption {
    path: string;
    name: string;
}

interface AvailableImages {
    [folder: string]: ImageOption[];
}

interface Product {
    id: number;
    product_name: string;
    purchase_price: number;
    selling_price: number;
    stock: number;
    image: string | null;
}

interface EditProps {
    title: string;
    product: Product;
    availableImages?: AvailableImages;
}

export default function Edit({
    title,
    product,
    availableImages = {},
}: EditProps) {
    const [previewUrl, setPreviewUrl] = useState<string>(
        product.image ? `/storage/${product.image}` : '',
    );
    const [fileError, setFileError] = useState<string>('');

    const { data, setData, put, processing, errors } = useForm<{
        product_name: string;
        purchase_price: number | '';
        selling_price: number | '';
        stock: number | '';
        image: File | null;
        image_file: string;
    }>({
        product_name: product.product_name,
        purchase_price: product.purchase_price,
        selling_price: product.selling_price,
        stock: product.stock,
        image: null,
        image_file: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Daftar Produk',
            href: route('products.index'),
        },
        {
            title: 'Edit Produk',
            href: route('products.edit', product.id),
        },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        setFileError('');

        if (!file) {
            setPreviewUrl(product.image ? `/storage/${product.image}` : '');
            setData('image', null);

            return;
        }

        // Validate file type
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
        ];

        if (!allowedTypes.includes(file.type)) {
            setFileError('Format gambar harus: JPG, PNG, atau WebP');
            setPreviewUrl(product.image ? `/storage/${product.image}` : '');
            setData('image', null);

            return;
        }

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (file.size > maxSize) {
            setFileError('Ukuran gambar maksimal 2MB');
            setPreviewUrl(product.image ? `/storage/${product.image}` : '');
            setData('image', null);

            return;
        }

        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Set form data
        setData('image', file);
        setData('image_file', ''); // Clear preset selection when upload new
    };

    const handlePresetImageChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const imagePath = e.target.value;
        setData('image_file', imagePath);

        if (imagePath) {
            // Clear file input and show public/images preview path
            setData('image', null);
            setPreviewUrl(`/images/${imagePath}`);
            setFileError('');
        } else {
            setPreviewUrl(product.image ? `/storage/${product.image}` : '');
        }
    };

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('products.update', product.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="px-4 py-6">
                <form action="" onSubmit={handleSubmit}>
                    <div className="flex flex-row items-center justify-between">
                        <label className="text-2xl font-semibold">
                            {title}
                        </label>
                        <Button asChild variant="koemau">
                            <Link href={route('products.index')} prefetch>
                                Kembali ke Daftar Produk
                            </Link>
                        </Button>
                    </div>
                    <p className="text-muted-foreground">
                        Silahkan ubah formulir di bawah untuk mengubah produk.
                    </p>

                    <FieldGroup className="mt-6 grid grid-cols-1 gap-8 rounded-xl border bg-card p-6 md:grid-cols-2">
                        {/* KOLOM KIRI: Data Produk */}
                        <div className="space-y-4">
                            <div>
                                {/* Nama Produk */}
                                <Field>
                                    <FieldLabel htmlFor="product_name">
                                        Nama Produk
                                    </FieldLabel>
                                    <FieldContent>
                                        <input
                                            id="product_name"
                                            type="text"
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Nama Produk"
                                            value={data.product_name}
                                            onChange={(e) =>
                                                setData(
                                                    'product_name',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {errors.product_name && (
                                            <p className="mt-1 text-xs text-destructive">
                                                {errors.product_name}
                                            </p>
                                        )}
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
                                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Harga Beli"
                                                value={data.purchase_price}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value;
                                                    setData(
                                                        'purchase_price',
                                                        value === ''
                                                            ? ''
                                                            : Number(value),
                                                    );
                                                }}
                                                required
                                            />
                                            {errors.purchase_price && (
                                                <p className="mt-1 text-xs text-destructive">
                                                    {errors.purchase_price}
                                                </p>
                                            )}
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
                                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Harga Jual"
                                                value={data.selling_price}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value;
                                                    setData(
                                                        'selling_price',
                                                        value === ''
                                                            ? ''
                                                            : Number(value),
                                                    );
                                                }}
                                                required
                                            />
                                            {errors.selling_price && (
                                                <p className="mt-1 text-xs text-destructive">
                                                    {errors.selling_price}
                                                </p>
                                            )}
                                        </FieldContent>
                                    </Field>
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="stock">
                                        Stok
                                    </FieldLabel>
                                    <FieldContent>
                                        <input
                                            id="stock"
                                            type="number"
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Stok"
                                            value={data.stock}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setData(
                                                    'stock',
                                                    value === ''
                                                        ? ''
                                                        : Number(value),
                                                );
                                            }}
                                            required
                                        />
                                        {errors.stock && (
                                            <p className="mt-1 text-xs text-destructive">
                                                {errors.stock}
                                            </p>
                                        )}
                                    </FieldContent>
                                </Field>
                            </div>

                            {/* Tombol Simpan Produk */}
                            <div className="flex justify-center border-t pt-4 md:col-span-2">
                                <Field className="w-full max-w-sm">
                                    <FieldContent>
                                        <Button
                                            type="submit"
                                            variant="daisySuccess"
                                            className="w-full"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <LoadingSpinner
                                                        size={20}
                                                        color="#fff"
                                                    />
                                                    <span>Menyimpan...</span>
                                                </div>
                                            ) : (
                                                'Simpan Perubahan'
                                            )}
                                        </Button>
                                    </FieldContent>
                                </Field>
                            </div>
                        </div>

                        {/* KOLOM KANAN: Upload Gambar */}
                        <div className="space-y-4">
                            {/* IMAGE PREVIEW SECTION */}
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-500 p-6 text-center">
                                <Label className="mb-3 block text-sm font-semibold">
                                    Gambar Saat Ini
                                </Label>
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="mx-auto mb-2 h-40 w-40 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="mx-auto mb-2 flex h-40 w-40 items-center justify-center rounded-lg bg-gray-200">
                                        <span className="text-sm text-gray-400">
                                            Belum ada gambar
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* IMAGE SELECTION SECTION */}
                            <Field>
                                <FieldLabel className="text-base font-semibold">
                                    Gambar Produk
                                </FieldLabel>

                                {/* PRESET IMAGES SELECTOR */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                        Pilih dari Folder (public/images):
                                    </Label>
                                    <select
                                        value={data.image_file}
                                        onChange={handlePresetImageChange}
                                        className="w-full rounded-md border border-input bg-orange-500 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                    >
                                        <option value="">
                                            -- Tidak Mengubah --
                                        </option>
                                        {Object.entries(availableImages).map(
                                            ([folder, images]) => (
                                                <optgroup
                                                    key={folder}
                                                    label={folder}
                                                >
                                                    {images.map((img) => (
                                                        <option
                                                            key={img.path}
                                                            value={img.path}
                                                        >
                                                            {img.name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ),
                                        )}
                                    </select>
                                    {Object.keys(availableImages).length ===
                                        0 && (
                                        <p className="text-xs text-gray-500">
                                            Tidak ada gambar di public/images
                                        </p>
                                    )}
                                </div>

                                {/* DIVIDER */}
                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-white px-2 text-gray-500">
                                            ATAU
                                        </span>
                                    </div>
                                </div>

                                {/* FILE UPLOAD SECTION */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                        Upload Gambar Baru:
                                    </Label>
                                    <FieldContent>
                                        <input
                                            id="image"
                                            name="image"
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handleFileChange}
                                            className="w-full cursor-pointer rounded-md border-2 border-dashed border-gray-300 px-3 py-3 text-sm transition-all file:mr-2 file:rounded-md file:border-0 file:bg-orange-600 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-white hover:file:bg-orange-700"
                                        />
                                    </FieldContent>
                                    {errors.image && (
                                        <p className="text-xs text-destructive">
                                            {errors.image}
                                        </p>
                                    )}
                                    {fileError && (
                                        <p className="text-xs text-destructive">
                                            {fileError}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Format: JPG, PNG, WebP · Ukuran
                                        maksimal: 2MB
                                    </p>
                                </div>
                            </Field>
                        </div>
                    </FieldGroup>
                </form>
            </div>
        </AppLayout>
    );
}
