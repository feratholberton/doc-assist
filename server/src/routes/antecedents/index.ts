import { FastifyPluginAsync } from 'fastify'
import {
  PatientIntakeRecord,
  normalizeChiefComplaint,
  normalizeAntecedents,
  upsertPatientIntake
} from '../../stores/patient-intake-store.js'

interface AntecedentsRequestBody {
  age: number;
  gender: 'Male' | 'Female';
  chiefComplaint: string;
  selectedAntecedents: string[];
}

interface AntecedentsResponseBody {
  message: string;
  record: PatientIntakeRecord;
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
            required: ['message', 'record'],
            properties: {
              message: { type: 'string' },
              record: {
                type: 'object',
                required: ['age', 'gender', 'chiefComplaint', 'selectedAntecedents', 'updatedAt'],
                properties: {
                  age: { type: 'integer' },
                  gender: { type: 'string', enum: ['Male', 'Female'] },
                  chiefComplaint: { type: 'string' },
                  selectedAntecedents: {
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
      const { age, gender, chiefComplaint, selectedAntecedents } = request.body

      const normalizedChiefComplaint = normalizeChiefComplaint(chiefComplaint)
      const normalizedAntecedentList = normalizeAntecedents(selectedAntecedents)

      const record = upsertPatientIntake({
        age,
        gender,
        chiefComplaint: normalizedChiefComplaint,
        selectedAntecedents: normalizedAntecedentList
      })

      request.log.debug({ record }, 'Saved patient antecedents')

      return {
        message: 'Antecedentes confirmados guardados.',
        record
      }
    }
  )
}

export default antecedentsRoute
