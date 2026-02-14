import client from './client';

/**
 * POST /admin/template
 * @param {Object} data - AddTemplateRequest (file data is base64 encoded)
 */
export const addTemplate = (data) =>
  client.post('/admin/template', data).then((r) => r.data);

/**
 * GET /admin/template/:id/file
 * Downloads the template file as a blob.
 * @param {string} id - template UUID
 * @returns {Promise<Blob>}
 */
export const downloadTemplateFile = (id) =>
  client
    .get(`/admin/template/${id}/file`, { responseType: 'blob' })
    .then((r) => r.data);
