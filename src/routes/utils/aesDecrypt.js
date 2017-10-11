const crypto = require('crypto');

const key = process.env.AES_KEY;

function aesDecrypt(encrypted) {
  const decipher = crypto.createDecipher('aes192', key);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = aesDecrypt;
