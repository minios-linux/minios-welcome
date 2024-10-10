// Get the user's language from the browser
let userLanguage = navigator.language || navigator.userLanguage;

// Use the first two characters of the user's language (e.g., "en", "ru")
userLanguage = userLanguage.substr(0, 2);

// Determine the script file to use based on the user's language
let languageScript = `./js/translations/${userLanguage}.js`;

// Dynamically create a script element
const script = document.createElement('script');
script.src = languageScript;

script.onload = () => {
    let translations = window.translations;

    // Select all elements with title, span, a, p, h1, h2, h3, h4, h5, h6 tags
    let elements = document.querySelectorAll(
        'title, span, a, p, h1, h2, h3, h4, h5, h6'
    );
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

                // If a translation exists for the key, replace the node's text content
                if (translations[translationKey]) {
                    node.nodeValue = translations[translationKey];
                }

                console.log('TK:', translationKey);
                console.log('TR:', translations[translationKey]);
            }
        });
    });
};

script.onerror = () => {
    console.log('Error loading the translation script.');
};

// Append the script to the document
document.head.appendChild(script);