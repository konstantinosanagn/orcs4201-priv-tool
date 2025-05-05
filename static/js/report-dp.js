// static/js/report-dp.js
export function maybeInitDP(topTool, syncQuestionTextHeights, scrollQuestionsToCenter) {
  if (topTool !== 'Differential Privacy') return;

  const $container = $('#dp-questions-container').hide();
  const $bar = $(`
    <div class="row dp-bar-row my-4">
      <div class="col-12 text-center">
        <button class="btn-dp btn btn-primary">
          Differential Privacy Specifics <i class="bi bi-arrow-down"></i>
        </button>
      </div>
    </div>
  `);

  $container.before($bar);

  $bar.find('.btn-dp').on('click', () => {
    // first-click: spacer + intro
    if ($('.spacer-dp-row').length === 0) {
      const $dpSpacer = $('<div class="row spacer-dp-row"></div>');
      const $dpIntro = $(`
        <div class="row dp-intro-row mb-4">
          <div class="col-12 text-center">
            <h2 class="dp-intro">
              Dive into Differential Privacy questions:
            </h2>
          </div>
        </div>
      `);
      $container.before($dpSpacer).before($dpIntro);
    }

    // if already populated, smoothly toggle intro, questions & results
    if ($container.children().length > 0) {
      $('.spacer-dp-row, .dp-intro-row').toggle();
      $container.slideToggle(() => {
        if ($container.is(':visible')) {
          syncQuestionTextHeights();
          scrollQuestionsToCenter($container);
        }
      });
      $('.dp-results-row').slideToggle();
      return;
    }

    // fetch questions + specs and render
    Promise.all([
      fetch('/static/dp.json'),
      fetch('/static/dp-spec.json')
    ])
    .then(resps => Promise.all(
      resps.map(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
    ))
    .then(([dpData, specData]) => {
      const qs = Array.isArray(dpData) ? dpData[0].questions : dpData.questions;
      const questions = qs.slice(0, 5);
      const dpSpecs = specData.dpSpecs;
      $container.empty();

      // helper to compute & render results
      function computeDPResults() {
        const answered = $container.find('.dp-question-box .answers li.selected').length;
        if (answered < questions.length) {
          $('.dp-results-row').remove();
          return;
        }

        // accumulate totals
        const totals = {
          CentralDP: 0,
          LocalDP: 0,
          RandomizedResponse: 0,
          UserLevelDP: 0,
          EventLevelDP: 0
        };
        $container.find('.dp-question-box').each(function() {
          const w = JSON.parse($(this).find('.answers li.selected').attr('data-weights'));
          Object.entries(w).forEach(([k, v]) => totals[k] += v);
        });

        // build & sort pairs
        const cl = [
          ['CentralDP', totals.CentralDP],
          ['LocalDP',   totals.LocalDP]
        ].sort((a, b) => b[1] - a[1]);

        const ue = [
          ['UserLevelDP',  totals.UserLevelDP],
          ['EventLevelDP', totals.EventLevelDP]
        ].sort((a, b) => b[1] - a[1]);

        // remove old results
        $('.dp-results-row').remove();

        // build results row hidden by default
        const $resultsRow = $(`
          <div class="row dp-results-row mb-6" style="display:none">
            <div class="col-md-6 mb-6">
              <div class="dp-result-container" id="dp-cl-ranking"></div>
            </div>
            <div class="col-md-6 mb-6">
              <div class="dp-result-container" id="dp-ue-ranking"></div>
            </div>
          </div>
        `);

        // fill Central vs Local container
        const $cl = $resultsRow.find('#dp-cl-ranking');
        $cl.append(`<div class="row"><div class="col"><h3>Central DP vs Local DP</h3></div></div>`);
        cl.forEach(([tool, pts], i) => {
          $cl.append(`
            <div class="row subtask-row align-items-center mt-2">
              <div class="col-1 subtask-index">${i + 1}.</div>
              <div class="col subtask-title">${tool}</div>
              <div class="col-auto ranking-points-dp">${pts} pt${pts !== 1 ? 's' : ''}</div>
            </div>
            <div class="row summary-row">
              <div class="col">
                <p class="dp-summary px-3">${dpSpecs[tool].summary}</p>
              </div>
            </div>
          `);
        });

        // fill User vs Event container
        const $ue = $resultsRow.find('#dp-ue-ranking');
        $ue.append(`<div class="row"><div class="col"><h3>User-Level DP vs Event-Level DP</h3></div></div>`);
        ue.forEach(([tool, pts], i) => {
          $ue.append(`
            <div class="row subtask-row align-items-center mt-2">
              <div class="col-1 subtask-index">${i + 1}.</div>
              <div class="col subtask-title">${tool}</div>
              <div class="col-auto ranking-points-dp">${pts} pt${pts !== 1 ? 's' : ''}</div>
            </div>
            <div class="row summary-row">
              <div class="col">
                <p class="dp-summary px-3">${dpSpecs[tool].summary}</p>
              </div>
            </div>
          `);
        });

        // insert and animate
        $container.after($resultsRow);
        $resultsRow.slideDown();
      }

      // Row 1: first 3 questions
      const $row1 = $('<div class="row question-row mb-4 justify-content-center align-items-stretch"></div>');
      questions.slice(0, 3).forEach(q => {
        const $col = $('<div class="col-md-4 mb-4 d-flex flex-column"></div>');
        const $box = $(`
          <div class="question-box dp-question-box">
            <div class="question-text"><h3>${q.question}</h3></div>
            <div class="answers-container"><ul class="answers"></ul></div>
          </div>
        `);
        q.answers.forEach(a => {
          $box.find('.answers').append(`
            <li data-weights='${JSON.stringify(a.weights)}'>${a.text}</li>
          `);
        });
        $box.find('.answers li').on('click', function() {
          $(this).closest('ul').find('li').removeClass('selected');
          $(this).addClass('selected');
          computeDPResults();
        });
        $col.append($box);
        $row1.append($col);
      });
      $container.append($row1);

      // Row 2: next 2 in 4-column layout
      const $row2 = $('<div class="row question-row mb-4 align-items-stretch"></div>');
      const colWidths = [2, 4, 4, 2];
      for (let i = 0; i < 4; i++) {
        const $col = $(`<div class="col-md-${colWidths[i]} mb-4 d-flex flex-column"></div>`);
        if (i === 1 || i === 2) {
          const q = questions[i + 2];
          const $box = $(`
            <div class="question-box dp-question-box">
              <div class="question-text"><h3>${q.question}</h3></div>
              <div class="answers-container"><ul class="answers"></ul></div>
            </div>
          `);
          q.answers.forEach(a => {
            $box.find('.answers').append(`
              <li data-weights='${JSON.stringify(a.weights)}'>${a.text}</li>
            `);
          });
          $box.find('.answers li').on('click', function() {
            $(this).closest('ul').find('li').removeClass('selected');
            $(this).addClass('selected');
            computeDPResults();
          });
          $col.append($box);
        }
        $row2.append($col);
      }
      $container.append($row2);

      // slide questions into view
      $container.slideToggle(() => {
        if ($container.is(':visible')) {
          syncQuestionTextHeights();
          scrollQuestionsToCenter($container);
        } else {
          $('.spacer-dp-row, .dp-intro-row').remove();
          $('.dp-results-row').remove();
        }
      });
    })
    .catch(err => {
      console.error(err);
      $container.append('<p>Error loading Differential Privacy questions.</p>').slideDown();
    });
  });
}
