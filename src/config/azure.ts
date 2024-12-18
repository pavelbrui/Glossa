export const AZURE_CONFIG = {
  key: 'DzDZYDdLdSTFItlkhw38yjtElavKzM7NVPr2myA6HHeoGRd2zdsnJQQJ99AKACYeBjFXJ3w3AAAYACOGwxfq',
  region: 'eastus',
  endpoint: 'https://eastus.api.cognitive.microsoft.com/',
  speechRecognitionLanguage: 'en-US',
  targetLanguages: ['es', 'fr', 'ko', 'ru'] as const,
  languageMap: {
    'English': 'en',
    'Spanish': 'es',
    'French': 'fr',
    'Korean': 'ko',
    'Russian': 'ru'
  },
  voiceMap: {
    'es': 'es-ES-ElviraNeural',
    'fr': 'fr-FR-DeniseNeural',
    'ko': 'ko-KR-SunHiNeural',
    'ru': 'ru-RU-SvetlanaNeural'
  },
  recognitionConfig: {
    initialSilenceTimeoutMs: 5000,
    endSilenceTimeoutMs: 2000,
    phraseDetectionMode: 'Automatic',
    stablePartialResultThreshold: 3,
    audioBufferSize: 8192,
    sampleRate: 16000,
    minWordCount: 3,
    maxPartialLength: 200,
    commonPhrases: [
      "welcome to our church",
      "hope you have a good time",
      "we are glad you are here",
      "let us pray together",
      "in our congregation",
      "bless you all",
      "thank you for joining us"
    ],
    sentenceEndMarkers: ['.', '!', '?', ';'],
    minSentenceConfidence: 0.7
  }
};