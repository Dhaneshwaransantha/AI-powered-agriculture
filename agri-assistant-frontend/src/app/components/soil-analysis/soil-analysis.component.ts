import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgriService } from '../../services/agri.service';
import { SoilAnalysisResponse } from '../../models/analysis.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-soil-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <!-- HERO -->
      <div class="page-hero">
        <span class="hero-icon">🪨</span>
        <h1 class="section-title">Soil Analysis</h1>
        <p class="section-subtitle">Upload a soil image to get AI-powered fertility, texture, and cultivation insights</p>
      </div>

      <div class="container">
        <div class="analysis-layout">

          <!-- UPLOAD PANEL -->
          <div class="upload-panel card animate-fade-up">
            <h2 class="panel-title">📤 Upload Soil Image</h2>

            <!-- Upload Zone -->
            <div class="upload-zone"
                 [class.drag-over]="isDragging"
                 (dragover)="onDragOver($event)"
                 (dragleave)="isDragging=false"
                 (drop)="onDrop($event)">
              <input type="file" accept="image/*" (change)="onFileSelected($event)" #fileInput />
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

            <!-- Form Fields -->
            <div class="form-fields">
              <div class="form-group">
                <label class="form-label">👨‍🌾 Farmer Name</label>
                <input class="form-control" [(ngModel)]="farmerName" placeholder="Enter your name" />
              </div>
              <div class="form-group">
                <label class="form-label">📍 Location / Field Name</label>
                <input class="form-control" [(ngModel)]="location" placeholder="e.g. North Field, Block A" />
              </div>
              <div class="form-group">
                <label class="form-label">🌐 Language</label>
                <select class="form-control" [(ngModel)]="language">
                  <option *ngFor="let l of languages" [value]="l.code">{{ l.name }}</option>
                </select>
              </div>
            </div>

            <!-- Analyze Button -->
            <button class="btn btn-primary btn-lg analyze-btn"
                    (click)="analyze()"
                    [disabled]="!selectedFile || loading">
              <span *ngIf="!loading">🔬 Analyze Soil</span>
              <span *ngIf="loading" class="btn-loading">
                <span class="spinner" style="width:18px;height:18px;border-width:2px"></span>
                Analyzing...
              </span>
            </button>

            <!-- Error -->
            <div *ngIf="error" class="alert alert-danger animate-fade-in" style="margin-top:16px">
              ⚠️ {{ error }}
            </div>
          </div>

          <!-- RESULTS PANEL -->
          <div class="results-panel animate-slide-right" *ngIf="result || loading">

            <!-- Loading -->
            <div *ngIf="loading" class="card spinner-overlay">
              <div class="spinner"></div>
              <p class="spinner-text">🤖 Gemini AI is analyzing your soil...</p>
              <p class="spinner-text" style="font-size:0.82rem;opacity:0.6">This may take 10–20 seconds</p>
            </div>

            <!-- Results -->
            <div *ngIf="result && !loading">

              <!-- Quality Card -->
              <div class="card result-card animate-fade-up">
                <div class="result-header">
                  <h3>🔬 Soil Quality Report</h3>
                  <span class="badge" [ngClass]="result.isSuitableForCultivation ? 'badge-success' : 'badge-danger'">
                    {{ result.isSuitableForCultivation ? '✅ Suitable' : '❌ Not Suitable' }}
                  </span>
                </div>

                <!-- Score -->
                <div class="score-section">
                  <div class="score-label">
                    <span>Suitability Score</span>
                    <strong class="score-value">{{ result.suitabilityScore }}/100</strong>
                  </div>
                  <div class="progress-bar-outer">
                    <div class="progress-bar-inner" [style.width.%]="result.suitabilityScore"
                         [style.background]="getScoreColor(result.suitabilityScore)"></div>
                  </div>
                </div>

                <!-- Properties Grid -->
                <div class="props-grid">
                  <div class="prop-item" *ngFor="let p of getSoilProps()">
                    <span class="prop-icon">{{ p.icon }}</span>
                    <div>
                      <span class="prop-label">{{ p.label }}</span>
                      <span class="prop-value">{{ p.value || '—' }}</span>
                    </div>
                  </div>
                </div>

                <div class="alert alert-info" *ngIf="result.suitabilityReason">
                  💡 {{ result.suitabilityReason }}
                </div>
              </div>

              <!-- Recommendations -->
              <div class="card result-card animate-fade-up delay-1" *ngIf="hasRecommendations()">
                <h3>📋 Recommendations</h3>

                <div *ngIf="result.suitableCrops?.length" class="rec-section">
                  <h4 class="rec-heading">🌱 Suitable Crops</h4>
                  <div class="tags-row">
                    <span class="tag tag-green" *ngFor="let c of result.suitableCrops">{{ c }}</span>
                  </div>
                </div>

                <div *ngIf="result.recommendedFertilizers?.length" class="rec-section">
                  <h4 class="rec-heading">🧪 Fertilizers</h4>
                  <ul class="rec-list">
                    <li *ngFor="let f of result.recommendedFertilizers">{{ f }}</li>
                  </ul>
                </div>

                <div *ngIf="result.recommendedNutrients?.length" class="rec-section">
                  <h4 class="rec-heading">⚗️ Nutrients</h4>
                  <ul class="rec-list">
                    <li *ngFor="let n of result.recommendedNutrients">{{ n }}</li>
                  </ul>
                </div>

                <div *ngIf="result.organicImprovements?.length" class="rec-section">
                  <h4 class="rec-heading">♻️ Organic Improvements</h4>
                  <ul class="rec-list">
                    <li *ngFor="let o of result.organicImprovements">{{ o }}</li>
                  </ul>
                </div>

                <div *ngIf="result.generalRecommendations?.length" class="rec-section">
                  <h4 class="rec-heading">💡 General Tips</h4>
                  <ul class="rec-list">
                    <li *ngFor="let g of result.generalRecommendations">{{ g }}</li>
                  </ul>
                </div>
              </div>

              <!-- Analyse Another -->
              <button class="btn btn-secondary" style="width:100%;margin-top:8px" (click)="reset()">
                🔄 Analyze Another Sample
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div class="results-panel empty-state card animate-fade-in" *ngIf="!result && !loading">
            <div class="empty-icon">🔬</div>
            <h3>Ready to Analyze</h3>
            <p>Upload a soil image and fill in your details, then click <strong>Analyze Soil</strong> to get instant AI insights.</p>
            <div class="tips-list">
              <div class="tip" *ngFor="let t of tips">
                <span>{{ t.icon }}</span><span>{{ t.text }}</span>
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
    .link-text { color: var(--primary-light); }
    .upload-hint { font-size: 0.82rem; color: var(--text-muted); }

    .preview-container { position: relative; }
    .preview-img { width: 100%; max-height: 240px; object-fit: cover; border-radius: var(--radius-md); pointer-events: none; }
    .preview-overlay {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.8));
      padding: 12px 16px;
      display: flex; align-items: center; justify-content: space-between;
      border-radius: 0 0 var(--radius-md) var(--radius-md);
      font-size: 0.82rem; color: #fff;
      pointer-events: all;
    }

    .form-fields { display: flex; flex-direction: column; gap: 16px; margin: 20px 0; }
    .analyze-btn { width: 100%; justify-content: center; }
    .btn-loading { display: flex; align-items: center; gap: 10px; }

    /* Results */
    .result-card { margin-bottom: 20px; }
    .result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .result-header h3 { font-size: 1.1rem; }

    .score-section { margin-bottom: 20px; }
    .score-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 0.9rem; color: var(--text-secondary); }
    .score-value { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }

    .props-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
    .prop-item {
      display: flex; align-items: center; gap: 10px;
      background: var(--bg-surface); border-radius: var(--radius-sm); padding: 12px;
    }
    .prop-icon { font-size: 1.4rem; flex-shrink: 0; }
    .prop-label { display: block; font-size: 0.76rem; color: var(--text-muted); margin-bottom: 2px; }
    .prop-value { display: block; font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }

    .rec-section { margin-bottom: 20px; }
    .rec-heading { font-size: 0.9rem; color: var(--text-secondary); font-weight: 600; margin-bottom: 12px; }
    .tags-row { display: flex; flex-wrap: wrap; gap: 8px; }

    /* Empty */
    .empty-state { text-align: center; padding: 48px 32px; }
    .empty-icon { font-size: 3rem; margin-bottom: 16px; }
    .empty-state h3 { margin-bottom: 10px; }
    .empty-state p { color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6; margin-bottom: 24px; }
    .tips-list { display: flex; flex-direction: column; gap: 10px; text-align: left; }
    .tip { display: flex; align-items: center; gap: 12px; font-size: 0.88rem; color: var(--text-secondary); padding: 10px 14px; background: var(--bg-surface); border-radius: var(--radius-sm); }

    @media (max-width: 1024px) {
      .analysis-layout { grid-template-columns: 1fr; }
      .upload-panel { position: static; }
    }
  `]
})
export class SoilAnalysisComponent implements OnInit {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  farmerName = '';
  location = '';
  language = 'en';
  loading = false;
  error = '';
  result: SoilAnalysisResponse | null = null;
  isDragging = false;

  languages = [
    { code: 'en', name: '🇬🇧 English' }, { code: 'hi', name: '🇮🇳 Hindi' },
    { code: 'ta', name: '🇮🇳 Tamil' }, { code: 'te', name: '🇮🇳 Telugu' },
    { code: 'kn', name: '🇮🇳 Kannada' }, { code: 'ml', name: '🇮🇳 Malayalam' },
    { code: 'mr', name: '🇮🇳 Marathi' }, { code: 'bn', name: '🇮🇳 Bengali' },
    { code: 'gu', name: '🇮🇳 Gujarati' }, { code: 'pa', name: '🇮🇳 Punjabi' }
  ];

  tips = [
    { icon: '☀️', text: 'Take photos in natural daylight for best accuracy' },
    { icon: '📐', text: 'Include a ruler or coin for scale reference' },
    { icon: '🧪', text: 'Photograph freshly dug soil for better analysis' },
    { icon: '📷', text: 'Ensure the image is sharp and well-focused' }
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
    this.agriService.getSoilById(id).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
        // Optionally set metadata fields if they were saved
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

    this.agriService.analyzeSoil(this.selectedFile, this.farmerName || 'Unknown', this.location || 'Unknown', this.language)
      .subscribe({
        next: (res) => { this.result = res; this.loading = false; },
        error: (err) => { this.error = err?.error?.message || 'Analysis failed. Please try again.'; this.loading = false; }
      });
  }

  reset() { this.result = null; this.selectedFile = null; this.previewUrl = null; this.error = ''; }

  hasRecommendations() {
    return (this.result?.recommendedFertilizers?.length ||
            this.result?.suitableCrops?.length ||
            this.result?.generalRecommendations?.length);
  }

  getSoilProps() {
    return [
      { icon: '🪨', label: 'Texture', value: this.result?.texture },
      { icon: '💧', label: 'Moisture', value: this.result?.moistureLevel },
      { icon: '🌱', label: 'Organic Matter', value: this.result?.organicMatter },
      { icon: '⚗️', label: 'Fertility', value: this.result?.fertilityLevel },
      { icon: '🎨', label: 'Color', value: this.result?.colorDescription },
      { icon: '🧪', label: 'pH Estimate', value: this.result?.phEstimate }
    ];
  }

  getScoreColor(score?: number): string {
    if (!score) return '#e74c3c';
    if (score >= 75) return 'linear-gradient(90deg, #27ae60, #2ecc71)';
    if (score >= 50) return 'linear-gradient(90deg, #f39c12, #f1c40f)';
    return 'linear-gradient(90deg, #e74c3c, #c0392b)';
  }
}
