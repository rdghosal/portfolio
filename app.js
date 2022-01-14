function initializePage() {
    initializeButtonLinks();
}

function initializeButtonLinks() {
    const buttonLinkMap = {
        ".hero__btn--view": "#portfolio",
        ".hero__btn--contact": "#contacts",
        ".nav__home-btn": "#"
    };

    Object.keys(buttonLinkMap).forEach(k => {
        let el = document.querySelector(k);        
        el.addEventListener('click', () => {
            window.location = `${window.location.origin + buttonLinkMap[k]}`;
        });
    });  
}

initializePage();
