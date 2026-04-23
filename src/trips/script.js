/* Tab Icon */

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
  document.querySelector('link[rel="icon"]').href = '/images/tabicon-light.png';
}

/* Map */

const map = new jsVectorMap({
  map: 'world',
  selector: document.getElementById('map'),
  showTooltip: false,
  onLoaded(map) {
    window.addEventListener('resize', () => {
      map.updateSize();
    });
  }
});
