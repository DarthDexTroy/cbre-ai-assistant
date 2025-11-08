# TrustEstate AI - Setup TODO List

This is your comprehensive guide to complete the setup of your AI-powered real estate platform. Follow these steps to add the required API keys and enable all features.

## 🔑 Required API Keys

### 1. Google Maps API Key
**What it enables:** Interactive map with property markers, clustering, heatmap overlays, and location services

**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geolocation API (optional, for user location)
4. Go to "Credentials" and create an API key
5. Restrict the key to your domain for security

**Where to add it:**
- File: `src/components/MapView.tsx`
- Line: ~24
- Replace: `YOUR_GOOGLE_MAPS_API_KEY_HERE`

```typescript
const GOOGLE_MAPS_API_KEY = "AIzaSyB..."; // Your actual key here
```

**Cost:** Google Maps offers $200 free credit per month, sufficient for development and moderate usage.

---

### 2. Google Gemini API Key
**What it enables:** 
- AI-powered chat assistant
- Natural language property queries
- Risk analysis and market insights
- Multi-source data verification
- Confidence scoring

**How to get it:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

**Where to add it:**
- Option 1 (Recommended): Add as environment variable
  - Create a `.env` file in the root directory
  - Add: `VITE_GEMINI_API_KEY=your_key_here`
  
- Option 2: Direct in code
  - File: `src/lib/gemini.ts`
  - In the `queryAI` function (around line 28)
  - Uncomment the API implementation code and add your key

```typescript
// Example implementation in gemini.ts
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const response = await fetch(
  'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    // ... rest of configuration
  }
);
```

**Cost:** Gemini API offers generous free tier with rate limits. Check [pricing](https://ai.google.dev/pricing) for details.

---

## 🎯 Features Currently Using Mock Data

These features are fully implemented in the UI but need API keys to function with real data:

### With Google Maps API:
- ✅ Interactive map navigation
- ✅ Property pin markers with clustering
- ✅ Custom status-based marker colors
- ✅ Heatmap overlays
- ✅ Zoom/pan controls
- ✅ User geolocation

### With Gemini API:
- ✅ Natural language chat interface
- ✅ Property search queries
- ✅ Risk assessment
- ✅ Market analysis
- ✅ Multi-source verification
- ✅ Confidence scoring
- ✅ Source citation

---

## 🏗️ Additional Optional Enhancements

### 1. Voice Input
Currently shows a placeholder toast. To implement:

**Web Speech API (Free, browser-based):**
```typescript
// In src/components/AIChat.tsx
const recognition = new (window as any).webkitSpeechRecognition();
recognition.continuous = false;
recognition.onresult = (event: any) => {
  const transcript = event.results[0][0].transcript;
  setInput(transcript);
};
recognition.start();
```

No API key needed - uses browser's built-in speech recognition.

---

### 2. Enhanced Data Sources
The platform currently uses `src/data/properties.json` as the mock CBRE database.

**To integrate real data sources:**
1. Add Supabase or Firebase for backend database
2. Set up API endpoints for property data
3. Implement real-time updates
4. Add authentication for secure access

---

### 3. Advanced AI Features with Gemini

**Implement Google Search Grounding:**
```typescript
// In gemini.ts queryAI function
tools: [{
  googleSearch: {} // Enables real-time web search
}]
```

This allows Gemini to:
- Search web for real-time market data
- Verify property information from public records
- Find recent news about properties/areas
- Cross-reference multiple data sources

---

## 📝 Environment Variables Template

Create a `.env` file in the project root:

```env
# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here

# Google Gemini
VITE_GEMINI_API_KEY=your_gemini_key_here

# Optional: Backend Configuration
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

---

## 🚀 Testing After Setup

Once you've added your API keys:

1. **Test Google Maps:**
   - Open the app
   - Verify map loads with real tiles
   - Click property markers
   - Test zoom/pan controls

2. **Test Gemini AI:**
   - Open AI chat panel
   - Ask: "What are the key risks for Class A office space in downtown Austin?"
   - Verify you get a real AI response (not mock data)
   - Check that sources are listed

3. **Test Voice Input (if implemented):**
   - Click microphone icon
   - Grant browser permissions
   - Speak a query
   - Verify transcription appears

---

## 🔒 Security Best Practices

1. **Never commit API keys to Git:**
   - Add `.env` to `.gitignore`
   - Use environment variables
   - Rotate keys if exposed

2. **Restrict API keys:**
   - Google Maps: Restrict to your domain
   - Gemini: Set usage quotas
   - Monitor API usage regularly

3. **Production deployment:**
   - Use server-side API calls for sensitive operations
   - Implement rate limiting
   - Add authentication for user actions

---

## 📚 Documentation Links

- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [React Best Practices](https://react.dev/)

---

## ✅ Quick Start Checklist

- [ ] Create Google Cloud project
- [ ] Enable Maps JavaScript API
- [ ] Create Maps API key
- [ ] Add Maps key to MapView.tsx
- [ ] Create Gemini API key
- [ ] Add Gemini key to .env or gemini.ts
- [ ] Test map loads correctly
- [ ] Test AI chat works with real responses
- [ ] (Optional) Implement voice input
- [ ] (Optional) Set up backend database
- [ ] Deploy to production

---

## 💡 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify API keys are correct
3. Ensure APIs are enabled in Google Cloud Console
4. Check API usage quotas
5. Review the code comments in MapView.tsx and gemini.ts

---

**🎉 Once setup is complete, your TrustEstate AI platform will have:**
- Real-time interactive maps
- Intelligent AI assistance
- Multi-source data verification
- Trust scoring system
- Property tracking & alerts
- Beautiful, responsive UI
- Professional real estate tools

Happy building! 🏢✨
