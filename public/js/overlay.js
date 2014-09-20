document.getElementsByTagName('header')[0].addEventListener('click', function(e) {
  if (e.target === e.currentTarget) {
    this.style.display = 'none';
  }
});
