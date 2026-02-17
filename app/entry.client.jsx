/**
 * Client Entry Point
 * 
 * Hydrates the React application on the client side.
 * This file is executed in the browser to make the server-rendered
 * HTML interactive by attaching React event handlers.
 * 
 * @module entry.client
 */

import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

// Hydrate the entire document with the React Router
hydrateRoot(
  document,
  <HydratedRouter />
);
