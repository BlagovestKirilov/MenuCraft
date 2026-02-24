import client from './client';

/**
 * POST /admin/register
 * @param {{ username: string, password: string, role: 'COMPANY'|'ADMIN' }} data
 * @returns {Promise<{ status: string }>}
 */
export const registerAccount = (data) =>
  client.post('/admin/register', data).then((r) => r.data);

/**
 * GET /admin/accounts/company
 * @returns {Promise<string[]>} list of company account usernames
 */
export const getCompanyAccounts = () =>
  client.get('/admin/accounts/company').then((r) => r.data);

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
