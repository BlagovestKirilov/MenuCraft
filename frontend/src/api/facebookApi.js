import client from './client';

/**
 * GET /facebook/oauth/login?venueId=...
 * Returns the Facebook OAuth login URL.
 * @param {string} venueId
 * @returns {Promise<string>} login URL
 */
export const getOAuthLoginUrl = (venueId) =>
  client.get('/facebook/oauth/login', { params: { venueId } }).then((r) => r.data);

/**
 * GET /facebook/oauth/callback?code=...&state=...
 * Handles Facebook OAuth callback.
 * @param {string} code
 * @param {string} state
 * @returns {Promise<FacebookOAuthResponse>}
 */
export const oauthCallback = (code, state) =>
  client.get('/facebook/oauth/callback', { params: { code, state } }).then((r) => r.data);

/**
 * GET /facebook/connections/:venueId
 * @param {string} venueId
 * @returns {Promise<Array<FacebookConnectionDto>>}
 */
export const getConnections = (venueId) =>
  client.get(`/facebook/connections/${venueId}`).then((r) => r.data);

/**
 * POST /facebook/post
 * @param {{ connectionId: string, message: string, photoUrl?: string }} data
 * @returns {Promise<FacebookPostResponse>}
 */
export const postToFacebook = (data) =>
  client.post('/facebook/post', data).then((r) => r.data);
