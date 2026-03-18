import { Head, Link } from '@inertiajs/react';
import { LogIn, UserPlus, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { route } from 'ziggy-js';

export default function Welcome() {
    const canLogin = true;
    const canRegister = true;

    return (
        <>
            <Head title="KoeMau POS - Selamat Datang" />

            <div className="relative min-h-screen bg-neutral-950 text-neutral-100 selection:bg-orange-500 selection:text-white">
                {/* Navbar */}
                {/* <nav className="absolute top-0 right-0 z-50 flex gap-4 p-6 lg:p-10">
                    {canLogin && (
                        <Link
                            href={route('login')}
                            className="flex items-center gap-2 text-sm transition text-neutral-300 hover:text-white"
                        >
                            <LogIn className="w-4 h-4" />
                            Log in
                        </Link>
                    )}
                    {canRegister && (
                        <Link
                            href={route('register')}
                            className="flex items-center gap-2 text-sm transition text-neutral-300 hover:text-white"
                        >
                            <UserPlus className="w-4 h-4" />
                            Register
                        </Link>
                    )}
                </nav> */}

                <div className="flex min-h-screen flex-col items-center justify-center p-6 lg:p-10">
                    <div className="w-full max-w-7xl">
                        {/* Header Logo */}
                        <div className="flex justify-center py-12 lg:justify-start">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-3xl font-bold text-white shadow-lg">
                                    K
                                </div>
                                <span className="text-2xl font-bold tracking-tight text-white">
                                    KoeMau POS
                                </span>
                            </div>
                        </div>

                        {/* Grid Utama */}
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                            {/* KOTAK KIRI - Ringkasan POS */}
                            <div className="flex flex-col gap-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl transition hover:border-orange-500">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100/10 text-orange-500">
                                        <PackageSearch className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-3xl font-extrabold tracking-tighter text-white">
                                        POS KoeMau Frozen Food
                                    </h2>
                                </div>

                                <div className="space-y-6 text-neutral-300">
                                    <p className="text-lg leading-relaxed">
                                        Sistem Kasir & POS modern untuk
                                        mengelola inventaris frozen food Bunda.
                                    </p>

                                    <ul className="list-inside list-disc space-y-4">
                                        <li>Cek stok produk secara instan.</li>
                                        <li>Kelola daftar produk dan harga.</li>
                                        <li>
                                            Pantau riwayat transaksi harian.
                                        </li>
                                        <li>Laporan keuntungan otomatis.</li>
                                    </ul>

                                    <div className="pt-6">
                                        <Link href="/login">
                                            <Button
                                                size="lg"
                                                className="text-md h-12 w-full bg-orange-600 px-8 hover:bg-orange-700 sm:w-auto"
                                            >
                                                Mulai Sekarang
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* KOTAK KANAN - Tempat Gambar */}
                            <div className="relative flex min-h-[400px] flex-col overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl transition hover:border-orange-900/50">
                                <div className="absolute inset-0 z-0 flex items-center justify-center bg-orange-950/10">
                                    <span className="text-9xl font-black text-orange-900/20">
                                        IMAGE
                                    </span>
                                </div>

                                <div className="relative z-10 flex h-full flex-col items-center justify-center bg-black/40 p-8 text-center">
                                    <h3 className="mb-3 text-2xl font-bold tracking-tight text-white">
                                        Etalase Digital
                                    </h3>
                                    <p className="max-w-sm text-neutral-300">
                                        Pasang foto terbaik produk KoeMau atau
                                        render Blender kamu di sini.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Login & Register */}
                        <nav className="mx-auto flex justify-center">
                            <nav className="my-4 flex w-fit justify-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 p-1.5 shadow-lg">
                                {canLogin && (
                                    <Link
                                        href={route('login')}
                                        className="flex scale-100 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-300 transition duration-300 ease-in-out hover:scale-105 hover:bg-neutral-800 hover:text-white"
                                    >
                                        <LogIn className="h-4 w-4" />
                                        Log in
                                    </Link>
                                )}

                                {canRegister && (
                                    <Link
                                        href={route('register')}
                                        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-300 transition duration-300 ease-in-out hover:scale-105 hover:bg-neutral-800 hover:text-white"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Register
                                    </Link>
                                )}
                            </nav>
                        </nav>
                    </div>
                </div>

                {/* Footer */}
                <footer className="w-full border-t border-neutral-800 py-6 text-center text-sm text-neutral-600">
                    © 2021 KoeMau Frozen Food.
                </footer>
            </div>
        </>
    );
}
