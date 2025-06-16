import { describe, it, expect, vi } from 'vitest';
import { debounce, generateId, formatDate, truncateText, sanitizeHTML } from '../helpers';

describe('Helpers Utility', () => {
  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(fn).not.toHaveBeenCalled();

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-01T12:00:00');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan 1, 2024/);
      expect(formatted).toMatch(/12:00/);
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that needs to be truncated';
      const truncated = truncateText(longText, 20);
      expect(truncated.length).toBeLessThanOrEqual(23); // 20 + '...'
      expect(truncated).toEndWith('...');
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 20);
      expect(result).toBe(shortText);
    });
  });

  describe('sanitizeHTML', () => {
    it('should sanitize HTML content', () => {
      const html = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = sanitizeHTML(html);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Safe content');
    });

    it('should handle empty input', () => {
      expect(sanitizeHTML('')).toBe('');
      expect(sanitizeHTML(null)).toBe('');
      expect(sanitizeHTML(undefined)).toBe('');
    });
  });
}); 