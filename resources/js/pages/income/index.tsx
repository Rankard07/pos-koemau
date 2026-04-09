import { Head } from '@inertiajs/react';
import { ArrowUpCircle, CalendarDays, ChartLine, Landmark, Wallet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

interface ChartItem {
    bulan: string;
    amount: number;
}

interface IncomeItem {
    id: number;
    description: string;
    amount: number;
    date: string;
    source: string;
}

interface IncomeIndexProps {
    title: string;
    totalKeseluruhan: number;
    totalTahunIni: number;
    totalBulanIni: number;
    totalMingguIni: number;
    chartData: ChartItem[];
    incomes: IncomeItem[];
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function TrendLineChart({ data }: { data: ChartItem[] }) {
    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Belum ada data pemasukan untuk ditampilkan.
            </div>
        );
    }

    const maxY = Math.max(...data.map((item) => item.amount), 1);
    const points = data
        .map((item, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * 100;
            const y = 100 - (item.amount / maxY) * 100;

            return `${x},${y}`;
        })
        .join(' ');

    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">
                    Grafik Pemasukan
                </h2>
                <div className="inline-flex rounded-lg border border-border bg-background p-1 text-xs">
                    <button className="rounded-md px-2 py-1 text-muted-foreground">1 Minggu</button>
                    <button className="rounded-md bg-primary px-2 py-1 font-medium text-primary-foreground">
                        1 Bulan
                    </button>
                    <button className="rounded-md px-2 py-1 text-muted-foreground">1 Tahun</button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="h-64 rounded-lg bg-muted/20 p-3">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                        <polyline
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="text-green-500"
                            points={points}
                        />
                        {data.map((item, index) => {
                            const x = (index / Math.max(data.length - 1, 1)) * 100;
                            const y = 100 - (item.amount / maxY) * 100;

                            return (
                                <circle
                                    key={`${item.bulan}-${index}`}
                                    cx={x}
                                    cy={y}
                                    r="1.2"
                                    className="fill-green-500"
                                />
                            );
                        })}
                    </svg>
                </div>
                <div className="grid grid-cols-6 gap-2 text-center text-[11px] text-muted-foreground">
                    {data.slice(-6).map((item) => (
                        <span key={item.bulan}>{item.bulan}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pemasukan', href: route('income.index') }];

export default function IncomeIndex({
    title,
    totalKeseluruhan,
    totalTahunIni,
    totalBulanIni,
    totalMingguIni,
    chartData,
    incomes,
}: IncomeIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="space-y-6 px-4 py-6">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Data Pemasukan</h1>
                    <p className="text-sm text-muted-foreground">
                        Nominal pemasukan otomatis dari transaksi penjualan dan input manual.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Total Pemasukan Keseluruhan</p>
                        <p className="mt-2 text-xl font-semibold text-green-500">{formatRupiah(totalKeseluruhan)}</p>
                        <Wallet className="mt-2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Total Pemasukan Tahun Ini</p>
                        <p className="mt-2 text-xl font-semibold text-orange-500">{formatRupiah(totalTahunIni)}</p>
                        <Landmark className="mt-2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Total Pemasukan Bulan Ini</p>
                        <p className="mt-2 text-xl font-semibold text-blue-500">{formatRupiah(totalBulanIni)}</p>
                        <CalendarDays className="mt-2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Total Pemasukan Minggu Ini</p>
                        <p className="mt-2 text-xl font-semibold text-violet-500">{formatRupiah(totalMingguIni)}</p>
                        <ArrowUpCircle className="mt-2 h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                <TrendLineChart data={chartData} />

                <div className="rounded-xl border border-border bg-card p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <ChartLine className="h-4 w-4 text-green-500" />
                        <h2 className="text-base font-semibold text-foreground">Riwayat Pemasukan</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-muted-foreground">
                                    <th className="px-3 py-2 font-medium">Tanggal</th>
                                    <th className="px-3 py-2 font-medium">Sumber</th>
                                    <th className="px-3 py-2 font-medium">Keterangan</th>
                                    <th className="px-3 py-2 text-right font-medium">Nominal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomes.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                                            Tidak ada data pemasukan.
                                        </td>
                                    </tr>
                                ) : (
                                    incomes.map((income) => (
                                        <tr key={income.id} className="border-b border-border/60 last:border-0">
                                            <td className="px-3 py-3">{income.date}</td>
                                            <td className="px-3 py-3">
                                                <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                                                    {income.source}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-foreground">{income.description}</td>
                                            <td className="px-3 py-3 text-right font-semibold text-green-500">
                                                {formatRupiah(income.amount)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
