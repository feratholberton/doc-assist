import { IntakeRepository } from '../../ports/intake.repository';
import { DrugSuggestionResult, RequestDrugSuggestionsCommand } from '../../dto/intake.dto';
import { UseCase } from '../use-case';

export class RequestDrugSuggestionsUseCase
  implements UseCase<RequestDrugSuggestionsCommand, DrugSuggestionResult>
{
  constructor(private readonly repository: IntakeRepository) {}

  execute(command: RequestDrugSuggestionsCommand): Promise<DrugSuggestionResult> {
    return this.repository.requestDrugSuggestions(command);
  }
}
