//Open and close collapsibles
const coll = document.getElementsByClassName("dropcircle");
for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.parentNode.getElementsByClassName("arrow")[0].classList.toggle("contentopen");
    this.parentNode.classList.toggle("contentopen");
    const content = this.parentNode.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      //Resize content on each image load for first open
      let imgDiv = content.getElementsByClassName("cards checkload")[0];
      if (typeof(imgDiv) != "undefined" && imgDiv != null) {
        imgDiv.classList.remove("checkload");
        for (const img of content.getElementsByTagName("img")) {
          img.onload = function() {
            content.style.maxHeight = content.scrollHeight + "px";
          };
        }
      }
    }
  });
}

//Resize content on window resize
window.addEventListener("resize", function() {
  const contents = document.getElementsByClassName('content');
  for (const content of contents) {
    if (content.style.maxHeight) {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  }
});

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
    ripple.style.top = event.clientY - (circle.offsetTop + radius)+ window.scrollY + "px";
    ripple.classList.add("ripple");
    const pastRipple = circle.getElementsByClassName("ripple")[0];
    if (pastRipple) ripple.remove();
    circle.appendChild(ripple);
  });
}
