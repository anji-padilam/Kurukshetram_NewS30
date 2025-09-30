// Utility functions for language handling

export interface Language {
  id: string | number;
  code: string;
  name: string;
  languageName?: string;
}

// Function to get selected language from localStorage
export const getSelectedLanguageFromStorage = (): Language | null => {
  try {
    const stored = localStorage.getItem("selectedLanguage");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error parsing stored language:", error);
  }
  return null;
};

// Map i18n languages to language IDs
export const getlanguage_idFromI18n = (): string => {
  const language_idMap: Record<string, string> = {
    'en': '5dd95034-d533-4b09-8687-cd2ed3682ab6',
    'te': '90255d91-aead-47c9-ba76-ea85e75dc68b',
    'hi': 'd9badd6f-ffb3-4fff-91aa-b14c7af45e06',
    'kn': '22172f29-f60e-4875-be34-1fdb05106e3d',
    'ur': 'ba9c4fc4-f346-470e-bdd4-8e3a6a0f3ed1',
    'ta': 'f316a270-bf20-4a2c-90ae-3cb19fae65fb',
  };
  
  const currentLang = localStorage.getItem('i18nextLng') || 'en';
  return language_idMap[currentLang] || language_idMap['en'];
};

// Get current language ID for API calls
export const getCurrentLanguageId = (): string => {
  const storedLanguage = getSelectedLanguageFromStorage();
  if (storedLanguage && storedLanguage.id) {
    return String(storedLanguage.id);
  }
  return getlanguage_idFromI18n();
};
