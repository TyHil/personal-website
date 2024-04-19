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
  if (document.readyState !== 'complete') {
    callback();
  } else {
    element.addEventListener('transitionend', callback, { once: true });
  }
}

/* Clear Query Paramaters */

function clearQuery() {
  window.history.replaceState(
    '',
    document.title,
    window.location.toString().substring(0, window.location.toString().indexOf('?'))
  );
}

/* Allow transitions on load */

window.addEventListener('load', function () {
  const rectanlgesAndFilters = document.querySelectorAll(
    '.item.transitionDisabled, .filter.transitionDisabled'
  );
  for (let i = 0; i < rectanlgesAndFilters.length; i++) {
    rectanlgesAndFilters[i].classList.remove('transitionDisabled');
  }
});

/* Header Tilt */

const headerBg = document.getElementById('headerBg');
const header = document.getElementsByTagName('header')[0];
function headerHeight() {
  function fullHeight(el) {
    const style = window.getComputedStyle(el);
    return (
      parseInt(style.getPropertyValue('margin-top')) +
      el.clientHeight +
      parseInt(style.getPropertyValue('margin-top'))
    );
  }

  const base = window.innerWidth;
  const left = fullHeight(document.getElementById('left'));
  const right = fullHeight(document.getElementById('right'));
  const deg =
    (180 / Math.PI) *
    Math.asin((right - left) / Math.sqrt(Math.pow(base, 2) + Math.pow(right - left, 2)));
  headerBg.style.transform = 'skewY(' + deg + 'deg)';
  if (deg >= 0) {
    headerBg.style['transform-origin'] = 'top right';
  } else {
    headerBg.style['transform-origin'] = 'top left';
  }

  const bothHeight = parseInt(window.getComputedStyle(header).getPropertyValue('padding-top'));
  const shape = document.getElementById('shape');
  shape.style.setProperty('--left', bothHeight + left + 'px');
  shape.style.setProperty('--right', bothHeight + right + 'px');

  const blurb = document.getElementById('blurb');
  let bottomDiff = blurb.getBoundingClientRect().bottom - header.getBoundingClientRect().bottom;
  if (bottomDiff < 0) {
    bottomDiff = 0;
  }
  header.style.marginBottom = 'calc(1rem + ' + bottomDiff + 'px)';
}

headerHeight();
headerBg.addEventListener(
  'transitionend',
  function () {
    this.classList.add('transitionDisabled');
  },
  { once: true }
);
header.addEventListener(
  'transitionend',
  function () {
    this.classList.add('transitionDisabled');
  },
  { once: true }
);
window.addEventListener('resize', headerHeight);

/* Items */

const projects = document.getElementById('projects');
function projectsResize() {
  let heightAdd = 0;
  for (const id in items) {
    if (items[id].canOpen && id !== 'resume') {
      heightAdd += parseInt(items[id].content.getBoundingClientRect().height);
    }
  }
  projects.style.setProperty('--extraHeight', heightAdd + 'px');
}

const shadowOverlay = document.getElementById('shadowOverlay');
let overlayPresent = true;
function removeShadowOverlay() {
  if (overlayPresent) {
    overlayPresent = false;
    projects.style.transition = 'max-height 1000ms ease-out';
    projects.style.maxHeight = projects.scrollHeight + 'px';
    shadowOverlay.style.opacity = 0;
    projects.addEventListener(
      'transitionend',
      () => {
        projects.style.maxHeight = 'none';
        shadowOverlay.style.display = 'none';
      },
      { once: true }
    );
  }
}
shadowOverlay
  .getElementsByTagName('button')[0]
  .addEventListener('click', removeShadowOverlay, { once: true });

let removedPulses = false;
function removePulses() {
  if (!removedPulses) {
    const pulses = document.getElementsByClassName('pulse');
    for (let i = 0; i < pulses.length; i++) {
      pulses[i].classList.remove('pulse');
    }
    removedPulses = true;
  }
}

class Item {
  constructor(item) {
    this.item = item;
    this.canOpen = item.classList.contains('collapsible');
    if (this.canOpen) {
      this.content = this.item.nextElementSibling;
      this.item.addEventListener('click', e => {
        if (!e.target.classList.contains('noOpen') && window.getSelection().type !== 'Range') {
          clearQuery();
          if (this.item.nextElementSibling.style.maxHeight) {
            //Close
            this.close();
          } else {
            //Open
            this.open();
          }
        }
      });
    }
  }
  open() {
    if (this.canOpen) {
      this.item.classList.add('open');
      this.content.classList.add('open');
      this.content.style.display = 'block';
      this.content.style.maxHeight = this.content.scrollHeight + 'px';
      this.content.addEventListener(
        'transitionend',
        () => {
          if (this.content.previousElementSibling.classList.contains('open')) {
            //Prevent leftover listener when double clicking quickly
            this.content.style.maxHeight = 'none';
          }
          projectsResize();
        },
        { once: true }
      );
      removePulses();
      analytics.logEvent(analytics, 'view_item', {
        event_category: 'engagement',
        event_label: this.item.getElementsByTagName('h3')[0].innerText
      }); //Log view_item event to analytics
    }
  }
  close() {
    if (this.canOpen) {
      this.item.classList.remove('open');
      this.content.classList.remove('open');
      this.content.style.maxHeight = this.content.scrollHeight + 'px';
      setTimeout(() => {
        this.content.style.maxHeight = null;
        this.content.addEventListener(
          'transitionend',
          () => {
            if (!this.content.previousElementSibling.classList.contains('open')) {
              //Prevent leftover listener when double clicking quickly
              this.content.style.display = 'none';
            }
            projectsResize();
          },
          { once: true }
        );
      }); //Delay so js runs these separately, won't animate otherwise
    }
  }
  hide() {
    if (this.item.id !== 'resume' && !this.item.classList.contains('remove')) {
      if (this.canOpen && this.item.classList.contains('open')) {
        this.close();
      }
      this.item.style.maxHeight = this.item.getBoundingClientRect().height + 'px';
      setTimeout(() => {
        this.item.classList.add('remove');
        this.item.style.maxHeight = 0;
        onTransitionEnd(this.item, () => {
          this.item.style.display = 'none';
        });
      });
    }
  }
  show() {
    if (this.item.id !== 'resume' && this.item.classList.contains('remove')) {
      this.item.style.display = 'flex';
      setTimeout(() => {
        this.item.style.maxHeight = '300px';
        this.item.classList.remove('remove');
        onTransitionEnd(this.item, () => {
          this.item.style.maxHeight = '';
        });
      });
    }
  }
}

const itemsDOM = document.getElementsByClassName('item');
const items = {};
for (let i = 0; i < itemsDOM.length; i++) {
  items[itemsDOM[i].id] = new Item(itemsDOM[i]);
}

/* Ripples */

const circs = document.getElementsByClassName('ripple');
for (let i = 0; i < circs.length; i++) {
  circs[i].addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    const diameter = Math.max(this.clientWidth, this.clientHeight);
    const radius = diameter / 2;
    ripple.style.width = ripple.style.height = diameter + 'px';
    ripple.style.left = e.offsetX - radius + 'px';
    ripple.style.top = e.offsetY - radius + 'px';
    ripple.classList.add('ripplecircle');
    this.append(ripple);
    ripple.addEventListener(
      'animationend',
      function () {
        this.remove();
      },
      { once: true }
    );
  });
}

/* Full Screen Image */

let fullscreenbg = document.getElementById('fullscreenbg');

function openFullscreen(src, alt) {
  let fullscreenimg = document.getElementById('fullscreenimg');
  fullscreenimg.src = src;
  fullscreenimg.alt = alt;
  openModal(fullscreenbg);
}

const images = document.querySelectorAll('.cards img');
for (let i = 0; i < images.length; i++) {
  images[i].addEventListener('click', () => {
    openFullscreen(images[i].src.substring(0, images[i].src.length - 3) + '2400', images[i].alt);
  });
}

function closeFullscreen() {
  closeModal(fullscreenbg);
}

fullscreenbg.addEventListener('click', function () {
  closeFullscreen();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeFullscreen();
  }
});

/* Filter */

class Filter {
  constructor(filter) {
    this.filter = filter;
  }
  hide() {
    if (!this.filter.classList.contains('remove')) {
      transitioning = 1;
      this.filter.style.maxWidth = this.filter.getBoundingClientRect().width + 'px';
      setTimeout(() => {
        this.filter.classList.add('remove');
        this.filter.style.maxWidth = 0;
        onTransitionEnd(this.filter, () => {
          this.filter.style.display = 'none';
          transitioning = 0;
        });
      });
    }
  }
  show() {
    if (this.filter.classList.contains('remove')) {
      transitioning = 1;
      if (this.filter.classList.contains('featured')) {
        this.filter.style.display = 'flex';
      } else {
        this.filter.style.display = 'inline-block';
      }
      setTimeout(() => {
        this.filter.style.maxWidth = '200px';
        this.filter.classList.remove('remove');
        onTransitionEnd(this.filter, () => {
          this.filter.style.maxWidth = '';
          transitioning = 0;
        });
      });
    }
  }
}

const filterButtons = document.getElementsByClassName('filterButton');
const filters = {};
for (let i = 0; i < filterButtons.length; i++) {
  filters[filterButtons[i].dataset.filter] = new Filter(filterButtons[i]);
  filterButtons[i].addEventListener('click', function () {
    if (!transitioning) {
      clearQuery();
      openFilter(this);
      logOpenFilter();
    }
  });
}

function openFilter(filter) {
  let alreadyFiltered = document.getElementsByClassName('filtered');
  if (
    !filter.classList.contains('filtered') &&
    (!alreadyFiltered.length ||
      alreadyFiltered[alreadyFiltered.length - 1].dataset.children
        .split(' ')
        .includes(filter.dataset.filter))
  ) {
    removeShadowOverlay();
    //Not already clicked
    filter.classList.add('filtered');
    for (let i = 0; i < filterButtons.length; i++) {
      if (
        filterButtons[i].classList.contains('filtered') ||
        filterButtons[i].dataset.parent === filter.dataset.filter
      ) {
        //Show subfilters
        filters[filterButtons[i].dataset.filter].show();
      } else {
        //Hide others
        filters[filterButtons[i].dataset.filter].hide();
      }
    }
    for (const id in items) {
      //Hide items
      if (
        'filters' in items[id].item.dataset &&
        !items[id].item.dataset.filters.split(' ').includes(filter.dataset.filter)
      ) {
        items[id].hide();
      }
    }
    const clearFilter = document.getElementById('clearFilter'); //Show clear filter button
    const shareFilter = document.getElementById('shareFilter'); //Show share filter button
    clearFilter.style.display = 'flex';
    shareFilter.style.display = 'flex';
    setTimeout(() => {
      clearFilter.classList.add('show');
      shareFilter.classList.add('show');
    });
  }
}

//Close filters
document.getElementById('clearFilter').addEventListener('click', function () {
  if (!transitioning) {
    clearQuery();
    const shareFilter = document.getElementById('shareFilter');
    this.classList.remove('show'); //Hide self
    shareFilter.classList.remove('show');
    this.style.display = 'none';
    shareFilter.style.display = 'none';

    for (let i = 0; i < filterButtons.length; i++) {
      //Show all buttons except subfilters
      if (!filterButtons[i].classList.contains('subfilter')) {
        filters[filterButtons[i].dataset.filter].show();
      } else {
        filters[filterButtons[i].dataset.filter].hide();
      }
    }
    for (const id in items) {
      //Show all items
      items[id].show();
    }
    while (document.getElementsByClassName('filtered')[0]) {
      document.getElementsByClassName('filtered')[0].classList.remove('filtered');
    }
  }
});

/* Share */

function shareLink(el, title, url) {
  function success() {
    const check = el.getElementsByClassName('check')[0];
    check.classList.add('copied');
    check.addEventListener(
      'animationend',
      function () {
        this.classList.remove('copied');
      },
      { once: true }
    );
    const shareIcon = el.getElementsByClassName('shareIcon')[0];
    shareIcon.classList.add('copied');
    shareIcon.addEventListener(
      'animationend',
      function () {
        this.classList.remove('copied');
      },
      { once: true }
    );
  }
  if (navigator.share) {
    navigator
      .share({
        title: title,
        url: url
      })
      .then(() => {
        success();
      })
      .catch(console.error);
  } else if (navigator.clipboard) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        success();
      })
      .catch(console.error);
  } else {
    alert(url);
  }
}

function currentURL() {
  return window.location.href.split('?')[0].split('#')[0];
}

//Share filter
document.getElementById('shareFilter').addEventListener('click', function () {
  const filtereds = document.getElementsByClassName('filtered');
  let ids = [];
  let names = [];
  for (let i = 0; i < filtereds.length; i++) {
    ids.push(filtereds[i].id);
    names.push(filtereds[i].innerText);
  }
  shareLink(this, names.reverse().join(' ') + ' Filter', currentURL() + '?filter=' + ids.join());
  analytics.logEvent(analytics, 'share_filter', {
    event_category: 'engagement',
    event_label: names.join(' ')
  }); //Log share_filter event to analytics
});

//Share item
const shares = document.getElementsByClassName('share');
for (let i = 0; i < shares.length; i++) {
  shares[i].addEventListener('click', function () {
    shareLink(
      this,
      shares[i].parentNode.parentNode.getElementsByTagName('h3')[0].innerText,
      currentURL() + '?item=' + shares[i].parentNode.parentNode.id
    );
    analytics.logEvent(analytics, 'share_item', {
      event_category: 'engagement',
      event_label: this.parentNode.parentNode.getElementsByTagName('h3')[0].innerText
    }); //Log share_item event to analytics
  });
}

/* Query paramaters */

function openFilterAndWait(list) {
  //Open filter(s) one at a time, waiting for each
  if (list.length) {
    waitForNotTransitioning(() => {
      openFilter(document.querySelector('#' + list.shift() + '.filterButton'));
      openFilterAndWait(list);
    });
  } else {
    logOpenFilter();
  }
}

const params = new URLSearchParams(window.location.search);

function expandProjects() {
  document.getElementById('projects').style.maxHeight = 'none';
  document.getElementById('shadowOverlay').style.display = 'none';
}

if (params) {
  if (params.has('item') && document.querySelector('#' + params.get('item') + '.item')) {
    expandProjects();
    items[params.get('item')].item.classList.add('pulse-once')
    items[params.get('item')].open();
    document.querySelector('#' + params.get('item') + '.item').scrollIntoView({
      behavior: 'smooth'
    });
  }
  if (
    params.has('filter') &&
    params
      .get('filter')
      .split(',')
      .map(id => document.querySelector('#' + id + '.filterButton'))
      .every(Boolean)
  ) {
    //if each filter is a valid element
    expandProjects();
    openFilterAndWait(params.get('filter').split(','));
  }
}

/* Google Analytics */

const links = document.getElementsByTagName('a');
for (let i = 0; i < links.length; i++) {
  links[i].addEventListener('click', function () {
    analytics.logEvent(analytics, 'click_link', {
      event_category: 'engagement',
      event_label: this.href
    }); //Log click_link event to analytics
  });
}

function logOpenFilter() {
  const filtereds = document.getElementsByClassName('filtered');
  let names = [];
  for (let i = 0; i < filtereds.length; i++) {
    names.push(filtereds[i].innerText);
  }
  analytics.logEvent(analytics, 'view_filter', {
    event_category: 'engagement',
    event_label: names.reverse().join(' ')
  }); //Log view_filter event to analytics
}

/* Easter Eggs */

/*Hue, Saturation, and Brightness*/

let hueSatBri = [
  document.getElementById('hue'),
  document.getElementById('sat'),
  document.getElementById('bri')
];
let hueSatBriVals = [0, 0, 0];

function updateColor() {
  const changeTo =
    'hue-rotate(' +
    hueSatBriVals[0] +
    'deg) saturate(' +
    (((hueSatBriVals[1] / 360) * 200 + 100) % 200) +
    '%) brightness(' +
    (((hueSatBriVals[2] / 360) * 200 + 100) % 200) +
    '%)';
  headerBg.style.filter = changeTo;
  document.getElementById('featured').style.filter = changeTo;
  const features = document.getElementsByClassName('feature');
  for (let i = 0; i < features.length; i++) {
    features[i].style.filter = changeTo;
  }
}

for (let i = 0; i < 3; i++) {
  hueSatBri[i].addEventListener('click', function () {
    hueSatBriVals[i] = (hueSatBriVals[i] + 10) % 360;
    updateColor();
    this.style.transform = 'rotate(' + hueSatBriVals[i] + 'deg)';
  });
}

/*Tilt*/

const splashText = document.getElementById('splashText');
const defaultText = splashText.innerText;
let lines = [];
document.getElementById('tilt').addEventListener('dblclick', function () {
  if (this.classList.contains('hang')) {
    this.classList.remove('hang');
    splashText.innerText = defaultText;
    splashText.classList.remove('splash');
    return;
  }
  this.classList.add('hang');
  function setText() {
    const line = lines[Math.floor(Math.random() * (lines.length - 1))];
    splashText.innerText = line;
    splashText.classList.add('splash');
    headerHeight();
  }
  if (lines.length) {
    setText();
  } else {
    fetch('splashes.txt')
      .then(response => {
        if (!response.ok) {
          throw response.statusText;
        }
        return response.text();
      })
      .then(data => {
        lines = data.split('\n');
        setText();
      })
      .catch(error => {
        console.error('Error fetching splashes:', error);
      });
  }
});

/*Hi!*/

const hi = document.getElementById('hi');

function setExplosion() {
  function rand() {
    return Math.random() * 2 - 1;
  }
  function genColor() {
    let col = [0, 0, 0];
    while (
      Math.sqrt(
        0.299 * Math.pow(col[0], 2) + 0.587 * Math.pow(col[1], 2) + 0.114 * Math.pow(col[2], 2)
      ) < 100
    ) {
      for (let i = 0; i < 3; i++) {
        col[i] = Math.random() * (1 << 8);
      }
    }
    for (let i = 0; i < 3; i++) {
      col[i] = ('0' + (col[i] | 0).toString(16)).slice(-2);
    }
    return '#' + col[0] + col[1] + col[2];
  }
  function burst() {
    return rand() * 2 + 'ch ' + rand() + 'em ' + genColor();
  }
  let textShadow = '';
  for (let i = 0; i < Math.random() * 3 + 2; i++) {
    textShadow += burst() + ', ';
  }
  textShadow += burst();
  hi.style.setProperty('--text-shadow', textShadow);
}
setExplosion();
hi.addEventListener('mouseleave', setExplosion);
