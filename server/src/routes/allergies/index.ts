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
  gender: 'Masculino' | 'Femenino';
  chiefComplaint: string;
  selectedAntecedents?: string[];
  selectedAllergies: string[];
}

interface SaveAllergiesResponseBody {
  message: string;
  record: PatientIntakeRecord;
  suggestedDrugs: string[];
  model: string;
}

interface SuggestAllergiesRequestBody {
  age: number;
  gender: 'Masculino' | 'Femenino';
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
            gender: { type: 'string', enum: ['Masculino', 'Femenino'] },
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
            required: ['message', 'record', 'suggestedDrugs', 'model'],
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
                  'suggestedDrugs',
                  'selectedDrugs',
                  'updatedAt'
                ],
                properties: {
                  age: { type: 'integer' },
                  gender: { type: 'string', enum: ['Masculino', 'Femenino'] },
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
                  suggestedDrugs: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  selectedDrugs: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  updatedAt: { type: 'string' }
                }
              },
              suggestedDrugs: {
                type: 'array',
                items: { type: 'string' }
              },
              model: { type: 'string' }
            }
          }
        }
      }
    },
    async (request) => {
      if (!fastify.genAIClient) {
        throw fastify.httpErrors.serviceUnavailable('Google GenAI client is not configured')
      }

      const { age, gender, chiefComplaint, selectedAntecedents, selectedAllergies } = request.body
      const normalizedChiefComplaint = normalizeChiefComplaint(chiefComplaint)
      const normalizedAntecedentList =
        selectedAntecedents && selectedAntecedents.length > 0
          ? normalizeAntecedents(selectedAntecedents)
          : undefined
      const normalizedAllergyList = normalizeAllergies(selectedAllergies)

      const chosenModel = fastify.genAIDefaultModel
      const prompt = [
        '- Eres un médico clínico.',
        '- Utiliza rigor clínico y epidemiológico, con foco en el Contexto de Uruguay (T=0)',
        '- Basandote en los datos provistos: Edad, Género, Motivo de consulta, Antecedentes, Alergias. Genera hasta 8 medicamentos que podrían ser razonablemente considerados para este caso. SOLO EL NOMBRE. Prioriza nombres genéricos cuando sea posible.',
        '- Responde ÚNICAMENTE con un array JSON válido de strings.',
        '- No añadas texto, explicaciones ni encabezados. Si no hay elementos relevantes, responde con []. No inventes información ni fechas.',
        '- Si la información clínica es insuficiente para proponer fármacos específicos, devuelve sugerencias generales de clases (por ejemplo: \"AINEs\", \"Antibiótico tópico para conjuntivitis\")',
        '- NO inventes fármacos.',
        '',
        'Datos:',
        `Edad: ${age}`,
        `Género: ${gender}`,
        `Motivo de consulta: ${normalizedChiefComplaint}`,
        `Antecedentes confirmados: ${
          normalizedAntecedentList && normalizedAntecedentList.length > 0
            ? normalizedAntecedentList.join('; ')
            : 'Ninguno'
        }`,
        `Alergias confirmadas: ${
          normalizedAllergyList.length > 0 ? normalizedAllergyList.join('; ') : 'Ninguna'
        }`
      ].join('\n')

      try {
        const response = await fastify.genAIClient.models.generateContent({
          model: chosenModel,
          contents: prompt
        })

        const answer = response.text
        if (!answer) {
          request.log.warn({ response }, 'Google GenAI returned an empty drug list')
          throw fastify.httpErrors.badGateway('El modelo no devolvió medicamentos válidos.')
        }

        const suggestedDrugs = parseStringArrayFromModelAnswer(answer)
        if (suggestedDrugs.length === 0) {
          request.log.warn({ answer }, 'Unable to parse drug suggestions from model response')
        }

        const record = upsertPatientIntake({
          age,
          gender,
          chiefComplaint: normalizedChiefComplaint,
          selectedAntecedents: normalizedAntecedentList,
          selectedAllergies: normalizedAllergyList,
          suggestedDrugs
        })

        request.log.debug({ record, suggestedDrugs }, 'Saved allergies and generated drug suggestions')

        return {
          message: 'Alergias confirmadas guardadas.',
          record,
          suggestedDrugs,
          model: chosenModel
        }
      } catch (error) {
        request.log.error({ err: error }, 'Failed to generate drug suggestions after saving allergies')
        throw fastify.httpErrors.badGateway('No se pudieron generar medicamentos en este momento.')
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
            gender: { type: 'string', enum: ['Masculino', 'Femenino'] },
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
                  'selectedDrugs',
                  'suggestedAllergies',
                  'suggestedDrugs',
                  'updatedAt'
                ],
                properties: {
                  age: { type: 'integer' },
                  gender: { type: 'string', enum: ['Masculino', 'Femenino'] },
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
