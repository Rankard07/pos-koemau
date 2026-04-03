// resources/js/pages/products/create.tsx
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Daftar Produk', href: route('products.index') },
    { title: 'Tambah Produk', href: route('products.create') },
];

interface ImageOption {
    path: string;
    name: string;
}

interface AvailableImages {
    [folder: string]: ImageOption[];
}

interface CreateProps {
    title: string;
    availableImages?: AvailableImages;
}

// ─────────────────────────────────────────────────────────
// HELPER: Format angka ke Rupiah
// Contoh: 175000 → "Rp 175.000"
// ─────────────────────────────────────────────────────────
function formatRupiah(angka: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(angka);
}

export default function Create({ title, availableImages = {} }: CreateProps) {
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [fileError, setFileError] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm<{
        product_name: string;
        purchase_price: number | '';
        selling_price: number | '';
        stock: number | '';
        image: File | null;
        image_file: string;
    }>({
        product_name: '',
        purchase_price: 0,
        selling_price: 0,
        stock: 0,
        image: null,
        image_file: '',
    });

    // ── Hitung total harga (harga satuan × stok)
    // Tampil hanya jika kedua nilai > 0
    const totalHargaBeli =
        Number(data.purchase_price) > 0 && Number(data.stock) > 0
            ? Number(data.purchase_price) * Number(data.stock)
            : null;

    const totalHargaJual =
        Number(data.selling_price) > 0 && Number(data.stock) > 0
            ? Number(data.selling_price) * Number(data.stock)
            : null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileError('');

        if (!file) {
            setPreviewUrl('');
            setData('image', null);

            return;
        }

        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
        ];

        if (!allowedTypes.includes(file.type)) {
            setFileError('Format gambar harus: JPG, PNG, atau WebP');
            setPreviewUrl('');
            setData('image', null);

            return;
        }

        const maxSize = 2 * 1024 * 1024;

        if (file.size > maxSize) {
            setFileError('Ukuran gambar maksimal 2MB');
            setPreviewUrl('');
            setData('image', null);

            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
        setData('image', file);
        setData('image_file', '');
    };

    const handlePresetImageChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const imagePath = e.target.value;
        setData('image_file', imagePath);

        if (imagePath) {
            setData('image', null);
            setPreviewUrl(`/images/${imagePath}`);
            setFileError('');
        } else {
            setPreviewUrl('');
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('products.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="px-4 py-6">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-row items-center justify-between">
                        <label className="text-2xl font-semibold">
                            {title}
                        </label>
                        <Button asChild variant="customWarning">
                            <Link href={route('products.index')} prefetch>
                                Kembali ke Daftar Produk
                            </Link>
                        </Button>
                    </div>
                    <p className="text-muted-foreground">
                        Silahkan isi formulir di bawah untuk menambah stok baru.
                    </p>

                    <FieldGroup className="mt-6 grid grid-cols-1 gap-8 rounded-xl border bg-card p-6 md:grid-cols-2">
                        {/* ── KOLOM KIRI: Data Produk ── */}
                        <div className="space-y-4">
                            {/* Nama Produk */}
                            <Field>
                                <FieldLabel htmlFor="product_name">
                                    Nama Produk
                                </FieldLabel>
                                <FieldContent>
                                    <input
                                        id="product_name"
                                        type="text"
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
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

                            {/* Harga Beli & Harga Jual */}
                            <div className="grid grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel htmlFor="purchase_price">
                                        Harga Beli (per unit)
                                    </FieldLabel>
                                    <FieldContent>
                                        <input
                                            id="purchase_price"
                                            type="number"
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                            placeholder="Harga Beli"
                                            value={data.purchase_price}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setData(
                                                    'purchase_price',
                                                    v === '' ? '' : Number(v),
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
                                        Harga Jual (per unit)
                                    </FieldLabel>
                                    <FieldContent>
                                        <input
                                            id="selling_price"
                                            type="number"
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                            placeholder="Harga Jual"
                                            value={data.selling_price}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setData(
                                                    'selling_price',
                                                    v === '' ? '' : Number(v),
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

                            {/* Stok */}
                            <Field>
                                <FieldLabel htmlFor="stock">Stok</FieldLabel>
                                <FieldContent>
                                    <input
                                        id="stock"
                                        type="number"
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                        placeholder="Stok"
                                        value={data.stock}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setData(
                                                'stock',
                                                v === '' ? '' : Number(v),
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

                            {/* ── TOTAL HARGA (harga × stok) ──
                                Muncul otomatis jika harga dan stok sudah diisi.
                                Ini read-only — hanya informasi kalkulasi. */}
                            {(totalHargaBeli !== null ||
                                totalHargaJual !== null) && (
                                <div className="rounded-xl border border-border bg-muted/30 p-4">
                                    <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Total Keseluruhan (harga × stok)
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Total Harga Beli */}
                                        <div>
                                            <p className="mb-1 text-xs text-muted-foreground">
                                                Total Harga Beli
                                            </p>
                                            <div className="flex h-9 items-center rounded-lg border border-border bg-background px-3">
                                                <span className="font-mono text-sm font-semibold text-foreground">
                                                    {totalHargaBeli !== null
                                                        ? formatRupiah(
                                                              totalHargaBeli,
                                                          )
                                                        : '—'}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {Number(data.purchase_price) >
                                                    0 && Number(data.stock) > 0
                                                    ? `${formatRupiah(Number(data.purchase_price))} × ${data.stock} unit`
                                                    : ''}
                                            </p>
                                        </div>

                                        {/* Total Harga Jual */}
                                        <div>
                                            <p className="mb-1 text-xs text-muted-foreground">
                                                Total Harga Jual
                                            </p>
                                            <div className="flex h-9 items-center rounded-lg border border-border bg-background px-3">
                                                <span className="font-mono text-sm font-semibold text-foreground">
                                                    {totalHargaJual !== null
                                                        ? formatRupiah(
                                                              totalHargaJual,
                                                          )
                                                        : '—'}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {Number(data.selling_price) >
                                                    0 && Number(data.stock) > 0
                                                    ? `${formatRupiah(Number(data.selling_price))} × ${data.stock} unit`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Estimasi keuntungan total */}
                                    {totalHargaBeli !== null &&
                                        totalHargaJual !== null &&
                                        totalHargaBeli > 0 && (
                                            <div className="mt-3 border-t border-border pt-3">
                                                <p className="mb-1 text-xs text-muted-foreground">
                                                    Estimasi Keuntungan Total
                                                </p>
                                                <p
                                                    className={`text-base font-bold ${
                                                        totalHargaJual -
                                                            totalHargaBeli >=
                                                        0
                                                            ? 'text-green-500'
                                                            : 'text-destructive'
                                                    }`}
                                                >
                                                    {totalHargaJual -
                                                        totalHargaBeli >=
                                                    0
                                                        ? '+'
                                                        : ''}
                                                    {formatRupiah(
                                                        totalHargaJual -
                                                            totalHargaBeli,
                                                    )}
                                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                                        (
                                                        {(
                                                            ((totalHargaJual -
                                                                totalHargaBeli) /
                                                                totalHargaBeli) *
                                                            100
                                                        ).toFixed(1)}
                                                        %)
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                </div>
                            )}

                            {/* Tombol Simpan */}
                            <div className="flex justify-center border-t pt-4">
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
                                                'Simpan Produk'
                                            )}
                                        </Button>
                                    </FieldContent>
                                </Field>
                            </div>
                        </div>

                        {/* ── KOLOM KANAN: Upload Gambar ── */}
                        <div className="space-y-4">
                            {/* Preview gambar */}
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-500 p-3 text-center">
                                <Label className="mb-3 block text-sm font-semibold">
                                    Gambar Saat Ini
                                </Label>
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="mx-auto mb-2 h-80 w-80 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="mx-auto mb-2 flex h-40 w-40 items-center justify-center rounded-lg bg-gray-200">
                                        <span className="text-sm text-gray-400">
                                            Belum ada gambar dipilih
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Selector gambar */}
                            <Field>
                                <FieldLabel className="text-base font-semibold">
                                    Gambar Produk
                                </FieldLabel>

                                {/* Preset folder */}
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
                                            -- Tidak Memilih --
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

                                {/* Divider ATAU */}
                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-white px-2 text-gray-500">
                                            ATAU
                                        </span>
                                    </div>
                                </div>

                                {/* Upload file baru */}
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
