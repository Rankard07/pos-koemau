import { Head, router } from '@inertiajs/react';
import {
    ArrowUpCircle,
    CalendarDays,
    ChartLine,
    Landmark,
    RotateCcw,
    Trash2,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
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
    currentRange: string;
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function TrendLineChart({
    data,
    currentRange,
    onRangeChange,
}: {
    data: ChartItem[];
    currentRange: string;
    onRangeChange: (range: string) => void;
}) {
    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Belum ada data pemasukan untuk ditampilkan.
            </div>
        );
    }

    const ranges = ['minggu', 'bulan', 'tahun', 'keseluruhan'];
    const rangeLabels = {
        minggu: '1 Minggu',
        bulan: '1 Bulan',
        tahun: '1 Tahun',
        keseluruhan: 'Keseluruhan',
    };

    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">
                    Grafik Pemasukan
                </h2>
                <div className="inline-flex rounded-lg border border-border bg-background p-1 text-xs">
                    {ranges.map((rangeOption) => (
                        <button
                            key={rangeOption}
                            onClick={() => onRangeChange(rangeOption)}
                            className={`rounded-md px-2 py-1 transition-colors ${
                                currentRange === rangeOption
                                    ? 'bg-primary font-medium text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {
                                rangeLabels[
                                    rangeOption as keyof typeof rangeLabels
                                ]
                            }
                        </button>
                    ))}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                    />
                    <XAxis dataKey="bulan" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem',
                            color: 'hsl(var(--foreground))',
                        }}
                        formatter={(value) =>
                            new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                            }).format(value as number)
                        }
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="amount"
                        name="Pemasukan"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ fill: '#22c55e', r: 4 }}
                        activeDot={{ r: 6 }}
                        isAnimationActive={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pemasukan', href: route('income.index') },
];

export default function IncomeIndex({
    title,
    totalKeseluruhan,
    totalTahunIni,
    totalBulanIni,
    totalMingguIni,
    chartData,
    incomes,
    currentRange: initialRange,
}: IncomeIndexProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [currentRange, setCurrentRange] = useState(initialRange);
    const [showResetConfirm1, setShowResetConfirm1] = useState(false);
    const [showResetConfirm2, setShowResetConfirm2] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleRangeChange = (range: string) => {
        setCurrentRange(range);
        setSelectedIds([]);
        router.get(route('income.index'), { range }, { preserveScroll: true });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(incomes.map((i) => i.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectItem = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) {
            return;
        }

        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        setIsProcessing(true);
        router.post(
            route('income.bulkDelete'),
            { ids: selectedIds },
            {
                onSuccess: () => {
                    setSelectedIds([]);
                    setShowDeleteConfirm(false);
                    setIsProcessing(false);
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    const handleReset = () => {
        setShowResetConfirm1(true);
    };

    const confirmReset1 = () => {
        setShowResetConfirm1(false);
        setShowResetConfirm2(true);
    };

    const confirmReset2 = () => {
        setIsProcessing(true);
        router.post(
            route('income.reset'),
            {},
            {
                onSuccess: () => {
                    setShowResetConfirm2(false);
                    setSelectedIds([]);
                    setIsProcessing(false);
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="space-y-6 px-4 py-6">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Data Pemasukan
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Nominal pemasukan otomatis dari transaksi penjualan dan
                        input manual.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">
                            Total Pemasukan Keseluruhan
                        </p>
                        <p className="mt-2 text-xl font-semibold text-green-500">
                            {formatRupiah(totalKeseluruhan)}
                        </p>
                        <Wallet className="mt-2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">
                            Total Pemasukan Tahun Ini
                        </p>
                        <p className="mt-2 text-xl font-semibold text-orange-500">
                            {formatRupiah(totalTahunIni)}
                        </p>
                        <Landmark className="mt-2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">
                            Total Pemasukan Bulan Ini
                        </p>
                        <p className="mt-2 text-xl font-semibold text-blue-500">
                            {formatRupiah(totalBulanIni)}
                        </p>
                        <CalendarDays className="mt-2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">
                            Total Pemasukan Minggu Ini
                        </p>
                        <p className="mt-2 text-xl font-semibold text-violet-500">
                            {formatRupiah(totalMingguIni)}
                        </p>
                        <ArrowUpCircle className="mt-2 h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                <TrendLineChart
                    data={chartData}
                    currentRange={currentRange}
                    onRangeChange={handleRangeChange}
                />

                <div className="rounded-xl border border-border bg-card p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ChartLine className="h-4 w-4 text-green-500" />
                            <h2 className="text-base font-semibold text-foreground">
                                Riwayat Pemasukan
                            </h2>
                        </div>
                        <div className="flex gap-2">
                            {selectedIds.length > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteSelected}
                                    disabled={isProcessing}
                                    className="gap-1"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Hapus ({selectedIds.length})
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                disabled={isProcessing || incomes.length === 0}
                                className="gap-1"
                            >
                                <RotateCcw className="h-3 w-3" />
                                Reset Data...
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-muted-foreground">
                                    <th className="px-3 py-2 font-medium">
                                        <input
                                            type="checkbox"
                                            checked={
                                                incomes.length > 0 &&
                                                selectedIds.length ===
                                                    incomes.length
                                            }
                                            onChange={handleSelectAll}
                                            className="cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-3 py-2 font-medium">
                                        Tanggal
                                    </th>
                                    <th className="px-3 py-2 font-medium">
                                        Sumber
                                    </th>
                                    <th className="px-3 py-2 font-medium">
                                        Keterangan
                                    </th>
                                    <th className="px-3 py-2 text-right font-medium">
                                        Nominal
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomes.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-3 py-8 text-center text-muted-foreground"
                                        >
                                            Tidak ada data pemasukan.
                                        </td>
                                    </tr>
                                ) : (
                                    incomes.map((income) => (
                                        <tr
                                            key={income.id}
                                            className={`border-b border-border/60 last:border-0 ${
                                                selectedIds.includes(income.id)
                                                    ? 'bg-secondary'
                                                    : ''
                                            }`}
                                        >
                                            <td className="px-3 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(
                                                        income.id,
                                                    )}
                                                    onChange={() =>
                                                        handleSelectItem(
                                                            income.id,
                                                        )
                                                    }
                                                    className="cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                {income.date}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                                                    {income.source}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-foreground">
                                                {income.description}
                                            </td>
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

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-foreground">
                            Konfirmasi Penghapusan
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Anda akan menghapus {selectedIds.length} data
                            pemasukan. Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isProcessing}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDelete}
                                disabled={isProcessing}
                            >
                                Ya, Hapus
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* First Reset Confirmation Dialog */}
            {showResetConfirm1 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-foreground">
                            Konfirmasi Pertama
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Anda akan menghapus SEMUA data pemasukan. Tindakan
                            ini tidak dapat dibatalkan dan permanen.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowResetConfirm1(false)}
                                disabled={isProcessing}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmReset1}
                                disabled={isProcessing}
                            >
                                Lanjutkan
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Second Reset Confirmation Dialog */}
            {showResetConfirm2 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-foreground">
                            Konfirmasi Kedua
                        </h3>
                        <p className="mt-2 text-sm font-medium text-red-500">
                            INI ADALAH TINDAKAN TERAKHIR. Semua data pemasukan
                            akan dihapus permanen dan tidak dapat dikembalikan.
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                            Ketik "RESET" untuk melanjutkan.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowResetConfirm2(false)}
                                disabled={isProcessing}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmReset2}
                                disabled={isProcessing}
                            >
                                Ya, Reset Semua
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
