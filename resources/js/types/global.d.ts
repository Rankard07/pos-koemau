import type { Auth } from '@/types/auth';
import type { route as ziggyRoute } from 'ziggy-js';

declare global {
    var route: typeof ziggyRoute;
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
