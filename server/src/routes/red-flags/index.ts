import { FastifyPluginAsync } from 'fastify'
import {
  PatientIntakeRecord,
  SymptomOnsetQuestion,
  buildPatientKey,
  getPatientIntake,
  normalizeChiefComplaint,
  upsertPatientIntake
} from '../../stores/patient-intake-store.js'

interface SaveRedFlagsRequestBody {
  age: number;
  gender: 'Male' | 'Female';
  chiefComplaint: string;
  answers: Array<{ id: string; answer: string }>;
}

interface SaveRedFlagsResponseBody {
  message: string;
  record: PatientIntakeRecord;
  redFlagsQuestions: SymptomOnsetQuestion[];
  reviewSummary: string;
}

const redFlagsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: SaveRedFlagsRequestBody; Reply: SaveRedFlagsResponseBody }>(
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
            required: ['message', 'record', 'redFlagsQuestions', 'reviewSummary'],
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
              reviewSummary: { type: 'string' }
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

      const baseQuestions: SymptomOnsetQuestion[] = existing?.redFlagsQuestions ?? []
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
        redFlagsQuestions: updatedQuestions
      })

      request.log.debug({ key, updatedQuestions }, 'Saved red flag symptoms answers')

      // Build review summary text
      const lines: string[] = []
      lines.push('# Resumen de respuestas del formulario clínico')
      lines.push('')
      lines.push(`Edad: ${record.age}`)
      lines.push(`Género: ${record.gender}`)
      lines.push(`Motivo de consulta: ${record.chiefComplaint}`)
      lines.push('')
      const list = (title: string, items: string[]) => {
        lines.push(`## ${title}`)
        lines.push(items.length ? `- ${items.join(', ')}` : '- (sin datos)')
        lines.push('')
      }
      list('Antecedentes', record.selectedAntecedents ?? [])
      list('Alergias', record.selectedAllergies ?? [])
      list('Medicamentos', record.selectedDrugs ?? [])

      const qa = (title: string, qs?: SymptomOnsetQuestion[]) => {
        if (!qs || qs.length === 0) return
        lines.push(`## ${title}`)
        for (const q of qs) {
          lines.push(`- ${q.prompt}`)
          lines.push(`  Respuesta: ${q.answer ?? ''}`)
        }
        lines.push('')
      }
      qa('Inicio de síntomas', record.symptomOnsetQuestions)
      qa('Evaluación y curso', record.evaluationQuestions)
      qa('Localización', record.locationQuestions)
      qa('Características del síntoma', record.characteristicsQuestions)
      qa('Síntomas asociados', record.associatedSymptomsQuestions)
      qa('Factores precipitantes y contexto', record.precipitatingFactorsQuestions)
      qa('Exposiciones y contactos recientes', record.recentExposuresQuestions)
      qa('Impacto funcional y calidad de vida', record.functionalImpactQuestions)
      qa('Tratamientos previos y automedicación', record.priorTherapiesQuestions)
      qa('Síntomas de alarma', record.redFlagsQuestions)

      const reviewSummary = lines.join('\n')

      return {
        message: 'Síntomas de alarma guardados.',
        record,
        redFlagsQuestions: record.redFlagsQuestions,
        reviewSummary
      }
    }
  )
}

export default redFlagsRoute
