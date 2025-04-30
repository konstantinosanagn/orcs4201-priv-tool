// static/js/report-dp.js
export function maybeInitDP(topTool, syncQuestionTextHeights, scrollQuestionsToCenter) {
    if (topTool !== 'Differential Privacy') return;
  
    const $container = $('#dp-questions-container').hide();
    const $bar = $(
      `<div class="row dp-bar-row my-4">
         <div class="col-12 text-center">
           <button class="btn-dp btn btn-primary">
             Differential Privacy Specifics <i class="bi bi-arrow-down"></i>
           </button>
         </div>
       </div>`
    );
  
    // insert the toggle button
    $container.before($bar);
  
    $bar.find('.btn-dp').on('click', () => {
      // first-click: spacer + intro
      if ($('.spacer-dp-row').length === 0) {
        const $dpSpacer = $('<div class="row spacer-dp-row"></div>');
        const $dpIntro = $(
          `<div class="row dp-intro-row mb-4">
             <div class="col-12 text-center">
               <h2 class="dp-intro">
                 Dive into Differential Privacy questions:
               </h2>
             </div>
           </div>`
        );
        $container.before($dpSpacer).before($dpIntro);
      }
  
      // if already populated, just toggle visibility
      if ($container.children().length > 0) {
        $container.slideToggle(() => {
          if ($container.is(':visible')) {
            syncQuestionTextHeights();
            scrollQuestionsToCenter($container);
          } else {
            $('.spacer-dp-row, .dp-intro-row').remove();
          }
        });
        return;
      }
  
      // fetch and render questions
      fetch('/static/dp.json')
        .then(res => {
          if (!res.ok) throw new Error(`Status ${res.status}`);
          return res.json();
        })
        .then(data => {
          const qs = Array.isArray(data) ? data[0].questions : data.questions;
          $container.empty();
  
          // Row 1: 3 columns
          const $row1 = $('<div class="row question-row mb-4 justify-content-center align-items-stretch"></div>');
          qs.slice(0, 3).forEach(q => {
            const $col = $('<div class="col-md-4 mb-4 d-flex flex-column"></div>');
            const $box = $(
              `<div class="question-box dp-question-box">
                 <div class="question-text"><h3>${q.question}</h3></div>
                 <div class="answers-container"><ul class="answers"></ul></div>
               </div>`
            );
            q.answers.forEach(a => $box.find('.answers').append(`<li>${a.text}</li>`));
            // enforce single-select per question
            $box.find('.answers li').on('click', function() {
            const $li = $(this);
            // clear all in this list, then mark this one
            $li.closest('ul').find('li').removeClass('selected');
            $li.addClass('selected');
            });
            $col.append($box);
            $row1.append($col);
          });
          $container.append($row1);
  
          // Row 2: 2/4/4/2 columns
          const $row2 = $('<div class="row question-row mb-4 align-items-stretch"></div>');
          const colWidths = [2, 4, 4, 2];
          for (let i = 0; i < 4; i++) {
            const $col = $(`<div class="col-md-${colWidths[i]} mb-4 d-flex flex-column"></div>`);
            if (i === 1 || i === 2) {
              const qa = qs[i + 2];
              const $box = $(
                `<div class="question-box dp-question-box">
                   <div class="question-text"><h3>${qa.question}</h3></div>
                   <div class="answers-container"><ul class="answers"></ul></div>
                 </div>`
              );
              qa.answers.forEach(a => $box.find('.answers').append(`<li>${a.text}</li>`));
            // enforce single-select per question
            $box.find('.answers li').on('click', function() {
                const $li = $(this);
                // clear all in this list, then mark this one
                $li.closest('ul').find('li').removeClass('selected');
                $li.addClass('selected');
                });
            $col.append($box);
            }
            $row2.append($col);
          }
          $container.append($row2);
  
          // now toggle visibility and then sync heights
          $container.slideToggle(() => {
            if ($container.is(':visible')) {
              syncQuestionTextHeights();
              scrollQuestionsToCenter($container);
            } else {
              $('.spacer-dp-row, .dp-intro-row').remove();
            }
          });
        })
        .catch(err => {
          console.error(err);
          $container.append('<p>Error loading Differential Privacy questions.</p>').slideDown();
        });
    });
  }
  