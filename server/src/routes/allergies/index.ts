import { FastifyPluginAsync } from 'fastify'
import {
  PatientIntakeRecord,
  buildPatientKey,
  normalizeAntecedents,
  normalizeAllergies,
  normalizeChiefComplaint,
  upsertPatientIntake,
  getPatientIntake
} from '../../stores/patient-intake-store.js'
import { parseStringArrayFromModelAnswer } from '../../utils/parse-string-array.js'

interface SaveAllergiesRequestBody {
  age: number;
  gender: 'Male' | 'Female';
  chiefComplaint: string;
  selectedAntecedents?: string[];
  selectedAllergies: string[];
}

interface SaveAllergiesResponseBody {
  message: string;
  record: PatientIntakeRecord;
}

interface SuggestAllergiesRequestBody {
  age: number;
  gender: 'Male' | 'Female';
  chiefComplaint: string;
  selectedAntecedents?: string[];
  selectedAllergies?: string[];
  excludeAllergies?: string[];
}

interface SuggestAllergiesResponseBody {
  message: string;
  suggestedAllergies: string[];
  model: string;
  record: PatientIntakeRecord;
}

const allergiesRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: SaveAllergiesRequestBody; Reply: SaveAllergiesResponseBody }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['age', 'gender', 'chiefComplaint', 'selectedAllergies'],
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
                  'suggestedAllergies',
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
                  suggestedAllergies: {
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
      const { age, gender, chiefComplaint, selectedAntecedents, selectedAllergies } = request.body
      const normalizedChiefComplaint = normalizeChiefComplaint(chiefComplaint)
      const normalizedAntecedentList =
        selectedAntecedents && selectedAntecedents.length > 0
          ? normalizeAntecedents(selectedAntecedents)
          : undefined
      const normalizedAllergyList = normalizeAllergies(selectedAllergies)

      const record = upsertPatientIntake({
        age,
        gender,
        chiefComplaint: normalizedChiefComplaint,
        selectedAntecedents: normalizedAntecedentList,
        selectedAllergies: normalizedAllergyList
      })

      request.log.debug({ record }, 'Saved confirmed allergies')

      return {
        message: 'Alergias confirmadas guardadas.',
        record
      }
    }
  )

  fastify.post<{ Body: SuggestAllergiesRequestBody; Reply: SuggestAllergiesResponseBody }>(
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
            excludeAllergies: {
              type: 'array',
              items: { type: 'string', minLength: 1 },
              maxItems: 32
            }
          }
        },
        response: {
          200: {
            type: 'object',
            required: ['message', 'suggestedAllergies', 'model', 'record'],
            properties: {
              message: { type: 'string' },
              suggestedAllergies: {
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
                  'suggestedAllergies',
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
                  suggestedAllergies: {
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

      const { age, gender, chiefComplaint, selectedAntecedents, selectedAllergies, excludeAllergies } =
        request.body

      const normalizedChiefComplaint = normalizeChiefComplaint(chiefComplaint)
      const normalizedAntecedentList =
        selectedAntecedents && selectedAntecedents.length > 0
          ? normalizeAntecedents(selectedAntecedents)
          : undefined
      const normalizedSelectedAllergiesList = normalizeAllergies(selectedAllergies)
      const normalizedSelectedAllergiesForRecord =
        selectedAllergies && selectedAllergies.length > 0 ? normalizedSelectedAllergiesList : undefined
      const normalizedExcludeAllergies = normalizeAllergies(excludeAllergies)

      const chosenModel = fastify.genAIDefaultModel
      const promptLines = [
        'Genera hasta 8 alergias farmacológicas o ambientales relevantes para investigar en este paciente.',
        '- Responde ÚNICAMENTE con UN SOLO array JSON válido de strings.',
        '- No añadas texto, explicaciones ni encabezados. Si no hay elementos relevantes, responde con []. No inventes información ni fechas.',
        '',
        normalizedExcludeAllergies.length
          ? `- No repitas ninguna de las siguientes alergias ya sugeridas: ${normalizedExcludeAllergies.join('; ')}.`
          : undefined,
        normalizedSelectedAllergiesList.length
          ? `- No repitas las alergias ya confirmadas: ${normalizedSelectedAllergiesList.join('; ')}.`
          : undefined,
        normalizedExcludeAllergies.length || normalizedSelectedAllergiesList.length ? '' : undefined,
        'Datos:',
        `Edad: ${age}`,
        `Género: ${gender}`,
        `Motivo de consulta: ${normalizedChiefComplaint}`,
        `Antecedentes confirmados: ${
          normalizedAntecedentList && normalizedAntecedentList.length > 0
            ? normalizedAntecedentList.join('; ')
            : 'Ninguno'
        }`,
        `Alergias confirmadas actuales: ${
          normalizedSelectedAllergiesList.length > 0 ? normalizedSelectedAllergiesList.join('; ') : 'Ninguna'
        }`
      ].filter((line): line is string => typeof line === 'string')

      const prompt = promptLines.join('\n')

      try {
        const response = await fastify.genAIClient.models.generateContent({
          model: chosenModel,
          contents: prompt
        })

        const answer = response.text
        if (!answer) {
          request.log.warn({ response }, 'Google GenAI returned an empty allergy suggestion list')
          throw fastify.httpErrors.badGateway('El modelo no devolvió alergias válidas.')
        }

        const suggestedAllergies = parseStringArrayFromModelAnswer(answer)
        if (suggestedAllergies.length === 0) {
          request.log.warn({ answer }, 'Unable to parse allergy suggestions from model response')
        }

        const existingRecord = getPatientIntake(
          buildPatientKey(age, gender, normalizedChiefComplaint)
        )
        const mergedSuggestedAllergies = Array.from(
          new Set([...(existingRecord?.suggestedAllergies ?? []), ...suggestedAllergies])
        ).slice(0, 24)

        const record = upsertPatientIntake({
          age,
          gender,
          chiefComplaint: normalizedChiefComplaint,
          selectedAntecedents: normalizedAntecedentList,
          selectedAllergies: normalizedSelectedAllergiesForRecord,
          suggestedAllergies: mergedSuggestedAllergies
        })

        request.log.debug({ record, suggestedAllergies }, 'Generated additional allergy suggestions')

        return {
          message: suggestedAllergies.length > 0 ? 'Nuevas alergias sugeridas.' : 'No se generaron nuevas alergias.',
          suggestedAllergies,
          model: chosenModel,
          record
        }
      } catch (error) {
        request.log.error({ err: error }, 'Failed to generate allergy suggestions')
        throw fastify.httpErrors.badGateway('No se pudieron generar alergias en este momento.')
      }
    }
  )
}

export default allergiesRoute
