# ⚡ Nitram AI Suite

**Nitram AI Suite** is a high-performance, multi-modal creative workspace powered by Google Gemini. It bridges the gap between complex reasoning, cinematic generation, and natural voice interaction within a single, unified professional interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![Powered By](https://img.shields.io/badge/powered%20by-Gemini%20API-orange?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 🌟 Core Intelligence Modules

### 💬 Chat Grounding (Gemini 3 Pro)
*   **Contextual Reasoning**: Deep logic and code generation capabilities.
*   **Search Integration**: Live Google Search grounding with automated source extraction and link generation.
*   **Rich Citations**: Every grounded claim is backed by verified web references.

### 🎙️ Voice Sync (Gemini 2.5 Native Audio)
*   **Low-Latency Conversation**: Real-time, continuous audio streaming for natural turn-taking.
*   **Native Multi-Modality**: Processes audio directly without intermediate text conversion for higher emotional fidelity.
*   **Live Transcripts**: Real-time visualization of the verbal exchange.

### 🎨 Vision Lab (Gemini 3 Pro Image)
*   **Professional Synthesis**: High-resolution image generation with manual Quality vs. Speed toggles.
*   **Pro Mode**: Access the high-fidelity Gemini 3 Pro Image model for publication-ready assets.
*   **One-Click Export**: Integrated download manager for all visual creations.

### 🎬 Motion Studio (Veo 3.1)
*   **Cinematic Video**: Text-to-Video generation using the state-of-the-art Veo 3.1 model.
*   **Aspect Control**: Support for both Landscape (16:9) and Portrait (9:16) cinematic outputs.
*   **Billed Key Support**: Secure flow for enterprise/paid project API key selection.

### 🌍 Geo Finder (Gemini 2.5 Maps)
*   **Spatial Grounding**: Integrated Google Maps tool for local discovery and navigation.
*   **Coordinate Awareness**: Browser-based geolocation support for ultra-relevant local results.

---

## 🛠️ Technical Implementation

-   **Frontend Engine**: React 19 (ES6 Modules)
-   **Styling**: Tailwind CSS with custom glassmorphism components.
-   **SDK**: `@google/genai` (Official Google Generative AI SDK).
-   **Audio**: Web Audio API with PCM stream decoding and scheduling.

---

## 🚀 Deployment Guide

### Setting up on Vercel

1.  **Fork the Repository** to your GitHub account.
2.  **Create a New Project** in Vercel and import your fork.
3.  **Environment Variables**:
    *   Navigate to *Project Settings > Environment Variables*.
    *   Add `API_KEY`: Your Google AI Studio API Key.
4.  **Permissions**:
    *   Ensure your browser permissions allow Microphone and Geolocation for the deployed domain.

### Running Locally

```bash
# Clone the repo
git clone https://github.com/yourusername/nitram-ai-suite.git

# Set your API Key in your local environment
export API_KEY=your_key_here

# Open index.html in a modern browser (use a local server like Live Server)
```

## 📐 Monitoring & Performance
The built-in **Operations Log** (accessible via the activity icon in the header) tracks:
*   API Method latency (ms).
*   Request status (Success/Pending/Error).
*   Operation timestamps for auditing performance.

---
*Developed by Wamuhu Martin. Built for the future of AI workflows.*