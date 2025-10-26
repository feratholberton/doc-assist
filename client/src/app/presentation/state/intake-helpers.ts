import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { Gender, IntakeQuestion } from '../../domain/models/intake';
import { QuestionStepResult, SaveQuestionsCommand } from '../../application/dto/intake.dto';
import { extractErrorMessage } from '../../utils/app-helpers';
import { FormGroup } from '@angular/forms';

export interface SelectionState {
  readonly selected: WritableSignal<Set<string>>;
  readonly custom: WritableSignal<Set<string>>;
  readonly customText: WritableSignal<string>;
  readonly selectedList: Signal<string[]>;
  readonly customList: Signal<string[]>;
}

export const createSelectionState = (): SelectionState => {
  const selected = signal(new Set<string>());
  const custom = signal(new Set<string>());
  const customText = signal('');
  const selectedList = computed(() => Array.from(selected()));
  const customList = computed(() => Array.from(custom()));

  return {
    selected,
    custom,
    customText,
    selectedList,
    customList,
  };
};

export class SelectionGroup {
  readonly options = signal<string[]>([]);
  readonly seen = signal<Set<string>>(new Set());
  readonly additionalFetches = signal(0);
  readonly selection = createSelectionState();

  readonly selected = this.selection.selected;
  readonly custom = this.selection.custom;
  readonly customText = this.selection.customText;
  readonly selectedList = this.selection.selectedList;
  readonly customList = this.selection.customList;

  readonly canRequestMore = computed(
    () => this.additionalFetches() < 2 && this.options().length < 24,
  );

  readonly isFetching = signal(false);
  readonly isSaving = signal(false);
  readonly saveMessage = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);

  constructor() {}

  addCustomValue(): void {
    const value = this.customText().trim();
    if (!value || this.selected().has(value)) {
      if (this.selected().has(value)) this.customText.set('');
      return;
    }

    this.custom.update(current => new Set(current).add(value));
    this.selected.update(current => new Set(current).add(value));
    this.customText.set('');
    this.clearMessages();
  }

  removeCustomValue(value: string): void {
    this.custom.update(current => {
      const s = new Set(current);
      s.delete(value);
      return s;
    });
    this.selected.update(current => {
      const s = new Set(current);
      s.delete(value);
      return s;
    });
    this.clearMessages();
  }

  toggleSelection(option: string, checked: boolean): void {
    this.selected.update(current => {
      const s = new Set(current);
      if (checked) {
        s.add(option);
      } else {
        s.delete(option);
      }
      return s;
    });
    this.clearMessages();
  }

  syncSelection(
    suggestions: ReadonlyArray<string>,
    persistedSelection: ReadonlyArray<string>,
    options: { resetCustomText?: boolean } = {},
  ): void {
    const { resetCustomText = true } = options;
    const uniqueSuggestions = Array.from(new Set(suggestions));
    this.options.set(uniqueSuggestions);
    this.seen.set(new Set(uniqueSuggestions));
    this.selected.set(new Set(persistedSelection));
    const customItems = persistedSelection.filter(item => !uniqueSuggestions.includes(item));
    this.custom.set(new Set(customItems));
    if (resetCustomText) {
      this.customText.set('');
    }
  }

  reset(): void {
    this.options.set([]);
    this.selected.set(new Set());
    this.seen.set(new Set());
    this.custom.set(new Set());
    this.customText.set('');
    this.additionalFetches.set(0);
    this.isFetching.set(false);
    this.isSaving.set(false);
    this.clearMessages();
  }

  clearMessages(): void {
    this.saveMessage.set(null);
    this.saveError.set(null);
  }

  async requestMoreOptions<TResponse>(
    fetchFn: () => Promise<TResponse>,
    extractSuggestions: (response: TResponse) => ReadonlyArray<string> | string[],
    extractRecord: (response: TResponse) => { suggested: ReadonlyArray<string> | string[]; selected: ReadonlyArray<string> | string[] },
    extractMessage?: (response: TResponse) => string | null | undefined,
  ): Promise<void> {
    if (this.isFetching() || !this.canRequestMore()) {
      return;
    }

    this.additionalFetches.update(v => v + 1);
    this.isFetching.set(true);
    this.clearMessages();

    try {
      const response = await fetchFn();
      const newSuggestions = extractSuggestions(response);

      if (newSuggestions.length > 0) {
        this.options.update(current => {
          const merged = [...current, ...newSuggestions.filter(item => !current.includes(item))];
          return merged.slice(0, 24);
        });

        this.seen.update(current => {
          const updated = new Set(current);
          newSuggestions.forEach(item => updated.add(item));
          return updated;
        });

        const message = extractMessage?.(response);
        if (message) {
          this.saveMessage.set(message);
        }
      } else {
        const message = extractMessage?.(response);
        if (message) {
          this.saveMessage.set(message);
        }
      }

      const record = extractRecord(response);
      this.syncSelection(record.suggested, record.selected, { resetCustomText: false });
    } catch (error) {
      this.additionalFetches.update(v => v - 1);
      const message = extractErrorMessage(error);
      this.saveError.set(message);
    } finally {
      this.isFetching.set(false);
    }
  }

  async saveConfirmation<TResponse>(
    saveFn: (selections: string[]) => Promise<TResponse>,
    extractRecord: (response: TResponse) => { suggested: ReadonlyArray<string> | string[]; selected: ReadonlyArray<string> | string[] },
    extractMessage: (response: TResponse) => string,
    options: {
      emptyError: string;
      onSuccess?: (response: TResponse) => void;
    },
  ): Promise<void> {
    const combinedSelections = new Set([...this.selected(), ...this.custom()]);

    if (combinedSelections.size === 0) {
      this.saveError.set(options.emptyError);
      this.saveMessage.set(null);
      return;
    }

    this.isSaving.set(true);
    this.clearMessages();

    try {
      const response = await saveFn(Array.from(combinedSelections));
      const record = extractRecord(response);
      this.syncSelection(record.suggested, record.selected);
      const message = extractMessage(response);
      this.saveMessage.set(message);
      options.onSuccess?.(response);
    } catch (error) {
      const message = extractErrorMessage(error);
      this.saveError.set(message);
    } finally {
      this.isSaving.set(false);
    }
  }
}

export class QuestionSection<T extends QuestionStepResult> {
  readonly questions = signal<IntakeQuestion[]>([]);
  readonly isSaving = signal(false);
  readonly saveMessage = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);

  constructor(
    private useCase: { execute(command: SaveQuestionsCommand): Promise<T> },
    private intakeState: { form: FormGroup; nextSection?: WritableSignal<IntakeQuestion[]> },
    private onSuccess?: (result: T) => void,
  ) {}

  updateAnswer(id: string, value: string): void {
    this.questions.update(current =>
      current.map(q => (q.id === id ? { ...q, answer: value } : q)),
    );
  }

  async save(nextSection?: WritableSignal<IntakeQuestion[]>): Promise<void> {
    const answers = this.questions().map(q => ({ id: q.id, answer: q.answer ?? '' }));
    if (answers.length === 0) {
      this.saveError.set('No hay preguntas para guardar.');
      this.saveMessage.set(null);
      return;
    }

    this.isSaving.set(true);
    this.saveMessage.set(null);
    this.saveError.set(null);

    const payload: SaveQuestionsCommand = {
      ...this.intakeState.form.getRawValue(),
      answers,
    };

    try {
      const result = await this.useCase.execute(payload);
      this.questions.update(current =>
        result.currentQuestions.map(q => ({
          ...q,
          answer: current.find(c => c.id === q.id)?.answer ?? q.answer ?? '',
        })),
      );

      if (nextSection && result.nextQuestions) {
        nextSection.set(result.nextQuestions.map(q => ({ ...q, answer: '' })));
      }

      if (this.onSuccess) {
        this.onSuccess(result);
      }
      this.saveMessage.set(result.message);
    } catch (error) {
      this.saveError.set(extractErrorMessage(error));
    } finally {
      this.isSaving.set(false);
    }
  }

  reset(): void {
    this.questions.set([]);
    this.isSaving.set(false);
    this.saveMessage.set(null);
    this.saveError.set(null);
  }
}
