import { IntakeRepository } from '../../ports/intake.repository';
import { QuestionStepResult, RedFlagsStepResult, SaveQuestionsCommand } from '../../dto/intake.dto';
import { UseCase } from '../use-case';

type QuestionSectionExecutor<T extends QuestionStepResult> = (
  command: SaveQuestionsCommand
) => Promise<T>;

export class QuestionSectionUseCase<T extends QuestionStepResult>
  implements UseCase<SaveQuestionsCommand, T>
{
  private readonly executor: QuestionSectionExecutor<T>;

  constructor(executor: QuestionSectionExecutor<T>) {
    this.executor = executor;
  }

  execute(command: SaveQuestionsCommand): Promise<T> {
    return this.executor(command);
  }
}

export class SaveSymptomOnsetUseCase extends QuestionSectionUseCase<QuestionStepResult> {
  constructor(repository: IntakeRepository) {
    super((command) => repository.saveSymptomOnset(command));
  }
}

export class SaveEvaluationUseCase extends QuestionSectionUseCase<QuestionStepResult> {
  constructor(repository: IntakeRepository) {
    super((command) => repository.saveEvaluation(command));
  }
}

export class SaveLocationUseCase extends QuestionSectionUseCase<QuestionStepResult> {
  constructor(repository: IntakeRepository) {
    super((command) => repository.saveLocation(command));
  }
}

export class SaveCharacteristicsUseCase extends QuestionSectionUseCase<QuestionStepResult> {
  constructor(repository: IntakeRepository) {
    super((command) => repository.saveCharacteristics(command));
  }
}

export class SaveAssociatedUseCase extends QuestionSectionUseCase<QuestionStepResult> {
  constructor(repository: IntakeRepository) {
    super((command) => repository.saveAssociated(command));
  }
}

export class SavePrecipitatingUseCase extends QuestionSectionUseCase<QuestionStepResult> {
  constructor(repository: IntakeRepository) {
    super((command) => repository.savePrecipitating(command));
  }
}

export class SaveRecentExposuresUseCase extends QuestionSectionUseCase<QuestionStepResult> {
  constructor(repository: IntakeRepository) {
    super((command) => repository.saveRecentExposures(command));
  }
}

export class SaveFunctionalImpactUseCase extends QuestionSectionUseCase<QuestionStepResult> {
  constructor(repository: IntakeRepository) {
    super((command) => repository.saveFunctionalImpact(command));
  }
}

export class SavePriorTherapiesUseCase extends QuestionSectionUseCase<QuestionStepResult> {
  constructor(repository: IntakeRepository) {
    super((command) => repository.savePriorTherapies(command));
  }
}

export class SaveRedFlagsUseCase extends QuestionSectionUseCase<RedFlagsStepResult> {
  constructor(repository: IntakeRepository) {
    super((command) => repository.saveRedFlags(command));
  }
}
