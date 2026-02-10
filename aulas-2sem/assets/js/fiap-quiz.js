/**
 * FIAP Quiz System for Reveal.js
 * Sistema de quizzes interativos para as aulas
 */

(function () {
  'use strict';

  // Inicializa todos os quizzes quando o Reveal estiver pronto
  function initQuizzes() {
    const quizSlides = document.querySelectorAll('.quiz-slide');
    quizSlides.forEach(initQuiz);
  }

  function initQuiz(slide) {
    const options = slide.querySelectorAll('.quiz-options li');
    const feedback = slide.querySelector('.quiz-feedback');
    let answered = false;

    options.forEach(option => {
      option.addEventListener('click', function () {
        if (answered) return;
        answered = true;

        const isCorrect = this.dataset.correct === 'true';

        // Marca todas as opções
        options.forEach(opt => {
          opt.style.pointerEvents = 'none';
          if (opt.dataset.correct === 'true') {
            opt.classList.add('correct');
          } else if (opt === option && !isCorrect) {
            opt.classList.add('incorrect');
          }
        });

        // Mostra feedback
        if (feedback) {
          feedback.classList.add('show');
          if (isCorrect) {
            feedback.classList.add('correct');
            feedback.innerHTML = '<strong>Correto!</strong> ' + (feedback.dataset.correctMsg || '');
          } else {
            feedback.classList.add('incorrect');
            feedback.innerHTML = '<strong>Incorreto.</strong> ' + (feedback.dataset.incorrectMsg || '');
          }
        }
      });
    });
  }

  // Reset quiz quando voltar ao slide
  function resetQuizOnSlideChange() {
    Reveal.on('slidechanged', event => {
      const prevSlide = event.previousSlide;
      if (prevSlide && prevSlide.classList.contains('quiz-slide')) {
        const options = prevSlide.querySelectorAll('.quiz-options li');
        const feedback = prevSlide.querySelector('.quiz-feedback');

        options.forEach(opt => {
          opt.classList.remove('correct', 'incorrect');
          opt.style.pointerEvents = '';
        });

        if (feedback) {
          feedback.classList.remove('show', 'correct', 'incorrect');
          feedback.innerHTML = '';
        }

        // Reset answered state - reinitialize
        initQuiz(prevSlide);
      }
    });
  }

  // Timer para exercícios
  window.startTimer = function (elementId, minutes) {
    const el = document.getElementById(elementId);
    if (!el) return;

    let totalSeconds = minutes * 60;

    const interval = setInterval(() => {
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      if (totalSeconds <= 0) {
        clearInterval(interval);
        el.textContent = '00:00';
        el.style.color = '#e74c3c';
        el.style.fontWeight = '700';
      }

      totalSeconds--;
    }, 1000);

    return interval;
  };

  // Inicialização - tenta múltiplas vezes para garantir
  function boot() {
    initQuizzes();
    if (typeof Reveal !== 'undefined' && Reveal.isReady && Reveal.isReady()) {
      resetQuizOnSlideChange();
    } else if (typeof Reveal !== 'undefined') {
      Reveal.on('ready', () => {
        initQuizzes();
        resetQuizOnSlideChange();
      });
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(boot, 500);
  } else {
    window.addEventListener('load', () => setTimeout(boot, 500));
  }

})();
