const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '../../logs/auth.log');

function logEvent(message) {
  const entry = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(logPath, entry);
}

module.exports = { logEvent };
