const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { logEvent } = require('../utils/logger');
const router = express.Router();

const CERTS_DIR = path.join(__dirname, '../../certs');

// POST /session/initiate
router.post('/initiate', (req, res) => {
  const { from, to } = req.body; // e.g., from=alice, to=bob

  // Load keys
  const senderPrivKey = fs.readFileSync(path.join(CERTS_DIR, `${from}.key`), 'utf8');
  const recipientPubCert = fs.readFileSync(path.join(CERTS_DIR, `${to}.crt`), 'utf8');
  const recipientPubKey = crypto.createPublicKey(recipientPubCert);
  const senderPriv = crypto.createPrivateKey(senderPrivKey);

  // Generate random session key
  const sessionKey = crypto.randomBytes(32).toString('base64');
  const timestamp = Date.now().toString();
  const message = `${sessionKey}:${timestamp}`;

  // Encrypt session key with recipient’s public key
  const encrypted = crypto.publicEncrypt(recipientPubKey, Buffer.from(message)).toString('base64');

  // Sign original message with sender's private key
  const sign = crypto.createSign('SHA256');
  sign.update(message);
  sign.end();
  const signature = sign.sign(senderPriv).toString('base64');

  logEvent(`Session key sent from ${from} to ${to}`);

  res.json({
    from,
    to,
    encryptedSession: encrypted,
    signature,
  });
});

router.post('/accept', (req, res) => {
  const { from, to, encryptedSession, signature } = req.body;

  try {
    // Load Bob's private key (recipient)
    const recipientPrivKeyPem = fs.readFileSync(path.join(CERTS_DIR, `${to}.key`), 'utf8');
    const recipientPrivKey = crypto.createPrivateKey(recipientPrivKeyPem);

    // Decrypt session
    const decrypted = crypto.privateDecrypt(
      recipientPrivKey,
      Buffer.from(encryptedSession, 'base64')
    ).toString();

    const [sessionKey, timestamp] = decrypted.split(':');

    // Validate timestamp (replay prevention)
    const now = Date.now();
    const timeDiff = now - parseInt(timestamp, 10);
    if (timeDiff > 2 * 60 * 1000) { // more than 2 minutes old
      return res.status(403).json({ message: 'Replay attack detected or session expired' });
    }

    // Load Alice’s public key
    const senderCert = fs.readFileSync(path.join(CERTS_DIR, `${from}.crt`), 'utf8');
    const senderPubKey = crypto.createPublicKey(senderCert);

    // Verify signature
    const verify = crypto.createVerify('SHA256');
    verify.update(`${sessionKey}:${timestamp}`);
    verify.end();

    const isValid = verify.verify(senderPubKey, Buffer.from(signature, 'base64'));

    if (!isValid) {
      logEvent(`Signature invalid for session from ${from} to ${to}`);
      return res.status(400).json({ message: 'Signature verification failed' });
    }

    logEvent(`Session key from ${from} accepted by ${to}`);
    res.json({
      message: 'Session key verified successfully',
      sessionKey, // You can encrypt this for demo safety
      from,
      to,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing session key' });
  }
});



module.exports = router;