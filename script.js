/* Transition Management */

//Stop new clicks when still animating
let transitioning = 0;

function waitForNotTransitioning(callback) {
  if (transitioning === 0) {
    callback();
  } else {
    setTimeout(() => {
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



/* Clear Query Paramaters */

function clearQuery() {
  window.history.replaceState("", document.title, window.location.toString().substring(0, window.location.toString().indexOf("?")));
}



/* Allow transitions on load */

window.addEventListener("load", function() {
  const rectanlgesAndFilters = document.querySelectorAll(".item.transitionDisabled, .filter.transitionDisabled");
  for (let i = 0; i < rectanlgesAndFilters.length; i++) {
    rectanlgesAndFilters[i].classList.remove("transitionDisabled");
  }
});



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
headerBg.addEventListener("transitionend", function() {
  this.classList.add("transitionDisabled");
}, { once: true });
window.addEventListener("resize", headerHeight);

let hueSatBri = [document.getElementById("hue"), document.getElementById("sat"), document.getElementById("bri")];
let hueSatBriVals = [0, 0, 0];

function updateColor() {
  const changeTo = "hue-rotate(" + hueSatBriVals[0] + "deg) saturate(" + (hueSatBriVals[1] / 360 * 200 + 100) % 200 + "%) brightness(" + (hueSatBriVals[2] / 360 * 200 + 100) % 200 + "%)";
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



/* Items */

class Item {
  constructor(item) {
    this.item = item;
    this.canOpen = item.classList.contains("collapsible");
    if (this.canOpen) {
      this.content = this.item.nextElementSibling;
      this.item.addEventListener("click", (e) => {
        if (!e.target.classList.contains("noOpen") && window.getSelection().type !== "Range") {
          clearQuery();
          if (this.item.nextElementSibling.style.maxHeight) { //Close
            this.close();
          } else { //Open
            this.open();
          }
        }
      });
    }
  }
  open() {
    if (this.canOpen) {
      this.item.classList.add("open");
      this.content.classList.add("open");
      this.content.style.display = "block";
      this.content.style.maxHeight = this.content.scrollHeight + "px";
      this.content.addEventListener("transitionend", () => {
        if (this.content.previousElementSibling.classList.contains("open")) { //Prevent leftover listener when double clicking quickly
          this.content.style.maxHeight = "none";
        }
      }, { once: true });
      gtag("event", "view_item", { "event_category": "engagement", "event_label": this.item.getElementsByTagName("h3")[0].innerText }); //Log view_item event to analytics
    }
  }
  close() {
    if (this.canOpen) {
      this.item.classList.remove("open");
      this.content.classList.remove("open");
      this.content.style.maxHeight = this.content.scrollHeight + "px";
      setTimeout(() => {
        this.content.style.maxHeight = null;
        this.content.addEventListener("transitionend", () => {
          if (!this.content.previousElementSibling.classList.contains("open")) { //Prevent leftover listener when double clicking quickly
            this.content.style.display = "none";
          }
        }, { once: true });
      }); //Delay so js runs these separately, won't animate otherwise
    }
  }
  hide() {
    if (this.canOpen && this.item.id !== "resume" && !this.item.classList.contains("remove")) {
      if (this.item.classList.contains("open")) {
        this.close();
      }
      this.item.style.maxHeight = this.item.getBoundingClientRect().height + "px";
      setTimeout(() => {
        this.item.classList.add("remove");
        this.item.style.maxHeight = 0;
        onTransitionEnd(this.item, () => {
          this.item.style.display = "none";
        });
      });
    }
  }
  show() {
    if (this.item.id !== "resume" && this.item.classList.contains("remove")) {
      this.item.style.display = "flex";
      setTimeout(() => {
        this.item.style.maxHeight = "300px";
        this.item.classList.remove("remove");
        onTransitionEnd(this.item, () => {
          this.item.style.maxHeight = "";
        });
      });
    }
  }
}

const itemsDOM = document.getElementsByClassName("item");
const items = {};
for (let i = 0; i < itemsDOM.length; i++) {
  items[itemsDOM[i].id] = new Item(itemsDOM[i]);
}



/* Ripples */

const circs = document.getElementsByClassName("ripple");
for (let i = 0; i < circs.length; i++) {
  circs[i].addEventListener("click", function(e) {
    const ripple = document.createElement("span");
    const diameter = Math.max(this.clientWidth, this.clientHeight);
    const radius = diameter / 2;
    ripple.style.width = ripple.style.height = diameter + "px";
    ripple.style.left = e.offsetX - radius + "px";
    ripple.style.top = e.offsetY - radius + "px";
    ripple.classList.add("ripplecircle");
    this.append(ripple);
    ripple.addEventListener("animationend", function() {
      this.remove();
    }, { once: true });
  });
}



/* Full Screen Image */

let fullscreenbg = document.getElementById("fullscreenbg");

function openFullscreen(src, alt) {
  let fullscreenimg = document.getElementById("fullscreenimg");
  fullscreenimg.src = src;
  fullscreenimg.alt = alt;
  document.body.style.marginRight = window.innerWidth - document.documentElement.clientWidth + "px";
  document.body.classList.add("disableScroll");
  fullscreenbg.style.display = "flex";
  setTimeout(function() {
    fullscreenbg.classList.add("show");
  });
}

const images = document.querySelectorAll(".cards img");
for (let i = 0; i < images.length; i++) {
  images[i].addEventListener("click", () => {
    openFullscreen(images[i].src.substring(0, images[i].src.length - 3) + "2400", images[i].alt);
  });
}

function closeFullscreen() {
  fullscreenbg.classList.remove("show");
  fullscreenbg.addEventListener("transitionend", function() {
    this.style.display = "none";
  }, { once: true });
  document.body.style.marginRight = 0;
  document.body.classList.remove("disableScroll");
}

fullscreenbg.addEventListener("click", function() {
  closeFullscreen();
});

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    closeFullscreen();
  }
});



/* Filter */

class Filter {
  constructor(filter) {
    this.filter = filter;
  }
  hide() {
    if (!this.filter.classList.contains("remove")) {
      transitioning = 1;
      this.filter.style.maxWidth = this.filter.getBoundingClientRect().width + "px";
      setTimeout(() => {
        this.filter.classList.add("remove");
        this.filter.style.maxWidth = 0;
        onTransitionEnd(this.filter, () => {
          this.filter.style.display = "none";
          transitioning = 0;
        });
      });
    }
  }
  show() {
    if (this.filter.classList.contains("remove")) {
      transitioning = 1;
      this.filter.style.display = "inline-block";
      setTimeout(() => {
        this.filter.style.maxWidth = "200px";
        this.filter.classList.remove("remove");
        onTransitionEnd(this.filter, () => {
          this.filter.style.maxWidth = "";
          transitioning = 0;
        });
      });
    }
  }
}

const filterButtons = document.getElementsByClassName("filterButton");
const filters = {};
for (let i = 0; i < filterButtons.length; i++) {
  filters[filterButtons[i].id] = new Filter(filterButtons[i]);
  filterButtons[i].addEventListener("click", function() {
    if (!transitioning) {
      clearQuery();
      openFilter(this);
      logOpenFilter();
    }
  });
}

function openFilter(filter) {
  let alreadyFiltered = document.getElementsByClassName("filtered");
  if (!filter.classList.contains("filtered") && (!alreadyFiltered.length || alreadyFiltered[alreadyFiltered.length - 1].classList.contains(filter.id))) { //Not already clicked
    filter.classList.add("filtered");
    for (let i = 0; i < filterButtons.length; i++) {
      if (!filterButtons[i].classList.contains("filtered") && !filterButtons[i].classList.contains(filter.id)) { //Hide others
        filters[filterButtons[i].id].hide();
      } else { //Show subfilters
        filters[filterButtons[i].id].show();
      }
    }
    for (const id in items) { //Hide itemss
      if (!items[id].item.classList.contains(filter.id)) {
        items[id].hide();
      }
    }
    const clearFilter = document.getElementById("clearFilter"); //Show clear filter button
    const shareFilter = document.getElementById("shareFilter"); //Show share filter button
    clearFilter.style.display = "flex";
    shareFilter.style.display = "flex";
    setTimeout(() => {
      clearFilter.classList.add("show");
      shareFilter.classList.add("show");
    });
  }
}

//Close filters
document.getElementById("clearFilter").addEventListener("click", function() {
  if (!transitioning) {
    clearQuery();
    const shareFilter = document.getElementById("shareFilter");
    this.classList.remove("show"); //Hide self
    shareFilter.classList.remove("show");
    this.style.display = "none";
    shareFilter.style.display = "none";

    for (let i = 0; i < filterButtons.length; i++) { //Show all buttons except subfilters
      if (!filterButtons[i].classList.contains("subfilter")) {
        filters[filterButtons[i].id].show();
      } else {
        filters[filterButtons[i].id].hide();
      }
    }
    for (const id in items) { //Show all items
      items[id].show();
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
    check.addEventListener("animationend", function() {
      this.classList.remove("copied");
    }, { once: true });
    const shareIcon = el.getElementsByClassName("shareIcon")[0];
    shareIcon.classList.add("copied");
    shareIcon.addEventListener("animationend", function() {
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
document.getElementById("shareFilter").addEventListener("click", function() {
  const filtereds = document.getElementsByClassName("filtered");
  let ids = [];
  let names = [];
  for (let i = 0; i < filtereds.length; i++) {
    ids.push(filtereds[i].id);
    names.push(filtereds[i].innerText);
  }
  shareLink(this, names.reverse().join(" ") + " Filter", window.location.href.split('?')[0] + "?filter=" + ids.join());
  gtag("event", "share_filter", { "event_category": "engagement", "event_label": names.join(" ") }); //Log share_filter event to analytics
});

//Share item
const shares = document.getElementsByClassName("share");
for (let i = 0; i < shares.length; i++) {
  shares[i].addEventListener("click", function() {
    shareLink(this, shares[i].parentNode.parentNode.getElementsByTagName("h3")[0].innerText, window.location.href.split('?')[0] + "?item=" + shares[i].parentNode.parentNode.id);
    gtag("event", "share_item", { "event_category": "engagement", "event_label": this.parentNode.parentNode.getElementsByTagName("h3")[0].innerText }); //Log share_item event to analytics
  });
}



/* Query paramaters */

function openFilterAndWait(list) { //Open filter(s) one at a time, waiting for each
  if (list.length) {
    waitForNotTransitioning(() => {
      openFilter(document.querySelector("#" + list.shift() + ".filterButton"));
      openFilterAndWait(list);
    });
  } else {
    logOpenFilter();
  }
}

const params = new URLSearchParams(window.location.search);

if (params) {
  if (params.has("item") && document.querySelector("#" + params.get("item") + ".item")) {
    items[params.get("item")].open();
    document.querySelector("#" + params.get("item") + ".item").scrollIntoView({
      behavior: "smooth"
    });
  }
  if (params.has("filter") && params.get("filter").split(",").map(id => document.querySelector("#" + id + ".filterButton")).every(Boolean)) { //if each filter is a valid element
    openFilterAndWait(params.get("filter").split(","));
  }
}



/* Google Analytics */

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag("js", new Date());
gtag("config", "G-BVTJ5JS3H2");

const links = document.getElementsByTagName('a');
for (let i = 0; i < links.length; i++) {
  links[i].addEventListener('click', function() {
    gtag("event", "click_link", { "event_category": "engagement", "event_label": this.href }); //Log click_link event to analytics
  });
}

function logOpenFilter() {
  const filtereds = document.getElementsByClassName("filtered");
  let names = [];
  for (let i = 0; i < filtereds.length; i++) {
    names.push(filtereds[i].innerText);
  }
  gtag("event", "view_filter", { "event_category": "engagement", "event_label": names.reverse().join(" ") }); //Log view_filter event to analytics
}
