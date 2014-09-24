document.querySelector('header').addEventListener('click', function(e) {
  if (e.target === e.currentTarget) {
    this.style.display = 'none';
  }
});
