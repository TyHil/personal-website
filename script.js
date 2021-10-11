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
const images = document.querySelectorAll(".cards img");
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

/*Sort*/
window.addEventListener("load", function() {//Allow transitions
  const rectanlges = document.querySelectorAll(".rectangle.transitionDisabled");
  for (let i = 0; i < rectanlges.length; i++) {
    rectanlges[i].classList.remove("transitionDisabled");
  }
  const sorts = document.querySelectorAll(".sort.transitionDisabled");
  for (let i = 0; i < sorts.length; i++) {
    sorts[i].classList.remove("transitionDisabled");
  }
});
function transitionend(el, callback) {
  if (document.readyState === "complete") {
    el.addEventListener("transitionend", callback, { once: true });
  } else {
    callback();
  }
}
const sorts = document.getElementsByClassName("sortButton");
for (let i = 0; i < sorts.length; i++) {
  sorts[i].addEventListener("click", function () {
    if (this.id !== "sorted") {//Not already clicked
      this.id = "sorted";
      for (let j = 0; j < sorts.length; j++) {//Hide animate others
        if (sorts[j] !== this) {
          sorts[j].style.maxWidth = sorts[j].getBoundingClientRect().width + "px";
          setTimeout(function () {
            sorts[j].classList.add("remove");
            sorts[j].style.maxWidth = 0;
            transitionend(sorts[j], function () {
              sorts[j].style.display = "none";
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
      const clearSort = document.getElementById("clearSort");//show clear sort button
      clearSort.style.display = "flex";
      setTimeout(function () {
        clearSort.classList.add("show");
      });
    }
  });
}
document.getElementById("clearSort").addEventListener("click", function () {
  this.classList.remove("show");//hide self
  transitionend(this, () => {
    this.style.display = "none";
  });
  document.getElementById("sorted").removeAttribute("id");
  for (let i = 0; i < sorts.length; i++) {//show all buttons
    sorts[i].style.display = "inline-block";
    setTimeout(function () {
      sorts[i].style.maxWidth = "";
      sorts[i].classList.remove("remove");
    });
  }
  const rectangles = document.getElementsByClassName("rectangle");//show all rectangles
  for (let i = 0; i < rectangles.length; i++) {
    rectangles[i].style.display = "flex";
    setTimeout(function () {
      rectangles[i].style.maxHeight = "";
      rectangles[i].classList.remove("remove");
    });
  }
});

/*Google Analytics*/
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag("js", new Date());
gtag("config", "G-BVTJ5JS3H2");