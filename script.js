/* Transition Management */

//Stop new clicks when still animating
let transitioning = 0;

function waitForNotTransitioning(callback) {
  if (transitioning === 0) {
    callback();
  } else {
    window.setTimeout(() => {
      waitForNotTransitioning(callback);
    }, 100);
  }
}

//On transition end or immediatly if transitions disabled
function onTransitionEnd(element, callback) {
  if (document.readyState !== "complete") {
    callback();
  } else {
    element.addEventListener("transitionend", callback, { once: true });
  }
}



/* Header Tilt */

const headerBg = document.getElementById("headerBg");
function headerHeight() {
  const base = window.innerWidth;
  const left = document.getElementById("left").clientHeight;
  const right = document.getElementById("right").clientHeight;
  const deg = 180 / Math.PI * Math.asin((right - left) / Math.sqrt(Math.pow(base, 2) + Math.pow(right - left, 2)));
  headerBg.style.transform = "skewY(" + deg + "deg)";
  if (deg >= 0) {
    headerBg.style["transform-origin"] = "top right";
  } else {
    headerBg.style["transform-origin"] = "top left";
  }
}

headerHeight();
headerBg.addEventListener("transitionend", function () {
  this.classList.add("transitionDisabled");
}, { once: true });
window.addEventListener("resize", headerHeight);

let hueSatBri = [document.getElementById("hue"), document.getElementById("sat"), document.getElementById("bri")];
let hueSatBriVals = [0, 0, 0];
function updateColor() {
  const changeTo = "hue-rotate(" + hueSatBriVals[0] + "deg) saturate(" + (hueSatBriVals[1]/360*200+100)%200 + "%) brightness(" + (hueSatBriVals[2]/360*200+100)%200 + "%)";
  headerBg.style.filter = changeTo;
  document.getElementById("featured").style.filter = changeTo;
  const features = document.getElementsByClassName("feature");
  for (let i = 0; i < features.length; i++) {
    features[i].style.filter = changeTo;
  }
}
for (let i = 0; i < 3; i++) {
  hueSatBri[i].addEventListener("click", function() {
    hueSatBriVals[i] = (hueSatBriVals[i] + 10) % 360;
    updateColor();
    this.style.transform = "rotate(" + hueSatBriVals[i] + "deg)";
  });
}



/* Collapsibles */

class Collapsible {
  constructor(collapsible) {
    this.collapsible = collapsible;
    this.content = this.collapsible.nextElementSibling;
    this.collapsible.addEventListener("click", (e) => {
      if (!e.target.classList.contains("buttonlink") && window.getSelection().type !== "Range") {
        query.clear();
        if (this.collapsible.nextElementSibling.style.maxHeight) { //Close
          this.close();
        } else { //Open
          this.open(1);
          gtag("event", "view_item", { "event_category": "engagement", "event_label": this.collapsible.getElementsByTagName("h3")[0].innerText }); //Log open event to analytics
        }
      }
    });
  }
  open() {
    this.collapsible.getElementsByClassName("arrow")[0].classList.add("contentopen");
    this.collapsible.classList.add("contentopen");
    this.content.style.display = "block";
    this.content.style.maxHeight = this.content.scrollHeight + "px";
    this.content.addEventListener("transitionend", () => {
      if (this.content.previousElementSibling.classList.contains("contentopen")) { //Prevent leftover listener when double clicking quickly
        this.content.style.maxHeight = "none";
      }
    }, { once: true });
  }
  close() {
    this.collapsible.getElementsByClassName("arrow")[0].classList.remove("contentopen");
    this.collapsible.classList.remove("contentopen");
    this.content.style.maxHeight = this.content.scrollHeight + "px";
    setTimeout(() => {
      this.content.style.maxHeight = null;
      this.content.addEventListener("transitionend", () => {
        if (!this.content.previousElementSibling.classList.contains("contentopen")) { //Prevent leftover listener when double clicking quickly
          this.content.style.display = "none";
        }
      }, { once: true });
    }); //Delay so js runs these separately, won't animate otherwise
  }
  hide() {
    if (this.collapsible.id !== "resume" && !this.collapsible.classList.contains("remove")) {
      if (this.collapsible.classList.contains("contentopen")) {
        this.close();
      }
      this.collapsible.style.maxHeight = this.collapsible.getBoundingClientRect().height + "px";
      setTimeout(() => {
        this.collapsible.classList.add("remove");
        this.collapsible.style.maxHeight = 0;
        onTransitionEnd(this.collapsible, () => {
          this.collapsible.style.display = "none";
        });
      });
    }
  }
  show() {
    if (this.collapsible.id !== "resume" && this.collapsible.classList.contains("remove")) {
      this.collapsible.style.display = "flex";
      setTimeout(() => {
        this.collapsible.style.maxHeight = "300px";
        this.collapsible.classList.remove("remove");
        onTransitionEnd(this.collapsible, () => {
          this.collapsible.style.maxHeight = "";
        });
      });
    }
  }
}

const rectangles = document.getElementsByClassName("rectangle");
const collapsibles = {};
for (let i = 0; i < rectangles.length; i++) {
  collapsibles[rectangles[i].id] = new Collapsible(rectangles[i]);
}



/* Ripples */

const circs = document.getElementsByClassName("ripple");
for (let i = 0; i < circs.length; i++) {
  circs[i].addEventListener("click", function (e) {
    const ripple = document.createElement("span");
    const diameter = Math.max(this.clientWidth, this.clientHeight);
    const radius = diameter / 2;
    ripple.style.width = ripple.style.height = diameter + "px";
    ripple.style.left = e.offsetX - radius + "px";
    ripple.style.top = e.offsetY - radius + "px";
    ripple.classList.add("ripplecircle");
    this.append(ripple);
    ripple.addEventListener("animationend", function () {
      this.remove();
    }, { once: true });
  });
}



/* Full Screen Image */

let fullscreenbg = document.getElementById("fullscreenbg");
function closeFullscreen() {
  fullscreenbg.classList.remove("show");
  fullscreenbg.addEventListener("transitionend", function () {
    this.style.display = "none";
  }, { once: true });
  document.body.style.marginRight = 0;
  document.body.classList.remove("disableScroll");
}

fullscreenbg.addEventListener("click", function () {
  closeFullscreen();
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeFullscreen();
  }
});

const images = document.querySelectorAll(".cards img");
for (let i = 0; i < images.length; i++) {
  images[i].addEventListener("click", function () {
    let fullscreenimg = document.getElementById("fullscreenimg");
    fullscreenimg.src = this.src.substring(0, this.src.length - 3) + "2400";
    fullscreenimg.alt = this.alt;
    document.body.style.marginRight = window.innerWidth - document.documentElement.clientWidth + "px";
    document.body.classList.add("disableScroll");
    fullscreenbg.style.display = "flex";
    setTimeout(function () {
      fullscreenbg.classList.add("show");
    });
  });
}



/* Tab Enter/Space Clicks */

const dropcircles = document.getElementsByClassName("dropcircle");
for (let i = 0; i < dropcircles.length; i++) {
  dropcircles[i].addEventListener("keydown", function (e) {
    if (e.code === 'Space' || e.code === 'Enter') {
      this.click();
    }
  });
}



/* Filter */

//Allow transitions on load
window.addEventListener("load", function () {
  const rectanlges = document.querySelectorAll(".rectangle.transitionDisabled");
  for (let i = 0; i < rectanlges.length; i++) {
    rectanlges[i].classList.remove("transitionDisabled");
  }
  const filters = document.querySelectorAll(".filter.transitionDisabled");
  for (let i = 0; i < filters.length; i++) {
    filters[i].classList.remove("transitionDisabled");
  }
});

function hideFilter(filter) {
  if (!filter.classList.contains("remove")) {
    transitioning = 1;
    filter.style.maxWidth = filter.getBoundingClientRect().width + "px";
    setTimeout(function () {
      filter.classList.add("remove");
      filter.style.maxWidth = 0;
      onTransitionEnd(filter, () => {
        filter.style.display = "none";
        transitioning = 0;
      });
    });
  }
}

function showFilter(filter) {
  if (filter.classList.contains("remove")) {
    transitioning = 1;
    filter.style.display = "inline-block";
    setTimeout(function () {
      filter.style.maxWidth = "200px";
      filter.classList.remove("remove");
      onTransitionEnd(filter, () => {
        filter.style.maxWidth = "";
        transitioning = 0;
      });
    });
  }
}

const filters = document.getElementsByClassName("filterButton");
function openFilter(filter) {
  let alreadyFiltered = document.getElementsByClassName("filtered");
  if (!filter.classList.contains("filtered") && !transitioning && (!alreadyFiltered.length || alreadyFiltered[alreadyFiltered.length - 1].classList.contains(filter.id))) { //Not already clicked
    filter.classList.add("filtered");
    for (let i = 0; i < filters.length; i++) {
      if (!filters[i].classList.contains("filtered") && !filters[i].classList.contains(filter.id)) { //Hide others
        hideFilter(filters[i]);
      } else { //Show subfilters
        showFilter(filters[i]);
      }
    }
    const rectangles = document.getElementsByClassName("rectangle"); //Hide rectangles
    for (let i = 0; i < rectangles.length; i++) {
      if (!rectangles[i].classList.contains(filter.id)) {
        collapsibles[rectangles[i].id].hide();
      }
    }
    const clearFilter = document.getElementById("clearFilter"); //Show clear filter button
    const shareFilter = document.getElementById("shareFilter"); //Show share filter button
    clearFilter.style.display = "flex";
    shareFilter.style.display = "flex";
    setTimeout(function () {
      clearFilter.classList.add("show");
      shareFilter.classList.add("show");
    });
  }
}

for (let i = 0; i < filters.length; i++) {
  filters[i].addEventListener("click", function () {
    query.clear();
    openFilter(this);
  });
}

//Close filters
document.getElementById("clearFilter").addEventListener("click", function () {
  if (!transitioning) {
    query.clear();
    const shareFilter = document.getElementById("shareFilter");
    this.classList.remove("show"); //Hide self
    shareFilter.classList.remove("show");
    transitioning = 1;
    onTransitionEnd(this, () => {
      this.style.display = "none";
      transitioning = 0;
    });
    onTransitionEnd(shareFilter, () => {
      shareFilter.style.display = "none";
      transitioning = 0;
    });

    for (let i = 0; i < filters.length; i++) { //Show all buttons except subfilters
      if (!filters[i].classList.contains("subfilter")) {
        showFilter(filters[i]);
      } else {
        hideFilter(filters[i]);
      }
    }
    const rectangles = document.getElementsByClassName("rectangle"); //Show all rectangles
    for (let i = 0; i < rectangles.length; i++) {
      collapsibles[rectangles[i].id].show();
    }
    while (document.getElementsByClassName("filtered")[0]) {
      document.getElementsByClassName("filtered")[0].classList.remove("filtered");
    }
  }
});



/* Share */

function shareLink(el, title, url) {
  function success() {
    const check = el.getElementsByClassName("check")[0];
    check.classList.add("copied");
    check.addEventListener("animationend", function () {
      this.classList.remove("copied");
    }, { once: true });
    const shareIcon = el.getElementsByClassName("shareIcon")[0];
    shareIcon.classList.add("copied");
    shareIcon.addEventListener("animationend", function () {
      this.classList.remove("copied");
    }, { once: true });
  }
  if (navigator.share) {
    navigator.share({
      title: title,
      url: url
    }).then(() => {
      success();
    }).catch(console.error);
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      success();
    }).catch(console.error);
  } else {
    alert(url);
  }
}

//Share filter
document.getElementById("shareFilter").addEventListener("click", function () {
  const filtereds = document.getElementsByClassName("filtered");
  let ids = [];
  let names = [];
  for (let i = 0; i < filtereds.length; i++) {
    ids.push(filtereds[i].id);
    names.push(filtereds[i].innerText);
  }
  shareLink(this, names.reverse().join(" ") + " Filter", window.location.href.split('?')[0] + "?filter=" + ids.join());
});

//Share item
const shares = document.getElementsByClassName("share");
for (let i = 0; i < shares.length; i++) {
  shares[i].addEventListener("click", function () {
    shareLink(this, shares[i].parentNode.parentNode.getElementsByTagName("h3")[0].innerText, window.location.href.split('?')[0] + "?item=" + shares[i].parentNode.parentNode.id);
  });
}



/* Query paramaters */

class Query {
  constructor(params) {
    this.params = params;
    if (params) {
      this.read();
    }
  }
  read() {
    if (this.params.has("item") && document.querySelector("#" + this.params.get("item") + ".rectangle")) {
      const rectangles = document.getElementsByClassName("rectangle");
      for (let i = 0; i < rectangles.length; i++) {
        if (rectangles[i].id !== "resume" && rectangles[i].classList.contains("contentopen")) {
          collapsibles[rectangles[i].id].close();
        }
      }
      collapsibles[this.params.get("item")].open();
      document.querySelector("#" + this.params.get("item") + ".rectangle").scrollIntoView({
        behavior: "smooth"
      });
    }
    if (this.params.has("filter") && this.params.get("filter").split(",").map(id => document.querySelector("#" + id + ".filterButton")).every(Boolean)) { //Open filter(s) one at a time, waiting for each
      const filtereds = this.params.get("filter").split(",");
      for (let i = 0; i < filtereds.length; i++) {
        waitForNotTransitioning(() => {
          openFilter(document.querySelector("#" + filtereds[i] + ".filterButton"));
        });
      }
    }
  }
  clear() {
    window.history.replaceState("", document.title, window.location.toString().substring(0, window.location.toString().indexOf("?")));
  }
}

const query = new Query(new URLSearchParams(window.location.search));




/* Google Analytics */

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag("js", new Date());
gtag("config", "G-BVTJ5JS3H2");
