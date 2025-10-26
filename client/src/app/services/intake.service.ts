import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';
import {
  AllergySuggestionResponse,
  DrugSuggestionResponse,
  SaveAllergiesResponse,
  SaveAntecedentsResponse,
  SaveDrugsResponse,
  SaveLocationResponse,
  SaveEvaluationResponse,
  SaveCharacteristicsResponse,
  SaveAssociatedResponse,
  SavePrecipitatingResponse,
  SaveRecentExposuresResponse,
  StartResponse,
} from '../models/intake.models';

@Injectable({ providedIn: 'root' })
export class IntakeService {
  constructor(private readonly http: HttpClient) {}

  start(payload: unknown): Observable<StartResponse> {
    return this.http.post<StartResponse>(`${API_BASE_URL}/start`, payload);
  }

  saveAntecedents(payload: unknown): Observable<SaveAntecedentsResponse> {
    return this.http.post<SaveAntecedentsResponse>(`${API_BASE_URL}/antecedents`, payload);
  }

  suggestAllergies(payload: unknown): Observable<AllergySuggestionResponse> {
    return this.http.post<AllergySuggestionResponse>(`${API_BASE_URL}/allergies/suggest`, payload);
  }

  saveAllergies(payload: unknown): Observable<SaveAllergiesResponse> {
    return this.http.post<SaveAllergiesResponse>(`${API_BASE_URL}/allergies`, payload);
  }

  suggestDrugs(payload: unknown): Observable<DrugSuggestionResponse> {
    return this.http.post<DrugSuggestionResponse>(`${API_BASE_URL}/drugs/suggest`, payload);
  }

  saveDrugs(payload: unknown): Observable<SaveDrugsResponse> {
    return this.http.post<SaveDrugsResponse>(`${API_BASE_URL}/drugs`, payload);
  }

  saveSymptomOnset(payload: unknown): Observable<import('../models/intake.models').SaveSymptomOnsetResponse> {
    return this.http.post<import('../models/intake.models').SaveSymptomOnsetResponse>(`${API_BASE_URL}/symptom-onset`, payload);
  }

  saveEvaluation(payload: unknown): Observable<SaveEvaluationResponse> {
    return this.http.post<SaveEvaluationResponse>(`${API_BASE_URL}/evaluation`, payload);
  }

  saveLocation(payload: unknown): Observable<SaveLocationResponse> {
    return this.http.post<SaveLocationResponse>(`${API_BASE_URL}/location`, payload);
  }

  saveCharacteristics(payload: unknown): Observable<SaveCharacteristicsResponse> {
    return this.http.post<SaveCharacteristicsResponse>(`${API_BASE_URL}/characteristics`, payload);
  }

  saveAssociated(payload: unknown): Observable<SaveAssociatedResponse> {
    return this.http.post<SaveAssociatedResponse>(`${API_BASE_URL}/associated`, payload);
  }

  savePrecipitating(payload: unknown): Observable<SavePrecipitatingResponse> {
    return this.http.post<SavePrecipitatingResponse>(`${API_BASE_URL}/precipitating`, payload);
  }

  saveRecentExposures(payload: unknown): Observable<SaveRecentExposuresResponse> {
    return this.http.post<SaveRecentExposuresResponse>(`${API_BASE_URL}/recent-exposures`, payload);
  }
}
