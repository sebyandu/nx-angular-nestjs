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
            import('./features/summary/summary-cards-grid').then(
                (m) => m.SummaryCardsGrid
            ),
    },
    {
        path: 'history',
        loadComponent: () =>
            import('./features/history/history-table').then(
                (m) => m.HistoryTable
            ),
    }
];
