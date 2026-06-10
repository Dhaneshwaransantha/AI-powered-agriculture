import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="home-page">
      <!-- HERO -->
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="container hero-content">
          <div class="hero-badge animate-fade-up">
            <span>🚀</span> Powered by Google Gemini AI
          </div>
          <h1 class="hero-title animate-fade-up delay-1">
            Smart Farming Starts<br>
            <span class="gradient-text">Here</span>
          </h1>
          <p class="hero-desc animate-fade-up delay-2">
            Upload images of your soil or crops and get instant AI-powered insights —
            disease detection, soil fertility, harvest predictions, and actionable recommendations.
          </p>
          <div class="hero-actions animate-fade-up delay-3">
            <a routerLink="/soil" class="btn btn-primary btn-lg">🪨 Analyze Soil</a>
            <a routerLink="/crop" class="btn btn-accent btn-lg">🌿 Analyze Crop</a>
          </div>
          <div class="hero-stats animate-fade-up delay-4">
            <div class="hero-stat">
              <strong>Instant</strong>
              <span>AI Analysis</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <strong>Gemini</strong>
              <span>Vision Model</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <strong>10+</strong>
              <span>Languages</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <strong>100%</strong>
              <span>Free to Use</span>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURES -->
      <section class="features-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Everything You Need</h2>
            <p class="section-subtitle">Comprehensive AI tools designed for modern farmers</p>
          </div>

          <div class="grid-2 features-grid">
            <div class="feature-card animate-fade-up" *ngFor="let f of features; let i = index" [style.animation-delay]="(i*0.1)+'s'">
              <div class="feature-icon">{{ f.icon }}</div>
              <h3>{{ f.title }}</h3>
              <p>{{ f.desc }}</p>
              <a [routerLink]="f.link" class="feature-link">Learn More →</a>
            </div>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section class="how-section">
        <div class="container">
          <h2 class="section-title" style="text-align:center">How It Works</h2>
          <p class="section-subtitle" style="text-align:center">Three simple steps to AI-powered farm insights</p>
          <div class="steps">
            <div class="step" *ngFor="let s of steps; let i = index">
              <div class="step-number">{{ i + 1 }}</div>
              <div class="step-icon">{{ s.icon }}</div>
              <h4>{{ s.title }}</h4>
              <p>{{ s.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-card">
            <div class="cta-bg"></div>
            <h2>Ready to Transform Your Farm?</h2>
            <p>Start with a free soil or crop analysis today. No registration needed.</p>
            <div class="cta-actions">
              <a routerLink="/soil" class="btn btn-primary btn-lg">🪨 Soil Analysis</a>
              <a routerLink="/crop" class="btn btn-accent btn-lg">🌿 Crop Analysis</a>
              <a routerLink="/dashboard" class="btn btn-secondary btn-lg">📊 Dashboard</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    /* HERO */
    .hero { position: relative; overflow: hidden; padding: 80px 0 60px; min-height: 88vh; display: flex; align-items: center; }
    .hero-bg {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(45,158,95,0.2), transparent 70%),
                  radial-gradient(ellipse 50% 40% at 80% 80%, rgba(245,166,35,0.1), transparent 60%);
      pointer-events: none;
    }
    .hero-content { position: relative; text-align: center; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(45,158,95,0.12); border: 1px solid rgba(45,158,95,0.3);
      border-radius: 100px; padding: 8px 20px;
      font-size: 0.88rem; font-weight: 500; color: var(--primary-light);
      margin-bottom: 28px;
    }
    .hero-title {
      font-size: clamp(2.8rem, 6vw, 5rem);
      font-weight: 800; line-height: 1.1;
      margin-bottom: 24px;
    }
    .gradient-text {
      background: linear-gradient(135deg, var(--primary-light), var(--accent));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .hero-desc {
      font-size: 1.15rem; color: var(--text-secondary);
      max-width: 580px; margin: 0 auto 40px; line-height: 1.7;
    }
    .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 56px; }
    .hero-stats {
      display: flex; align-items: center; justify-content: center; gap: 32px; flex-wrap: wrap;
    }
    .hero-stat { display: flex; flex-direction: column; align-items: center; }
    .hero-stat strong { font-size: 1.4rem; font-weight: 800; color: var(--primary-light); }
    .hero-stat span { font-size: 0.82rem; color: var(--text-muted); }
    .hero-stat-divider { width: 1px; height: 40px; background: var(--border); }

    /* FEATURES */
    .features-section { padding: 80px 0; }
    .section-header { text-align: center; margin-bottom: 48px; }
    .features-grid { gap: 24px; }
    .feature-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 32px;
      transition: all 0.3s ease;
    }
    .feature-card:hover {
      border-color: var(--primary); transform: translateY(-6px);
      box-shadow: var(--shadow-glow);
    }
    .feature-icon { font-size: 2.4rem; margin-bottom: 16px; }
    .feature-card h3 { font-size: 1.2rem; margin-bottom: 10px; }
    .feature-card p { color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6; margin-bottom: 20px; }
    .feature-link { color: var(--primary-light); font-size: 0.88rem; font-weight: 600; }
    .feature-link:hover { color: var(--accent); }

    /* HOW IT WORKS */
    .how-section { padding: 80px 0; background: var(--bg-card); }
    .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 48px; }
    .step { text-align: center; padding: 32px 24px; position: relative; }
    .step-number {
      width: 48px; height: 48px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #fff; font-weight: 800; font-size: 1.2rem;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
      box-shadow: 0 4px 16px var(--primary-glow);
    }
    .step-icon { font-size: 2.2rem; margin-bottom: 16px; }
    .step h4 { font-size: 1.1rem; margin-bottom: 10px; }
    .step p { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; }

    /* CTA */
    .cta-section { padding: 80px 0; }
    .cta-card {
      position: relative; overflow: hidden;
      background: var(--bg-card); border: 1px solid rgba(45,158,95,0.3);
      border-radius: var(--radius-xl); padding: 64px 48px; text-align: center;
    }
    .cta-bg {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(45,158,95,0.1), transparent);
      pointer-events: none;
    }
    .cta-card h2 { font-size: 2.2rem; margin-bottom: 16px; position: relative; }
    .cta-card p { color: var(--text-secondary); font-size: 1.05rem; margin-bottom: 36px; position: relative; }
    .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; position: relative; }

    @media (max-width: 768px) {
      .hero { padding: 60px 0 40px; }
      .steps { grid-template-columns: 1fr; gap: 20px; }
      .cta-card { padding: 40px 24px; }
    }
  `]
})
export class HomeComponent {
  features = [
    {
      icon: '🪨', title: 'Soil Intelligence',
      desc: 'Get detailed soil texture, pH estimation, fertility score, moisture level analysis and cultivation suitability with precise fertilizer recommendations.',
      link: '/soil'
    },
    {
      icon: '🌿', title: 'Crop Health Monitor',
      desc: 'Identify crop type, detect diseases and nutrient deficiencies, estimate harvest dates, and get targeted treatment methods in seconds.',
      link: '/crop'
    },
    {
      icon: '🦠', title: 'Disease Detection',
      desc: 'AI-powered pathogen identification with severity scoring, treatment protocols, and preventive measures to protect your harvest.',
      link: '/crop'
    },
    {
      icon: '📊', title: 'Analytics Dashboard',
      desc: 'Track all your soil and crop analyses over time with visual charts, trend insights, and comparative reports.',
      link: '/dashboard'
    }
  ];

  steps = [
    { icon: '📸', title: 'Upload Image', desc: 'Take a clear photo of your soil sample or crop field and upload it through our simple interface.' },
    { icon: '🤖', title: 'AI Analysis', desc: 'Google Gemini\'s vision model analyzes the image using advanced multimodal AI to extract insights.' },
    { icon: '📋', title: 'Get Insights', desc: 'Receive detailed recommendations, disease alerts, and actionable guidance within seconds.' }
  ];
}
