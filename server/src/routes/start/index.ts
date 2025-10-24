import { FastifyPluginAsync } from 'fastify'

interface StartRequestBody {
  age: number;
  gender: 'Male' | 'Female';
  chiefComplaint: string;
}

interface StartResponseBody {
  answer: string;
  model: string;
}

const startRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: StartRequestBody; Reply: StartResponseBody }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['age', 'gender', 'chiefComplaint'],
          properties: {
            age: { type: 'integer', minimum: 0, maximum: 140 },
            gender: { type: 'string', enum: ['Male', 'Female'] },
            chiefComplaint: { type: 'string', minLength: 1 }
          }
        },
        response: {
          200: {
            type: 'object',
            required: ['answer', 'model'],
            properties: {
              answer: { type: 'string' },
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

      const { age, gender, chiefComplaint } = request.body
      const chosenModel = fastify.genAIDefaultModel
      const prompt = [
        'You are a clinical intake assistant. Provide a concise summary and initial guidance.',
        `Age: ${age}`,
        `Gender: ${gender}`,
        `Chief complaint: ${chiefComplaint}`
      ].join('\n')

      try {
        const response = await fastify.genAIClient.models.generateContent({
          model: chosenModel,
          contents: prompt
        })

        const answer = response.text
        if (!answer) {
          request.log.warn({ response }, 'Google GenAI returned an empty answer')
          throw fastify.httpErrors.badGateway('The model did not return a usable answer')
        }

        return {
          answer,
          model: chosenModel
        }
      } catch (error) {
        request.log.error({ err: error }, 'Failed to generate answer with Google GenAI')
        throw fastify.httpErrors.badGateway('Unable to generate an answer at this time')
      }
    }
  )
}

export default startRoute
