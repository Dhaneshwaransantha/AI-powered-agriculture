import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SoilAnalysisComponent } from './components/soil-analysis/soil-analysis.component';
import { CropAnalysisComponent } from './components/crop-analysis/crop-analysis.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HistoryComponent } from './components/history/history.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'soil', component: SoilAnalysisComponent },
  { path: 'soil/:id', component: SoilAnalysisComponent },
  { path: 'crop', component: CropAnalysisComponent },
  { path: 'crop/:id', component: CropAnalysisComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'history', component: HistoryComponent },
  { path: '**', redirectTo: '' }
];
