# Nitram AI Suite 🚀

Nitram AI Suite is an advanced, multi-modal AI workspace designed for professionals and creators. Built with the latest Gemini 3 and 2.5 series models, it provides a unified interface for reasoning, visual creation, cinematic motion, and real-time voice interaction.

## ✨ Core Features

### 💬 Chat Grounding (Gemini 3 Pro)
*   **Real-time Intelligence**: Integrated Google Search grounding for up-to-the-minute information.
*   **Rich Citations**: Automated source extraction and linking for verified information.
*   **Complex Reasoning**: Powered by Gemini 3 Pro for advanced logic and coding tasks.

### 🎨 Vision Lab (Gemini 3 Pro Image)
*   **Professional Generation**: High-fidelity image creation with aspect ratio controls.
*   **Pro Mode**: Toggle between speed (Flash) and quality (Pro) for your creative needs.
*   **Instant Downloads**: Save your creations locally with one click.

### 🎬 Motion Studio (Veo 3.1)
*   **Cinematic Video**: Generate 720p cinematic sequences from text prompts.
*   **Flexible Ratios**: Support for 16:9 (Landscape) and 9:16 (Portrait) assets.
*   **Paid Key Support**: Integrated flow for selecting specific billing-enabled API keys for Veo operations.

### 🎙️ Voice Sync (Gemini 2.5 Native Audio)
*   **Human-like Interaction**: Low-latency, real-time audio conversation using the Native Audio API.
*   **Natural Responses**: Continuous stream of high-quality PCM audio for a fluid conversational experience.

### 🌍 Geo Finder (Gemini 2.5 Maps)
*   **Location Awareness**: Browser-based geolocation integration for relevant local results.
*   **Interactive Links**: Direct links to Google Maps for restaurants, landmarks, and businesses.

## 🛠️ Tech Stack

-   **Frontend**: React 19 (ESM), Tailwind CSS
-   **Icons**: FontAwesome 6, Material Symbols
-   **AI Core**: `@google/genai` (Google Generative AI SDK)
-   **Audio**: Web Audio API (ScriptProcessor & AudioBufferSource)

## 🚀 Getting Started

### Prerequisites
-   A Google AI Studio API Key.
-   For Video generation, a paid GCP project is required via the selection dialog.

### Environment Configuration
The application expects the following environment variable to be available:
```javascript
process.env.API_KEY // Your Gemini API Key
```

## 📐 Architecture

The app is built with a modular architecture:
-   `GeminiService`: A centralized wrapper for all AI interactions.
-   `AIView`: Enum-based state management for switching between workspace modules.
-   `MonitoringPanel`: A real-time log of API operations, status codes, and latency tracking.

## 🛡️ Security & Performance
-   **Privacy-First**: No personal data is stored; all AI interactions happen directly through the SDK.
-   **Optimized Rendering**: Lazy-loaded modules and CSS-based animations for a smooth 60FPS UI.
-   **Error Handling**: Robust retry logic and graceful degradation for API limitations.

---
*Built with curiosity by Wamuhu Martin.*