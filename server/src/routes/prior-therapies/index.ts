import { FastifyPluginAsync } from 'fastify'
import {
  PatientIntakeRecord,
  SymptomOnsetQuestion,
  buildPatientKey,
  getPatientIntake,
  normalizeChiefComplaint,
  upsertPatientIntake
} from '../../stores/patient-intake-store.js'

interface SavePriorTherapiesRequestBody {
  age: number;
  gender: 'Masculino' | 'Femenino';
  chiefComplaint: string;
  answers: Array<{ id: string; answer: string }>;
}

interface SavePriorTherapiesResponseBody {
  message: string;
  record: PatientIntakeRecord;
  priorTherapiesQuestions: SymptomOnsetQuestion[];
  redFlagsQuestions: SymptomOnsetQuestion[];
}

const priorTherapiesRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: SavePriorTherapiesRequestBody; Reply: SavePriorTherapiesResponseBody }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['age', 'gender', 'chiefComplaint', 'answers'],
          properties: {
            age: { type: 'integer', minimum: 0, maximum: 140 },
            gender: { type: 'string', enum: ['Masculino', 'Femenino'] },
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
            required: ['message', 'record', 'priorTherapiesQuestions', 'redFlagsQuestions'],
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
                  'precipitatingFactorsQuestions',
                  'recentExposuresQuestions',
                  'functionalImpactQuestions',
                  'priorTherapiesQuestions',
                  'redFlagsQuestions',
                  'updatedAt'
                ],
                properties: {
                  age: { type: 'integer' },
                  gender: { type: 'string', enum: ['Masculino', 'Femenino'] },
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
                  precipitatingFactorsQuestions: {
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
                  recentExposuresQuestions: {
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
                  functionalImpactQuestions: {
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
                  priorTherapiesQuestions: {
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
                  redFlagsQuestions: {
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
              priorTherapiesQuestions: {
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
              redFlagsQuestions: {
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

      const baseQuestions: SymptomOnsetQuestion[] = existing?.priorTherapiesQuestions ?? []
      const answersById = new Map(answers.map((a) => [a.id, (a.answer ?? '').trim()]))
      const updatedQuestions = baseQuestions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        answer: answersById.get(q.id) ?? q.answer ?? ''
      }))

      // Default next section questions (Red flag symptoms)
      const defaultRedFlagsQuestions: SymptomOnsetQuestion[] = [
        { id: 'fiebre-alta', prompt: 'Fiebre alta persistente (>38.5°C)', answer: '' },
        { id: 'sangrados', prompt: 'Sangrados (hemoptisis, hematemesis, melena, hematuria)', answer: '' },
        { id: 'disnea-reposo', prompt: 'Dificultad respiratoria severa o disnea de reposo', answer: '' },
        { id: 'dolor-toracico', prompt: 'Dolor torácico intenso, opresivo, con irradiación', answer: '' },
        { id: 'perdida-peso', prompt: 'Pérdida de peso no intencional significativa (>5% en 1 mes)', answer: '' },
        { id: 'sincopes', prompt: 'Pérdida de conciencia, síncope o lipotimia', answer: '' },
        { id: 'convulsiones', prompt: 'Convulsiones', answer: '' },
        { id: 'alteraciones-neurologicas', prompt: 'Alteraciones neurológicas agudas (paresia, parestesias, afasia, alteración visual súbita)', answer: '' },
        { id: 'deshidratacion-severa', prompt: 'Deshidratación severa (en contexto de vómitos/diarrea)', answer: '' },
        { id: 'ictericia', prompt: 'Ictericia (piel/ojos amarillos)', answer: '' },
        { id: 'sangrado-activo-petequias', prompt: 'Signos de sangrado activo o petequias (considerar dengue)', answer: '' },
        { id: 'nota-personalizada-rf', prompt: 'Nota personalizada', answer: '' }
      ]

      const record = upsertPatientIntake({
        age,
        gender,
        chiefComplaint: normalizedChiefComplaint,
        priorTherapiesQuestions: updatedQuestions,
        redFlagsQuestions: existing?.redFlagsQuestions?.length ? existing.redFlagsQuestions : defaultRedFlagsQuestions
      })

      request.log.debug({ key, updatedQuestions }, 'Saved prior therapies and self-treatment answers')

      return {
        message: 'Tratamientos previos y automedicación guardados.',
        record,
        priorTherapiesQuestions: record.priorTherapiesQuestions,
        redFlagsQuestions: record.redFlagsQuestions
      }
    }
  )
}

export default priorTherapiesRoute
