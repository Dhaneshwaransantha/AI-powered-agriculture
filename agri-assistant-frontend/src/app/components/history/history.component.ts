import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AgriService } from '../../services/agri.service';
import { HistoryResponse } from '../../models/analysis.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <!-- HERO -->
      <div class="page-hero">
        <span class="hero-icon">📋</span>
        <h1 class="section-title">Analysis History</h1>
        <p class="section-subtitle">Track all your soil and crop analyses over time</p>
      </div>

      <div class="container">

        <!-- FILTERS -->
        <div class="filters-bar card animate-fade-up">
          <div class="filter-group">
            <button class="filter-btn" [class.active]="activeFilter==='ALL'" (click)="filterByType('ALL')">
              📊 All
            </button>
            <button class="filter-btn" [class.active]="activeFilter==='SOIL'" (click)="filterByType('SOIL')">
              🪨 Soil
            </button>
            <button class="filter-btn" [class.active]="activeFilter==='CROP'" (click)="filterByType('CROP')">
              🌿 Crop
            </button>
          </div>

          <div class="search-group">
            <input class="form-control search-input"
                   [(ngModel)]="searchQuery"
                   (input)="onSearch()"
                   placeholder="🔍 Search by farmer name..." />
          </div>

          <div class="count-badge">
            {{ filteredHistory.length }} records
          </div>
        </div>

        <!-- LOADING -->
        <div *ngIf="loading" class="spinner-overlay">
          <div class="spinner"></div>
          <p class="spinner-text">Loading history...</p>
        </div>

        <!-- HISTORY TABLE -->
        <div class="table-container card animate-fade-up delay-1" *ngIf="!loading && filteredHistory.length">
          <div class="history-table">
          <div class="table-header">
            <div class="th">Type</div>
            <div class="th">Farmer</div>
            <div class="th">Location</div>
            <div class="th">Summary</div>
            <div class="th">Status</div>
            <div class="th">Date</div>
            <div class="th">Action</div>
          </div>

          <div class="table-row animate-fade-in"
               *ngFor="let h of filteredHistory; let i = index"
               [style.animation-delay]="(i*0.05)+'s'"
               [class.active-row]="activeMenuId === h.id">
            <div class="td">
              <span class="type-badge" [ngClass]="h.analysisType === 'SOIL' ? 'type-soil' : 'type-crop'">
                {{ h.analysisType === 'SOIL' ? '🪨 Soil' : '🌿 Crop' }}
              </span>
            </div>
            <div class="td">
              <span class="farmer-name">{{ h.farmerName || 'Unknown' }}</span>
            </div>
            <div class="td">
              <span class="location">📍 {{ h.location || '—' }}</span>
            </div>
            <div class="td summary-td">
              <span class="summary-text" [title]="h.summary">{{ h.summary || '—' }}</span>
            </div>
            <div class="td">
              <span class="badge" [ngClass]="h.resultStatus === 'SUCCESS' ? 'badge-success' : 'badge-danger'">
                {{ h.resultStatus === 'SUCCESS' ? '✅ Success' : '❌ Failed' }}
              </span>
            </div>
            <div class="td">
              <span class="date-text">{{ formatDate(h.createdAt) }}</span>
            </div>
            <div class="td actions-td">
              <div class="kebab-menu">
                <button class="kebab-btn" (click)="toggleMenu($event, h.id)">⋮</button>
                <div class="dropdown-menu card" *ngIf="activeMenuId === h.id" (click)="$event.stopPropagation()">
                  <a [routerLink]="h.analysisType === 'SOIL' ? '/soil/' + h.referenceId : '/crop/' + h.referenceId"
                     class="dropdown-item">
                    <span>👁️</span> View Details
                  </a>
                  <button class="dropdown-item danger" (click)="deleteRecord(h.id)">
                    <span>🗑️</span> Delete Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <!-- EMPTY STATE -->
        <div class="empty-history card animate-fade-in" *ngIf="!loading && filteredHistory.length === 0">
          <div class="empty-icon">📭</div>
          <h3>No Records Found</h3>
          <p *ngIf="searchQuery">No results match "{{ searchQuery }}"</p>
          <p *ngIf="!searchQuery">You haven't done any analyses yet. Start with a soil or crop image!</p>
          <div class="empty-actions">
            <a routerLink="/soil" class="btn btn-primary">🪨 Analyze Soil</a>
            <a routerLink="/crop" class="btn btn-accent">🌿 Analyze Crop</a>
          </div>
        </div>
      </div>

      <!-- DELETE MODAL -->
      <div class="modal-overlay" *ngIf="showDeleteModal" (click)="cancelDelete()">
        <div class="modal-card card animate-fade-up" (click)="$event.stopPropagation()">
          <div class="modal-icon">⚠️</div>
          <h3>Confirm Deletion</h3>
          <p>Are you sure you want to permanently delete this analysis record? This action cannot be undone.</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cancelDelete()">Cancel</button>
            <button class="btn btn-danger" (click)="confirmDelete()" [disabled]="deleting">
              <span *ngIf="!deleting">Yes, Delete</span>
              <span *ngIf="deleting" class="spinner" style="width:16px;height:16px"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Filters */
    .filters-bar {
      display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
      margin-bottom: 20px; padding: 16px 20px;
    }
    .filter-group { display: flex; gap: 8px; }
    .filter-btn {
      padding: 8px 16px; border-radius: 100px;
      background: var(--bg-surface); border: 1px solid var(--border);
      color: var(--text-secondary); font-size: 0.88rem; font-weight: 500;
      cursor: pointer; transition: all 0.2s;
    }
    .filter-btn.active {
      background: var(--primary-glow); border-color: var(--primary);
      color: var(--primary-light);
    }
    .filter-btn:hover:not(.active) { border-color: var(--primary); color: var(--text-primary); }
    .search-group { flex: 1; min-width: 220px; }
    .search-input { padding: 9px 14px !important; }
    .count-badge {
      background: var(--bg-surface); border: 1px solid var(--border);
      padding: 6px 14px; border-radius: 100px;
      font-size: 0.82rem; color: var(--text-secondary); white-space: nowrap;
    }

    /* Table */
    .history-table { padding: 0; min-width: 800px; }
    .table-container { overflow-x: auto; border-radius: var(--radius-lg); border: 1px solid var(--border); }

    .table-header {
      display: grid; grid-template-columns: 100px 120px 120px 1fr 100px 120px 60px;
      padding: 14px 20px; background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
    }
    .th { font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .table-row {
      display: grid; grid-template-columns: 100px 120px 120px 1fr 100px 120px 60px;
      padding: 14px 20px; border-bottom: 1px solid var(--border);
      align-items: center; transition: background 0.2s;
    }
    .table-row:last-child { border-bottom: none; }
    .table-row:hover { background: var(--bg-hover); }
    .table-row.active-row { z-index: 1001; position: relative; } /* Elevate active row */
    .td { font-size: 0.88rem; display: flex; align-items: center; }

    @media (max-width: 900px) {
      .history-table { min-width: auto; }
      .table-header { display: none; }
      .table-row {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        padding: 20px;
      }
      .td { font-size: 0.95rem; }
      .td:nth-child(4) { grid-column: span 2; font-weight: 600; color: #fff; margin: 8px 0; } /* Summary */
      .actions-td { grid-column: 2; justify-content: flex-end; }
      .type-badge { order: -1; }
    }
    .actions-td { position: relative; display: flex; justify-content: center; align-items: center; }

    /* Kebab Menu */
    .kebab-btn {
      background: rgba(255,255,255,0.05); border: 1px solid var(--border); 
      color: var(--text-primary); font-size: 1.2rem; cursor: pointer; 
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; line-height: 1;
    }
    .kebab-btn:hover { background: var(--primary-glow); border-color: var(--primary); }

    .dropdown-menu {
      position: absolute; right: 20px; top: 10px; width: 190px;
      z-index: 10000; padding: 8px;
      background: #1a1d21;
      border: 1px solid rgba(255,255,255,0.12); 
      box-shadow: 0 20px 50px rgba(0,0,0,0.9);
      border-radius: 12px;
    }
    .dropdown-item {
      display: flex; align-items: center; gap: 12px; width: 100%;
      padding: 10px 14px; border-radius: 6px; font-size: 0.9rem;
      color: #e0e0e0; cursor: pointer; text-decoration: none;
      background: transparent; border: none; transition: all 0.2s;
      text-align: left;
    }
    .dropdown-item span { font-size: 1.1rem; filter: grayscale(0); }
    .dropdown-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
    .dropdown-item.danger { color: #ff5252; }
    .dropdown-item.danger:hover { background: rgba(255,82,82,0.15); color: #ff5252; }

    /* Modal */
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
      padding: 20px;
    }
    .modal-card {
      max-width: 400px; width: 100%; text-align: center; padding: 32px;
      border: 1px solid var(--border);
    }
    .modal-icon { font-size: 3rem; margin-bottom: 16px; }
    .modal-card h3 { margin-bottom: 12px; font-size: 1.3rem; }
    .modal-card p { color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px; }
    .modal-actions { display: flex; gap: 12px; justify-content: center; }

    .type-badge { padding: 4px 10px; border-radius: 100px; font-size: 0.8rem; font-weight: 600; }
    .type-soil { background: rgba(52,152,219,0.15); color: #3498db; border: 1px solid rgba(52,152,219,0.3); }
    .type-crop { background: rgba(39,174,96,0.15); color: #27ae60; border: 1px solid rgba(39,174,96,0.3); }

    .farmer-name { font-weight: 600; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .location { font-size: 0.82rem; color: var(--text-secondary); }
    .summary-td { overflow: hidden; }
    .summary-text { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-secondary); font-size: 0.84rem; }
    .date-text { font-size: 0.8rem; color: var(--text-muted); }

    /* Empty */
    .empty-history { text-align: center; padding: 64px 32px; }
    .empty-icon { font-size: 3.5rem; margin-bottom: 20px; }
    .empty-history h3 { font-size: 1.4rem; margin-bottom: 12px; }
    .empty-history p { color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 32px; }
    .empty-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

    @media (max-width: 1024px) {
      .table-header, .table-row { grid-template-columns: 90px 100px 100px 1fr 90px 90px 70px; }
    }
    @media (max-width: 768px) {
      .table-header { display: none; }
      .table-row { grid-template-columns: 1fr 1fr; gap: 8px; padding: 16px; }
      .filters-bar { flex-direction: column; align-items: stretch; }
    }
  `]
})
export class HistoryComponent implements OnInit {
  allHistory: HistoryResponse[] = [];
  filteredHistory: HistoryResponse[] = [];
  loading = true;
  activeFilter = 'ALL';
  searchQuery = '';
  
  activeMenuId: number | null = null;
  showDeleteModal = false;
  recordToDelete: number | null = null;
  deleting = false;

  constructor(private agriService: AgriService) {}

  ngOnInit() { this.loadHistory(); }

  loadHistory() {
    this.loading = true;
    this.agriService.getAllHistory().subscribe({
      next: (data) => { this.allHistory = data; this.applyFilters(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  filterByType(type: string) {
    this.activeFilter = type;
    this.applyFilters();
  }

  onSearch() { this.applyFilters(); }

  applyFilters() {
    let filtered = this.allHistory;
    if (this.activeFilter !== 'ALL') {
      filtered = filtered.filter(h => h.analysisType === this.activeFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(h =>
        h.farmerName?.toLowerCase().includes(q) ||
        h.location?.toLowerCase().includes(q) ||
        h.summary?.toLowerCase().includes(q)
      );
    }
    this.filteredHistory = filtered;
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  }

  toggleMenu(event: Event, id?: number) {
    event.stopPropagation();
    if (id === undefined) return;
    
    // If clicking the same menu, toggle it. If clicking a different one, open it.
    if (this.activeMenuId === id) {
      this.activeMenuId = null;
    } else {
      this.activeMenuId = id;
    }
  }

  // Close the menu automatically when the user scrolls the page
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.activeMenuId = null;
  }

  // Close menu when clicking anywhere else
  @HostListener('document:click')
  onDocumentClick() {
    this.activeMenuId = null;
  }

  deleteRecord(id?: number) {
    if (!id) return;
    this.activeMenuId = null;
    this.recordToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.recordToDelete = null;
  }

  confirmDelete() {
    if (!this.recordToDelete) return;
    this.deleting = true;

    this.agriService.deleteHistory(this.recordToDelete).subscribe({
      next: () => {
        this.allHistory = this.allHistory.filter(h => h.id !== this.recordToDelete);
        this.applyFilters();
        this.deleting = false;
        this.cancelDelete();
      },
      error: () => {
        alert('Failed to delete record. Please try again.');
        this.deleting = false;
      }
    });
  }
}
