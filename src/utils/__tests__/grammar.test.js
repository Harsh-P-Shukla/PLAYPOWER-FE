import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGrammarSuggestions, applyGrammarSuggestion, getGrammarStats } from '../grammar';

describe('Grammar Utility', () => {
  const mockText = 'This is a test text with some grammer errors.';
  const mockSuggestions = [
    {
      message: 'Possible spelling mistake found',
      offset: 30,
      length: 7,
      replacements: ['grammar'],
      context: {
        text: 'This is a test text with some grammer errors.',
        offset: 30,
        length: 7
      }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('getGrammarSuggestions', () => {
    it('should fetch grammar suggestions successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ matches: mockSuggestions })
      });

      const result = await getGrammarSuggestions(mockText);
      expect(result).toEqual(mockSuggestions);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/check'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        })
      );
    });

    it('should handle empty text', async () => {
      await expect(getGrammarSuggestions('')).rejects.toThrow('Text cannot be empty');
    });

    it('should handle API errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(getGrammarSuggestions(mockText)).rejects.toThrow('Failed to fetch grammar suggestions');
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getGrammarSuggestions(mockText)).rejects.toThrow('Network error');
    });
  });

  describe('applyGrammarSuggestion', () => {
    it('should apply suggestion correctly', () => {
      const suggestion = mockSuggestions[0];
      const result = applyGrammarSuggestion(mockText, suggestion);
      expect(result).toBe('This is a test text with some grammar errors.');
    });

    it('should handle empty text', () => {
      const suggestion = mockSuggestions[0];
      expect(() => applyGrammarSuggestion('', suggestion)).toThrow('Text cannot be empty');
    });

    it('should handle invalid suggestion', () => {
      const invalidSuggestion = { ...mockSuggestions[0], offset: 1000 };
      expect(() => applyGrammarSuggestion(mockText, invalidSuggestion)).toThrow('Invalid suggestion');
    });
  });

  describe('getGrammarStats', () => {
    it('should return correct grammar stats', () => {
      const stats = getGrammarStats(mockSuggestions);
      expect(stats).toEqual({
        totalErrors: 1,
        errorTypes: {
          'Possible spelling mistake found': 1
        }
      });
    });

    it('should handle empty suggestions', () => {
      const stats = getGrammarStats([]);
      expect(stats).toEqual({
        totalErrors: 0,
        errorTypes: {}
      });
    });

    it('should handle multiple error types', () => {
      const multipleSuggestions = [
        ...mockSuggestions,
        {
          message: 'Missing space',
          offset: 10,
          length: 1,
          replacements: [' '],
          context: {
            text: 'This is a test text with some grammer errors.',
            offset: 10,
            length: 1
          }
        }
      ];

      const stats = getGrammarStats(multipleSuggestions);
      expect(stats).toEqual({
        totalErrors: 2,
        errorTypes: {
          'Possible spelling mistake found': 1,
          'Missing space': 1
        }
      });
    });
  });
}); 