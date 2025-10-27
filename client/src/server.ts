import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Sanitize and validate URL to prevent XSS attacks
 */
const sanitizeUrl = (url: string): string => {
  try {
    // Parse the URL to validate it
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid protocol');
    }
    
    // Return the sanitized URL (toString() normalizes it)
    return urlObj.toString();
  } catch (error) {
    console.error('Invalid API_BASE_URL:', url, error);
    return 'http://localhost:3000'; // Fallback to safe default
  }
};

/**
 * Escape HTML special characters to prevent XSS
 */
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use(async (req, res, next) => {
  try {
    const response = await angularApp.handle(req);
    if (!response) {
      next();
      return;
    }
    
    // Get the API base URL from environment or use default
    const rawApiBaseUrl = process.env['API_BASE_URL'] || 'http://localhost:3000';
    
    // Sanitize and validate the URL
    const apiBaseUrl = sanitizeUrl(rawApiBaseUrl);
    
    // Escape for safe HTML injection
    const safeApiBaseUrl = escapeHtml(apiBaseUrl);
    
    // Get the response text and replace the placeholder
    const html = await response.text();
    const modifiedHtml = html.replace('{{API_BASE_URL}}', safeApiBaseUrl);
    
    // Set headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Send the modified HTML
    res.status(response.status).send(modifiedHtml);
  } catch (error) {
    next(error);
  }
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
const handleBootstrapError = (error: NodeJS.ErrnoException | undefined) => {
  if (!error) {
    return;
  }

  const permissionDenied = error.code === 'EPERM' || error.code === 'EACCES';

  if (permissionDenied) {
    console.warn(
      'Angular SSR server bootstrap skipped: unable to bind to a local port in this environment.',
    );
    return;
  }

  throw error;
};

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;

  try {
    const server = app.listen(port, () => {
      console.log(`Node Express server listening on http://localhost:${port}`);
    });

    server.once('error', handleBootstrapError);
  } catch (error) {
    handleBootstrapError(error as NodeJS.ErrnoException | undefined);
  }
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
