import { Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: number; // Ukuran spinner dalam piksel
    color?: string; // Warna spinner, misalnya 'blue', 'red', atau kode warna hex
    className?: string; // Kelas CSS tambahan untuk styling
}

export default function LoadingSpinner({
    size = 16, // Ukuran default 16px
    color = 'currentColor', // Warna default mengikuti warna teks saat ini
    className = '', // Kelas CSS tambahan default kosong
}: LoadingSpinnerProps) {
    return (
        <Loader2Icon
            className={cn(`animate-spin ${className}`)} // Menambahkan kelas animate-spin untuk animasi berputar
            style={{ width: size, height: size, color }} // Mengatur ukuran dan warna spinner
        />
    );
}
