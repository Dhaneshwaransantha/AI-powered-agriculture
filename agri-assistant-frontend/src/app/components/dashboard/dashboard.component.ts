import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgriService } from '../../services/agri.service';
import { DashboardStats, SoilAnalysisResponse, CropAnalysisResponse } from '../../models/analysis.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <!-- HERO -->
      <div class="page-hero">
        <span class="hero-icon">📊</span>
        <h1 class="section-title">Analytics Dashboard</h1>
        <p class="section-subtitle">Monitor all your soil and crop analyses at a glance</p>
      </div>

      <div class="container">

        <!-- LOADING -->
        <div *ngIf="loading" class="spinner-overlay">
          <div class="spinner"></div>
          <p class="spinner-text">Loading dashboard data...</p>
        </div>

        <ng-container *ngIf="!loading">

          <!-- STAT CARDS -->
          <div class="grid-4 animate-fade-up">
            <div class="stat-card" *ngFor="let s of statCards; let i = index" [style.animation-delay]="(i*0.08)+'s'">
              <div class="stat-icon">{{ s.icon }}</div>
              <div class="stat-value" [style.color]="s.color">{{ s.value }}</div>
              <div class="stat-label">{{ s.label }}</div>
            </div>
          </div>

          <!-- MAIN GRID -->
          <div class="dash-grid">

            <!-- SOIL PANEL -->
            <div class="card dash-card animate-fade-up delay-2">
              <div class="dash-card-header">
                <h3>🪨 Soil Analysis Summary</h3>
                <a routerLink="/soil" class="btn btn-sm btn-secondary">+ New</a>
              </div>

              <!-- Donut Chart - CSS only -->
              <div class="donut-wrap" *ngIf="stats">
                <div class="donut" [style]="getSoilDonutStyle()">
                  <div class="donut-center">
                    <strong>{{ stats.totalSoilAnalyses }}</strong>
                    <span>Total</span>
                  </div>
                </div>
                <div class="donut-legend">
                  <div class="legend-item">
                    <span class="legend-dot" style="background:#27ae60"></span>
                    <span>Suitable ({{ stats.suitableSoilCount }})</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-dot" style="background:#e74c3c"></span>
                    <span>Not Suitable ({{ stats.nonSuitableSoilCount }})</span>
                  </div>
                </div>
              </div>

              <!-- Recent Soil -->
              <div class="recent-list" *ngIf="recentSoil.length">
                <h4 class="recent-title">Recent Analyses</h4>
                <div class="recent-item" *ngFor="let s of recentSoil.slice(0,4)" [routerLink]="['/soil', s.id]" style="cursor:pointer">
                  <div class="recent-info">
                    <span class="recent-name">{{ s.farmerName }}</span>
                    <span class="recent-loc">{{ s.location }}</span>
                  </div>
                  <div class="recent-right">
                    <span class="badge" [ngClass]="s.isSuitableForCultivation ? 'badge-success' : 'badge-danger'">
                      {{ s.isSuitableForCultivation ? 'Suitable' : 'Not Suitable' }}
                    </span>
                    <span class="recent-score">{{ s.suitabilityScore }}/100</span>
                  </div>
                </div>
              </div>
              <div class="empty-mini" *ngIf="!recentSoil.length">
                <p>No soil analyses yet. <a routerLink="/soil">Start now →</a></p>
              </div>
            </div>

            <!-- CROP PANEL -->
            <div class="card dash-card animate-fade-up delay-3">
              <div class="dash-card-header">
                <h3>🌿 Crop Analysis Summary</h3>
                <a routerLink="/crop" class="btn btn-sm btn-secondary">+ New</a>
              </div>

              <!-- Bar Chart - CSS only -->
              <div class="bar-chart" *ngIf="stats">
                <div class="bar-row">
                  <span class="bar-label">Healthy</span>
                  <div class="bar-track">
                    <div class="bar-fill green"
                         [style.width.%]="getHealthyPercent()"></div>
                  </div>
                  <span class="bar-val">{{ getHealthyCropCount() }}</span>
                </div>
                <div class="bar-row">
                  <span class="bar-label">Diseased</span>
                  <div class="bar-track">
                    <div class="bar-fill red"
                         [style.width.%]="getDiseasePercent()"></div>
                  </div>
                  <span class="bar-val">{{ stats.diseasedCropCount }}</span>
                </div>
                <div class="bar-row">
                  <span class="bar-label">Deficient</span>
                  <div class="bar-track">
                    <div class="bar-fill orange"
                         [style.width.%]="getDeficiencyPercent()"></div>
                  </div>
                  <span class="bar-val">{{ stats.deficientCropCount }}</span>
                </div>
              </div>

              <!-- Recent Crops -->
              <div class="recent-list" *ngIf="recentCrops.length">
                <h4 class="recent-title">Recent Analyses</h4>
                <div class="recent-item" *ngFor="let c of recentCrops.slice(0,4)" [routerLink]="['/crop', c.id]" style="cursor:pointer">
                  <div class="recent-info">
                    <span class="recent-name">{{ c.cropName || 'Unknown' }}</span>
                    <span class="recent-loc">{{ c.farmerName }} · {{ c.location }}</span>
                  </div>
                  <div class="recent-right">
                    <span class="badge" [ngClass]="c.hasDisease ? 'badge-danger' : 'badge-success'">
                      {{ c.hasDisease ? '🦠 Diseased' : '✅ Healthy' }}
                    </span>
                    <span class="recent-score">{{ c.daysToHarvest }}d harvest</span>
                  </div>
                </div>
              </div>
              <div class="empty-mini" *ngIf="!recentCrops.length">
                <p>No crop analyses yet. <a routerLink="/crop">Start now →</a></p>
              </div>
            </div>
          </div>

          <!-- ACTIVITY FEED -->
          <div class="card animate-fade-up delay-4" style="margin-top:24px">
            <div class="dash-card-header">
              <h3>⚡ Quick Actions</h3>
            </div>
            <div class="quick-actions">
              <a routerLink="/soil" class="quick-action">
                <span class="qa-icon">🪨</span>
                <span class="qa-label">Analyze Soil</span>
              </a>
              <a routerLink="/crop" class="quick-action">
                <span class="qa-icon">🌿</span>
                <span class="qa-label">Analyze Crop</span>
              </a>
              <a routerLink="/history" class="quick-action">
                <span class="qa-icon">📋</span>
                <span class="qa-label">View History</span>
              </a>
              <div class="quick-action" (click)="refresh()">
                <span class="qa-icon">🔄</span>
                <span class="qa-label">Refresh Data</span>
              </div>
            </div>
          </div>

        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-bottom: 28px; }
    .stat-card { text-align: center; }
    .stat-icon { font-size: 2rem; margin-bottom: 10px; }
    .stat-value { font-size: 2.2rem; font-weight: 800; font-family: 'Poppins',sans-serif; }
    .stat-label { font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px; }

    .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .dash-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .dash-card-header h3 { font-size: 1.05rem; }

    /* Donut */
    .donut-wrap { display: flex; align-items: center; gap: 28px; margin-bottom: 24px; justify-content: center; }
    .donut {
      width: 120px; height: 120px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      position: relative; flex-shrink: 0;
    }
    .donut-center { text-align: center; }
    .donut-center strong { display: block; font-size: 1.6rem; font-weight: 800; }
    .donut-center span { font-size: 0.78rem; color: var(--text-muted); }
    .donut-legend { display: flex; flex-direction: column; gap: 10px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--text-secondary); }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }

    /* Bar Chart */
    .bar-chart { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
    .bar-row { display: flex; align-items: center; gap: 12px; }
    .bar-label { font-size: 0.82rem; color: var(--text-secondary); width: 68px; flex-shrink: 0; }
    .bar-track { flex: 1; background: var(--bg-surface); border-radius: 100px; height: 10px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 100px; transition: width 1s ease; }
    .bar-fill.green { background: linear-gradient(90deg, #27ae60, #2ecc71); }
    .bar-fill.red   { background: linear-gradient(90deg, #e74c3c, #c0392b); }
    .bar-fill.orange{ background: linear-gradient(90deg, #f39c12, #f1c40f); }
    .bar-val { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); width: 24px; text-align: right; }

    /* Recent */
    .recent-title { font-size: 0.82rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .recent-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 12px; background: var(--bg-surface); border-radius: var(--radius-sm);
      margin-bottom: 8px; gap: 12px;
    }
    .recent-info { flex: 1; min-width: 0; }
    .recent-name { display: block; font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .recent-loc { display: block; font-size: 0.78rem; color: var(--text-muted); }
    .recent-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
    .recent-score { font-size: 0.78rem; color: var(--text-muted); }
    .empty-mini { text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.88rem; }

    /* Quick Actions */
    .quick-actions { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
    .quick-action {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      padding: 24px 16px; background: var(--bg-surface);
      border-radius: var(--radius-md); border: 1px solid var(--border);
      cursor: pointer; text-decoration: none; color: var(--text-primary);
      transition: all 0.25s ease;
    }
    .quick-action:hover { border-color: var(--primary); background: rgba(45,158,95,0.08); transform: translateY(-3px); }
    .qa-icon { font-size: 2rem; }
    .qa-label { font-size: 0.88rem; font-weight: 600; }

    @media (max-width: 1024px) {
      .grid-4 { grid-template-columns: repeat(2,1fr); }
      .quick-actions { grid-template-columns: repeat(2,1fr); }
    }
    @media (max-width: 768px) {
      .dash-grid { grid-template-columns: 1fr; }
      .grid-4 { grid-template-columns: repeat(2,1fr); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  recentSoil: SoilAnalysisResponse[] = [];
  recentCrops: CropAnalysisResponse[] = [];
  loading = true;

  statCards: any[] = [];

  constructor(private agriService: AgriService) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading = true;
    this.agriService.getDashboardStats().subscribe({
      next: (s) => { this.stats = s; this.buildStatCards(); },
      error: () => { this.stats = { totalSoilAnalyses: 0, totalCropAnalyses: 0, suitableSoilCount: 0, nonSuitableSoilCount: 0, diseasedCropCount: 0, deficientCropCount: 0, totalAnalyses: 0 }; this.buildStatCards(); }
    });
    this.agriService.getAllSoilAnalyses().subscribe({ next: (d) => { this.recentSoil = d; this.loading = false; }, error: () => this.loading = false });
    this.agriService.getAllCropAnalyses().subscribe({ next: (d) => this.recentCrops = d, error: () => {} });
  }

  refresh() { this.loadData(); }

  buildStatCards() {
    this.statCards = [
      { icon: '📊', label: 'Total Analyses', value: this.stats?.totalAnalyses ?? 0, color: 'var(--primary-light)' },
      { icon: '🪨', label: 'Soil Analyses', value: this.stats?.totalSoilAnalyses ?? 0, color: '#3498db' },
      { icon: '🌿', label: 'Crop Analyses', value: this.stats?.totalCropAnalyses ?? 0, color: 'var(--accent)' },
      { icon: '🦠', label: 'Disease Cases', value: this.stats?.diseasedCropCount ?? 0, color: '#e74c3c' }
    ];
  }

  getSoilDonutStyle(): string {
    const total = this.stats?.totalSoilAnalyses || 1;
    const suitable = this.stats?.suitableSoilCount || 0;
    const pct = Math.round((suitable / total) * 100);
    const deg = Math.round(pct * 3.6);
    return `background: conic-gradient(#27ae60 0deg ${deg}deg, #e74c3c ${deg}deg 360deg)`;
  }

  getHealthyCropCount(): number {
    return Math.max(0, (this.stats?.totalCropAnalyses || 0) - (this.stats?.diseasedCropCount || 0));
  }

  getHealthyPercent(): number {
    const t = this.stats?.totalCropAnalyses || 1;
    return Math.round((this.getHealthyCropCount() / t) * 100);
  }

  getDiseasePercent(): number {
    const t = this.stats?.totalCropAnalyses || 1;
    return Math.round(((this.stats?.diseasedCropCount || 0) / t) * 100);
  }

  getDeficiencyPercent(): number {
    const t = this.stats?.totalCropAnalyses || 1;
    return Math.round(((this.stats?.deficientCropCount || 0) / t) * 100);
  }
}
