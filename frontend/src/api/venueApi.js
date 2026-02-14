import client from './client';

/**
 * POST /venue/register
 * @param {Object} data - VenueRegistrationRequest
 */
export const registerVenue = (data) =>
  client.post('/venue/register', data).then((r) => r.data);

/**
 * POST /venue/menu
 * Generates a PDF menu from template + meals.
 * @param {Object} data - MenuGenerationRequest
 * @returns {Promise<Blob>}
 */
export const generateMenu = (data) =>
  client
    .post('/venue/menu', data, { responseType: 'blob' })
    .then((r) => r.data);

/**
 * GET /venue/template?venueName=...
 * @param {string} venueName
 * @returns {Promise<Array<TemplateDto>>}
 */
export const getTemplatesByVenue = (venueName) =>
  client.get('/venue/template', { params: { venueName } }).then((r) => r.data);
