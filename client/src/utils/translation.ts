// Web Speech API wrapper for pronunciation

export async function speakText(text: string, lang: string = 'fi-FI'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower than normal
    
    utterance.onend = () => {
      resolve();
    };
    
    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };
    
    window.speechSynthesis.speak(utterance);
  });
}

// Translation helper using API
export async function translateText(
  text: string, 
  sourceLanguage: string = 'en', 
  targetLanguage: string = 'fi'
): Promise<string> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.translation;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}
