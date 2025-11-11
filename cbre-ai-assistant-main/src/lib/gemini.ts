// Gemini AI Integration - CBRE Trust-Layer Assistant
// Based on Flask implementation with structured JSON responses

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AIResponse {
  answer: string;
  sources: Array<{
    name: string;
    url: string;
    snippet: string;
    published_at?: string;
    type: string;
  }>;
  confidence: number;
  trust_breakdown?: {
    internal_used: boolean;
    external_count: number;
    freshness_days: number;
    agreements: string;
    conflicts: string;
    missing: string;
  };
}

export interface QueryContext {
  properties: unknown[];
}
  
// Gemini API configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

if (!GEMINI_API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set. Please add it to your .env file.");
}
  
export const queryAI = async (
  question: string,
  context?: QueryContext
): Promise<AIResponse> => {
  try {
    if (!question.trim()) {
      throw new Error("Please enter a question.");
    }

    // Format properties context for the AI
    const contextText = context?.properties
      ? `\n\n=== AVAILABLE PROPERTIES DATABASE ===\n\nIMPORTANT: Each property has a detailed description field that contains comprehensive context about the property. When answering questions about properties, you MUST use the description field as your primary source of information, along with other property details like location, type, class, price, occupancy, risks, and opportunities.\n\n${JSON.stringify(context.properties, null, 2)}\n\n=== END OF PROPERTIES DATABASE ===`
      : '';

    const systemPrompt = `SYSTEM — "CBRE Trust-Layer Assistant"

ROLE
You are an AI analyst embedded in a real-estate web app. Your job is not only to answer questions but to prove why the user should trust each answer. You fuse:
1) Internal data: the app passes a context object; if present, context.properties is the simulated CBRE database (properties.json) and is the primary source of truth.
2) External data: use your knowledge and reasoning to verify, contextualize, or challenge internal data based on market trends and real estate principles.

PRINCIPLES
- Precision over hype. If something is uncertain, say so and quantify it.
- Never invent facts, figures, or URLs. Prefer primary sources.
- Freshness matters. Prefer the most recent credible sources; report data timestamps.
- Transparency by default. Always return a confidence score and a source list.
- Strictly follow the response contract below (no extra top-level fields). The app will render answer (markdown), show confidence, and display sources.

WHAT TO DO FOR EACH REQUEST
1) Understand intent and scope (location, asset type/class, timeframe, metrics).
2) If context.properties exists, search it first for relevant assets; treat it as internal/"CBRE" data.
3) Analyze key claims (cap rates, vacancies, comps, permits, sales, zoning, macro trends).
4) Reconcile conflicts between internal vs external knowledge. Call out discrepancies explicitly.
5) Compute a confidence score (0–100) from: source quality & independence, recency, agreement among sources, coverage (sample size), and presence of anomalies.
6) Surface gaps: what's missing, noisy, or likely to change.
7) Return results in the schema below.

RESPONSE CONTRACT (JSON object only)
YOU MUST RETURN ONLY A VALID JSON OBJECT WITH NO MARKDOWN CODE BLOCKS OR EXTRA TEXT.
{
  "answer": string,                // Markdown. Concise but complete. Include bullet points/tables where helpful.
  "confidence": number,            // 0–100 integer. Your overall confidence in THIS answer.
  "sources": [                     // 2–8 items, ordered by importance
    {
      "name": string,              // Publisher or dataset name (e.g., "LA County Assessor", "CBRE Research", "WSJ")
      "url": string,               // Direct, openable link (use "#" if not available)
      "snippet": string,           // 1–2 lines summarizing why this source supports the answer
      "published_at": string,      // ISO date if known; else ""
      "type": string               // one of: "government", "news", "research", "listing/MLS", "company", "CBRE_internal", "other"
    }
  ],
  "trust_breakdown": {             // Keep brief; helps debugging UI; optional fields can be ""
    "internal_used": boolean,      // true if context.properties contributed facts
    "external_count": number,      // number of external sources considered
    "freshness_days": number,      // median age of data you relied on, in days (estimate if needed)
    "agreements": string,          // 1–2 lines: where sources agree
    "conflicts": string,           // 1–2 lines: where sources disagree
    "missing": string              // key data you could not find or verify
  }
}

ANSWER STYLE
- Put the conclusion first (one short paragraph).
- Then bullet points with the key drivers/risks or the steps/assumptions for any calculations (cap rate, DSCR, IRR, absorption, rent comps). Show formulas and inputs.
- If the user is on a specific property (detected via context or question), include a compact "Property snapshot" (price, size, type/class, last update, notable comps) and explicitly state anything that contradicts external sources.
- Keep claims traceable to sources returned in sources. Do not cite anything you didn't list.

TRUST / CONFIDENCE HEURISTIC (guidance, not shown to user)
Start at 50. Add up to +25 for multiple independent, high-quality sources in agreement; add up to +15 for recency (<90 days). Subtract up to −30 for conflicts or stale data, −20 for missing critical inputs. Clamp 0–100.

SAFETY & SECRETS
- Never display or echo API keys, headers, tokens, or environment variables.
- If a user requests private data you don't have, say you don't have access and proceed with public sources.
- No legal, tax, or investment advice; present as informational analysis.

FAILURE MODE
If you cannot verify key facts, return a lower confidence, clearly list "missing" in trust_breakdown, and keep the answer short with next steps (what to check, where).

EXAMPLES (abbrev.)

User: "What are key risks for Class A office in downtown Austin for the next 24 months?"
→ Return markdown summary (supply, sublease pipeline, rate trends, financing, regulatory/permit timelines), computed confidence, and 3–6 sources (CBRE Research if present in context, city permits dashboard, state comptroller/econ data, reputable news).

User: "Find industrial near Port of Long Beach with cold storage potential."
→ Use internal properties first; if none, say so. Use external listings/news/permits. Call out zoning/utilities, power availability, truck gates/turn radii, cold-chain tenants nearby. Provide sources and confidence.
${contextText}`;

    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key is missing.");
    }

    // Use gemini-2.0-flash-exp model (matches Flask app's gemini-flash-latest)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
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
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`Gemini API error: ${response.status} ${response.statusText}`, errText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawText) {
      throw new Error("No response generated from AI model.");
    }

    console.log('Raw AI response:', rawText);

    // Parse JSON response
    let parsedResponse: AIResponse;
    try {
      // Clean up response - remove markdown code blocks if present
      let cleanedText = rawText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '').replace(/```\n?$/g, '').trim();
      }

      parsedResponse = JSON.parse(cleanedText);
      
      // Validate required fields
      if (!parsedResponse.answer || !parsedResponse.sources || parsedResponse.confidence === undefined) {
        throw new Error("Invalid response structure from AI");
      }

      console.log('Parsed AI response:', parsedResponse);

    } catch (e) {
      console.error('Failed to parse AI response:', e);
      console.error('Raw text was:', rawText);
      
      // Fallback response
      parsedResponse = {
        answer: rawText || "I couldn't generate a proper response. Please try rephrasing your question.",
        confidence: 50,
        sources: [
          { 
            name: 'CBRE Internal Database', 
            snippet: 'Property listings and market data', 
            url: '#', 
            type: 'CBRE_internal' 
          }
        ],
        trust_breakdown: {
          internal_used: true,
          external_count: 0,
          freshness_days: 7,
          agreements: 'Limited data sources',
          conflicts: '',
          missing: 'Unable to fully process request'
        }
      };
    }

    return parsedResponse;

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Return user-friendly error response
    return {
      answer: "Sorry, I encountered an error processing your request. Please verify your API key is correct and try again.",
      sources: [
        {
          name: 'Error',
          snippet: error instanceof Error ? error.message : 'Unknown error',
          url: '#',
          type: 'other'
        }
      ],
      confidence: 0,
      trust_breakdown: {
        internal_used: false,
        external_count: 0,
        freshness_days: 0,
        agreements: '',
        conflicts: '',
        missing: 'API request failed'
      }
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