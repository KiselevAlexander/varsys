const LANGUAGES = ['en', 'ru'];
const DEFAULT_LANGUAGE = 'en';

function checkLanguage(language) {
    if (!language || LANGUAGES.indexOf(language.toLowerCase()) === -1) {
        return false;
    }
    return true;
}

function detectLanguage() {
    const lng = (navigator && navigator.language && navigator.language.split('-')[0].toLowerCase());
    return checkLanguage(lng) ? lng : null;
}

const LNG_LS_ITEM = 'LNG_LS_ITEM';


function getLanguageFromCache() {
    return localStorage.getItem(LNG_LS_ITEM);
}

function setLanguageToCache(language) {
    localStorage.setItem(LNG_LS_ITEM, language);
}

let language;
export function getLanguage() {
    const newLanguage = language
        || getLanguageFromCache()
        || detectLanguage()
        || DEFAULT_LANGUAGE;

    if (newLanguage !== language) {
        language = newLanguage;
        setLanguageToCache(language);
    }

    return language;
}
