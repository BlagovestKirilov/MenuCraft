import client from './client';

/**
 * GET /venue
 * Fetches venues for the authenticated user (derived from token).
 * @returns {Promise<{ venues: Array<VenueDto> }>}
 */
export const getVenues = () =>
  client.get('/venue').then((r) => r.data);

/**
 * POST /venue/register
 * @param {Object} data - VenueRegistrationRequest
 */
export const registerVenue = (data) =>
  client.post('/venue/register', data).then((r) => r.data);

/**
 * POST /venue/menu
 * Generates a PDF menu and returns base64 in a MenuResponse.
 * @param {Object} data - MenuGenerationRequest
 * @returns {Promise<{ status, data, contentType, filename }>}
 */
export const generateMenu = (data) =>
  client.post('/venue/menu', data).then((r) => r.data);

/**
 * GET /venue/template?venueName=...
 * @param {string} venueName
 * @returns {Promise<{ templates: Array<TemplateDto> }>}
 */
export const getTemplatesByVenue = (venueName) =>
  client.get('/venue/template', { params: { venueName } }).then((r) => r.data);
