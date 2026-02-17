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

/**
 * GET /venue/history
 * Returns list of generated menus for the authenticated user.
 * @returns {Promise<{ menus: Array<{ id, templateName, createdAt }> }>}
 */
export const getHistory = () =>
  client.get('/venue/history').then((r) => r.data);

/**
 * GET /venue/history/:menuId
 * Returns full detail (PDF + preview image) for a generated menu.
 * @param {string} menuId
 * @returns {Promise<{ status, data, contentType, filename, previewImage }>}
 */
export const getMenuDetail = (menuId) =>
  client.get(`/venue/history/${menuId}`).then((r) => r.data);
