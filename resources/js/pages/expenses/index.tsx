import { Head } from '@inertiajs/react';
import { ArrowDownCircle, CalendarDays, ChartLine, Landmark, Wallet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

interface ChartItem {
    bulan: string;
    amount: number;
}

interface ExpenseItem {
    id: number;
    description: string;
    amount: number;
    date: string;
    category: string;
}

interface ExpensesIndexProps {
    title: string;
    totalKeseluruhan: number;
    totalTahunIni: number;
    totalBulanIni: number;
    totalMingguIni: number;
    chartData: ChartItem[];
    expenses: ExpenseItem[];
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function ExpenseTrendChart({ data }: { data: ChartItem[] }) {
    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Belum ada data pengeluaran untuk ditampilkan.
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
                <h2 className="text-base font-semibold text-foreground">Grafik Pengeluaran</h2>
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
                            className="text-red-500"
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
                                    className="fill-red-500"
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

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pengeluaran', href: route('expenses.index') }];

export default function ExpensesIndex({
    title,
    totalKeseluruhan,
    totalTahunIni,
    totalBulanIni,
    totalMingguIni,
    chartData,
    expenses,
}: ExpensesIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="space-y-6 px-4 py-6">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Data Pengeluaran</h1>
                    <p className="text-sm text-muted-foreground">
                        Nominal pengeluaran otomatis dari pembelian stok dan input biaya manual.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Total Pengeluaran Keseluruhan</p>
                        <p className="mt-2 text-xl font-semibold text-red-500">{formatRupiah(totalKeseluruhan)}</p>
                        <Wallet className="mt-2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Total Pengeluaran Tahun Ini</p>
                        <p className="mt-2 text-xl font-semibold text-orange-500">{formatRupiah(totalTahunIni)}</p>
                        <Landmark className="mt-2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Total Pengeluaran Bulan Ini</p>
                        <p className="mt-2 text-xl font-semibold text-blue-500">{formatRupiah(totalBulanIni)}</p>
                        <CalendarDays className="mt-2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Total Pengeluaran Minggu Ini</p>
                        <p className="mt-2 text-xl font-semibold text-violet-500">{formatRupiah(totalMingguIni)}</p>
                        <ArrowDownCircle className="mt-2 h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                <ExpenseTrendChart data={chartData} />

                <div className="rounded-xl border border-border bg-card p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <ChartLine className="h-4 w-4 text-red-500" />
                        <h2 className="text-base font-semibold text-foreground">Riwayat Pengeluaran</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-muted-foreground">
                                    <th className="px-3 py-2 font-medium">Tanggal</th>
                                    <th className="px-3 py-2 font-medium">Kategori</th>
                                    <th className="px-3 py-2 font-medium">Keterangan</th>
                                    <th className="px-3 py-2 text-right font-medium">Nominal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                                            Tidak ada data pengeluaran.
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.map((expense) => (
                                        <tr key={expense.id} className="border-b border-border/60 last:border-0">
                                            <td className="px-3 py-3">{expense.date}</td>
                                            <td className="px-3 py-3">
                                                <span className="inline-flex rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-500">
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-foreground">{expense.description}</td>
                                            <td className="px-3 py-3 text-right font-semibold text-red-500">
                                                {formatRupiah(expense.amount)}
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
