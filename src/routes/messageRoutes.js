const express = require('express');
const { logEvent } = require('../utils/logger');
const {
  encryptMessage,
  decryptMessage,
  generateHMAC
} = require('../utils/cryptoUtils');

const router = express.Router();

// In-memory session key store for testing (normally DB/cache)
const sessionKeys = {}; // { "alice_bob": key }

router.post('/send', (req, res) => {
  const { from, to, message, sessionKey } = req.body;

  const timestamp = Date.now().toString();
  const encrypted = encryptMessage(message, sessionKey);
  const payload = encrypted + timestamp;
  const hmac = generateHMAC(payload, sessionKey);

  // Save the session key (for test only)
  sessionKeys[`${from}_${to}`] = sessionKey;

  logEvent(`Encrypted message sent from ${from} to ${to}`);

  res.json({
    from,
    to,
    encrypted,
    timestamp,
    hmac
  });
});

router.post('/receive', (req, res) => {
  const { from, to, encrypted, timestamp, hmac } = req.body;
  const key = sessionKeys[`${from}_${to}`] || sessionKeys[`${to}_${from}`];

  if (!key) {
    return res.status(403).json({ message: 'No session key available' });
  }

  const expectedHmac = generateHMAC(encrypted + timestamp, key);
  if (expectedHmac !== hmac) {
    return res.status(400).json({ message: 'Message integrity check failed' });
  }

  const now = Date.now();
  if (now - parseInt(timestamp) > 2 * 60 * 1000) {
    return res.status(403).json({ message: 'Message expired (possible replay)' });
  }

  const decrypted = decryptMessage(encrypted, key);
  logEvent(`Message received by ${to} from ${from}`);

  res.json({
    from,
    to,
    message: decrypted
  });
});

module.exports = router;
