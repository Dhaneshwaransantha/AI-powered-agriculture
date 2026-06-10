import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgriService } from '../../services/agri.service';
import { CropAnalysisResponse } from '../../models/analysis.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-crop-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <!-- HERO -->
      <div class="page-hero">
        <span class="hero-icon">🌿</span>
        <h1 class="section-title">Crop Analysis</h1>
        <p class="section-subtitle">Identify crop type, detect diseases, estimate harvest date and get AI-powered treatment plans</p>
      </div>

      <div class="container">
        <div class="analysis-layout">

          <!-- UPLOAD PANEL -->
          <div class="upload-panel card animate-fade-up">
            <h2 class="panel-title">📤 Upload Crop Image</h2>

            <div class="upload-zone"
                 [class.drag-over]="isDragging"
                 (dragover)="onDragOver($event)"
                 (dragleave)="isDragging=false"
                 (drop)="onDrop($event)">
              <input type="file" accept="image/*" (change)="onFileSelected($event)" />
              <div *ngIf="!previewUrl" class="upload-placeholder">
                <div class="upload-icon">☁️</div>
                <p class="upload-text">Drag & drop or <span class="link-text">click to browse</span></p>
                <p class="upload-hint">JPEG, PNG, WEBP — Max 10MB</p>
              </div>
              <div *ngIf="previewUrl" class="preview-container">
                <img [src]="previewUrl" alt="Preview" class="preview-img" />
                <div class="preview-overlay">
                  <span>📸 {{ selectedFile?.name }}</span>
                  <button class="btn btn-sm btn-danger" (click)="clearFile($event)">✕ Remove</button>
                </div>
              </div>
            </div>

            <div class="form-fields">
              <div class="form-group">
                <label class="form-label">👨‍🌾 Farmer Name</label>
                <input class="form-control" [(ngModel)]="farmerName" placeholder="Enter your name" />
              </div>
              <div class="form-group">
                <label class="form-label">📍 Location / Field</label>
                <input class="form-control" [(ngModel)]="location" placeholder="e.g. South Farm, Plot B" />
              </div>
              <div class="form-group">
                <label class="form-label">🌐 Language</label>
                <select class="form-control" [(ngModel)]="language">
                  <option *ngFor="let l of languages" [value]="l.code">{{ l.name }}</option>
                </select>
              </div>
            </div>

            <button class="btn btn-accent btn-lg analyze-btn"
                    (click)="analyze()"
                    [disabled]="!selectedFile || loading">
              <span *ngIf="!loading">🔬 Analyze Crop</span>
              <span *ngIf="loading" class="btn-loading">
                <span class="spinner" style="width:18px;height:18px;border-width:2px"></span>
                Analyzing...
              </span>
            </button>

            <div *ngIf="error" class="alert alert-danger animate-fade-in" style="margin-top:16px">
              ⚠️ {{ error }}
            </div>
          </div>

          <!-- RESULTS -->
          <div class="results-panel">

            <!-- Loading -->
            <div *ngIf="loading" class="card spinner-overlay animate-fade-in">
              <div class="spinner"></div>
              <p class="spinner-text">🤖 Gemini AI is scanning your crop...</p>
              <p class="spinner-text" style="font-size:0.82rem;opacity:0.6">Checking for diseases, deficiencies & growth stage</p>
            </div>

            <!-- Results -->
            <ng-container *ngIf="result && !loading">

              <!-- Crop ID Card -->
              <div class="card result-card animate-fade-up">
                <div class="result-header">
                  <div>
                    <h3>🌿 {{ result.cropName || 'Unknown Crop' }}</h3>
                    <p class="crop-variety" *ngIf="result.cropVariety && result.cropVariety !== 'Unknown'">
                      Variety: {{ result.cropVariety }}
                    </p>
                  </div>
                  <div class="header-badges">
                    <span class="badge badge-primary">{{ result.confidenceLevel }} Confidence</span>
                    <span class="badge" [ngClass]="getHealthBadge(result.overallHealth)">
                      {{ getHealthIcon(result.overallHealth) }} {{ result.overallHealth }}
                    </span>
                  </div>
                </div>

                <!-- Growth Progress -->
                <div class="growth-section">
                  <div class="growth-info">
                    <div class="growth-detail">
                      <span class="growth-icon">📈</span>
                      <div>
                        <span class="growth-label">Growth Stage</span>
                        <strong>{{ result.growthStage }}</strong>
                      </div>
                    </div>
                    <div class="growth-detail">
                      <span class="growth-icon">📅</span>
                      <div>
                        <span class="growth-label">Days to Harvest</span>
                        <strong>{{ result.daysToHarvest }} days</strong>
                      </div>
                    </div>
                    <div class="growth-detail">
                      <span class="growth-icon">🗓️</span>
                      <div>
                        <span class="growth-label">Est. Harvest</span>
                        <strong>{{ result.estimatedHarvestDate || '—' }}</strong>
                      </div>
                    </div>
                  </div>
                  <div class="progress-label">
                    <span>Growth Progress</span>
                    <span>{{ result.growthPercentage }}%</span>
                  </div>
                  <div class="progress-bar-outer">
                    <div class="progress-bar-inner"
                         [style.width.%]="result.growthPercentage"
                         [style.background]="getGrowthColor(result.growthPercentage)"></div>
                  </div>
                </div>
              </div>

              <!-- Disease Alert Card -->
              <div class="card result-card animate-fade-up delay-1" *ngIf="result.hasDisease">
                <div class="disease-header">
                  <div class="disease-alert-icon">🦠</div>
                  <div>
                    <h3>Disease Detected</h3>
                    <p class="disease-name">{{ result.diseaseName }}</p>
                  </div>
                  <span class="badge" [ngClass]="getSeverityBadge(result.diseaseSeverity)">
                    {{ result.diseaseSeverity }} Severity
                  </span>
                </div>

                <p class="disease-desc" *ngIf="result.diseaseDescription">{{ result.diseaseDescription }}</p>

                <div *ngIf="result.treatmentMethods?.length" class="rec-section">
                  <h4 class="rec-heading">💊 Treatment Methods</h4>
                  <ul class="rec-list">
                    <li *ngFor="let t of result.treatmentMethods">{{ t }}</li>
                  </ul>
                </div>

                <div *ngIf="result.preventiveMeasures?.length" class="rec-section" style="margin-top:16px">
                  <h4 class="rec-heading">🛡️ Preventive Measures</h4>
                  <ul class="rec-list">
                    <li *ngFor="let p of result.preventiveMeasures">{{ p }}</li>
                  </ul>
                </div>
              </div>

              <!-- Healthy Badge -->
              <div class="card result-card animate-fade-up delay-1 healthy-card" *ngIf="!result.hasDisease">
                <div class="healthy-content">
                  <span class="healthy-icon">✅</span>
                  <div>
                    <h4>No Disease Detected</h4>
                    <p>Your crop appears healthy! Continue current care practices.</p>
                  </div>
                </div>
              </div>

              <!-- Deficiency Card -->
              <div class="card result-card animate-fade-up delay-2" *ngIf="result.hasDeficiency">
                <h3>⚠️ Nutrient Deficiency Detected</h3>
                <div class="tags-row" style="margin: 12px 0">
                  <span class="badge badge-warning" *ngFor="let d of result.deficiencyType">{{ d }}</span>
                </div>
                <div *ngIf="result.deficiencyTreatment?.length">
                  <h4 class="rec-heading">💉 Treatment</h4>
                  <ul class="rec-list">
                    <li *ngFor="let t of result.deficiencyTreatment">{{ t }}</li>
                  </ul>
                </div>
              </div>

              <!-- Inputs Required -->
              <div class="card result-card animate-fade-up delay-2">
                <h3>🌾 Required Inputs</h3>
                <div class="inputs-grid">
                  <div class="input-item" *ngIf="result.waterRequirement">
                    <span class="input-icon">💧</span>
                    <div>
                      <span class="input-label">Water</span>
                      <p>{{ result.waterRequirement }}</p>
                    </div>
                  </div>
                </div>

                <div *ngIf="result.fertilizerRequirement?.length" class="rec-section" style="margin-top:16px">
                  <h4 class="rec-heading">🧪 Fertilizers</h4>
                  <ul class="rec-list">
                    <li *ngFor="let f of result.fertilizerRequirement">{{ f }}</li>
                  </ul>
                </div>

                <div *ngIf="hasPesticides(result.pesticideRequirement)" class="rec-section" style="margin-top:16px">
                  <h4 class="rec-heading">🧴 Pesticides</h4>
                  <ul class="rec-list">
                    <li *ngFor="let p of result.pesticideRequirement">{{ p }}</li>
                  </ul>
                </div>
              </div>

              <!-- General Recommendations -->
              <div class="card result-card animate-fade-up delay-3" *ngIf="result.generalRecommendations?.length">
                <h3>💡 General Recommendations</h3>
                <ul class="rec-list" style="margin-top:14px">
                  <li *ngFor="let g of result.generalRecommendations">{{ g }}</li>
                </ul>
              </div>

              <button class="btn btn-secondary" style="width:100%;margin-top:8px" (click)="reset()">
                🔄 Analyze Another Crop
              </button>
            </ng-container>

            <!-- Empty State -->
            <div class="empty-state card animate-fade-in" *ngIf="!result && !loading">
              <div class="empty-icon">🌿</div>
              <h3>Ready to Analyze</h3>
              <p>Upload a crop photo to detect diseases, estimate harvest date, and get care recommendations.</p>
              <div class="tips-list">
                <div class="tip" *ngFor="let t of tips">
                  <span>{{ t.icon }}</span><span>{{ t.text }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analysis-layout { display: grid; grid-template-columns: 420px 1fr; gap: 28px; align-items: start; }
    .upload-panel { position: sticky; top: 88px; }
    .panel-title { font-size: 1.2rem; margin-bottom: 20px; }
    .upload-placeholder { pointer-events: none; }
    .upload-icon { font-size: 2.5rem; margin-bottom: 12px; }
    .upload-text { font-size: 0.95rem; margin-bottom: 6px; }
    .link-text { color: var(--accent); }
    .upload-hint { font-size: 0.82rem; color: var(--text-muted); }
    .preview-container { position: relative; }
    .preview-img { width: 100%; max-height: 240px; object-fit: cover; border-radius: var(--radius-md); pointer-events: none; }
    .preview-overlay {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.8));
      padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;
      border-radius: 0 0 var(--radius-md) var(--radius-md);
      font-size: 0.82rem; color: #fff; pointer-events: all;
    }
    .form-fields { display: flex; flex-direction: column; gap: 16px; margin: 20px 0; }
    .analyze-btn { width: 100%; justify-content: center; }
    .btn-loading { display: flex; align-items: center; gap: 10px; }

    /* Results */
    .result-card { margin-bottom: 20px; }
    .result-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 12px; }
    .result-header h3 { font-size: 1.2rem; }
    .crop-variety { font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }
    .header-badges { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }

    .growth-section { margin-top: 8px; }
    .growth-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .growth-detail {
      display: flex; align-items: center; gap: 10px;
      background: var(--bg-surface); border-radius: var(--radius-sm); padding: 12px;
    }
    .growth-icon { font-size: 1.4rem; }
    .growth-label { display: block; font-size: 0.74rem; color: var(--text-muted); margin-bottom: 2px; }
    .growth-detail strong { font-size: 0.88rem; }
    .progress-label { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px; }

    /* Disease */
    .disease-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; flex-wrap: wrap; }
    .disease-alert-icon { font-size: 2.2rem; }
    .disease-header h3 { font-size: 1.1rem; margin-bottom: 4px; }
    .disease-name { font-size: 1rem; color: var(--danger); font-weight: 600; }
    .disease-desc { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px; }

    .healthy-card { border-color: rgba(39,174,96,0.3); background: rgba(39,174,96,0.05); }
    .healthy-content { display: flex; align-items: center; gap: 16px; }
    .healthy-icon { font-size: 2.2rem; }
    .healthy-content h4 { font-size: 1rem; margin-bottom: 4px; }
    .healthy-content p { font-size: 0.88rem; color: var(--text-secondary); }

    .inputs-grid { display: flex; flex-direction: column; gap: 12px; margin-top: 14px; }
    .input-item { display: flex; align-items: flex-start; gap: 12px; background: var(--bg-surface); border-radius: var(--radius-sm); padding: 14px; }
    .input-icon { font-size: 1.6rem; flex-shrink: 0; }
    .input-label { display: block; font-size: 0.78rem; color: var(--text-muted); margin-bottom: 4px; }
    .input-item p { font-size: 0.9rem; color: var(--text-primary); line-height: 1.5; }

    .rec-section { margin-bottom: 16px; }
    .rec-heading { font-size: 0.9rem; color: var(--text-secondary); font-weight: 600; margin-bottom: 10px; }
    .tags-row { display: flex; flex-wrap: wrap; gap: 8px; }

    .empty-state { text-align: center; padding: 48px 32px; }
    .empty-icon { font-size: 3rem; margin-bottom: 16px; }
    .empty-state h3 { margin-bottom: 10px; }
    .empty-state p { color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6; margin-bottom: 24px; }
    .tips-list { display: flex; flex-direction: column; gap: 10px; text-align: left; }
    .tip { display: flex; align-items: center; gap: 12px; font-size: 0.88rem; color: var(--text-secondary); padding: 10px 14px; background: var(--bg-surface); border-radius: var(--radius-sm); }

    @media (max-width: 1024px) {
      .analysis-layout { grid-template-columns: 1fr; }
      .upload-panel { position: static; }
      .growth-info { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 600px) {
      .growth-info { grid-template-columns: 1fr; }
    }
  `]
})
export class CropAnalysisComponent implements OnInit {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  farmerName = '';
  location = '';
  language = 'en';
  loading = false;
  error = '';
  result: CropAnalysisResponse | null = null;
  isDragging = false;

  languages = [
    { code: 'en', name: '🇬🇧 English' }, { code: 'hi', name: '🇮🇳 Hindi' },
    { code: 'ta', name: '🇮🇳 Tamil' }, { code: 'te', name: '🇮🇳 Telugu' },
    { code: 'kn', name: '🇮🇳 Kannada' }, { code: 'ml', name: '🇮🇳 Malayalam' },
    { code: 'mr', name: '🇮🇳 Marathi' }, { code: 'bn', name: '🇮🇳 Bengali' },
    { code: 'gu', name: '🇮🇳 Gujarati' }, { code: 'pa', name: '🇮🇳 Punjabi' }
  ];

  tips = [
    { icon: '🌿', text: 'Photograph the affected leaves clearly for disease detection' },
    { icon: '☀️', text: 'Use daylight — avoid flash which flattens colors' },
    { icon: '📏', text: 'Capture the whole plant or a representative section' },
    { icon: '🔍', text: 'Zoom in on discolored or damaged areas' }
  ];

  constructor(
    private agriService: AgriService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadById(+id);
    }
  }

  loadById(id: number) {
    this.loading = true;
    this.agriService.getCropById(id).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
        this.farmerName = res.farmerName || '';
        this.location = res.location || '';
      },
      error: () => {
        this.error = 'Failed to load analysis record.';
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.setFile(input.files[0]);
  }

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging = true; }

  onDrop(e: DragEvent) {
    e.preventDefault(); this.isDragging = false;
    if (e.dataTransfer?.files.length) this.setFile(e.dataTransfer.files[0]);
  }

  setFile(file: File) {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result as string;
    reader.readAsDataURL(file);
    this.result = null; this.error = '';
  }

  clearFile(e: Event) {
    e.stopPropagation(); e.preventDefault();
    this.selectedFile = null; this.previewUrl = null; this.result = null; this.error = '';
  }

  analyze() {
    if (!this.selectedFile) return;
    this.loading = true; this.error = ''; this.result = null;

    this.agriService.analyzeCrop(this.selectedFile, this.farmerName || 'Unknown', this.location || 'Unknown', this.language)
      .subscribe({
        next: (res) => { this.result = res; this.loading = false; },
        error: (err) => { this.error = err?.error?.message || 'Analysis failed. Please try again.'; this.loading = false; }
      });
  }

  reset() { this.result = null; this.selectedFile = null; this.previewUrl = null; this.error = ''; }

  getHealthBadge(health?: string): string {
    const map: Record<string, string> = {
      'Excellent': 'badge-success', 'Good': 'badge-success',
      'Fair': 'badge-warning', 'Poor': 'badge-danger', 'Critical': 'badge-danger'
    };
    return map[health || ''] || 'badge-info';
  }

  getHealthIcon(health?: string): string {
    const map: Record<string, string> = {
      'Excellent': '💚', 'Good': '✅', 'Fair': '🟡', 'Poor': '🟠', 'Critical': '🔴'
    };
    return map[health || ''] || '⚪';
  }

  getSeverityBadge(severity?: string): string {
    const map: Record<string, string> = {
      'Mild': 'badge-warning', 'Moderate': 'badge-warning', 'Severe': 'badge-danger', 'None': 'badge-success'
    };
    return map[severity || ''] || 'badge-info';
  }

  getGrowthColor(pct?: number): string {
    if (!pct) return '#3498db';
    if (pct >= 80) return 'linear-gradient(90deg,#f39c12,#f1c40f)';
    if (pct >= 50) return 'linear-gradient(90deg,#27ae60,#2ecc71)';
    return 'linear-gradient(90deg,#3498db,#2980b9)';
  }

  hasPesticides(list?: string[]): boolean {
    return !!(list && list.length > 0 && list[0] !== 'None');
  }
}
