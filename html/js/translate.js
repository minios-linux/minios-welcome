// Get the user's locale from the browser with better Firefox support
const fullLocale  = navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage || 'en';
const shortLocale = fullLocale.substr(0, 2);
let loadedLocale  = fullLocale;

// Dynamically create a script element
const script = document.createElement('script');

script.onload = () => {
    let translations = window.translations;
    console.log('Translations loaded for locale:', loadedLocale);
    console.log('Available translations:', Object.keys(translations));

    // Select all elements with title, span, a, p, h1, h2, h3, h4, h5, h6 tags
    let elements = document.querySelectorAll(
        'title, span, a, p, h1, h2, h3, h4, h5, h6'
    );
    
    console.log('Found elements to translate:', elements.length);
    
    elements.forEach((element) => {
        // Get all child nodes of the element
        let childNodes = element.childNodes;

        childNodes.forEach((node) => {
            // Check if the node is a text node
            if (node.nodeType === Node.TEXT_NODE) {
                // Get the translation key from the node's text content
                let translationKey = node.nodeValue.trim();

                // Check if the translation key is a single non-breaking space, dot, asterisk, space, or empty
                if ([' ', '.', '*', '\xa0', ''].includes(translationKey)) {
                    return; // Skip this iteration
                }

                console.log('TK:', translationKey);
                
                // If a translation exists for the key, replace the node's text content
                if (translations[translationKey]) {
                    node.nodeValue = translations[translationKey];
                    console.log('TR:', translations[translationKey]);
                } else {
                    console.log('No translation found for:', translationKey);
                }
            }
        });
    });
};

script.onerror = () => {
    if (loadedLocale !== shortLocale) {
        console.log('Translation script for full locale failed, falling back to short locale:', shortLocale);
        loadedLocale = shortLocale;
        
        // Create a new script element for fallback
        const fallbackScript = document.createElement('script');
        fallbackScript.onload = script.onload;
        fallbackScript.onerror = () => {
            console.log('Error loading the fallback translation script.');
        };
        
        fallbackScript.src = `./js/translations/${shortLocale}.js`;
        console.log('Attempting to load fallback translations from', fallbackScript.src);
        document.head.appendChild(fallbackScript);
    } else {
        console.log('Error loading the translation script.');
    }
};

// Function to load translation script
function loadTranslationScript() {
    // start with full locale, fallback happens in onerror
    script.src = `./js/translations/${loadedLocale}.js`;
    console.log('Attempting to load translations for locale:', loadedLocale, 'from', script.src);
    
    // Append the script to the document
    document.head.appendChild(script);
}

// Wait for DOM to be ready, especially important for Firefox
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTranslationScript);
} else {
    // DOM is already loaded
    loadTranslationScript();
}
