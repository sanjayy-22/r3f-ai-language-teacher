import { create } from "zustand";

export const teachers = ["Nanami", "Naoki"];

export const useAITeacher = create((set, get) => ({
  messages: [],
  currentMessage: null,
  teacher: teachers[0],
  setTeacher: (teacher) => {
    set(() => ({
      teacher,
      messages: get().messages.map((message) => {
        message.audioPlayer = null; // New teacher, new Voice
        return message;
      }),
    }));
  },
  classroom: "default",
  setClassroom: (classroom) => {
    set(() => ({
      classroom,
    }));
  },
  loading: false,
  furigana: true,
  setFurigana: (furigana) => {
    set(() => ({
      furigana,
    }));
  },
  english: true,
  setEnglish: (english) => {
    set(() => ({
      english,
    }));
  },
  speech: "formal",
  setSpeech: (speech) => {
    set(() => ({
      speech,
    }));
  },
  askAI: async (question) => {
    if (!question) return;
    
    const message = {
      question,
      id: get().messages.length,
    };
    
    set(() => ({ loading: true }));

    try {
      const params = new URLSearchParams({
        question: question,
        speech: get().speech,
        provider: process.env.NEXT_PUBLIC_AI_PROVIDER || 'openrouter'
      });

      const response = await fetch(`/api/ai?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      message.answer = data;
      
      set((state) => ({
        messages: [...state.messages, message],
        loading: false,
      }));

      // TTS handling
      if (!message.audioPlayer) {
        set(() => ({ loading: true }));

        try {
          const text = message.answer.japanese
            .map((word) => word.word)
            .join(" ");

          const provider = process.env.NEXT_PUBLIC_SPEECH_PROVIDER || 'browser';
          
          if (provider !== 'browser') {
            const response = await fetch(
              `/api/tts?text=${encodeURIComponent(text)}&teacher=${get().teacher}&provider=${provider}`
            );
            
            if (!response.ok) {
              throw new Error('TTS API request failed');
            }

            const contentType = response.headers.get('Content-Type');
            if (contentType === 'audio/wav') {
              const audioBlob = await response.blob();
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              
              message.audioPlayer = audio;
              message.visemes = JSON.parse(response.headers.get('visemes') || '[]');
              
              audio.onended = () => {
                set(() => ({ currentMessage: null }));
              };
            } else {
              // Fallback to browser TTS
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.lang = 'ja-JP';
              utterance.rate = 1.0;
              utterance.pitch = 1.0;
              utterance.onend = () => {
                set(() => ({ currentMessage: null }));
              };
              message.audioPlayer = utterance;
            }
          } else {
            // Direct browser TTS
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.onend = () => {
              set(() => ({ currentMessage: null }));
            };
            message.audioPlayer = utterance;
          }

          set(() => ({
            loading: false,
            messages: get().messages.map((m) => {
              if (m.id === message.id) return message;
              return m;
            }),
          }));
        } catch (error) {
          console.error('TTS Error:', error);
          set(() => ({ loading: false }));
        }
      }

      if (message.audioPlayer) {
        if (message.audioPlayer instanceof Audio) {
          message.audioPlayer.play();
        } else {
          window.speechSynthesis.speak(message.audioPlayer);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      set(() => ({ loading: false }));
    }
  },
  playMessage: async (message) => {
    set(() => ({
      currentMessage: message,
    }));

    if (!message.audioPlayer) {
      set(() => ({
        loading: true,
      }));

      try {
        const text = message.answer.japanese
          .map((word) => word.word)
          .join(" ");

        // Get the selected provider from URL params or use browser as default
        const params = new URLSearchParams(window.location.search);
        const provider = params.get('provider') || 'browser';
        
        if (provider !== 'browser') {
          const response = await fetch(
            `/api/tts?text=${encodeURIComponent(text)}&teacher=${get().teacher}&provider=${provider}`
          );
          
          if (!response.ok) {
            throw new Error('TTS API request failed');
          }

          const contentType = response.headers.get('Content-Type');
          if (contentType === 'audio/wav') {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            message.audioPlayer = audio;
            message.visemes = JSON.parse(response.headers.get('visemes') || '[]');
            
            audio.onended = () => {
              set(() => ({
                currentMessage: null,
              }));
            };
          } else {
            // Handle browser TTS script response
            const script = await response.text();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onend = () => {
              set(() => ({
                currentMessage: null,
              }));
            };

            message.audioPlayer = utterance;
          }
        } else {
          // Direct browser TTS
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'ja-JP';
          utterance.rate = 1.0;
          utterance.pitch = 1.0;

          utterance.onend = () => {
            set(() => ({
              currentMessage: null,
            }));
          };

          message.audioPlayer = utterance;
        }

        set(() => ({
          loading: false,
          messages: get().messages.map((m) => {
            if (m.id === message.id) {
              return message;
            }
            return m;
          }),
        }));
      } catch (error) {
        console.error('TTS Error:', error);
        set(() => ({
          loading: false,
        }));
      }
    }

    if (message.audioPlayer) {
      window.speechSynthesis.speak(message.audioPlayer);
    }
  },
  stopMessage: (message) => {
    if (message.audioPlayer) {
      window.speechSynthesis.cancel();
    }
    set(() => ({
      currentMessage: null,
    }));
  },
}));
