import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { LovoAiApi } from '@lovo-ai/lovo-sdk';

export async function GET(req) {
  const text = req.nextUrl.searchParams.get("text");
  const teacher = req.nextUrl.searchParams.get("teacher");
  const provider = req.nextUrl.searchParams.get("provider") || 'browser';

  switch (provider) {
    case 'azure':
      if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
        console.warn('Azure credentials not found, falling back to browser TTS');
        return getBrowserTTSResponse(text);
      }
      return handleAzureTTS(text);
    case 'lovo':
      if (!process.env.LOVO_API_KEY) {
        console.warn('LOVO credentials not found, falling back to browser TTS');
        return getBrowserTTSResponse(text);
      }
      return handleLovoTTS(text);
    default:
      return getBrowserTTSResponse(text);
  }
}

async function handleAzureTTS(text) {
  try {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    speechConfig.speechSynthesisVoiceName = "ja-JP-NanamiNeural";
    
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    
    const result = await new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        result => resolve(result),
        error => reject(error)
      );
    });
    
    const audioData = result.audioData;
    synthesizer.close();
    
    return new Response(audioData, {
      headers: {
        "Content-Type": "audio/wav",
        "visemes": JSON.stringify(result.visemes || []),
      },
    });
  } catch (error) {
    console.error('Azure TTS Error:', error);
    return getBrowserTTSResponse(text);
  }
}

async function handleLovoTTS(text) {
  try {
    const lovoApi = new LovoAiApi(process.env.LOVO_API_KEY);
    
    const response = await lovoApi.tts({
      text: text,
      speaker_id: "JP-F-001", // Japanese female voice
      speed: 1.0,
      pitch: 1.0,
      format: "wav"
    });
    
    if (!response || !response.audioData) {
      throw new Error('Invalid LOVO API response');
    }
    
    return new Response(response.audioData, {
      headers: {
        "Content-Type": "audio/wav",
        "visemes": JSON.stringify([]), // LOVO doesn't provide visemes
      },
    });
  } catch (error) {
    console.error('LOVO TTS Error:', error);
    return getBrowserTTSResponse(text);
  }
}

function getBrowserTTSResponse(text) {
  const script = `
    const text = "${text}";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  `;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript",
      "visemes": JSON.stringify([]),
    },
  });
}
