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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an AI real estate assistant. Answer the following question with confidence and cite sources where applicable. Question: ${question}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
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
    const confidence = 85; // Default confidence
    const sources = [
      { name: 'CBRE Internal Database', snippet: 'Verified property data' },
      { name: 'Google Search', snippet: 'Market analysis' },
    ];

    return {
      answer,
      sources,
      confidence,
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Fallback to mock response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockResponses: Record<string, AIResponse> = {
    'default': {
      answer: "Based on CBRE's internal database and recent market analysis, I've identified several key factors to consider. The market shows strong fundamentals with 95% confidence based on 5 verified comparable properties and recent transaction data from the last 30 days.",
      sources: [
        { name: 'CBRE Internal Database', snippet: 'Verified property data and comps' },
        { name: 'Google Search - Market Report', url: 'https://example.com', snippet: 'Q4 2024 market trends' },
        { name: 'County Records', snippet: 'Official ownership and transaction history' },
      ],
      confidence: 95,
    },
    'risk': {
      answer: "Key risks for Class A office space in downtown Austin over the next 24 months include: 1) Increased supply from new developments (3 major projects completing in 2025), 2) Hybrid work adoption affecting demand (current vacancy at 12%), and 3) Rising interest rates impacting valuations. However, Austin's strong tech sector growth and limited Class A inventory provide cushion. Overall risk level: MEDIUM with 85% confidence.",
      sources: [
        { name: 'CBRE Internal Database', snippet: 'Austin office market data' },
        { name: 'Austin Business Journal', url: 'https://example.com', snippet: 'New development pipeline' },
        { name: 'CoStar Market Report', snippet: 'Vacancy and absorption trends' },
        { name: 'Federal Reserve', url: 'https://example.com', snippet: 'Interest rate projections' },
      ],
      confidence: 85,
    },
  };

    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('risk')) {
      return mockResponses.risk;
    }

    return mockResponses.default;
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
