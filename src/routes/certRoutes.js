const express = require('express');
const fs = require('fs');
const path = require('path');
const { logEvent } = require('../utils/logger');
const router = express.Router();

const CERTS_DIR = path.join(__dirname, '../../certs');
const CA_CERT_PATH = path.join(CERTS_DIR, 'ca.crt');

// Get a user’s certificate
router.get('/cert/:username', (req, res) => {
  const username = req.params.username;
  const certPath = path.join(CERTS_DIR, `${username}.crt`);

  if (!fs.existsSync(certPath)) {
    return res.status(404).json({ message: 'Certificate not found' });
  }

  const cert = fs.readFileSync(certPath, 'utf8');
  res.send(cert);
});

// Verify a received certificate using CA
router.post('/verify-cert', (req, res) => {
  const { certPem } = req.body;
  const tmpPath = path.join(CERTS_DIR, 'temp_cert.pem');
  const caPath = CA_CERT_PATH;

  fs.writeFileSync(tmpPath, certPem);

  const { exec } = require('child_process');
  exec(`openssl verify -CAfile ${caPath} ${tmpPath}`, (err, stdout, stderr) => {
    fs.unlinkSync(tmpPath); // cleanup

    if (err || !stdout.includes(': OK')) {
      logEvent('Certificate verification failed');
      return res.status(400).json({ message: 'Invalid certificate' });
    }

    logEvent('Certificate verified successfully');
    res.json({ message: 'Certificate is valid and trusted' });
  });
});

module.exports = router;
