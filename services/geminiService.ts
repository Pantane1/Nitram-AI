import { GoogleGenAI, Modality } from "@google/genai";
import { MODELS } from "../constants.tsx";

export const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const encodeBase64 = (bytes: Uint8Array) => {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export class GeminiService {
  private getClient(): GoogleGenAI {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Missing API Key. Please ensure a key is connected.");
    }
    return new GoogleGenAI({ apiKey });
  }

  public static isPermissionError(error: any): boolean {
    const msg = error?.message?.toLowerCase() || "";
    return msg.includes("permission") || msg.includes("403") || msg.includes("billing");
  }

  async chatWithGrounding(message: string, history: any[] = []) {
    const ai = this.getClient();
    const contents = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: MODELS.CHAT,
      contents: contents as any,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || '',
      title: chunk.web?.title || 'Verified Source'
    })).filter((s: any) => s.uri) || [];

    return {
      text: response.text || "I'm sorry, I couldn't process that request.",
      sources
    };
  }

  async generateImage(prompt: string, isPro: boolean = false) {
    const ai = this.getClient();
    const model = isPro ? MODELS.VISION_PRO : MODELS.VISION_FAST;
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response.");
  }

  async generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') {
    const ai = this.getClient();
    let operation = await ai.models.generateVideos({
      model: MODELS.MOTION,
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const apiKey = process.env.API_KEY;
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!response.ok) throw new Error("Failed to download video asset.");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  async getMapGrounding(query: string, lat?: number, lng?: number) {
    const ai = this.getClient();
    const toolConfig = lat && lng ? {
      retrievalConfig: {
        latLng: { latitude: lat, longitude: lng }
      }
    } : undefined;

    const response = await ai.models.generateContent({
      model: MODELS.MAPS,
      contents: query,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.maps?.uri || chunk.web?.uri || '',
      title: chunk.maps?.title || chunk.web?.title || 'Location'
    })).filter((s: any) => s.uri) || [];

    return {
      text: response.text || "",
      sources
    };
  }

  connectLive(callbacks: any) {
    const ai = this.getClient();
    return ai.live.connect({
      model: MODELS.VOICE,
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: 'You are Nitram, a professional AI assistant.'
      }
    });
  }
}