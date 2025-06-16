import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, isEncrypted } from '../encryption';

describe('Encryption Utility', () => {
  const testContent = 'This is a test content';
  const testPassword = 'test-password';

  describe('encrypt', () => {
    it('should encrypt content successfully', () => {
      const encrypted = encrypt(testContent, testPassword);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testContent);
      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('should throw error for empty content', () => {
      expect(() => encrypt('', testPassword)).toThrow();
    });

    it('should throw error for empty password', () => {
      expect(() => encrypt(testContent, '')).toThrow();
    });
  });

  describe('decrypt', () => {
    it('should decrypt content successfully', () => {
      const encrypted = encrypt(testContent, testPassword);
      const decrypted = decrypt(encrypted, testPassword);
      expect(decrypted).toBe(testContent);
    });

    it('should throw error for wrong password', () => {
      const encrypted = encrypt(testContent, testPassword);
      expect(() => decrypt(encrypted, 'wrong-password')).toThrow();
    });

    it('should throw error for invalid encrypted content', () => {
      expect(() => decrypt('invalid-content', testPassword)).toThrow();
    });
  });

  describe('isEncrypted', () => {
    it('should detect encrypted content', () => {
      const encrypted = encrypt(testContent, testPassword);
      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('should detect non-encrypted content', () => {
      expect(isEncrypted(testContent)).toBe(false);
    });

    it('should handle invalid input', () => {
      expect(isEncrypted('')).toBe(false);
      expect(isEncrypted(null)).toBe(false);
      expect(isEncrypted(undefined)).toBe(false);
    });
  });

  describe('encryption roundtrip', () => {
    it('should handle special characters', () => {
      const specialContent = '!@#$%^&*()_+{}|:"<>?~`-=[]\\;\',./';
      const encrypted = encrypt(specialContent, testPassword);
      const decrypted = decrypt(encrypted, testPassword);
      expect(decrypted).toBe(specialContent);
    });

    it('should handle unicode characters', () => {
      const unicodeContent = 'Hello, 世界! 🌍';
      const encrypted = encrypt(unicodeContent, testPassword);
      const decrypted = decrypt(encrypted, testPassword);
      expect(decrypted).toBe(unicodeContent);
    });

    it('should handle long content', () => {
      const longContent = 'a'.repeat(1000);
      const encrypted = encrypt(longContent, testPassword);
      const decrypted = decrypt(encrypted, testPassword);
      expect(decrypted).toBe(longContent);
    });
  });
}); 