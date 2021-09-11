/*Header resize*/
function headerHeight() {
  const base = window.innerWidth;
  const left = document.getElementById("left").clientHeight;
  const right = document.getElementById("right").clientHeight;
  const deg = 180 / Math.PI * Math.asin((right - left) / Math.sqrt(Math.pow(base, 2) + Math.pow(right - left, 2)));
  document.getElementById("headerBg").style.transform = "skewY(" + deg + "deg)";
  if (deg >= 0) {
    document.getElementById("headerBg").style["transform-origin"] = "top right";
  } else {
    document.getElementById("headerBg").style["transform-origin"] = "top left";
  }
}
headerHeight();
document.getElementById("headerBg").addEventListener("transitionend", function () {
  this.classList.add("transitionDisabled");
}, { once: true });
window.addEventListener("resize", headerHeight);

/*Open and close collapsibles*/
const coll = document.getElementsByClassName("dropcircle");
for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function () {
    const content = this.parentNode.nextElementSibling;
    if (content.style.maxHeight) {//close
      this.getElementsByClassName("arrow")[0].classList.remove("contentopen");
      this.parentNode.classList.remove("contentopen");
      content.style.maxHeight = content.scrollHeight + "px";
      setTimeout(function () {
        content.style.maxHeight = null;
        content.addEventListener("transitionend", function () {
          content.style.display = "none";
        }, { once: true });
      });//delay so js runs these separately, won't animate otherwise
    } else {//open
      this.getElementsByClassName("arrow")[0].classList.add("contentopen");
      this.parentNode.classList.add("contentopen");
      gtag("event", "view_item", { "event_category": "engagement", "event_label": this.parentNode.getElementsByTagName("h3")[0].innerText });//log open event to analytics
      content.style.display = "block";
      content.style.maxHeight = content.scrollHeight + "px";
      content.addEventListener("transitionend", function () {
        content.style.maxHeight = "none";
      }, { once: true });
    }
  });
}

/*Allow arrow transform animations on load*/
window.addEventListener("load", () => {
  const arrows = document.getElementsByClassName("arrow");
  for (let i = 0; i < arrows.length; i++) {
    arrows[i].classList.remove("transitionDisabled");
  }
});

/*Ripples*/
const circs = document.getElementsByClassName("ripplecircle");
for (let i = 0; i < circs.length; i++) {
  circs[i].addEventListener("click", event => {
    const ripple = document.createElement("span");
    const diameter = Math.max(circs[i].clientWidth, circs[i].clientHeight);
    const radius = diameter / 2;
    ripple.style.width = ripple.style.height = diameter + "px";
    ripple.style.left = event.clientX - (circs[i].offsetLeft + radius) + "px";
    ripple.style.top = event.clientY - (circs[i].offsetTop + radius) + window.scrollY + "px";
    ripple.classList.add("ripple");
    const pastRipple = circs[i].getElementsByClassName("ripple")[0];
    if (pastRipple) {
      pastRipple.remove();
    }
    circs[i].appendChild(ripple);
  });
}

/*Full screen image*/
document.getElementById("fullscreenbg").addEventListener("click", function () {
  this.style.display = "none";
  document.body.classList.remove("disableScroll");
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.getElementById("fullscreenbg").style.display = "none";
    document.body.classList.remove("disableScroll");
  }
});
let images = document.querySelectorAll(".cards img");
for (let i = 0; i < images.length; i++) {
  images[i].addEventListener("click", function () {
    let fullscreenimg = document.getElementById("fullscreenimg");
    fullscreenimg.src = this.src.substring(0, this.src.length - 3) + "2400";
    fullscreenimg.alt = this.alt;
    document.body.classList.add("disableScroll");
    document.getElementById("fullscreenbg").style.display = "flex";
  });
}

/*Tab enter/space clicks*/
const dcircs = document.getElementsByClassName("dropcircle");
for (let i = 0; i < dcircs.length; i++) {
  dcircs[i].addEventListener("keydown", event => {
    if (event.code === 'Space' || event.code === 'Enter') {
      dcircs[i].click();
    }
  });
}

/*Google Analytics*/
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag("js", new Date());
gtag("config", "G-0HK5QMV1SG");