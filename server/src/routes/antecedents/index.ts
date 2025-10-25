import { FastifyPluginAsync } from 'fastify'
import {
  PatientIntakeRecord,
  normalizeChiefComplaint,
  normalizeAntecedents,
  upsertPatientIntake
} from '../../stores/patient-intake-store.js'
import { parseStringArrayFromModelAnswer } from '../../utils/parse-string-array.js'

interface AntecedentsRequestBody {
  age: number;
  gender: 'Male' | 'Female';
  chiefComplaint: string;
  selectedAntecedents: string[];
}

interface AntecedentsResponseBody {
  message: string;
  record: PatientIntakeRecord;
  suggestedAllergies: string[];
  model: string;
}

const antecedentsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: AntecedentsRequestBody; Reply: AntecedentsResponseBody }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['age', 'gender', 'chiefComplaint', 'selectedAntecedents'],
          properties: {
            age: { type: 'integer', minimum: 0, maximum: 140 },
            gender: { type: 'string', enum: ['Male', 'Female'] },
            chiefComplaint: { type: 'string', minLength: 1 },
            selectedAntecedents: {
              type: 'array',
              items: { type: 'string', minLength: 1 },
              maxItems: 24
            }
          }
        },
        response: {
          200: {
            type: 'object',
            required: ['message', 'record', 'suggestedAllergies', 'model'],
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
              },
              suggestedAllergies: {
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
        throw fastify.httpErrors.serviceUnavailable('Google GenAI client is not configured');
      }

      const { age, gender, chiefComplaint, selectedAntecedents } = request.body;

      const normalizedChiefComplaint = normalizeChiefComplaint(chiefComplaint);
      const normalizedAntecedentList = normalizeAntecedents(selectedAntecedents);

      const chosenModel = fastify.genAIDefaultModel;
      const prompt = [
        'Genera hasta 8 alergias farmacológicas o ambientales relevantes para investigar en este paciente.',
        '- Responde ÚNICAMENTE con UN SOLO array JSON válido de strings.',
        '- No añadas texto, explicaciones ni encabezados. Si no hay elementos relevantes, responde con []. No inventes información ni fechas.',
        '',
        'Datos:',
        `Edad: ${age}`,
        `Género: ${gender}`,
        `Motivo de consulta: ${normalizedChiefComplaint}`,
        `Antecedentes confirmados: ${
          normalizedAntecedentList.length > 0 ? normalizedAntecedentList.join('; ') : 'Ninguno'
        }`
      ].join('\n');

      try {
        const response = await fastify.genAIClient.models.generateContent({
          model: chosenModel,
          contents: prompt
        });

        const answer = response.text;
        if (!answer) {
          request.log.warn({ response }, 'Google GenAI returned an empty allergy list');
          throw fastify.httpErrors.badGateway('El modelo no devolvió alergias válidas.');
        }

        const suggestedAllergies = parseStringArrayFromModelAnswer(answer);
        if (suggestedAllergies.length === 0) {
          request.log.warn({ answer }, 'Unable to parse allergy suggestions from model response');
        }

        const record = upsertPatientIntake({
          age,
          gender,
          chiefComplaint: normalizedChiefComplaint,
          selectedAntecedents: normalizedAntecedentList,
          suggestedAllergies
        });

        request.log.debug({ record }, 'Saved patient antecedents with allergy suggestions');

        return {
          message: 'Antecedentes confirmados guardados.',
          record,
          suggestedAllergies,
          model: chosenModel
        };
      } catch (error) {
        request.log.error({ err: error }, 'Failed to generate allergy suggestions');
        throw fastify.httpErrors.badGateway('No se pudieron generar alergias en este momento.');
      }
    }
  )
}

export default antecedentsRoute
