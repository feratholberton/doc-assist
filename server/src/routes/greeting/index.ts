import { FastifyPluginAsync } from 'fastify'

const greeting: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    return { hello: 'world' }
  })
}

export default greeting
