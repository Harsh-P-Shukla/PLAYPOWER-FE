const stopwords = new Set([
  "about", "above", "after", "again", "against", "all", "am", "an", "and", "any",
  "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below",
  "between", "both", "but", "by", "could", "did", "do", "does", "doing", "down",
  "during", "each", "few", "for", "from", "further", "had", "has", "have", "having",
  "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if",
  "in", "into", "is", "it", "its", "itself", "let's", "me", "more", "most", "my",
  "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
  "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should",
  "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves",
  "then", "there", "these", "they", "this", "those", "through", "to", "too", "under",
  "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while",
  "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
]);

export function summarize(text) {
  const sentences = text.match(/[^.!?]*[.!?]/g) || [text];

  if (text.length < 100 || sentences.length <= 2) {
    return text;
  }

  const filtered = sentences.filter(s => s.trim().length > 20);
  const sorted = filtered.sort((a, b) => b.length - a.length);

  return sorted.slice(0, 2).join(' ').trim();
}

/**
 * Generates insights from the given text content
 * @param {string} text - The text content to analyze
 * @returns {Array} Array of insight objects
 */
export function generateInsights(text) {
  if (!text || text.trim() === '') {
    return [{
      type: 'error',
      message: 'No content to analyze'
    }];
  }

  try {
    const insights = [];

    // Word count
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    insights.push({
      type: 'wordCount',
      value: wordCount
    });

    // Reading time (assuming average reading speed of 200 words per minute)
    const readingTime = Math.ceil(wordCount / 200);
    insights.push({
      type: 'readingTime',
      value: readingTime
    });

    // Keywords
    const keywords = extractKeywords(text);
    insights.push({
      type: 'keywords',
      value: keywords
    });

    // Summary
    const summary = generateSummary(text);
    insights.push({
      type: 'summary',
      value: summary
    });

    // Sentiment analysis
    const sentiment = analyzeSentiment(text);
    insights.push({
      type: 'sentiment',
      value: sentiment
    });

    // Writing style analysis
    const writingStyle = analyzeWritingStyle(text);
    insights.push({
      type: 'writingStyle',
      value: writingStyle
    });

    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [{
      type: 'error',
      message: 'Failed to generate insights'
    }];
  }
}

/**
 * Extracts keywords from the text
 * @param {string} text - The text to analyze
 * @returns {Array} Array of keywords
 */
export function extractKeywords(text) {
  try {
    // Remove HTML tags
    const cleanText = text.replace(/<[^>]*>/g, '');
    
    // Split into words and count frequency
    const words = cleanText.toLowerCase().split(/\s+/);
    const wordCount = {};
    
    words.forEach(word => {
      if (word.length > 3 && !stopwords.has(word)) { // Only consider words longer than 3 characters and not in stopwords
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    // Sort by frequency and get top 5
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return [];
  }
}

/**
 * Generates a summary of the text
 * @param {string} text - The text to summarize
 * @returns {string} Summary of the text
 */
function generateSummary(text) {
  try {
    // Remove HTML tags
    const cleanText = text.replace(/<[^>]*>/g, '');
    
    // Split into sentences
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 2) {
      return cleanText;
    }

    // Take first and last sentence
    return `${sentences[0].trim()}. ${sentences[sentences.length - 1].trim()}.`;
  } catch (error) {
    console.error('Error generating summary:', error);
    return '';
  }
}

/**
 * Analyzes the sentiment of the text
 * @param {string} text - The text to analyze
 * @returns {string} Sentiment description
 */
function analyzeSentiment(text) {
  try {
    // Remove HTML tags
    const cleanText = text.replace(/<[^>]*>/g, '');
    
    // Simple sentiment analysis based on positive/negative words
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'love', 'wonderful', 'amazing'];
    const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'hate', 'horrible', 'disappointing'];
    
    const words = cleanText.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return 'neutral';
  }
}

/**
 * Analyzes the writing style of the text
 * @param {string} text - The text to analyze
 * @returns {Array} Array of writing style insights
 */
function analyzeWritingStyle(text) {
  try {
    // Remove HTML tags
    const cleanText = text.replace(/<[^>]*>/g, '');
    
    const insights = [];
    
    // Analyze sentence length
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((acc, s) => acc + s.split(/\s+/).length, 0) / sentences.length;
    
    if (avgSentenceLength > 20) {
      insights.push('Consider using shorter sentences for better readability');
    }
    
    // Analyze paragraph length
    const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const avgParagraphLength = paragraphs.reduce((acc, p) => acc + p.split(/\s+/).length, 0) / paragraphs.length;
    
    if (avgParagraphLength > 100) {
      insights.push('Consider breaking long paragraphs into smaller ones');
    }
    
    // Analyze vocabulary diversity
    const words = cleanText.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const diversity = uniqueWords.size / words.length;
    
    if (diversity < 0.5) {
      insights.push('Consider using more varied vocabulary');
    }
    
    return insights;
  } catch (error) {
    console.error('Error analyzing writing style:', error);
    return [];
  }
}
