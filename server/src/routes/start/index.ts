import { FastifyPluginAsync } from 'fastify'

interface StartRequestBody {
  age: number;
  gender: 'Male' | 'Female';
  chiefComplaint: string;
  excludeAntecedents?: string[];
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
            chiefComplaint: { type: 'string', minLength: 1 },
            excludeAntecedents: {
              type: 'array',
              items: { type: 'string', minLength: 1 },
              maxItems: 32
            }
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

      const { age, gender, chiefComplaint, excludeAntecedents } = request.body
      const chosenModel = fastify.genAIDefaultModel
      const prompt = [
        '- Eres un médico clínico.',
        '- Utiliza rigor clínico y epidemiológico, con foco en el Contexto de Uruguay (T=0)',
        '- Basandote en los datos provistos: Edad, Género, Motivo de consulta, genera hasta 8 antecedentes personales RELEVANTES para este caso. Incluye (cuando correspondan): enfermedades crónicas, cirugías, hospitalizaciones y hábitos tóxicos (por ejemplo: tabaquismo, alcoholismo). Cada antecedente debe tener como máximo 4 palabras cuando sea posible.',
        '',
        '- Responde ÚNICAMENTE con UN SOLO array JSON válido de strings.',
        '- No añadas texto, explicaciones ni encabezados. Si no hay elementos relevantes, responde con []. No inventes información ni fechas.',
        '',
        excludeAntecedents?.length
          ? `- No repitas ninguno de los siguientes antecedentes ya sugeridos: ${excludeAntecedents.join('; ')}.`
          : undefined,
        excludeAntecedents?.length
          ? `Antecedentes ya descartados: ${excludeAntecedents.join('; ')}.`
          : undefined,
        excludeAntecedents?.length ? '' : undefined,
        'Datos:',
        `Edad: ${age}`,
        `Género: ${gender}`,
        `Motivo de consulta: ${chiefComplaint}`
      ].filter((line): line is string => typeof line === 'string').join('\n')

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
