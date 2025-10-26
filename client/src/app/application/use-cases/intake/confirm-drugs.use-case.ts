import { IntakeRepository } from '../../ports/intake.repository';
import { ConfirmDrugsCommand, ConfirmDrugsResult } from '../../dto/intake.dto';
import { UseCase } from '../use-case';

export class ConfirmDrugsUseCase
  implements UseCase<ConfirmDrugsCommand, ConfirmDrugsResult>
{
  constructor(private readonly repository: IntakeRepository) {}

  execute(command: ConfirmDrugsCommand): Promise<ConfirmDrugsResult> {
    return this.repository.confirmDrugs(command);
  }
}
