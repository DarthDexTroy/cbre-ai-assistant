**Inspiration**

Commercial real estate decisions involve significant capital, yet the market is often plagued by data opacity and fragmented information. Investors and analysts struggle with unverified listings, complex market trends, and a lack of standardized trust metrics. This information gap creates high-risk environments and missed opportunities. Inspired by the need for transparency and the power of generative AI, we envisioned TrustEstate AI, a platform that injects enterprise-grade trust verification and intelligent analytics into every real estate decision.

**What It Does**

TrustEstate AI revolutionizes real estate analysis by offering a comprehensive intelligence platform powered by Google Gemini. Users can effortlessly evaluate properties and markets by asking natural language questions and receiving verified, auditable answers. Key features include:

- **Trust-Scored AI**: An assistant that provides answers with confidence scores (0-100), source citations, and a full data-conflict breakdown.
- **Interactive Mapping**: Real-time Google Maps integration with custom-styled, color-coded property markers and detailed views.
- **In-Depth Analytics**: Visualize value history and occupancy trends with interactive charts for any selected property.
- **Comparison Tools**: Save, filter, and compare up to 3 properties side-by-side to analyze performance and key metrics.

**How We Built**

We developed TrustEstate AI by integrating a modern frontend stack with powerful third-party APIs to create a seamless and responsive user experience:

- **Conversational AI**: Utilized the **Google Gemini AI** API to power the assistant's analytical capabilities, including financial calculations (cap rates, DSCR) and risk assessment.
- **Mapping & Data Viz**: Integrated the **Google Maps JavaScript API** for interactive, custom-themed mapping and **Recharts** for visualizing all property analytics charts.
- **Frontend Stack**: Built with **React 18** and **TypeScript** for a type-safe, component-based UI, and used **Vite** for a rapid development server and build process.
- **Modern UI/UX**: Leveraged **Tailwind CSS** and **shadcn/ui** to create a responsive, dark-mode, glassmorphism-style dashboard with accessible components.

**Environment Variables**

Copy `.env.example` to `.env` and supply the two required keys:

```
VITE_GEMINI_API_KEY=your-google-gemini-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-browser-key
```

The `.env` file is gitignored, so add the same keys to your hosting provider (Vercel/Netlify/etc.) before building or deploying to ensure both Gemini chat and Google Maps continue to function.

**Challenges We Ran Into**

Developing an AI-native real estate platform presented several significant hurdles:

- **Data Trust Logic**: Designing and implementing the "Trust Verification System" was complex. It required creating a logical hierarchy to score confidence, cite multiple sources, and programmatically detect data conflicts.
- **API Integration**: Seamlessly combining and managing the state of multiple, distinct APIs (Google Maps, Gemini AI) and local property data into a single, cohesive user interface.
- **Performant Visualizations**: Ensuring the interactive charts and map markers remained fast and responsive, even when loading and filtering large property datasets.

**Accomplishments That We're Proud Of**

- **Trust-First AI**: Successfully built an AI assistant that goes beyond simple answers to provide a full trust breakdown, including confidence scores, citations, and data freshness.
- **Unified Interface**: Created a single-page application that seamlessly merges an interactive map, a powerful AI chat, and detailed property analytics into one intuitive dashboard.
- **Advanced Data Management**: Implemented robust property management tools, including advanced multi-criteria filtering, search, and a side-by-side comparison feature.
- **Polished UI/UX**: Delivered a responsive, accessible, and modern dark-mode interface using glassmorphism principles, Tailwind, and shadcn/ui.

**What We Learned**

Throughout the development of TrustEstate AI, we gained valuable insights:

- **AI Prompt Engineering**: Deepened our understanding of prompting generative AI (Gemini) to perform specific financial analyses and, crucially, to adhere to a strict, verifiable output format.
- **Complex State Management**: Learned the importance of robust state management in React to synchronize data and user interactions between multiple disconnected components (e.g., map, filters, and AI panel).
- **API Integration Strategies**: Gained expertise in integrating and managing multiple complex Google APIs, handling API key security, and managing asynchronous data flows effectively.
- **Component-Driven Design**: Recognized the power of a component library like shadcn/ui combined with Tailwind to rapidly build a consistent, accessible, and professional-grade application.

**What's Next for TrustEstate AI**

Looking ahead, we aim to expand and enhance TrustEstate AI to become an indispensable tool for all real estate professionals:

- **Backend & Auth**: Integrate a robust backend (like Supabase or Firebase) to enable user authentication, cloud storage for saved properties, and email alerts.
- **Live Web Data**: Implement Google Search Grounding to allow the AI assistant to access real-time web data for up-to-the-minute market insights.
- **Enhanced Mapping**: Add heatmap overlays for market trends (e.g., price changes, occupancy) and marker clustering to better handle dense urban areas.
- **Usability & Access**: Introduce voice input for the AI assistant, export-to-PDF/CSV functionality, and develop a dedicated mobile app version.
