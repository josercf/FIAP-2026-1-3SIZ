/**
 * FIAP Quiz System for Reveal.js
 * Sistema de quizzes interativos para as aulas
 * Usa data-correct no <section> e radio buttons nas opções
 */

(function () {
  'use strict';

  function initQuizzes() {
    var quizSlides = document.querySelectorAll('.quiz-slide');
    for (var i = 0; i < quizSlides.length; i++) {
      initQuiz(quizSlides[i]);
    }
  }

  function initQuiz(slide) {
    var labels = slide.querySelectorAll('.quiz-options label');
    var feedbackEl = slide.querySelector('.quiz-feedback');
    var correctAnswer = slide.getAttribute('data-correct');
    var feedbackText = slide.getAttribute('data-quiz-feedback') || '';
    var answered = false;

    for (var i = 0; i < labels.length; i++) {
      (function(label) {
        label.style.cursor = 'pointer';
        label.addEventListener('click', function () {
          if (answered) return;
          answered = true;

          var radio = label.querySelector('input[type="radio"]');
          if (!radio) return;
          var selectedValue = radio.value;
          var isCorrect = selectedValue === correctAnswer;

          // Style all labels
          for (var j = 0; j < labels.length; j++) {
            var lbl = labels[j];
            var inp = lbl.querySelector('input[type="radio"]');
            lbl.style.pointerEvents = 'none';
            lbl.style.transition = 'all 0.3s ease';

            if (inp && inp.value === correctAnswer) {
              lbl.style.background = '#eafaf1';
              lbl.style.borderLeft = '5px solid #27ae60';
              lbl.style.color = '#1e8449';
              lbl.style.fontWeight = '700';
            } else if (lbl === label && !isCorrect) {
              lbl.style.background = '#fdedec';
              lbl.style.borderLeft = '5px solid #e74c3c';
              lbl.style.color = '#c0392b';
              lbl.style.textDecoration = 'line-through';
            } else {
              lbl.style.opacity = '0.4';
            }
          }

          // Show feedback
          if (feedbackEl) {
            feedbackEl.style.display = 'block';
            feedbackEl.style.marginTop = '15px';
            feedbackEl.style.padding = '14px 20px';
            feedbackEl.style.borderRadius = '8px';
            feedbackEl.style.fontSize = '0.75em';
            feedbackEl.style.fontWeight = '600';
            feedbackEl.style.lineHeight = '1.5';

            if (isCorrect) {
              feedbackEl.style.background = '#eafaf1';
              feedbackEl.style.borderLeft = '5px solid #27ae60';
              feedbackEl.style.color = '#1e8449';
              feedbackEl.innerHTML = 'Correto! ' + feedbackText;
            } else {
              feedbackEl.style.background = '#fdedec';
              feedbackEl.style.borderLeft = '5px solid #e74c3c';
              feedbackEl.style.color = '#c0392b';
              feedbackEl.innerHTML = 'Incorreto. ' + feedbackText;
            }
          }
        });
      })(labels[i]);
    }
  }

  function resetQuizOnSlideChange() {
    Reveal.on('slidechanged', function(event) {
      var prevSlide = event.previousSlide;
      if (prevSlide && prevSlide.classList.contains('quiz-slide')) {
        var labels = prevSlide.querySelectorAll('.quiz-options label');
        var feedbackEl = prevSlide.querySelector('.quiz-feedback');
        var radios = prevSlide.querySelectorAll('.quiz-options input[type="radio"]');

        for (var i = 0; i < labels.length; i++) {
          labels[i].style.pointerEvents = '';
          labels[i].style.background = '';
          labels[i].style.borderLeft = '';
          labels[i].style.color = '';
          labels[i].style.fontWeight = '';
          labels[i].style.textDecoration = '';
          labels[i].style.opacity = '';
        }

        for (var j = 0; j < radios.length; j++) {
          radios[j].checked = false;
        }

        if (feedbackEl) {
          feedbackEl.style.display = 'none';
          feedbackEl.innerHTML = '';
        }

        initQuiz(prevSlide);
      }
    });
  }

  window.startTimer = function (elementId, minutes) {
    var el = document.getElementById(elementId);
    if (!el) return;
    var totalSeconds = minutes * 60;
    var interval = setInterval(function() {
      var mins = Math.floor(totalSeconds / 60);
      var secs = totalSeconds % 60;
      el.textContent = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
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

  function boot() {
    initQuizzes();
    if (typeof Reveal !== 'undefined' && Reveal.isReady && Reveal.isReady()) {
      resetQuizOnSlideChange();
    } else if (typeof Reveal !== 'undefined') {
      Reveal.on('ready', function() {
        initQuizzes();
        resetQuizOnSlideChange();
      });
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(boot, 500);
  } else {
    window.addEventListener('load', function() { setTimeout(boot, 500); });
  }

})();
