// Gemini AI Integration - Placeholder for API integration
// TODO: Add your Gemini API key to your .env file

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
  
  // --- FIX 1: Define a specific type for the context ---
  // This interface enforces the shape of the context object,
  // ensuring it has a 'properties' key.
  export interface QueryContext {
    properties: unknown[];
  }
  
  // --- FIX 2: Securely load the API key from environment variables ---
  // NEVER hard-code API keys. This loads it from a .env file.
  // Make sure your .env file has: VITE_GEMINI_API_KEY=your_key_here
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Add a check to ensure the key is loaded
  if (!GEMINI_API_KEY) {
    console.error("VITE_GEMINI_API_KEY is not set. Please add it to your .env file.");
    // You might want to throw an error here to stop the app from running
    // throw new Error("VITE_GEMINI_API_KEY is not set.");
  }
  
  export const queryAI = async (
    question: string,
    // --- FIX 1 (continued): Use the new QueryContext type instead of 'any' ---
    context?: QueryContext
  ): Promise<AIResponse> => {
    try {
    	// Format properties with emphasis on descriptions for context
    	const contextText = context?.properties
    	  ? `\n\n=== AVAILABLE PROPERTIES DATABASE ===\n\nIMPORTANT: Each property has a detailed description field that contains comprehensive context about the property. When answering questions about properties, you MUST use the description field as your primary source of information, along with other property details like location, type, class, price, occupancy, risks, and opportunities.\n\n${JSON.stringify(context.properties, null, 2)}\n\n=== END OF PROPERTIES DATABASE ===`
    	  : '';

    	const systemPrompt = `You are an expert CBRE real estate assistant powered by Google Gemini. Your role is to help users understand properties, market trends, risks, and opportunities in commercial real estate.

CRITICAL INSTRUCTIONS:
1. When users ask about specific properties, you MUST carefully read and use the "description" field from the properties database as your primary source of context. The description contains detailed information about each property's characteristics, location, market position, and context.

2. DO NOT rely solely on keyword matching. Instead, use semantic understanding based on the full description and all property details to provide accurate, contextual answers.

3. If a user asks about a property and you cannot find relevant information in the provided properties database, or if the question cannot be answered based on the available data, you MUST clearly state: "I'm not able to provide information about that property based on the available data. Could you provide more details or ask about a different property?"

4. When answering questions:
   - Reference specific property details from the database
   - Use the description field to provide context-rich answers
   - Mention relevant risks and opportunities when discussing properties
   - Include trust scores and occupancy rates when relevant
   - Be specific about locations, property types, and market conditions

5. Always be honest about what you know and don't know. If information is not in the database, say so clearly.

6. Provide professional, accurate, and helpful responses that demonstrate deep understanding of the property details provided.${contextText}`;
  
    // Check if the key exists before fetching
    	if (!GEMINI_API_KEY) {
    	  throw new Error("Gemini API key is missing.");
    	}
  
    // Abort controller for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    	  method: 'POST',
    	  headers: {
    	  	'Content-Type': 'application/json',
    	  },
    	  body: JSON.stringify({
        systemInstruction: {
          role: "system",
          parts: [{ text: systemPrompt }]
        },
        contents: [{
          role: "user",
          parts: [{ text: question }]
        }],
    	  	generationConfig: {
    	  	  temperature: 0.8,
    	  	  maxOutputTokens: 1024,
    	  	}
      }),
      signal: controller.signal
    	});
    clearTimeout(timeout);
  
    	if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} ${errText}`);
    	}
  
    	const data = await response.json();
    	const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
    	
    	// (Your placeholder data for confidence and sources remains unchanged)
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
    	// Return a user-friendly error response
    	return {
    	  answer: "Sorry, I ran into an error trying to get that information. Please try again later.",
    	  sources: [],
    	  confidence: 0,
    	};
    }
  };
  
  // (The rest of your file is unchanged)
  // Calculate trust score based on data sources and verification
  export const calculateTrustScore = (
    internalDataVerified: boolean,
    externalSourcesCount: number,
    dataFreshness: number, // days since update
    anomaliesDetected: number
  ): number => {
    let score = 0;
    // ... (rest of function)
    if (internalDataVerified) score += 40;
    score += Math.min(externalSourcesCount * 10, 30);
    if (dataFreshness <= 7) score += 20;
    else if (dataFreshness <= 30) score += 15;
    else if (dataFreshness <= 90) score += 10;
    else score += 5;
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