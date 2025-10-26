import { IntakeRepository } from '../../ports/intake.repository';
import { ConfirmAntecedentsCommand, ConfirmAntecedentsResult } from '../../dto/intake.dto';
import { UseCase } from '../use-case';

export class ConfirmAntecedentsUseCase
  implements UseCase<ConfirmAntecedentsCommand, ConfirmAntecedentsResult>
{
  constructor(private readonly repository: IntakeRepository) {}

  execute(command: ConfirmAntecedentsCommand): Promise<ConfirmAntecedentsResult> {
    return this.repository.confirmAntecedents(command);
  }
}
