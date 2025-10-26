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
}
