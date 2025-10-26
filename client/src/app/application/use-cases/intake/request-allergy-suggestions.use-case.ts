import { IntakeRepository } from '../../ports/intake.repository';
import {
  AllergySuggestionResult,
  RequestAllergySuggestionsCommand
} from '../../dto/intake.dto';
import { UseCase } from '../use-case';

export class RequestAllergySuggestionsUseCase
  implements UseCase<RequestAllergySuggestionsCommand, AllergySuggestionResult>
{
  constructor(private readonly repository: IntakeRepository) {}

  execute(command: RequestAllergySuggestionsCommand): Promise<AllergySuggestionResult> {
    return this.repository.requestAllergySuggestions(command);
  }
}
