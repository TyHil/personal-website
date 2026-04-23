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
    { name: 'Denver', coords: [39.74, -104.99] },
    { name: 'Arizona', coords: [34.05, -111.09] },
    { name: 'New York', coords: [40.71, -74.01] },
    { name: 'France', coords: [46.23, 2.21] },
    { name: 'Italy', coords: [41.87, 12.57] },
    { name: 'Czechia', coords: [49.82, 15.47] },
    { name: 'Hungary', coords: [47.16, 19.5] },
    { name: 'Austria', coords: [47.52, 14.55] },
    { name: 'Chile', coords: [-35.68, -71.54] },
    { name: 'Easter Island', coords: [-27.11, -109.35] },
    { name: 'Peru', coords: [-9.2, -74.99] },
    { name: 'South Dakota', coords: [43.97, -99.9] },
    { name: 'Romania', coords: [45.94, 24.97] },
    { name: 'Bulgaria', coords: [42.73, 25.49] },
    { name: 'Boston', coords: [42.36, -71.06] },
    { name: 'Arkansas', coords: [35.2, -91.83] },
    { name: 'Georgia', coords: [32.16, -82.91] },
    { name: 'North Carolina', coords: [35.76, -79.02] },
    { name: 'Alaska', coords: [63.59, -154.49] }
  ],
  lines: [
    { from: 'Los Angeles', to: 'Austin' },
    { from: 'Austin', to: 'Los Angeles' },
    { from: 'Denver', to: 'Austin' },
    { from: 'Austin', to: 'Denver' },
    { from: 'Arizona', to: 'Austin' },
    { from: 'Austin', to: 'Arizona' },
    { from: 'New York', to: 'Austin' },
    { from: 'France', to: 'New York' },
    { from: 'Italy', to: 'France' },
    { from: 'Czechia', to: 'Italy' },
    { from: 'Hungary', to: 'Czechia' },
    { from: 'Czechia', to: 'Hungary' },
    { from: 'Austria', to: 'Czechia' },
    { from: 'Czechia', to: 'Austria' },
    { from: 'Austin', to: 'Czechia' },
    { from: 'Chile', to: 'Austin' },
    { from: 'Easter Island', to: 'Chile' },
    { from: 'Chile', to: 'Easter Island' },
    { from: 'Austin', to: 'Chile' },
    { from: 'Peru', to: 'Austin' },
    { from: 'Austin', to: 'Peru' },
    { from: 'South Dakota', to: 'Austin' },
    { from: 'Austin', to: 'South Dakota' },
    { from: 'Romania', to: 'Austin' },
    { from: 'Bulgaria', to: 'Romania' },
    { from: 'Romania', to: 'Bulgaria' },
    { from: 'Austin', to: 'Romania' },
    { from: 'Boston', to: 'Austin' },
    { from: 'Austin', to: 'Boston' },
    { from: 'Arkansas', to: 'Austin' },
    { from: 'Austin', to: 'Arkansas' },
    { from: 'Georgia', to: 'Austin' },
    { from: 'Austin', to: 'Georgia' },
    { from: 'North Carolina', to: 'Austin' },
    { from: 'Austin', to: 'North Carolina' },
    { from: 'Alaska', to: 'Austin' },
    { from: 'Austin', to: 'Alaska' }
  ]
});
