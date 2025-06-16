import CryptoJS from 'crypto-js';

const ENCRYPTION_VERSION = '1';

/**
 * Encrypt content with AES encryption
 * @param {string} content Content to encrypt
 * @param {string} password Encryption password
 * @returns {string} Encrypted content
 * @throws {Error} If encryption fails
 */
export const encrypt = (content, password) => {
  try {
    if (!content || !password) {
      throw new Error('Content and password are required');
    }

    // Generate a random salt
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    
    // Derive key using PBKDF2
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 1000
    });

    // Generate random IV
    const iv = CryptoJS.lib.WordArray.random(128 / 8);

    // Encrypt the content
    const encrypted = CryptoJS.AES.encrypt(content, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });

    // Combine salt, IV, and encrypted content
    const result = {
      version: ENCRYPTION_VERSION,
      salt: salt.toString(),
      iv: iv.toString(),
      content: encrypted.toString()
    };

    return JSON.stringify(result);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt content');
  }
};

/**
 * Decrypt content with AES encryption
 * @param {string} encryptedContent Encrypted content
 * @param {string} password Decryption password
 * @returns {string} Decrypted content
 * @throws {Error} If decryption fails
 */
export const decrypt = (encryptedContent, password) => {
  try {
    if (!encryptedContent || !password) {
      throw new Error('Encrypted content and password are required');
    }

    // Parse the encrypted data
    const data = JSON.parse(encryptedContent);
    
    // Check version compatibility
    if (data.version !== ENCRYPTION_VERSION) {
      throw new Error('Incompatible encryption version');
    }

    // Convert salt and IV back to WordArray
    const salt = CryptoJS.enc.Hex.parse(data.salt);
    const iv = CryptoJS.enc.Hex.parse(data.iv);

    // Derive key using PBKDF2
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 1000
    });

    // Decrypt the content
    const decrypted = CryptoJS.AES.decrypt(data.content, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!result) {
      throw new Error('Decryption failed - invalid password');
    }

    return result;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt content');
  }
};

/**
 * Check if content is encrypted
 * @param {string} content Content to check
 * @returns {boolean} True if content is encrypted
 */
export const isEncrypted = (content) => {
  try {
    const data = JSON.parse(content);
    return data.version === ENCRYPTION_VERSION && 
           data.salt && 
           data.iv && 
           data.content;
  } catch {
    return false;
  }
};
