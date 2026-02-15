import client from './client';

/**
 * POST /auth/login
 * @param {{ username: string, password: string }} data
 * @returns {Promise<{ status, message, token, refreshToken, role }>}
 */
export const login = (data) =>
  client.post('/auth/login', data).then((r) => r.data);

/**
 * POST /auth/register
 * @param {{ username: string, password: string, role: 'COMPANY'|'ADMIN' }} data
 * @returns {Promise<{ status, message, token, refreshToken, role }>}
 */
export const register = (data) =>
  client.post('/auth/register', data).then((r) => r.data);

/**
 * POST /auth/refresh
 * @param {{ refreshToken: string }} data
 * @returns {Promise<{ status, token, refreshToken, role }>}
 */
export const refreshToken = (data) =>
  client.post('/auth/refresh', data).then((r) => r.data);
