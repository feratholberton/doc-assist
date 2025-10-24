import { FastifyPluginAsync } from 'fastify'

interface StartRequestBody {
  question: string;
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
          required: ['question'],
          properties: {
            question: { type: 'string', minLength: 1 }
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

      const { question } = request.body
      const chosenModel = fastify.genAIDefaultModel

      try {
        const response = await fastify.genAIClient.models.generateContent({
          model: chosenModel,
          contents: question
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
