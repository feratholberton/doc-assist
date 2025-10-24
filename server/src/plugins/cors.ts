import fp from 'fastify-plugin'
import cors, { FastifyCorsOptions } from '@fastify/cors'

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:4200']

function parseAllowedOrigins(value: string | undefined): string[] {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
}

export interface CorsPluginOptions extends FastifyCorsOptions {
  allowedOrigins?: string | string[];
}

export default fp<CorsPluginOptions>(async (fastify, opts = {}) => {
  const { allowedOrigins, ...corsOptions } = opts

  const envOrigins = parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS)
  const explicitOrigins = Array.isArray(allowedOrigins)
    ? allowedOrigins
    : parseAllowedOrigins(allowedOrigins as string | undefined)
  const configuredOrigins = [
    ...new Set([...envOrigins, ...explicitOrigins])
  ].filter((origin) => origin.length > 0)

  const originOption: FastifyCorsOptions['origin'] =
    configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS

  await fastify.register(cors, {
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    ...corsOptions,
    origin: corsOptions.origin ?? originOption
  })
})
