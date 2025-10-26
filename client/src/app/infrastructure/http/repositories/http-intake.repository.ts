import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  AllergySuggestionResult,
  ConfirmAllergiesCommand,
  ConfirmAllergiesResult,
  ConfirmAntecedentsCommand,
  ConfirmAntecedentsResult,
  ConfirmDrugsCommand,
  ConfirmDrugsResult,
  DrugSuggestionResult,
  QuestionStepResult,
  RedFlagsStepResult,
  RequestAllergySuggestionsCommand,
  RequestDrugSuggestionsCommand,
  SaveQuestionsCommand,
  StartIntakeCommand,
  StartIntakeResult
} from '../../../application/dto/intake.dto';
import { IntakeRepository } from '../../../application/ports/intake.repository';
import { API_BASE_URL } from '../../../config';
import {
  mapAllergySuggestionResponse,
  mapAssociatedResponse,
  mapCharacteristicsResponse,
  mapDrugSuggestionResponse,
  mapEvaluationResponse,
  mapFunctionalImpactResponse,
  mapLocationResponse,
  mapPrecipitatingResponse,
  mapPriorTherapiesResponse,
  mapRecentExposuresResponse,
  mapRedFlagsResponse,
  mapSaveAllergiesResponse,
  mapSaveAntecedentsResponse,
  mapSaveDrugsResponse,
  mapStartResponse,
  mapSymptomOnsetResponse
} from '../mappers/intake.mapper';
import {
  AllergySuggestionResponse,
  DrugSuggestionResponse,
  SaveAllergiesResponse,
  SaveAntecedentsResponse,
  SaveAssociatedResponse,
  SaveCharacteristicsResponse,
  SaveDrugsResponse,
  SaveEvaluationResponse,
  SaveFunctionalImpactResponse,
  SaveLocationResponse,
  SavePrecipitatingResponse,
  SavePriorTherapiesResponse,
  SaveRecentExposuresResponse,
  SaveRedFlagsResponse,
  SaveSymptomOnsetResponse,
  StartResponse
} from '../../../models/intake.models';

const endpoint = (path: string): string => `${API_BASE_URL}${path}`;

@Injectable({ providedIn: 'root' })
export class HttpIntakeRepository extends IntakeRepository {
  constructor(private readonly http: HttpClient) {
    super();
  }

  async start(command: StartIntakeCommand): Promise<StartIntakeResult> {
    const payload = {
      age: command.age,
      gender: command.gender,
      chiefComplaint: command.chiefComplaint,
      selectedAntecedents: command.selectedAntecedents ? [...command.selectedAntecedents] : [],
      ...(command.excludeAntecedents?.length
        ? { excludeAntecedents: [...command.excludeAntecedents] }
        : {})
    };
    const response = await this.post<StartResponse>('/start', payload);
    return mapStartResponse(response);
  }

  async confirmAntecedents(
    command: ConfirmAntecedentsCommand
  ): Promise<ConfirmAntecedentsResult> {
    const payload = {
      age: command.age,
      gender: command.gender,
      chiefComplaint: command.chiefComplaint,
      selectedAntecedents: [...command.selectedAntecedents]
    };
    const response = await this.post<SaveAntecedentsResponse>('/antecedents', payload);
    return mapSaveAntecedentsResponse(response);
  }

  async requestAllergySuggestions(
    command: RequestAllergySuggestionsCommand
  ): Promise<AllergySuggestionResult> {
    const payload = {
      age: command.age,
      gender: command.gender,
      chiefComplaint: command.chiefComplaint,
      selectedAntecedents: [...command.selectedAntecedents],
      selectedAllergies: [...command.selectedAllergies],
      excludeAllergies: [...command.excludeAllergies]
    };
    const response = await this.post<AllergySuggestionResponse>(
      '/allergies/suggest',
      payload
    );
    return mapAllergySuggestionResponse(response);
  }

  async confirmAllergies(
    command: ConfirmAllergiesCommand
  ): Promise<ConfirmAllergiesResult> {
    const payload = {
      age: command.age,
      gender: command.gender,
      chiefComplaint: command.chiefComplaint,
      selectedAntecedents: [...command.selectedAntecedents],
      selectedAllergies: [...command.selectedAllergies]
    };
    const response = await this.post<SaveAllergiesResponse>('/allergies', payload);
    return mapSaveAllergiesResponse(response);
  }

  async requestDrugSuggestions(
    command: RequestDrugSuggestionsCommand
  ): Promise<DrugSuggestionResult> {
    const payload = {
      age: command.age,
      gender: command.gender,
      chiefComplaint: command.chiefComplaint,
      selectedAntecedents: [...command.selectedAntecedents],
      selectedAllergies: [...command.selectedAllergies],
      selectedDrugs: [...command.selectedDrugs],
      excludeDrugs: [...command.excludeDrugs]
    };
    const response = await this.post<DrugSuggestionResponse>('/drugs/suggest', payload);
    return mapDrugSuggestionResponse(response);
  }

  async confirmDrugs(command: ConfirmDrugsCommand): Promise<ConfirmDrugsResult> {
    const payload = {
      age: command.age,
      gender: command.gender,
      chiefComplaint: command.chiefComplaint,
      selectedAntecedents: [...command.selectedAntecedents],
      selectedAllergies: [...command.selectedAllergies],
      selectedDrugs: [...command.selectedDrugs]
    };
    const response = await this.post<SaveDrugsResponse>('/drugs', payload);
    return mapSaveDrugsResponse(response);
  }

  async saveSymptomOnset(command: SaveQuestionsCommand): Promise<QuestionStepResult> {
    const response = await this.post<SaveSymptomOnsetResponse>(
      '/symptom-onset',
      this.buildAnswerPayload(command)
    );
    return mapSymptomOnsetResponse(response);
  }

  async saveEvaluation(command: SaveQuestionsCommand): Promise<QuestionStepResult> {
    const response = await this.post<SaveEvaluationResponse>(
      '/evaluation',
      this.buildAnswerPayload(command)
    );
    return mapEvaluationResponse(response);
  }

  async saveLocation(command: SaveQuestionsCommand): Promise<QuestionStepResult> {
    const response = await this.post<SaveLocationResponse>(
      '/location',
      this.buildAnswerPayload(command)
    );
    return mapLocationResponse(response);
  }

  async saveCharacteristics(command: SaveQuestionsCommand): Promise<QuestionStepResult> {
    const response = await this.post<SaveCharacteristicsResponse>(
      '/characteristics',
      this.buildAnswerPayload(command)
    );
    return mapCharacteristicsResponse(response);
  }

  async saveAssociated(command: SaveQuestionsCommand): Promise<QuestionStepResult> {
    const response = await this.post<SaveAssociatedResponse>(
      '/associated',
      this.buildAnswerPayload(command)
    );
    return mapAssociatedResponse(response);
  }

  async savePrecipitating(command: SaveQuestionsCommand): Promise<QuestionStepResult> {
    const response = await this.post<SavePrecipitatingResponse>(
      '/precipitating',
      this.buildAnswerPayload(command)
    );
    return mapPrecipitatingResponse(response);
  }

  async saveRecentExposures(command: SaveQuestionsCommand): Promise<QuestionStepResult> {
    const response = await this.post<SaveRecentExposuresResponse>(
      '/recent-exposures',
      this.buildAnswerPayload(command)
    );
    return mapRecentExposuresResponse(response);
  }

  async saveFunctionalImpact(command: SaveQuestionsCommand): Promise<QuestionStepResult> {
    const response = await this.post<SaveFunctionalImpactResponse>(
      '/functional-impact',
      this.buildAnswerPayload(command)
    );
    return mapFunctionalImpactResponse(response);
  }

  async savePriorTherapies(command: SaveQuestionsCommand): Promise<QuestionStepResult> {
    const response = await this.post<SavePriorTherapiesResponse>(
      '/prior-therapies',
      this.buildAnswerPayload(command)
    );
    return mapPriorTherapiesResponse(response);
  }

  async saveRedFlags(command: SaveQuestionsCommand): Promise<RedFlagsStepResult> {
    const response = await this.post<SaveRedFlagsResponse>(
      '/red-flags',
      this.buildAnswerPayload(command)
    );
    return mapRedFlagsResponse(response);
  }

  private buildAnswerPayload(command: SaveQuestionsCommand): Record<string, unknown> {
    return {
      age: command.age,
      gender: command.gender,
      chiefComplaint: command.chiefComplaint,
      answers: command.answers.map((answer) => ({
        id: answer.id,
        answer: answer.answer
      }))
    };
  }

  private post<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.post<T>(endpoint(path), body));
  }
}
