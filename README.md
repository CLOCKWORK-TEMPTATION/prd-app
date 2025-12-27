# PRD App: Research & Prototype Integration

This app connects Gemini Deep Research and multiple models to power product research, PRD generation, and prototype creation.

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
copy .env.example .env
# Edit .env and add provider keys if available
```

3. Start the backend (port 4000)

```bash
npm run server
```

4. Start the frontend (Vite on 5175)

```bash
npm run dev
```

The dev proxy forwards `/api` to `http://localhost:4000`.

## Environment Variables

- `APP_ALLOWED_ORIGINS`: Allowed origins for CORS (e.g., `http://localhost:5175`)
- `PORT`: Backend port (default `4000`)
- `GOOGLE_API_KEY`: Google Gemini API key (optional)
- `ANTHROPIC_API_KEY`: Anthropic API key (optional)
- `OPENAI_API_KEY`: OpenAI API key (optional)
- `GEMINI_FILE_SEARCH_STORE`: Custom file search store name for Gemini Deep Research (optional, default: `default-prd-store`)

If keys are missing, the backend returns stubbed results so the app works offline.

## New Features

### SSE Streaming with Reconnection
- The app now uses Server-Sent Events (SSE) for real-time streaming of Deep Research results
- Automatic reconnection with exponential backoff (up to 3 attempts)
- Fallback to traditional polling if SSE is unavailable
- Progress indicators show current status during research

### File Search for Gemini
- Enable file_search in the Product Research tab to leverage custom file stores
- Secure configuration with max_results, min_relevance_score, and citations
- Configure store names via `GEMINI_FILE_SEARCH_STORE` environment variable

### Provider/Model Tags
- All generated content now displays which provider and model was used
- Clear visual indicators in the UI for transparency
- Research tab: Shows Google Gemini Deep Research model
- PRD tab: Shows Gemini 2.5 Pro
- Prototype tab: Shows specific model for each version (Flash/Pro/Claude/GPT)

### Enhanced Error Handling
- Unified error normalization with user-friendly Arabic messages
- Automatic retry with exponential backoff and jitter (up to 3 attempts)
- Actionable error messages guide users on next steps
- Network errors, rate limits, and quota exceeded are handled gracefully

## Model Mapping

- Product Research (tab 1): Gemini Deep Research Agent via Interactions API
- PRD Generation (tab 2): `models/gemini-2.5-pro`
- Prototype (tab 3): `models/gemini-3-flash-preview`
- Alpha: `models/gemini-3-pro-preview`
- Beta: Anthropic `claude-sonnet-4-5`
- Pilot: OpenAI `gpt-5.2` (fallbacks to `gpt-5`, `gpt-4.1`, `o3-pro`)

## Notes

- Deep Research uses background tasks and polling. Streaming can be added via SSE.
- Keys are kept server-side only.
- Error responses are normalized; the UI shows toasts and progress.
# PRD to Prototype Application - Full Implementation

Complete implementation of all sections from the PRD to Prototype roadmap.

## Implemented Sections

### ✅ Sections 1 & 2: Onboarding & Templates
- Interactive Onboarding Tour with RTL support
- Smart Templates Library (SaaS, Mobile, E-commerce)
- See: `README-SECTIONS-1-2.md`

### ✅ Sections 3 & 4: AI Assistant & Progress Manager
- AI Writing Assistant with auto-complete
- Auto-save and Progress Management
- Session recovery features
- See: `README-SECTIONS-3-4.md`

### ✅ Sections 5 & 6: Guided Mode & Visual Examples
- Guided Mode vs Expert Mode toggle
- Visual Examples Carousel
- Step-by-step guidance with examples
- See: `README-SECTIONS-5-6.md`

### ✅ Sections 7 & 8
- Coming soon...

### ✅ Sections 9 & 10: Quality Scorer & User Portfolio
- PRD Quality Scoring System
- User Portfolio & Project Management
- See: Implementation details in section branches

### ✅ Sections 11-18
- Additional features (see individual section READMEs)

### ✅ Section 19: Compare Versions
- Side-by-side version comparison
- Diff viewer
- A/B testing features

---

## Quick Start

```bash
npm install
npm run dev
```

## Project Structure

```
prd-app/
├── src/
│   ├── components/     # React components from all sections
│   ├── contexts/       # React contexts (AppMode, etc.)
│   ├── services/       # Business logic services
│   ├── types/          # TypeScript definitions
│   └── index.ts        # Main export file
├── README-SECTIONS-*.md # Section-specific documentation
└── INTEGRATION_GUIDE.md # Integration instructions
```

## Features

- 🌍 Full bilingual support (English/Arabic) with RTL
- 💾 Auto-save and progress management
- 🤖 AI-powered writing assistance
- 📊 Quality scoring and analytics
- 🎨 Visual examples and guidance
- 📝 Template library
- 🔄 Version comparison
- 👤 User portfolio management

## Documentation

- See `README-SECTIONS-*.md` files for detailed section documentation
- See `INTEGRATION_GUIDE.md` for integration instructions
- See `src/types/index.ts` for TypeScript interfaces

## License

MIT
