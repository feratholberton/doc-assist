// Helper utilities extracted from App component

/**
 * Attempt to extract a list of antecedents (strings) from a free-form answer.
 */
export function extractAntecedents(answer: string): string[] {
  const attemptParse = (value: string): string[] => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        return parsed;
      }
    } catch {
      // Ignore parse errors and fall back to next strategy.
    }
    return [];
  };

  const trimmedAnswer = answer.trim();

  let antecedents = attemptParse(trimmedAnswer);
  if (antecedents.length > 0) {
    return antecedents;
  }

  const fencedMatch = trimmedAnswer.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    antecedents = attemptParse(fencedMatch[1].trim());
    if (antecedents.length > 0) {
      return antecedents;
    }
  }

  const startIndex = trimmedAnswer.indexOf('[');
  const endIndex = trimmedAnswer.lastIndexOf(']');
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const bracketContent = trimmedAnswer.slice(startIndex, endIndex + 1);
    antecedents = attemptParse(bracketContent);
    if (antecedents.length > 0) {
      return antecedents;
    }
  }

  return [];
}

/**
 * Extracts a human-readable error message from a typical HttpErrorResponse-like shape.
 */
export function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'error' in error) {
    const serverError = (error as { error?: unknown }).error;
    if (serverError && typeof serverError === 'object') {
      if ('message' in serverError && typeof (serverError as { message?: unknown }).message === 'string') {
        return (serverError as { message: string }).message;
      }
      if ('error' in serverError && typeof (serverError as { error?: unknown }).error === 'string') {
        return (serverError as { error: string }).error;
      }
    }
  }

  return 'Unable to submit the intake information. Please try again.';
}
