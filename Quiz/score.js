document.addEventListener('DOMContentLoaded', () => {
  loadTheme();

  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  displayBestScores();

  const bannerBtn = document.querySelector('.banner-btn');
  if (bannerBtn) {
    bannerBtn.addEventListener('click', () => {
      window.location.href = 'category.html';
    });
  }
});

function displayBestScores() {
  const rowsContainer = document.getElementById('rows');
  if (!rowsContainer) return;
  
  const bestScores = getBestScores();
  
  if (bestScores.length === 0) {
    rowsContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #94a3b8;">
        No scores yet. Take a quiz to get started!
      </div>
    `;
    return;
  }

  rowsContainer.innerHTML = '';

  bestScores.forEach((score, index) => {
    const row = document.createElement('div');
    row.className = 'table-row';

    let medal = '';
    if (index === 0) medal = '🥇';
    else if (index === 1) medal = '🥈';
    else if (index === 2) medal = '🥉';
    
    row.innerHTML = `
      <div class="rank-cell">
        <span class="rank-medal">${medal}</span>
        <span>#${index + 1}</span>
      </div>
      <div>
        <span class="category-badge">${formatCategory(score.category)}</span>
      </div>
      <div class="score-cell">${score.accuracy}%</div>
    `;
    
    rowsContainer.appendChild(row);
  });
}
