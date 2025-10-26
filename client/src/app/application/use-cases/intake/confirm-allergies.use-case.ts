import { IntakeRepository } from '../../ports/intake.repository';
import { ConfirmAllergiesCommand, ConfirmAllergiesResult } from '../../dto/intake.dto';
import { UseCase } from '../use-case';

export class ConfirmAllergiesUseCase
  implements UseCase<ConfirmAllergiesCommand, ConfirmAllergiesResult>
{
  constructor(private readonly repository: IntakeRepository) {}

  execute(command: ConfirmAllergiesCommand): Promise<ConfirmAllergiesResult> {
    return this.repository.confirmAllergies(command);
  }
}
