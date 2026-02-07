document.addEventListener('DOMContentLoaded', () => {

  const CORRECT_PASSWORD = '27112008';
  const MAX_LENGTH = 8;

  const form = document.getElementById('passwordForm');
  const passwordInput = document.getElementById('passwordInput');
  const keypad = document.getElementById('keypad');

  function appendValue(number) {
    if (passwordInput.value.length < MAX_LENGTH) {
      passwordInput.value += number;
    }
  }

  function clearPassword() {
    passwordInput.value = '';
  }

  function checkPassword() {
    const enteredPassword = passwordInput.value;

    if (enteredPassword === CORRECT_PASSWORD) {
      passwordInput.classList.add('correct');
      alert('Mật khẩu đúng! Chuẩn bị đón bất ngờ nè!!');
      window.location.href = 'main.html';
    } else {
      passwordInput.classList.add('incorrect');
      setTimeout(() => {
        passwordInput.classList.remove('incorrect');
        alert('Mật khẩu sai! Vui lòng thử lại.');
        clearPassword();
      }, 500);
    }
  }

  function createHeartEffects() {
    if (document.querySelector('.heart-particle')) return;

    for (let i = 0; i < 30; i++) {
      const heart = document.createElement('div');
      heart.classList.add('heart-particle');
      heart.style.left = `${Math.random() * 100}vw`;
      heart.style.animationDelay = `${Math.random() * 8}s`;
      heart.style.animationDuration = `${Math.random() * 5 + 5}s`;
      heart.style.backgroundColor = `hsl(${Math.random() * 20 + 330}, 80%, ${Math.random() * 20 + 60}%)`;
      document.body.appendChild(heart);
    }
  }

  keypad.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;

    const value = target.dataset.value;
    const action = target.dataset.action;

    if (value) {
      appendValue(value);
    } else if (action === 'clear') {
      clearPassword();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    checkPassword();
  });

  createHeartEffects();
});
