import { FastifyPluginAsync } from 'fastify'
import {
  PatientIntakeRecord,
  SymptomOnsetQuestion,
  buildPatientKey,
  getPatientIntake,
  normalizeChiefComplaint,
  upsertPatientIntake
} from '../../stores/patient-intake-store.js'

interface SaveSymptomOnsetRequestBody {
  age: number;
  gender: 'Masculino' | 'Femenino';
  chiefComplaint: string;
  answers: Array<{ id: string; answer: string }>;
}

interface SaveSymptomOnsetResponseBody {
  message: string;
  record: PatientIntakeRecord;
  symptomOnsetQuestions: SymptomOnsetQuestion[];
  evaluationQuestions: SymptomOnsetQuestion[];
}

const defaultSymptomOnsetQuestions: SymptomOnsetQuestion[] = [
  { id: 'cuando-comenzo', prompt: '¿Cuándo comenzó el problema?', answer: '' },
  { id: 'como-inicio', prompt: '¿Cómo fue el inicio?', answer: '' },
  { id: 'hace-cuanto', prompt: '¿Hace cuánto tiempo presenta los síntomas?', answer: '' },
  { id: 'evento-desencadenante', prompt: '¿Hubo algún evento desencadenante?', answer: '' },
  { id: 'nota-personalizada', prompt: 'Nota personalizada', answer: '' }
]

const defaultEvaluationQuestions: SymptomOnsetQuestion[] = [
  { id: 'como-evoluciono', prompt: '¿Cómo ha evolucionado desde que comenzó?', answer: '' },
  { id: 'continuo-remision', prompt: '¿Es continuo o tiene períodos de remisión?', answer: '' },
  { id: 'patron-horario', prompt: '¿Hay un patrón horario?', answer: '' },
  { id: 'tratamiento-efecto', prompt: '¿Ha recibido algún tratamiento? ¿Mejoró, empeoró o no hubo cambios?', answer: '' },
  { id: 'nota-personalizada-ev', prompt: 'Nota personalizada', answer: '' }
]

const symptomOnsetRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: SaveSymptomOnsetRequestBody; Reply: SaveSymptomOnsetResponseBody }>(
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
            required: ['message', 'record', 'symptomOnsetQuestions', 'evaluationQuestions'],
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
                  updatedAt: { type: 'string' }
                }
              },
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

      const baseQuestions: SymptomOnsetQuestion[] =
        existing?.symptomOnsetQuestions?.length
          ? existing.symptomOnsetQuestions
          : defaultSymptomOnsetQuestions

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
        symptomOnsetQuestions: updatedQuestions,
        evaluationQuestions: existing?.evaluationQuestions?.length ? existing.evaluationQuestions : defaultEvaluationQuestions
      })

      request.log.debug({ key, updatedQuestions }, 'Saved symptom onset answers')

      return {
        message: 'Inicio de síntomas guardado.',
        record,
        symptomOnsetQuestions: record.symptomOnsetQuestions,
        evaluationQuestions: record.evaluationQuestions
      }
    }
  )
}

export default symptomOnsetRoute
