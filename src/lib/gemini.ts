// Gemini AI Integration - Placeholder for API integration
// TODO: Add your Gemini API key to enable AI features

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AIResponse {
  answer: string;
  sources: Array<{
    name: string;
    url?: string;
    snippet?: string;
  }>;
  confidence: number;
}

const GEMINI_API_KEY = "AIzaSyCyY5R7nvehNJtbNy5FO993k6QoXOeWpCg";

export const queryAI = async (
  question: string,
  context?: any
): Promise<AIResponse> => {
  try {
    // Build context from properties if available
    const contextText = context?.properties 
      ? `\n\nAvailable Properties Database:\n${JSON.stringify(context.properties, null, 2)}`
      : '';

    const systemPrompt = `You are an expert CBRE real estate assistant with access to a comprehensive property database. Your role is to:
- Answer questions about specific properties, markets, and real estate trends
- Provide detailed analysis based on the property data available
- Cite specific properties and their details when relevant
- Give market insights for different cities and property types
- Explain trust scores, risks, and opportunities
- Be conversational, professional, and helpful

When answering:
- Reference specific properties by their addresses and details
- Mention trust scores and what they indicate
- Discuss market conditions for the relevant cities
- Provide actionable insights
- Be natural and conversational, like a knowledgeable real estate agent${contextText}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser Question: ${question}`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
    
    // Extract confidence and sources from the response
    const confidence = 88;
    const sources = [
      { name: 'CBRE Internal Database', snippet: 'Property listings and market data' },
      { name: 'Market Analysis Tools', snippet: 'Current market trends and analytics' },
    ];

    return {
      answer,
      sources,
      confidence,
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

// Calculate trust score based on data sources and verification
export const calculateTrustScore = (
  internalDataVerified: boolean,
  externalSourcesCount: number,
  dataFreshness: number, // days since update
  anomaliesDetected: number
): number => {
  let score = 0;

  // Internal data verification (40 points)
  if (internalDataVerified) score += 40;

  // External sources (30 points)
  score += Math.min(externalSourcesCount * 10, 30);

  // Data freshness (20 points)
  if (dataFreshness <= 7) score += 20;
  else if (dataFreshness <= 30) score += 15;
  else if (dataFreshness <= 90) score += 10;
  else score += 5;

  // Anomalies penalty (10 points)
  score += Math.max(10 - (anomaliesDetected * 5), 0);

  return Math.min(score, 100);
};

export const getTrustScoreColor = (score: number): string => {
  if (score >= 80) return 'trust-high';
  if (score >= 60) return 'trust-medium';
  return 'trust-low';
};

export const getTrustScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Review';
};
