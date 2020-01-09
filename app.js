
(function() {
    const projLinks = document.getElementsByClassName("links__link");
    for (let i = 0; i < projLinks.length; i++) {
        let origText, origFontSize = "";
        projLinks[i].addEventListener("mouseenter", underConstructionMessage);
    }
})();

function underConstructionMessage(e) {
    let origWinWidth = window.innerWidth;
    let origText = e.target.innerHTML;
    let origFontSize = window.getComputedStyle(e.target).getPropertyValue("font-size");
    if (e.target.classList.contains("disabled")) {
        e.target.style.cursor = "default";
        e.target.innerHTML = "Under construction!";
        e.target.style.fontSize = (origFontSize === "16px") ? "15px" : "17px";
        e.target.onclick = () => e.preventDefault();
        e.target.onmouseleave = () => {
            e.target.innerHTML = origText;
            e.target.style.fontSize = origFontSize;
        }
        window.onresize = () => {
            if (origWinWidth < 575 && window.innerWidth > 575) {
                e.target.style.fontSize = "20px";
            } else if (origWinWidth > 575 && window.innerWidth < 575) {
                e.target.style.fontSize = "16px";
            }
        }
    }
}