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
} from '../dto/intake.dto';

export abstract class IntakeRepository {
  abstract start(command: StartIntakeCommand): Promise<StartIntakeResult>;
  abstract confirmAntecedents(
    command: ConfirmAntecedentsCommand
  ): Promise<ConfirmAntecedentsResult>;
  abstract requestAllergySuggestions(
    command: RequestAllergySuggestionsCommand
  ): Promise<AllergySuggestionResult>;
  abstract confirmAllergies(command: ConfirmAllergiesCommand): Promise<ConfirmAllergiesResult>;
  abstract requestDrugSuggestions(
    command: RequestDrugSuggestionsCommand
  ): Promise<DrugSuggestionResult>;
  abstract confirmDrugs(command: ConfirmDrugsCommand): Promise<ConfirmDrugsResult>;
  abstract saveSymptomOnset(command: SaveQuestionsCommand): Promise<QuestionStepResult>;
  abstract saveEvaluation(command: SaveQuestionsCommand): Promise<QuestionStepResult>;
  abstract saveLocation(command: SaveQuestionsCommand): Promise<QuestionStepResult>;
  abstract saveCharacteristics(command: SaveQuestionsCommand): Promise<QuestionStepResult>;
  abstract saveAssociated(command: SaveQuestionsCommand): Promise<QuestionStepResult>;
  abstract savePrecipitating(command: SaveQuestionsCommand): Promise<QuestionStepResult>;
  abstract saveRecentExposures(command: SaveQuestionsCommand): Promise<QuestionStepResult>;
  abstract saveFunctionalImpact(command: SaveQuestionsCommand): Promise<QuestionStepResult>;
  abstract savePriorTherapies(command: SaveQuestionsCommand): Promise<QuestionStepResult>;
  abstract saveRedFlags(command: SaveQuestionsCommand): Promise<RedFlagsStepResult>;
}
