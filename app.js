function initializePage() {
    initializeButtonLinks();
    intializeResumeBtn();
    initializeObservers();
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
            window.location = `${buttonLinkMap[k]}`;
        });
    });  
}

function intializeResumeBtn() {
    const btn = document.querySelector(".hero__btn--resume");
    btn.addEventListener("click", () => {
        window.open(
            "./assets/Resume_Rahul D Ghosal.pdf", "_blank"
        );
    });
}

const containerLinkMap = {
    "container--web": ".nav-link.web",
    "container--mobile": ".nav-link.mobile",
    "container--misc": ".nav-link.misc",
};

function initializeObservers() {

    const containers = document.querySelectorAll(".container");
    const options = {
        rootMargin: "-50% 0% 0% 0%"
    };

    const containerObserver = new IntersectionObserver((entries, containerObserver) => {
        entries.forEach(e => {

            const currClass = e.target.classList[0];

            if (e.isIntersecting) {
                toggleActiveNavLink(containerLinkMap[currClass], true);
            }
            else {
                toggleActiveNavLink(containerLinkMap[currClass], false);
            }
        });
    }, options);

    const cardObserver = new IntersectionObserver((entries, cardObserver) => {
        entries.forEach(e => {

            if (e.isIntersecting) {
                e.target.classList.add("display");
                cardObserver.unobserve(e.target);
            }            

        });
    }, options);

    containers.forEach((c) => {
        containerObserver.observe(c);
        const cards = c.querySelectorAll(".card");
        cards.forEach((card) => {
            cardObserver.observe(card);
        });
    });    
}

function toggleActiveNavLink(className, shouldActivate) {
    const navLink = document.querySelector(className);

    if (shouldActivate) {
        const prevLink = document.querySelector(".active");
        if (prevLink) {
            prevLink.classList.remove("active");
        }
        navLink.classList.add("active");    
    }
    else {
        navLink.classList.remove("active");
    }
}

initializePage();
