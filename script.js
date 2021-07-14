window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-0HK5QMV1SG');

//Open and close collapsibles
const coll = document.getElementsByClassName("dropcircle");
for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.parentNode.getElementsByClassName("arrow")[0].classList.toggle("contentopen");
    this.parentNode.classList.toggle("contentopen");
    const content = this.parentNode.nextElementSibling;
    if (content.style.maxHeight) {//close
      content.style.maxHeight = content.scrollHeight + "px";
      setTimeout(function() {content.style.maxHeight = null;}, 1);//delay so js runs these separately, won't animate otherwise
    } else {//open
      content.style.maxHeight = content.scrollHeight + "px";
      content.addEventListener("transitionend", function() {
        content.style.maxHeight = "none";
      }, { once: true });
    }
  });
}

//Allow arrow transform animations
window.addEventListener("load", () => {
  const arrows = document.getElementsByClassName('arrow');
  for (let i = 0; i < arrows.length; i++) {
    arrows[i].classList.remove("preload");
  }
});

//Ripples
const circs = document.getElementsByClassName("ripplecircle");
for (const circ of circs) {
  circ.addEventListener("click", event => {
    const circle = event.currentTarget;
    const ripple = document.createElement("span");
    const diameter = Math.max(circle.clientWidth, circle.clientHeight);
    const radius = diameter / 2;
    ripple.style.width = ripple.style.height = diameter + "px";
    ripple.style.left = event.clientX - (circle.offsetLeft + radius) + "px";
    ripple.style.top = event.clientY - (circle.offsetTop + radius) + window.scrollY + "px";
    ripple.classList.add("ripple");
    const pastRipple = circle.getElementsByClassName("ripple")[0];
    if (pastRipple) ripple.remove();
    circle.appendChild(ripple);
  });
}
