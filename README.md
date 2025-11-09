# TrustEstate AI

An AI-powered real estate platform with enterprise-grade trust verification, property analytics, and intelligent market insights powered by Google Gemini AI.

## 🏢 Overview

TrustEstate AI is a comprehensive real estate intelligence platform that combines interactive mapping, AI-powered analysis, and trust-scored property data to help users make informed real estate decisions. The platform features:

- **Interactive Google Maps** with property markers and detailed views
- **AI Assistant** powered by Google Gemini 2.0 Flash
- **Trust Verification System** with confidence scoring and source citation
- **Property Analytics** with value trends and occupancy tracking
- **Property Comparison** tools for side-by-side analysis
- **Advanced Filtering** and search capabilities

## ✨ Key Features

### 🗺️ Interactive Map Experience
- Real-time Google Maps integration with custom dark theme
- Property markers color-coded by status (For Sale, Off Market, Trending, Flagged)
- Click markers to view property details
- Zoom, pan, and geolocation controls
- Fullscreen mode for immersive viewing

### 🤖 AI-Powered Assistant
- **Trust-First Answers**: Every response includes a confidence score (0-100)
- **Source Verification**: 2-8 cited sources per answer with URLs and snippets
- **Trust Breakdown**: Internal vs external data usage, agreements, conflicts, missing data
- **Data Freshness**: Median age tracking in days
- **CBRE Internal Database**: Prioritizes properties.json as source of truth
- **Intelligent Analysis**: Cap rates, DSCR, IRR, absorption, rent comps with formulas
- **Risk Assessment**: Explicit conflict detection and gap identification

### 📊 Property Analytics
- Value history tracking over 12 months
- Occupancy trend visualization
- Performance metrics (growth, price per SF, market position)
- Interactive charts using Recharts

### 🔍 Property Management
- Save and bookmark properties
- Compare up to 3 properties side-by-side
- Advanced filtering (location, type, class, status, price, size, year, occupancy, trust score)
- Property search with real-time results
- Detailed property cards with images and key metrics

### 🎨 Modern UI/UX
- Glassmorphism design with dark mode optimization
- Responsive design for mobile and desktop
- Smooth animations and transitions
- Optimized image loading with automatic fallbacks
- Accessible components with proper ARIA labels

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- Google Maps API key
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cbre-ai-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

   Or update the API keys directly in:
   - `src/components/MapView.tsx` (line 37) for Google Maps
   - `src/lib/gemini.ts` (line 1) for Gemini

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:8080`

## 📖 Usage

### Using the AI Assistant

1. Click the "AI Assistant" button in the header
2. Ask questions about properties, market trends, or risks
3. Review the confidence score and sources
4. Check the trust breakdown for data quality insights

Example questions:
- "What are the key risks for Class A office space in downtown Austin?"
- "Find industrial properties near Port of Long Beach with cold storage potential"
- "Compare the occupancy rates of properties in Miami"

### Property Management

- **Save Properties**: Click the bookmark icon on any property card
- **View Saved**: Access from the sidebar menu
- **Compare Properties**: Select up to 3 properties to compare side-by-side
- **Filter Properties**: Use the filter button to refine by multiple criteria
- **View Analytics**: Select a property in the Analytics dialog to see trends

### Map Navigation

- **Zoom**: Use the +/- buttons or mouse wheel
- **Pan**: Click and drag the map
- **Locate**: Click the locate button to center on your position
- **View Details**: Click any property marker to see details
- **Fullscreen**: Click the maximize button for immersive viewing


## 🛠️ Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Google Maps JavaScript API** - Interactive maps
- **Google Gemini AI** - AI assistant
- **Recharts** - Data visualization
- **React Markdown** - Markdown rendering
- **React Router** - Navigation
- **Sonner** - Toast notifications

## 🎯 Future Enhancements

Potential features for future development:

- Voice input for AI assistant
- Google Search Grounding for real-time web data
- Backend integration (Supabase/Firebase)
- User authentication and cloud storage
- Heatmap overlays on map
- Marker clustering for dense areas
- Export property data to CSV/PDF
- Email alerts for property updates
- Mobile app version
