// static/js/protect_questions.js
$(document).ready(() => {
  const $container   = $('#questions-container');
  const category     = $container.data('category');      // "Protect"
  const introUrl     = $container.data('intro-url');     // "/protect"
  const completeUrl  = $container.data('complete-url');  // "/report"

  fetch('/static/nist1.json')
    .then(res => res.json())
    .then(data => {
      const section = data.find(item => item.category === category);
      if (!section?.questions) {
        return console.error(`No "${category}.questions"`);
      }

      const questions = section.questions;
      const total     = questions.length;

      // render all question-boxes
      $container.empty();
      questions.forEach((q, qIdx) => {
        const $qBox = $(`
          <div class="question-box">
            <div class="question-content">
              <h3>${q.question}</h3>
              <ul class="answers"></ul>
              <button class="back-btn">Back</button>
              <button class="info-btn btn btn-link" type="button" aria-label="More info">
                <i class="bi bi-info-circle"></i>
              </button>
              <button class="next-btn">
                ${qIdx === total - 1 ? 'Finish Protect' : 'Next'}
              </button>
            </div>
            <div class="info-container">
              <button class="close-btn" aria-label="Close">&times;</button>
              <div class="info-body">
                <p>${q.explanation}</p>
              </div>
            </div>
          </div>
        `);

        // open slide-in panel
        $qBox.on('click', '.info-btn', function(e) {
          e.stopPropagation();
          $(this).closest('.question-box').addClass('open');
        });

        // close panel
        $qBox.on('click', '.close-btn', function(e) {
          e.stopPropagation();
          $(this).closest('.question-box').removeClass('open');
        });

        // populate answers
        q.answers.forEach((ans, aIdx) => {
          $qBox.find('.answers').append(`
            <li data-qid="${qIdx}" data-ans="${aIdx}">
              ${ans.text}
            </li>
          `);
        });

        $qBox.hide();
        $container.append($qBox);
      });

      // restore selections & scores
      questions.forEach((_, qIdx) => {
        const sel = sessionStorage.getItem(`${category}_q_${qIdx}`);
        if (sel !== null) {
          $container
            .find(`li[data-qid="${qIdx}"][data-ans="${sel}"]`)
            .addClass('selected');
        }
      });

      // answer click → update sessionStorage
      $container.on('click', '.answers li', function() {
        const $li   = $(this);
        const qid   = $li.data('qid');
        const ansId = +$li.data('ans');

        $li.siblings().removeClass('selected');
        $li.addClass('selected');
        sessionStorage.setItem(`${category}_q_${qid}`, ansId);

        const chosen   = questions[qid].answers[ansId];
        const wKey     = `${category}_weights_q_${qid}`;
        const sKey     = `${category}_scores`;
        const prevW    = JSON.parse(sessionStorage.getItem(wKey) || '{}');
        const totals   = JSON.parse(sessionStorage.getItem(sKey) || '{}');

        Object.entries(prevW).forEach(([tool,w]) => totals[tool] = (totals[tool]||0) - w);
        Object.entries(chosen.weights).forEach(([tool,w]) => totals[tool] = (totals[tool]||0) + w);

        sessionStorage.setItem(sKey, JSON.stringify(totals));
        sessionStorage.setItem(wKey, JSON.stringify(chosen.weights));
      });

      // paging logic
      let current = 0;
      const $boxes = $container.find('.question-box');
      function show(i) {
        $boxes.hide().eq(i).fadeIn(200);
      }
      show(current);

      // Next …
      $container.on('click', '.next-btn', () => {
        if (current < total - 1) {
          current += 1;
          show(current);
        } else {
          window.location.href = completeUrl;
        }
      });

      // Back …
      $container.on('click', '.back-btn', () => {
        if (current > 0) {
          current -= 1;
          show(current);
        } else {
          window.location.href = introUrl;
        }
      });
    })
    .catch(err => console.error(err));
});
