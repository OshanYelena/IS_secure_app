const CryptoJS = require('crypto-js');

function encryptMessage(message, key) {
  return CryptoJS.AES.encrypt(message, key).toString();
}

function decryptMessage(ciphertext, key) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

function generateHMAC(message, key) {
  return CryptoJS.HmacSHA256(message, key).toString();
}

module.exports = {
  encryptMessage,
  decryptMessage,
  generateHMAC
};
