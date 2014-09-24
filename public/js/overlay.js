document.querySelector('header').addEventListener('click', function(e) {
  if (e.target === e.currentTarget) {
    Transportation.clearHelp();
    this.style.display = 'none';
  }
});
