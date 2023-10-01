//Allow transitions on load
window.addEventListener('load', function () {
  const elements = document.querySelectorAll('.transitionDisabled');
  for (let i = 0; i < elements.length; i++) {
    elements[i].classList.remove('transitionDisabled');
  }
});