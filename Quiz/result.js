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

  // Add feedback message based on score
  const feedbackText = document.querySelector('.feedback-text');
  if (feedbackText) {
    let feedback = '';
    
    if (result.accuracy === 100) {
      feedback = 'Perfect score! You are a true master!';
    } else if (result.accuracy >= 80) {
      feedback = 'Great job! You have excellent knowledge!';
    } else if (result.accuracy >= 40) {
      feedback = 'Keep practicing! You can do better!';
    } else {
      feedback = 'Don\'t give up! Review the basics and try again!';
    }
    
    feedbackText.textContent = feedback;
  }
}
