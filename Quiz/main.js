document.addEventListener('DOMContentLoaded', () => {
  loadTheme();

  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
})
