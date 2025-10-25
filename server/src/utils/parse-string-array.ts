export const parseStringArrayFromModelAnswer = (answer: string): string[] => {
  const attemptParse = (value: string): string[] => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        return parsed;
      }
    } catch {
      // Ignore parse errors; fall through to other strategies.
    }
    return [];
  };

  const trimmed = answer.trim();

  let values = attemptParse(trimmed);
  if (values.length > 0) {
    return values;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    values = attemptParse(fencedMatch[1].trim());
    if (values.length > 0) {
      return values;
    }
  }

  const startIndex = trimmed.indexOf('[');
  const endIndex = trimmed.lastIndexOf(']');
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    values = attemptParse(trimmed.slice(startIndex, endIndex + 1));
    if (values.length > 0) {
      return values;
    }
  }

  return [];
};
