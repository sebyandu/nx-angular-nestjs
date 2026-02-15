import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./features/dashboard/dashboard').then(
                (m) => m.Dashboard
            ),
    },
    {
        path: 'summary',
        loadComponent: () =>
            import('./features/summary/summary-table').then(
                (m) => m.SummaryTable
            ),
    }
];
