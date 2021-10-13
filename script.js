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
    content.style.maxHeight = "none";
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
    window.history.replaceState("", document.title, window.location.pathname + window.location.search);
    if (this.parentNode.nextElementSibling.style.maxHeight) {//close
      closeCollapsible(this);
    } else {//open
      openCollapsible(this, 1);
    }
  });
}
function openAndScroll() {
  openCollapsible(document.getElementById(window.location.hash.substring(1)).getElementsByClassName("dropcircle")[0], 0);
  document.getElementById(window.location.hash.substring(1)).scrollIntoView({
    behavior: "smooth"
  });
}
if (window.location.hash) {
  openAndScroll();
}
window.addEventListener("hashchange", openAndScroll);

/*Ripples*/
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
      ripple.remove();
    });
  });
}

/*Full screen image*/
let fullscreenbg = document.getElementById("fullscreenbg");
function closeFullscreen() {
  fullscreenbg.classList.remove("show");
  fullscreenbg.addEventListener("transitionend", function() {
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

/*Tab enter/space clicks*/
const dcircs = document.getElementsByClassName("dropcircle");
for (let i = 0; i < dcircs.length; i++) {
  dcircs[i].addEventListener("keydown", function () {
    if (event.code === 'Space' || event.code === 'Enter') {
      this.click();
    }
  });
}

/*Copy links*/
const shares = document.getElementsByClassName("share");
for (let i = 0; i < shares.length; i++) {
  shares[i].addEventListener("click", function () {
    if (!navigator.clipboard) {
      console.error("URL Copy Error!");
    } else {
      navigator.clipboard.writeText(window.location.href.replace(window.location.hash, "") + "#" + this.parentNode.id).then(function () {
        const check = shares[i].getElementsByClassName("check")[0];
        check.classList.add("copied");
        check.addEventListener("animationend", function () {
          this.classList.remove("copied");
        });
        const shareIcon = shares[i].getElementsByClassName("shareIcon")[0];
        shareIcon.classList.add("copied");
        shareIcon.addEventListener("animationend", function () {
          this.classList.remove("copied");
        });
      }, function (err) {
        console.error("URL Copy Error!", err);
      });
    }
  });
}

/*Filter*/
window.addEventListener("load", function() {//Allow transitions
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
    el.addEventListener("transitionend", callback, { once: true });
  } else {
    callback();
  }
}
const filters = document.getElementsByClassName("filterButton");
for (let i = 0; i < filters.length; i++) {
  filters[i].addEventListener("click", function () {
    if (this.id !== "filtered") {//Not already clicked
      this.id = "filtered";
      for (let j = 0; j < filters.length; j++) {//Hide animate others
        if (filters[j] !== this) {
          filters[j].style.maxWidth = filters[j].getBoundingClientRect().width + "px";
          setTimeout(function () {
            filters[j].classList.add("remove");
            filters[j].style.maxWidth = 0;
            transitionend(filters[j], function () {
              filters[j].style.display = "none";
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
              rectangles[i].style.display = "none";
            });
          });
        }
      }
      const clearFilter = document.getElementById("clearFilter");//show clear filter button
      clearFilter.style.display = "flex";
      setTimeout(function () {
        clearFilter.classList.add("show");
      });
    }
  });
}
document.getElementById("clearFilter").addEventListener("click", function () {
  this.classList.remove("show");//hide self
  transitionend(this, () => {
    this.style.display = "none";
  });
  document.getElementById("filtered").removeAttribute("id");
  for (let i = 0; i < filters.length; i++) {//show all buttons
    filters[i].style.display = "inline-block";
    setTimeout(function () {
      filters[i].style.maxWidth = "200px";
      filters[i].classList.remove("remove");
      transitionend(filters[i], function() {
        filters[i].style.maxWidth = "";
      });
    });
  }
  const rectangles = document.getElementsByClassName("rectangle");//show all rectangles
  for (let i = 0; i < rectangles.length; i++) {
    rectangles[i].style.display = "flex";
    setTimeout(function () {
      rectangles[i].style.maxHeight = "300px";
      rectangles[i].classList.remove("remove");
      transitionend(rectangles[i], function() {
        rectangles[i].style.maxHeight = "";
      });
    });
  }
});

/*Google Analytics*/
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag("js", new Date());
gtag("config", "G-BVTJ5JS3H2");