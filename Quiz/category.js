document.addEventListener('DOMContentLoaded', () => {
  loadTheme();

  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  const cards = document.querySelectorAll('.card');
  
  cards.forEach(card => {
    const selectBtn = card.querySelector('.select-btn');
    
    selectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const module = card.getAttribute('data-module');
      
      if (module) {

        clearQuizState();

        localStorage.setItem('selectedCategory', module);

        window.location.href = 'quiz.html';
      }
    });

    card.addEventListener('click', () => {
      const module = card.getAttribute('data-module');
      
      if (module) {
        clearQuizState();
        localStorage.setItem('selectedCategory', module);
        window.location.href = 'quiz.html';
      }
    });
  });
});
