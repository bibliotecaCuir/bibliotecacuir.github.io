(function () {
    document.documentElement.classList.add('motion-ready');

    const normalizeCaosText = (value) => value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ñ/g, 'n')
        .replace(/Ñ/g, 'N');

    const stripAccentsFromCaosElements = () => {
        document.querySelectorAll('body *').forEach((element) => {
            const family = window.getComputedStyle(element).fontFamily.toLowerCase();

            if (!family.includes('caosmarika')) {
                return;
            }

            element.childNodes.forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent = normalizeCaosText(node.textContent);
                }
            });
        });
    };

    stripAccentsFromCaosElements();
})();
