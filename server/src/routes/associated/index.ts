import { FastifyPluginAsync } from 'fastify'
import {
  PatientIntakeRecord,
  SymptomOnsetQuestion,
  buildPatientKey,
  getPatientIntake,
  normalizeChiefComplaint,
  upsertPatientIntake
} from '../../stores/patient-intake-store.js'

interface SaveAssociatedRequestBody {
  age: number;
  gender: 'Male' | 'Female';
  chiefComplaint: string;
  answers: Array<{ id: string; answer: string }>;
}

interface SaveAssociatedResponseBody {
  message: string;
  record: PatientIntakeRecord;
  associatedSymptomsQuestions: SymptomOnsetQuestion[];
}

const associatedRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: SaveAssociatedRequestBody; Reply: SaveAssociatedResponseBody }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['age', 'gender', 'chiefComplaint', 'answers'],
          properties: {
            age: { type: 'integer', minimum: 0, maximum: 140 },
            gender: { type: 'string', enum: ['Male', 'Female'] },
            chiefComplaint: { type: 'string', minLength: 1 },
            answers: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'answer'],
                properties: {
                  id: { type: 'string', minLength: 1 },
                  answer: { type: 'string' }
                }
              },
              maxItems: 32
            }
          }
        },
        response: {
          200: {
            type: 'object',
            required: ['message', 'record', 'associatedSymptomsQuestions'],
            properties: {
              message: { type: 'string' },
              record: {
                type: 'object',
                required: [
                  'age',
                  'gender',
                  'chiefComplaint',
                  'selectedAntecedents',
                  'selectedAllergies',
                  'selectedDrugs',
                  'suggestedAllergies',
                  'suggestedDrugs',
                  'symptomOnsetQuestions',
                  'evaluationQuestions',
                  'locationQuestions',
                  'characteristicsQuestions',
                  'associatedSymptomsQuestions',
                  'updatedAt'
                ],
                properties: {
                  age: { type: 'integer' },
                  gender: { type: 'string', enum: ['Male', 'Female'] },
                  chiefComplaint: { type: 'string' },
                  selectedAntecedents: { type: 'array', items: { type: 'string' } },
                  selectedAllergies: { type: 'array', items: { type: 'string' } },
                  selectedDrugs: { type: 'array', items: { type: 'string' } },
                  suggestedAllergies: { type: 'array', items: { type: 'string' } },
                  suggestedDrugs: { type: 'array', items: { type: 'string' } },
                  symptomOnsetQuestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['id', 'prompt', 'answer'],
                      properties: {
                        id: { type: 'string' },
                        prompt: { type: 'string' },
                        answer: { type: 'string' }
                      }
                    }
                  },
                  evaluationQuestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['id', 'prompt', 'answer'],
                      properties: {
                        id: { type: 'string' },
                        prompt: { type: 'string' },
                        answer: { type: 'string' }
                      }
                    }
                  },
                  locationQuestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['id', 'prompt', 'answer'],
                      properties: {
                        id: { type: 'string' },
                        prompt: { type: 'string' },
                        answer: { type: 'string' }
                      }
                    }
                  },
                  characteristicsQuestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['id', 'prompt', 'answer'],
                      properties: {
                        id: { type: 'string' },
                        prompt: { type: 'string' },
                        answer: { type: 'string' }
                      }
                    }
                  },
                  associatedSymptomsQuestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['id', 'prompt', 'answer'],
                      properties: {
                        id: { type: 'string' },
                        prompt: { type: 'string' },
                        answer: { type: 'string' }
                      }
                    }
                  },
                  updatedAt: { type: 'string' }
                }
              },
              associatedSymptomsQuestions: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id', 'prompt', 'answer'],
                  properties: {
                    id: { type: 'string' },
                    prompt: { type: 'string' },
                    answer: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    async (request) => {
      const { age, gender, chiefComplaint, answers } = request.body

      const normalizedChiefComplaint = normalizeChiefComplaint(chiefComplaint)
      const key = buildPatientKey(age, gender, normalizedChiefComplaint)
      const existing = getPatientIntake(key)

      const baseQuestions: SymptomOnsetQuestion[] = existing?.associatedSymptomsQuestions ?? []
      const answersById = new Map(answers.map((a) => [a.id, (a.answer ?? '').trim()]))
      const updatedQuestions = baseQuestions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        answer: answersById.get(q.id) ?? q.answer ?? ''
      }))

      const record = upsertPatientIntake({
        age,
        gender,
        chiefComplaint: normalizedChiefComplaint,
        associatedSymptomsQuestions: updatedQuestions
      })

      request.log.debug({ key, updatedQuestions }, 'Saved associated symptoms answers')

      return {
        message: 'Síntomas asociados guardados.',
        record,
        associatedSymptomsQuestions: record.associatedSymptomsQuestions
      }
    }
  )
}

export default associatedRoute
