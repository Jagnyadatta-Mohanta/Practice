let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 30;
let timerInterval = null;
let selectedAnswer = null;
let isAnswered = false;
let category = '';

let categoryDisplay;
let timerValue;
let progressFill;
let questionText;
let optionsGrid;
let nextBtn;
let terminateBtn;

document.addEventListener('DOMContentLoaded', async () => {

  loadTheme();

  feedbackText = document.getElementById('feedbackText');

  initSounds();

  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  categoryDisplay = document.querySelector('.category');
  timerValue = document.querySelector('.timer-value');
  progressFill = document.querySelector('.progress-fill');
  questionText = document.querySelector('.question-text');
  optionsGrid = document.querySelector('.options-grid');
  nextBtn = document.querySelector('.next-btn');
  terminateBtn = document.querySelector('.terminate-btn');

  category = localStorage.getItem('selectedCategory') || 'html';

  if (categoryDisplay) {
    categoryDisplay.textContent = formatCategory(category);
  }

  await loadQuestions();

  nextBtn.addEventListener('click', handleNext);
  terminateBtn.addEventListener('click', handleTerminate);

  displayQuestion();
  startTimer();
});

async function loadQuestions() {
  try {
    const response = await fetch('questions.json');
    const data = await response.json();
    questions = data[category] || data.html;
    questions = shuffleArray(questions);
  } catch (error) {
    console.error('Error loading questions:', error);
    alert('Failed to load questions. Please refresh the page.');
  }
}

function displayQuestion() {
  if (currentQuestionIndex >= questions.length) {
    endQuiz();
    return;
  }
  
  const question = questions[currentQuestionIndex];

  isAnswered = false;
  selectedAnswer = null;
  nextBtn.disabled = true;

  questionText.textContent = question.question;

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressFill.style.width = `${progress}%`;

  optionsGrid.innerHTML = '';
  
  question.options.forEach((option, index) => {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option';
    optionDiv.setAttribute('data-index', index);
    
    optionDiv.innerHTML = `
      <div class="option-letter">${String.fromCharCode(65 + index)}</div>
      <div class="option-text">${option}</div>
      <div class="check-icon">✓</div>
    `;
    
    optionDiv.addEventListener('click', () => handleOptionClick(index, optionDiv));
    
    optionsGrid.appendChild(optionDiv);
  });

  timeLeft = 30;
  updateTimerDisplay();
}

function handleOptionClick(index, optionElement) {
  if (isAnswered) return;
  
  const question = questions[currentQuestionIndex];

  isAnswered = true;
  selectedAnswer = index;

  stopTimer();

  const allOptions = optionsGrid.querySelectorAll('.option');
  allOptions.forEach(opt => opt.classList.remove('selected'));

  optionElement.classList.add('selected');
  
  const isCorrect = index === question.correct;
  
  if (isCorrect) {
    optionElement.classList.remove('selected');
    optionElement.classList.add('correct');
    score++;
    playSound('correct');
  } else {
    optionElement.classList.remove('selected');
    optionElement.classList.add('incorrect');
    allOptions[question.correct].classList.add('correct');
    playSound('wrong');
  }
  nextBtn.disabled = false;
}

function handleNext() {
  currentQuestionIndex++;
  
  if (currentQuestionIndex < questions.length) {
    stopTimer();
    displayQuestion();
    startTimer();
  } else {
    endQuiz();
  }
}

function handleTerminate() {
  if (confirm('Are you sure you want to exit the quiz?')) {
    clearQuizState();
    window.location.href = 'index.html';
  }
}

function startTimer() {
  stopTimer();
  
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    
    if (timeLeft <= 0) {
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerValue.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (timeLeft <= 5 && timeLeft > 0) {
    timerValue.style.color = '#ef4444';
  } else {
    timerValue.style.color = '';
  }
}

function handleTimeout() {
  if (isAnswered) return; 
  
  stopTimer();
  isAnswered = true;
  
  const question = questions[currentQuestionIndex];
  const allOptions = optionsGrid.querySelectorAll('.option');

  allOptions[question.correct].classList.add('correct');
  
  playSound('timeout');
  nextBtn.disabled = false;

  setTimeout(() => {
    if (currentQuestionIndex < questions.length - 1) {
      handleNext();
    } else {
      endQuiz();
    }
  }, 2000);
}

function endQuiz() {
  stopTimer();
  saveResult(category, score, questions.length);
  window.location.href = 'result.html';
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
