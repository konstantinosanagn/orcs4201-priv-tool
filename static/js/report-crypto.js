// static/js/report-crypto.js
export function maybeInitCrypto(topTool, syncQuestionTextHeights, scrollQuestionsToCenter) {
    if (topTool !== 'Cryptography') return;
  
    const $container = $('#crypto-questions-container').hide();
    const $bar = $(`
      <div class="row crypto-bar-row my-4">
        <div class="col-12 text-center">
          <button class="btn-crypto btn btn-primary">
            Cryptography Specifics <i class="bi bi-arrow-down"></i>
          </button>
        </div>
      </div>
    `);
  
    // insert only the button initially
    $container.before($bar);
  
    $bar.find('.btn-crypto').on('click', () => {
      // on first click, insert spacer + intro
      if ($('.spacer-third-row').length === 0) {
        const $spacer = $('<div class="row spacer-third-row"></div>');
        const $intro = $(`
          <div class="row crypto-intro-row mb-4">
            <div class="col-12 text-center">
              <h2 class="crypto-intro">
                Identify the right cryptography tool for your need:
              </h2>
            </div>
          </div>
        `);
        $container.before($spacer).before($intro);
      }
  
      // if already loaded, just toggle visibility
      if ($container.children().length > 0) {
        $container.slideToggle(() => {
          if ($container.is(':visible')) {
            scrollQuestionsToCenter($container);
          } else {
            $('.spacer-third-row, .crypto-intro-row').remove();
          }
        });
        return;
      }
  
      // otherwise fetch and render the questions
      fetch('/static/crypto.json')
        .then(res => {
          if (!res.ok) throw new Error(`Status ${res.status}`);
          return res.json();
        })
        .then(data => {
          const qs = Array.isArray(data) ? data[0].questions : data.questions;
          $container.empty();
  
          // ——— Row 1: 3 columns ———
          const $row1 = $('<div class="row question-row mb-4 justify-content-center align-items-stretch"></div>');
          qs.slice(0, 3).forEach(q => {
            const $col = $('<div class="col-md-4 mb-4 d-flex flex-column"></div>');
            const $box = $(`
              <div class="question-box">
                <div class="question-text"><h3>${q.question}</h3></div>
                <div class="answers-container"><ul class="answers"></ul></div>
              </div>
            `);
            q.answers.forEach(a => $box.find('.answers').append(`<li>${a.text}</li>`));
            // single-select: clear siblings, mark only this one
             $box.find('.answers li').on('click', function() {
               const $li = $(this);
               $li.closest('ul').find('li').removeClass('selected');
               $li.addClass('selected');
             });
            $col.append($box);
            $row1.append($col);
          });
          $container.append($row1);
  
          // ——— Row 2: 2/4/4/2 columns ———
          const $row2 = $('<div class="row question-row mb-4 align-items-stretch"></div>');
          const colWidths = [2, 4, 4, 2];
          for (let i = 0; i < 4; i++) {
            const $col = $(`<div class="col-md-${colWidths[i]} mb-4 d-flex flex-column"></div>`);
            if (i === 1 || i === 2) {
              const qa = qs[i + 2];
              const $box = $(`
                <div class="question-box">
                  <div class="question-text"><h3>${qa.question}</h3></div>
                  <div class="answers-container"><ul class="answers"></ul></div>
                </div>
              `);
              qa.answers.forEach(a => $box.find('.answers').append(`<li>${a.text}</li>`));
              $box.find('.answers li').on('click', function() {
                const $li = $(this);
                $li.closest('ul').find('li').removeClass('selected');
                $li.addClass('selected');
              });
              $col.append($box);
            }
            $row2.append($col);
          }
          $container.append($row2);
  
          // sync heights & slide into view
          syncQuestionTextHeights();
          $container.slideToggle(() => {
            if ($container.is(':visible')) {
              // first make sure we equalize after it's visible
              syncQuestionTextHeights();
              scrollQuestionsToCenter($container);
            } else {
              $('.spacer-third-row, .crypto-intro-row').remove();
            }
          });
        })
        .catch(err => {
          console.error(err);
          $container.append('<p>Error loading cryptography questions.</p>').slideDown();
        });
    });
  }
  