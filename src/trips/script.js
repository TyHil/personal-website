/* Tab Icon */

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
  document.querySelector('link[rel="icon"]').href = '/images/tabicon-light.png';
}

/* Map */

const map = new jsVectorMap({
  map: 'world',
  selector: document.getElementById('map'),
  onRegionTooltipShow: function (event, tooltip, code) {
    event.preventDefault();
  },
  zoomButtons: false,
  regionStyle: {
    initial: {
      fill: 'var(--light1)'
    }
  },
  onLoaded(map) {
    window.addEventListener('resize', () => {
      map.updateSize();
    });
  },
  markerStyle: {
    initial: { stroke: 'transparent', fill: 'var(--accent)', r: 5 }
  },
  lineStyle: {
    stroke: 'var(--accent)',
    strokeWidth: 3,
    strokeDasharray: '6 6',
    curvature: 0.2
  },
  markers: [
    { name: 'Austin', coords: [30.27, -97.74] },
    { name: 'Los Angeles', coords: [34.05, -118.24] },
  ],
  lines: [
    { from: 'Los Angeles', to: 'Austin' },
    { from: 'Austin', to: 'Los Angeles' },
  ]
});
