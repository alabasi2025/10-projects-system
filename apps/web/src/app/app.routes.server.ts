import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'projects',
    renderMode: RenderMode.Client,
  },
  {
    path: 'projects/new',
    renderMode: RenderMode.Client,
  },
  {
    path: 'projects/:id/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
