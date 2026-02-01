window.toggleTheme = function() {
  const body = document.body;
  const currentTheme = body.classList.contains('light') ? 'light' : 'dark';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  body.classList.remove(currentTheme);
  body.classList.add(newTheme);
  
  localStorage.setItem('theme', newTheme);
}

window.loadTheme = function() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(savedTheme);
}

const sounds = {
  correct: null,
  wrong: null,
  timeout: null
};

window.initSounds = function() {
  const correctAudio = document.getElementById('correct-sound');
  const wrongAudio = document.getElementById('wrong-sound');
  const timeoutAudio = document.getElementById('timeout-sound');
  
  if (correctAudio) sounds.correct = correctAudio;
  if (wrongAudio) sounds.wrong = wrongAudio;
  if (timeoutAudio) sounds.timeout = timeoutAudio;
}

window.playSound = function(type) {
  if (sounds[type]) {
    sounds[type].currentTime = 0;
    sounds[type].play().catch(e => console.log('Sound play failed:', e));
  }
}

window.saveQuizState = function(category, currentIndex, score, timeLeft) {
  const state = {
    category,
    currentIndex,
    score,
    timeLeft,
    timestamp: Date.now()
  };
  localStorage.setItem('quizState', JSON.stringify(state));
}

window.loadQuizState = function() {
  const state = localStorage.getItem('quizState');
  if (state) {
    const parsed = JSON.parse(state);

    if (Date.now() - parsed.timestamp < 3600000) {
      return parsed;
    }
  }
  return null;
}

window.clearQuizState = function() {
  localStorage.removeItem('quizState');
}

window.saveResult = function(category, score, total) {
  const accuracy = Math.round((score / total) * 100);
  const result = {
    category,
    score,
    total,
    accuracy,
    timestamp: Date.now()
  };

  localStorage.setItem('latestResult', JSON.stringify(result));

  const bestScores = JSON.parse(localStorage.getItem('bestScores') || '[]');
  bestScores.push(result);

  bestScores.sort((a, b) => {
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return b.score - a.score;
  });

  const top10 = bestScores.slice(0, 10);
  localStorage.setItem('bestScores', JSON.stringify(top10));
}

window.getLatestResult = function() {
  const result = localStorage.getItem('latestResult');
  return result ? JSON.parse(result) : null;
}

window.getBestScores = function() {
  const scores = localStorage.getItem('bestScores');
  return scores ? JSON.parse(scores) : [];
}

window.getRank = function(accuracy) {
  if (accuracy >= 90) return 'A+';
  if (accuracy >= 80) return 'A';
  if (accuracy >= 70) return 'B+';
  if (accuracy >= 60) return 'B';
  if (accuracy >= 50) return 'C';
  return 'D';
}

window.formatCategory = function(category) {
  const names = {
    'html': 'HTML5',
    'css': 'CSS3',
    'javascript': 'JavaScript'
  };
  return names[category] || category.toUpperCase();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadTheme);
} else {
  loadTheme();
}