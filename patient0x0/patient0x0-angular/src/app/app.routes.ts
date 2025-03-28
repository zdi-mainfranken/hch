// app.routes.ts
import { Routes } from '@angular/router';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: PatientDashboardComponent },
  { 
    path: 'simulation/:id', 
    loadComponent: () => import('./conversation-simulation/conversation-simulation.component')
      .then(m => m.ConversationSimulationComponent) 
  },
  { 
    path: 'evaluation/:id', 
    loadComponent: () => import('./evaluation/evaluation.component')
      .then(m => m.EvaluationComponent) 
  },
  { path: '**', redirectTo: 'dashboard' }
];