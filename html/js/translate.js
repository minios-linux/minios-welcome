// Get the user's locale from the browser with better Firefox support
const rawLocale = navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage || 'en';
const shortLocale = rawLocale.replace(/_/g, '-').substr(0, 2);
let loadedLocale = rawLocale;

function getLocaleCandidates(locale) {
    const candidates = [];
    const seen = new Set();
    const add = (value) => {
        if (value && !seen.has(value)) {
            seen.add(value);
            candidates.push(value);
        }
    };

    add(locale);
    add(locale.replace(/_/g, '-'));
    add(locale.replace(/-/g, '_'));
    add(locale.toLowerCase());
    add(locale.replace(/_/g, '-').toLowerCase());
    add(locale.replace(/-/g, '_').toLowerCase());

    return candidates;
}

function applyTranslations() {
    const translations = window.translations;
    console.log('Translations loaded for locale:', loadedLocale);
    console.log('Available translations:', Object.keys(translations));

    const elements = document.querySelectorAll(
        'title, span, a, p, h1, h2, h3, h4, h5, h6'
    );

    console.log('Found elements to translate:', elements.length);

    elements.forEach((element) => {
        const childNodes = element.childNodes;

        childNodes.forEach((node) => {
            if (node.nodeType !== Node.TEXT_NODE) {
                return;
            }

            const translationKey = node.nodeValue.trim();

            if ([' ', '.', '*', '\xa0', ''].includes(translationKey)) {
                return;
            }

            console.log('TK:', translationKey);

            if (translations[translationKey]) {
                node.nodeValue = translations[translationKey];
                console.log('TR:', translations[translationKey]);
            } else {
                console.log('No translation found for:', translationKey);
            }
        });
    });
}

function loadLocaleCandidates(candidates, index = 0) {
    if (index >= candidates.length) {
        console.log('No translation script found for locale:', rawLocale);
        return;
    }

    const candidate = candidates[index];
    const script = document.createElement('script');

    script.onload = () => {
        loadedLocale = candidate;
        console.log('Translations loaded from', script.src);
        applyTranslations();
    };

    script.onerror = () => {
        console.log('Failed to load', script.src, '- trying next candidate');
        loadLocaleCandidates(candidates, index + 1);
    };

    script.src = `./js/translations/${candidate}.js`;
    console.log('Attempting to load translations from', script.src);
    document.head.appendChild(script);
}

function loadTranslationScript() {
    const candidates = [...getLocaleCandidates(rawLocale)];

    if (shortLocale !== rawLocale) {
        getLocaleCandidates(shortLocale).forEach((candidate) => {
            if (!candidates.includes(candidate)) {
                candidates.push(candidate);
            }
        });
    }

    loadLocaleCandidates(candidates);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTranslationScript);
} else {
    loadTranslationScript();
}