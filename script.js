/* Header Tilt */

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



/* Open and Close Collapsibles */

function openCollapsible(coll, log) {
  const content = coll.parentNode.nextElementSibling;
  coll.getElementsByClassName("arrow")[0].classList.add("contentopen");
  coll.parentNode.classList.add("contentopen");
  if (log) {//log open event to analytics
    gtag("event", "view_item", { "event_category": "engagement", "event_label": coll.parentNode.getElementsByTagName("h3")[0].innerText });
  }
  content.style.display = "block";
  content.style.maxHeight = content.scrollHeight + "px";
  content.addEventListener("transitionend", function () {
    this.style.maxHeight = "none";
  }, { once: true });
}

function closeCollapsible(coll) {
  const content = coll.parentNode.nextElementSibling;
  coll.getElementsByClassName("arrow")[0].classList.remove("contentopen");
  coll.parentNode.classList.remove("contentopen");
  content.style.maxHeight = content.scrollHeight + "px";
  setTimeout(function () {
    content.style.maxHeight = null;
    content.addEventListener("transitionend", function () {
      content.style.display = "none";
    }, { once: true });
  });//delay so js runs these separately, won't animate otherwise
}

const coll = document.getElementsByClassName("dropcircle");
for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function () {
    window.history.replaceState("", document.title, window.location.toString().substring(0, window.location.toString().indexOf("?")));
    if (this.parentNode.nextElementSibling.style.maxHeight) {//close
      closeCollapsible(this);
    } else {//open
      openCollapsible(this, 1);
    }
  });
}



/* Ripples */

const circs = document.getElementsByClassName("ripple");
for (let i = 0; i < circs.length; i++) {
  circs[i].addEventListener("click", function (e) {
    const ripple = document.createElement("span");
    const diameter = Math.max(this.clientWidth, this.clientHeight);
    const radius = diameter / 2;
    ripple.style.width = ripple.style.height = diameter + "px";
    ripple.style.left = e.clientX - (this.offsetLeft + radius) + "px";
    ripple.style.top = e.clientY - (this.offsetTop + radius) + window.scrollY + "px";
    ripple.classList.add("ripplecircle");
    this.append(ripple);
    ripple.addEventListener("animationend", function () {
      this.remove();
    }, { once: true });
  });
}



/*Full Screen Image*/

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



/*Tab Enter/Space Clicks*/

const dropcircles = document.getElementsByClassName("dropcircle");
for (let i = 0; i < dropcircles.length; i++) {
  dropcircles[i].addEventListener("keydown", function (e) {
    if (e.code === 'Space' || e.code === 'Enter') {
      this.click();
    }
  });
}



/* Filter */

//Allow transitions
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

function transitionend(el, callback) {
  if (document.readyState === "complete") {
    el.addEventListener("transitionend", callback.bind(el), { once: true });
  } else {
    callback.bind(el)();
  }
}

const filters = document.getElementsByClassName("filterButton");
function openFilter() {
  if (!this.classList.contains("filtered")) {//Not already clicked
    this.classList.add("filtered");
    for (let j = 0; j < filters.length; j++) {//Hide animate others
      if (filters[j] !== this) {
        filters[j].style.maxWidth = filters[j].getBoundingClientRect().width + "px";
        setTimeout(function () {
          filters[j].classList.add("remove");
          filters[j].style.maxWidth = 0;
          transitionend(filters[j], function () {
            this.style.display = "none";
          });
        });
      }
    }
    const rectangles = document.getElementsByClassName("rectangle");//Hide rectangles
    for (let i = 0; i < rectangles.length; i++) {
      if (!rectangles[i].classList.contains(this.innerText) && rectangles[i].id !== "resume") {
        if (rectangles[i].classList.contains("contentopen")) {
          closeCollapsible(rectangles[i].getElementsByClassName("dropcircle")[0]);
        }
        rectangles[i].style.maxHeight = rectangles[i].getBoundingClientRect().height + "px";
        setTimeout(function () {
          rectangles[i].classList.add("remove");
          rectangles[i].style.maxHeight = 0;
          transitionend(rectangles[i], function () {
            this.style.display = "none";
          });
        });
      }
    }
    const clearFilter = document.getElementById("clearFilter");//show clear filter button
    const shareFilter = document.getElementById("shareFilter");//show share filter button
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
    window.history.replaceState("", document.title, window.location.toString().substring(0, window.location.toString().indexOf("?")));
    openFilter.bind(this)();
  });
}

function closeFilters() {
  const clearFilter = document.getElementById("clearFilter");
  const shareFilter = document.getElementById("shareFilter");
  clearFilter.classList.remove("show");//hide self
  shareFilter.classList.remove("show");
  transitionend(clearFilter, function () {
    this.style.display = "none";
  });
  transitionend(shareFilter, function () {
    this.style.display = "none";
  });
  document.getElementsByClassName("filtered")[0].classList.remove("filtered");
  for (let i = 0; i < filters.length; i++) {//show all buttons
    filters[i].style.display = "inline-block";
    setTimeout(function () {
      filters[i].style.maxWidth = "200px";
      filters[i].classList.remove("remove");
      transitionend(filters[i], function () {
        this.style.maxWidth = "";
      });
    });
  }
  const rectangles = document.getElementsByClassName("rectangle");//show all rectangles
  for (let i = 0; i < rectangles.length; i++) {
    rectangles[i].style.display = "flex";
    setTimeout(function () {
      rectangles[i].style.maxHeight = "300px";
      rectangles[i].classList.remove("remove");
      transitionend(rectangles[i], function () {
        this.style.maxHeight = "";
      });
    });
  }
}

document.getElementById("clearFilter").addEventListener("click", function () {
  window.history.replaceState("", document.title, window.location.toString().substring(0, window.location.toString().indexOf("?")));
  closeFilters();
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
  shareLink(this, document.getElementsByClassName("filtered")[0].innerText + " Filter", window.location.href.split('?')[0] + "?filter=" + document.getElementsByClassName("filtered")[0].id);
});

//Share item
const shares = document.getElementsByClassName("share");
for (let i = 0; i < shares.length; i++) {
  shares[i].addEventListener("click", function () {
    shareLink(this, shares[i].parentNode.getElementsByTagName("h3")[0].innerText, window.location.href.split('?')[0] + "?item=" + shares[i].parentNode.id);
  });
}



/* Query paramaters */

const params = new URLSearchParams(window.location.search);
if (params) {
  if (params.has("item") && document.querySelector("#" + params.get("item") + ".rectangle")) {
    const rectangles = document.getElementsByClassName("rectangle");
    for (let i = 0; i < rectangles.length; i++) {
      if (rectangles[i].id !== "resume" && rectangles[i].classList.contains("contentopen")) {
        closeCollapsible(rectangles[i].getElementsByClassName("dropcircle")[0]);
      }
    }
    openCollapsible(document.querySelector("#" + params.get("item") + ".rectangle").getElementsByClassName("dropcircle")[0], 0);
    document.querySelector("#" + params.get("item") + ".rectangle").scrollIntoView({
      behavior: "smooth"
    });
  } else if (params.has("filter") && document.querySelector("#" + params.get("filter") + ".filterButton")) {
    openFilter.bind(document.querySelector("#" + params.get("filter") + ".filterButton"))();
    setTimeout(function () {
      window.scrollTo(0, 0);
    });
  }
}



/* Google Analytics */

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag("js", new Date());
gtag("config", "G-BVTJ5JS3H2");