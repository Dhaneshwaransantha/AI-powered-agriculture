import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SoilAnalysisResponse,
  CropAnalysisResponse,
  HistoryResponse,
  DashboardStats
} from '../models/analysis.model';

@Injectable({ providedIn: 'root' })
export class AgriService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ── Soil ──────────────────────────────────────────────────────────
  analyzeSoil(
    image: File,
    farmerName: string,
    location: string,
    language: string
  ): Observable<SoilAnalysisResponse> {
    const form = new FormData();
    form.append('image', image);
    const params = new HttpParams()
      .set('farmerName', farmerName)
      .set('location', location)
      .set('language', language);
    return this.http.post<SoilAnalysisResponse>(`${this.baseUrl}/soil/analyze`, form, { params });
  }

  getSoilAnalysis(id: number): Observable<SoilAnalysisResponse> {
    return this.http.get<SoilAnalysisResponse>(`${this.baseUrl}/soil/${id}`);
  }

  getAllSoilAnalyses(): Observable<SoilAnalysisResponse[]> {
    return this.http.get<SoilAnalysisResponse[]>(`${this.baseUrl}/soil/all`);
  }

  // ── Crop ──────────────────────────────────────────────────────────
  analyzeCrop(
    image: File,
    farmerName: string,
    location: string,
    language: string
  ): Observable<CropAnalysisResponse> {
    const form = new FormData();
    form.append('image', image);
    const params = new HttpParams()
      .set('farmerName', farmerName)
      .set('location', location)
      .set('language', language);
    return this.http.post<CropAnalysisResponse>(`${this.baseUrl}/crop/analyze`, form, { params });
  }

  getCropAnalysis(id: number): Observable<CropAnalysisResponse> {
    return this.http.get<CropAnalysisResponse>(`${this.baseUrl}/crop/${id}`);
  }

  getAllCropAnalyses(): Observable<CropAnalysisResponse[]> {
    return this.http.get<CropAnalysisResponse[]>(`${this.baseUrl}/crop/all`);
  }

  getSoilById(id: number): Observable<SoilAnalysisResponse> {
    return this.http.get<SoilAnalysisResponse>(`${this.baseUrl}/soil/${id}`);
  }

  getCropById(id: number): Observable<CropAnalysisResponse> {
    return this.http.get<CropAnalysisResponse>(`${this.baseUrl}/crop/${id}`);
  }

  // ── History & Stats ───────────────────────────────────────────────
  getAllHistory(): Observable<HistoryResponse[]> {
    return this.http.get<HistoryResponse[]>(`${this.baseUrl}/history/all`);
  }

  getHistoryByType(type: string): Observable<HistoryResponse[]> {
    return this.http.get<HistoryResponse[]>(`${this.baseUrl}/history/type/${type}`);
  }

  getHistoryByFarmer(name: string): Observable<HistoryResponse[]> {
    return this.http.get<HistoryResponse[]>(`${this.baseUrl}/history/farmer`, {
      params: new HttpParams().set('name', name)
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/history/stats`);
  }

  deleteHistory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/history/${id}`);
  }
}
