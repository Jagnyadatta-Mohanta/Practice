document.addEventListener('DOMContentLoaded', () => {
  loadTheme();

  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  const result = getLatestResult();
  
  if (!result) {
    window.location.href = 'index.html';
    return;
  }
  
  displayResults(result);

  const retryBtn = document.querySelector('.btn-primary');
  if (retryBtn) {
    retryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.setItem('selectedCategory', result.category);
      window.location.href = 'quiz.html';
    });
  }
});

function displayResults(result) {
  const accuracyElements = document.querySelectorAll('.metric-value');
  if (accuracyElements.length >= 2) {
    accuracyElements[0].textContent = `${result.accuracy}%`;
    accuracyElements[1].textContent = `${result.score}/${result.total}`;
  }

  const rankValue = document.querySelector('.rank-value');
  if (rankValue) {
    const rank = getRank(result.accuracy);
    rankValue.textContent = `RANK ${rank}`;
  }

  const statusBadge = document.querySelector('.status-badge');
  if (statusBadge) {
    if (result.accuracy >= 80) {
      statusBadge.textContent = 'EXCELLENT WORK';
      statusBadge.style.background = '#10b981';
    } else if (result.accuracy >= 60) {
      statusBadge.textContent = 'GOOD JOB';
      statusBadge.style.background = '#3b82f6';
    } else {
      statusBadge.textContent = 'KEEP PRACTICING';
      statusBadge.style.background = '#f59e0b';
    }
  }
}
