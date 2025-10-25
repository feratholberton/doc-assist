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
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
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
