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
    ],
  },
  {
    path: '**',
    redirectTo: 'projects',
  },
];
