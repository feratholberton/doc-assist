import { FastifyPluginAsync } from 'fastify'
import {
  PatientIntakeRecord,
  buildPatientKey,
  normalizeAntecedents,
  normalizeAllergies,
  normalizeChiefComplaint,
  normalizeDrugs,
  upsertPatientIntake,
  getPatientIntake
} from '../../stores/patient-intake-store.js'
import { parseStringArrayFromModelAnswer } from '../../utils/parse-string-array.js'

interface SaveDrugsRequestBody {
  age: number;
  gender: 'Male' | 'Female';
  chiefComplaint: string;
  selectedAntecedents?: string[];
  selectedAllergies?: string[];
  selectedDrugs: string[];
}

interface SaveDrugsResponseBody {
  message: string;
  record: PatientIntakeRecord;
}

interface SuggestDrugsRequestBody {
  age: number;
  gender: 'Male' | 'Female';
  chiefComplaint: string;
  selectedAntecedents?: string[];
  selectedAllergies?: string[];
  selectedDrugs?: string[];
  excludeDrugs?: string[];
}

interface SuggestDrugsResponseBody {
  message: string;
  suggestedDrugs: string[];
  model: string;
  record: PatientIntakeRecord;
}

const buildDrugPrompt = ({
  age,
  gender,
  chiefComplaint,
  antecedents,
  allergies,
  exclude,
  confirmed
}: {
  age: number;
  gender: 'Male' | 'Female';
  chiefComplaint: string;
  antecedents: string[];
  allergies: string[];
  exclude: string[];
  confirmed: string[];
}): string => {
  const lines: Array<string | undefined> = [
    '- Eres un médico clínico.',
    '- Utiliza rigor clínico y epidemiológico, con foco en el Contexto de Uruguay (T=0)',
    '- Basandote en los datos provistos: Edad, Género, Motivo de consulta, Antecedentes, Alergias. Genera hasta 8 medicamentos que podrían ser razonablemente considerados para este caso. SOLO EL NOMBRE. Prioriza nombres genéricos cuando sea posible.',
    '- Responde ÚNICAMENTE con un array JSON válido de strings.',
    '- No añadas texto, explicaciones ni encabezados. Si no hay elementos relevantes, responde con []. No inventes información ni fechas.',
    '- Si la información clínica es insuficiente para proponer fármacos específicos, devuelve sugerencias generales de clases (por ejemplo: "AINEs", "Antibiótico tópico para conjuntivitis")',
    '- NO inventes fármacos.',
    '',
    exclude.length > 0 ? `- No repitas ninguno de los siguientes medicamentos ya sugeridos: ${exclude.join('; ')}.` : undefined,
    confirmed.length > 0 ? `- No repitas los medicamentos ya confirmados: ${confirmed.join('; ')}.` : undefined,
    exclude.length > 0 || confirmed.length > 0 ? '' : undefined,
    'Datos:',
    `Edad: ${age}`,
    `Género: ${gender}`,
    `Motivo de consulta: ${chiefComplaint}`,
    `Antecedentes confirmados: ${antecedents.length > 0 ? antecedents.join('; ') : 'Ninguno'}`,
    `Alergias confirmadas: ${allergies.length > 0 ? allergies.join('; ') : 'Ninguna'}`,
    `Medicamentos ya confirmados: ${confirmed.length > 0 ? confirmed.join('; ') : 'Ninguno'}`
  ]

  return lines.filter((line): line is string => typeof line === 'string').join('\n')
}

const drugsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: SaveDrugsRequestBody; Reply: SaveDrugsResponseBody }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['age', 'gender', 'chiefComplaint', 'selectedDrugs'],
          properties: {
            age: { type: 'integer', minimum: 0, maximum: 140 },
            gender: { type: 'string', enum: ['Male', 'Female'] },
            chiefComplaint: { type: 'string', minLength: 1 },
            selectedAntecedents: {
              type: 'array',
              items: { type: 'string', minLength: 1 },
              maxItems: 24
            },
            selectedAllergies: {
              type: 'array',
              items: { type: 'string', minLength: 1 },
              maxItems: 24
            },
            selectedDrugs: {
              type: 'array',
              items: { type: 'string', minLength: 1 },
              maxItems: 24
            }
          }
        },
        response: {
          200: {
            type: 'object',
            required: ['message', 'record'],
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
                  'updatedAt'
                ],
                properties: {
                  age: { type: 'integer' },
                  gender: { type: 'string', enum: ['Male', 'Female'] },
                  chiefComplaint: { type: 'string' },
                  selectedAntecedents: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  selectedAllergies: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  selectedDrugs: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  suggestedAllergies: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  suggestedDrugs: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  updatedAt: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    async (request) => {
      const { age, gender, chiefComplaint, selectedAntecedents, selectedAllergies, selectedDrugs } = request.body

      const normalizedChiefComplaint = normalizeChiefComplaint(chiefComplaint)
      const normalizedAntecedentList =
        selectedAntecedents && selectedAntecedents.length > 0
          ? normalizeAntecedents(selectedAntecedents)
          : undefined
      const normalizedAllergyList =
        selectedAllergies && selectedAllergies.length > 0 ? normalizeAllergies(selectedAllergies) : undefined
      const normalizedDrugsList = normalizeDrugs(selectedDrugs)

      const record = upsertPatientIntake({
        age,
        gender,
        chiefComplaint: normalizedChiefComplaint,
        selectedAntecedents: normalizedAntecedentList,
        selectedAllergies: normalizedAllergyList,
        selectedDrugs: normalizedDrugsList
      })

      request.log.debug({ record }, 'Saved confirmed drugs')

      return {
        message: 'Medicamentos confirmados guardados.',
        record
      }
    }
  )

  fastify.post<{ Body: SuggestDrugsRequestBody; Reply: SuggestDrugsResponseBody }>(
    '/suggest',
    {
      schema: {
        body: {
          type: 'object',
          required: ['age', 'gender', 'chiefComplaint'],
          properties: {
            age: { type: 'integer', minimum: 0, maximum: 140 },
            gender: { type: 'string', enum: ['Male', 'Female'] },
            chiefComplaint: { type: 'string', minLength: 1 },
            selectedAntecedents: {
              type: 'array',
              items: { type: 'string', minLength: 1 },
              maxItems: 24
            },
            selectedAllergies: {
              type: 'array',
              items: { type: 'string', minLength: 1 },
              maxItems: 24
            },
            selectedDrugs: {
              type: 'array',
              items: { type: 'string', minLength: 1 },
              maxItems: 24
            },
            excludeDrugs: {
              type: 'array',
              items: { type: 'string', minLength: 1 },
              maxItems: 32
            }
          }
        },
        response: {
          200: {
            type: 'object',
            required: ['message', 'suggestedDrugs', 'model', 'record'],
            properties: {
              message: { type: 'string' },
              suggestedDrugs: {
                type: 'array',
                items: { type: 'string' }
              },
              model: { type: 'string' },
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
                  'updatedAt'
                ],
                properties: {
                  age: { type: 'integer' },
                  gender: { type: 'string', enum: ['Male', 'Female'] },
                  chiefComplaint: { type: 'string' },
                  selectedAntecedents: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  selectedAllergies: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  selectedDrugs: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  suggestedAllergies: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  suggestedDrugs: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  updatedAt: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    async (request) => {
      if (!fastify.genAIClient) {
        throw fastify.httpErrors.serviceUnavailable('Google GenAI client is not configured')
      }

      const { age, gender, chiefComplaint, selectedAntecedents, selectedAllergies, selectedDrugs, excludeDrugs } =
        request.body

      const normalizedChiefComplaint = normalizeChiefComplaint(chiefComplaint)
      const normalizedAntecedentList =
        selectedAntecedents && selectedAntecedents.length > 0
          ? normalizeAntecedents(selectedAntecedents)
          : undefined
      const normalizedAllergyList =
        selectedAllergies && selectedAllergies.length > 0 ? normalizeAllergies(selectedAllergies) : undefined
      const normalizedSelectedDrugs = normalizeDrugs(selectedDrugs)
      const normalizedExcludeDrugs = normalizeDrugs(excludeDrugs)

      const prompt = buildDrugPrompt({
        age,
        gender,
        chiefComplaint: normalizedChiefComplaint,
        antecedents: normalizedAntecedentList ?? [],
        allergies: normalizedAllergyList ?? [],
        exclude: normalizedExcludeDrugs,
        confirmed: normalizedSelectedDrugs
      })

      const chosenModel = fastify.genAIDefaultModel

      try {
        const response = await fastify.genAIClient.models.generateContent({
          model: chosenModel,
          contents: prompt
        })

        const answer = response.text
        if (!answer) {
          request.log.warn({ response }, 'Google GenAI returned an empty drug suggestion list')
          throw fastify.httpErrors.badGateway('El modelo no devolvió medicamentos válidos.')
        }

        const suggestedDrugs = parseStringArrayFromModelAnswer(answer)
        if (suggestedDrugs.length === 0) {
          request.log.warn({ answer }, 'Unable to parse drug suggestions from model response')
        }

        const existingRecord = getPatientIntake(
          buildPatientKey(age, gender, normalizedChiefComplaint)
        )
        const mergedSuggestedDrugs = Array.from(
          new Set([...(existingRecord?.suggestedDrugs ?? []), ...suggestedDrugs])
        ).slice(0, 24)

        const record = upsertPatientIntake({
          age,
          gender,
          chiefComplaint: normalizedChiefComplaint,
          selectedAntecedents: normalizedAntecedentList,
          selectedAllergies: normalizedAllergyList,
          selectedDrugs: normalizedSelectedDrugs.length > 0 ? normalizedSelectedDrugs : undefined,
          suggestedDrugs: mergedSuggestedDrugs
        })

        request.log.debug({ record, suggestedDrugs }, 'Generated additional drug suggestions')

        return {
          message: suggestedDrugs.length > 0 ? 'Nuevos medicamentos sugeridos.' : 'No se generaron nuevos medicamentos.',
          suggestedDrugs,
          model: chosenModel,
          record
        }
      } catch (error) {
        request.log.error({ err: error }, 'Failed to generate drug suggestions')
        throw fastify.httpErrors.badGateway('No se pudieron generar medicamentos en este momento.')
      }
    }
  )
}

export default drugsRoute
