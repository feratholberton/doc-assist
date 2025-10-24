import fp from 'fastify-plugin'
import { GoogleGenAI, GoogleGenAIOptions } from '@google/genai'

export interface GenAIPluginOptions {
  /**
   * Optional default model identifier used when a request does not specify one.
   */
  defaultModel?: string;
  /**
   * Explicit API key override. Defaults to environment variables.
   */
  apiKey?: string;
  /**
   * Optional API version passed to the SDK.
   */
  apiVersion?: string;
}

const DEFAULT_MODEL = 'gemini-2.0-flash'
const API_KEY_ENV_VARS = ['GOOGLE_API_KEY', 'GEMINI_API_KEY', 'GOOGLE_GENAI_API_KEY'] as const

function resolveApiKey(opts: GenAIPluginOptions): string | undefined {
  if (opts.apiKey) {
    return opts.apiKey
  }

  for (const envVar of API_KEY_ENV_VARS) {
    const value = process.env[envVar]
    if (value) {
      return value
    }
  }

  return undefined
}

export default fp<GenAIPluginOptions>(async (fastify, opts) => {
  const apiKey = resolveApiKey(opts)
  let client: GoogleGenAI | null = null

  if (apiKey) {
    const clientOptions: GoogleGenAIOptions = {
      apiKey
    }

    if (opts.apiVersion) {
      clientOptions.apiVersion = opts.apiVersion
    }

    try {
      client = new GoogleGenAI(clientOptions)
    } catch (error) {
      fastify.log.error({ err: error }, 'Failed to initialize Google GenAI client')
      client = null
    }
  } else {
    fastify.log.warn(
      { triedEnvVars: API_KEY_ENV_VARS },
      'Google GenAI client was not initialized: missing API key (set GOOGLE_API_KEY, GEMINI_API_KEY, or GOOGLE_GENAI_API_KEY)'
    )
  }

  const defaultModel = opts.defaultModel ?? process.env.GENAI_DEFAULT_MODEL ?? DEFAULT_MODEL

  fastify.decorate('genAIClient', client)
  fastify.decorate('genAIDefaultModel', defaultModel)
})

declare module 'fastify' {
  interface FastifyInstance {
    genAIClient: GoogleGenAI | null;
    genAIDefaultModel: string;
  }
}
