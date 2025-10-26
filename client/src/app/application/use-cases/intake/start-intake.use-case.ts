import { IntakeRepository } from '../../ports/intake.repository';
import { StartIntakeCommand, StartIntakeResult } from '../../dto/intake.dto';
import { UseCase } from '../use-case';

export class StartIntakeUseCase implements UseCase<StartIntakeCommand, StartIntakeResult> {
  constructor(private readonly repository: IntakeRepository) {}

  execute(command: StartIntakeCommand): Promise<StartIntakeResult> {
    return this.repository.start(command);
  }
}
