import { Head, Link, usePage } from '@inertiajs/react';

import {
    MoveRight,
    Store,
    ShieldCheck,
    Truck,
    Star,
    Check,
    Zap,
} from 'lucide-react';

import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home, dashboard, login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="KoeMau - Frozen Food Reseller" />

            <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 text-foreground selection:bg-orange-500 selection:text-white">
                {/* Navbar */}
                <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between px-6 py-4 lg:px-12">
                        <Link
                            // href={route('home')}
                            href={home()}
                            className="flex items-center gap-2 transition-opacity hover:opacity-80"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-bold text-white shadow-md">
                                K
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                KoeMau
                            </span>
                        </Link>

                        {/* Auth Buttons */}
                        <div className="flex gap-3">
                            {auth.user ? (
                                <Link
                                    // href={route('dashboard')}
                                    href={dashboard()}
                                >
                                    <Button size="sm">Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        // href={login()}
                                    >
                                        <Button variant="ghost" size="sm">
                                            Log In
                                        </Button>
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={route('register')}
                                            // href={register()}
                                        >
                                            <Button
                                                size="sm"
                                                className="bg-orange-600 hover:bg-orange-700"
                                            >
                                                Daftar
                                            </Button>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main>
                    {/* Hero Section */}
                    <section className="mx-auto max-w-5xl px-6 py-16 lg:py-28">
                        <div className="space-y-8 text-center">
                            {/* Badge */}
                            <div className="flex justify-center">
                                <Badge
                                    variant="secondary"
                                    className="bg-orange-100 text-orange-700 hover:bg-orange-100"
                                >
                                    <Star className="mr-1.5 h-3 w-3 fill-current" />
                                    Penyedia Frozen Food Terpercaya
                                </Badge>
                            </div>

                            {/* Heading */}
                            <h1 className="text-4xl font-extrabold tracking-tighter md:text-5xl lg:text-6xl">
                                Solusi Praktis{' '}
                                <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                                    Makan Enak Di Rumah
                                </span>
                            </h1>

                            {/* Description */}
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                Menyediakan berbagai pilihan frozen food
                                berkualitas tinggi untuk keluarga Anda. Stok
                                selalu baru, bersertifikat halal, dan siap
                                diantar langsung ke depan pintu rumah dengan
                                cepat dan aman.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
                                <Button
                                    size="lg"
                                    className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg hover:from-orange-600 hover:to-orange-700"
                                >
                                    Lihat Katalog Produk
                                    <MoveRight className="h-4 w-4" />
                                </Button>
                                <Link
                                    // href={route('login')}
                                    href={login()}
                                >
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        Admin Dashboard
                                        <Zap className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="border-t bg-muted/40 px-6 py-16 lg:py-20">
                        <div className="mx-auto max-w-5xl">
                            <div className="mb-12 text-center">
                                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                                    Mengapa Memilih KoeMau?
                                </h2>
                                <p className="mt-4 text-muted-foreground">
                                    Komitmen kami untuk memberikan pengalaman
                                    terbaik
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                <FeatureCard
                                    icon={
                                        <Store className="h-8 w-8 text-orange-600" />
                                    }
                                    title="Produk Lengkap"
                                    description="Dari camilan hingga lauk utama, semua pilihan tersedia dalam satu tempat dengan berbagai merk pilihan."
                                />
                                <FeatureCard
                                    icon={
                                        <ShieldCheck className="h-8 w-8 text-orange-600" />
                                    }
                                    title="Kualitas Terjamin"
                                    description="Penyimpanan dengan suhu optimal dan penanganan profesional memastikan kesegaran produk hingga sampai ke tangan Anda."
                                />
                                <FeatureCard
                                    icon={
                                        <Truck className="h-8 w-8 text-orange-600" />
                                    }
                                    title="Pengiriman Cepat"
                                    description="Pengiriman via ojol atau kurir kami sendiri untuk area Bekasi dan sekitarnya dengan jaminan keamanan."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Benefits Section */}
                    <section className="mx-auto max-w-5xl px-6 py-16 lg:py-20">
                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold tracking-tight">
                                    Keuntungan Berbelanja Bersama Kami
                                </h2>

                                {[
                                    {
                                        title: 'Harga Kompetitif',
                                        description:
                                            'Dapatkan harga terbaik tanpa kompromi kualitas',
                                    },
                                    {
                                        title: 'Sistem POS Modern',
                                        description:
                                            'Kelola bisnis dengan dashboard admin yang user-friendly',
                                    },
                                    {
                                        title: 'Support 24/7',
                                        description:
                                            'Tim siap membantu setiap pertanyaan dan kebutuhan Anda',
                                    },
                                    {
                                        title: 'Program Loyalitas',
                                        description:
                                            'Dapatkan reward dan keuntungan khusus untuk pelanggan setia',
                                    },
                                ].map((benefit, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                                                <Check className="h-5 w-5 text-orange-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">
                                                {benefit.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50">
                                <CardHeader>
                                    <CardTitle>Siap Memulai?</CardTitle>
                                    <CardDescription>
                                        Bergabung dengan ribuan pelanggan puas
                                        kami
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-foreground">
                                        Daftarkan diri Anda hari ini dan nikmati
                                        berbagai keuntungan eksklusif dari
                                        KoeMau Frozen Food.
                                    </p>
                                    <Link
                                        // href={route('register')}
                                        href={register()}
                                        className="block"
                                    >
                                        <Button
                                            className="w-full bg-orange-600 hover:bg-orange-700"
                                            size="lg"
                                        >
                                            Daftar Sekarang
                                        </Button>
                                    </Link>
                                    <p className="text-center text-xs text-muted-foreground">
                                        Sudah punya akun?{' '}
                                        <Link
                                            // href={route('login')}
                                            href={login()}
                                            className="font-semibold text-orange-600 hover:text-orange-700"
                                        >
                                            Login di sini
                                        </Link>
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t bg-muted/50 py-12">
                    <div className="mx-auto max-w-5xl space-y-4 px-6 text-center text-sm text-muted-foreground">
                        <p>© 2026 KoeMau Frozen Food. All rights reserved.</p>
                        <p className="text-xs">
                            Built with Laravel 12, React 19 & Tailwind CSS
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Card className="border-none bg-background shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="pt-6">
                <div className="mb-4 inline-flex rounded-lg bg-orange-100 p-3">
                    {icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
