import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full',
  },
  {
    path: 'projects',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/projects/components/project-list/project-list.component').then(
            (m) => m.ProjectListComponent
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/projects/components/project-form/project-form.component').then(
            (m) => m.ProjectFormComponent
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./features/projects/components/project-form/project-form.component').then(
            (m) => m.ProjectFormComponent
          ),
      },
      {
        path: ':projectId/wbs',
        loadComponent: () =>
          import('./features/wbs/components/wbs-tree/wbs-tree.component').then(
            (m) => m.WbsTreeComponent
          ),
      },
      {
        path: ':projectId/budget',
        loadComponent: () =>
          import('./features/budgets/components/budget-overview/budget-overview.component').then(
            (m) => m.BudgetOverviewComponent
          ),
      },
      {
        path: ':projectId/gantt',
        loadComponent: () =>
          import('./features/gantt/components/gantt-chart/gantt-chart.component').then(
            (m) => m.GanttChartComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'projects',
  },
];
