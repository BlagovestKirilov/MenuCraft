import client from './client';

/**
 * GET /facebook/oauth/login?venueName=...
 * Returns the Facebook OAuth login URL.
 * @param {string} venueName
 * @returns {Promise<string>} login URL
 */
export const getOAuthLoginUrl = (venueName) =>
  client.get('/facebook/oauth/login', { params: { venueName } }).then((r) => r.data);

/**
 * POST /facebook/post
 * @param {{ connectionId: string, message: string, photoUrl?: string }} data
 * @returns {Promise<FacebookPostResponse>}
 */
export const postToFacebook = (data) =>
  client.post('/facebook/post', data).then((r) => r.data);
