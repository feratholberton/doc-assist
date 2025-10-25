export type PatientGender = 'Male' | 'Female';

export interface PatientIntakeRecord {
  age: number;
  gender: PatientGender;
  chiefComplaint: string;
  selectedAntecedents: string[];
  updatedAt: string;
}

const patientIntakeStore = new Map<string, PatientIntakeRecord>();

export const buildPatientKey = (age: number, gender: PatientGender, chiefComplaint: string): string =>
  `${age}|${gender}|${chiefComplaint.trim()}`;

export const normalizeChiefComplaint = (chiefComplaint: string): string => chiefComplaint.trim();

export const normalizeAntecedents = (antecedents: string[] | undefined): string[] =>
  Array.from(
    new Set(
      (antecedents ?? [])
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    )
  );

export const getPatientIntake = (key: string): PatientIntakeRecord | undefined => patientIntakeStore.get(key);

export const upsertPatientIntake = (record: Omit<PatientIntakeRecord, 'updatedAt'>): PatientIntakeRecord => {
  const updatedRecord: PatientIntakeRecord = {
    ...record,
    updatedAt: new Date().toISOString()
  };

  const key = buildPatientKey(record.age, record.gender, record.chiefComplaint);
  patientIntakeStore.set(key, updatedRecord);
  return updatedRecord;
};

export const listPatientIntakes = (): PatientIntakeRecord[] => Array.from(patientIntakeStore.values());
