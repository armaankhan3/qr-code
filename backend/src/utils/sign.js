const crypto = require('crypto');

const signPayload = (payload, secret, expiresInSeconds = 60 * 60 * 24) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
};

const verifyPayload = (token, secret) => {
  try {
    const [headerB64, bodyB64, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', secret).update(`${headerB64}.${bodyB64}`).digest('base64url');
    if (expected !== signature) return { valid: false, reason: 'invalid signature' };
    const body = JSON.parse(Buffer.from(bodyB64, 'base64url').toString('utf8'));
    if (body.exp && body.exp < Math.floor(Date.now() / 1000)) return { valid: false, reason: 'expired' };
    return { valid: true, payload: body };
  } catch (e) {
    return { valid: false, reason: 'malformed token' };
  }
};

module.exports = { signPayload, verifyPayload };
