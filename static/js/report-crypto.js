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

  $container.before($bar);

  $bar.find('.btn-crypto').on('click', () => {
    // first click: insert spacer + intro
    if ($('.spacer-crypto-row').length === 0) {
      const $spacer = $('<div class="row spacer-crypto-row"></div>');
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

    // if already loaded, just toggle everything
    // if already loaded, smoothly toggle intro, questions & results
    if ($container.children().length > 0) {
      // 1) toggle the spacer + intro
      $('.spacer-crypto-row, .crypto-intro-row').toggle();

      // 2) slide the questions container in/out
      $container.slideToggle(() => {
        if ($container.is(':visible')) {
          scrollQuestionsToCenter($container);
        }
      });

      // 3) slide the results in/out
      $('.crypto-results-row').slideToggle();

      return;
    }


    // fetch questions + specs
    Promise.all([
      fetch('/static/crypto.json'),
      fetch('/static/crypto-spec.json')
    ])
    .then(resps => Promise.all(resps.map(r => {
      if (!r.ok) throw new Error(`Status ${r.status}`);
      return r.json();
    })))
    .then(([qData, specData]) => {
      const qs = Array.isArray(qData) ? qData[0].questions : qData.questions;
      const specs = specData.cryptoSpecs;
      $container.empty();

      // helper to compute & render results
      function computeCryptoResults() {
        const answered = $container.find('.question-box .answers li.selected').length;
        if (answered < 5) {
          $('.crypto-results-row').remove();
          return;
        }

        // accumulate totals for each tool
        const totals = {};
        Object.keys(specs).forEach(key => totals[key] = 0);

        $container.find('.question-box').each(function() {
          const weights = JSON.parse($(this).find('li.selected').attr('data-weights'));
          Object.entries(weights).forEach(([key, val]) => {
            if (totals[key] !== undefined) totals[key] += val;
          });
        });

        // sort descending
        const sorted = Object.entries(totals).sort((a,b) => b[1] - a[1]);

        // remove old results
        $('.crypto-results-row').remove();

        // build results row
        const $resultsRow = $(`
          <div class="row crypto-results-row mb-6" style="display:none">
            <div class="col-md-12 mb-6">
              <div class="crypto-result-container" id="crypto-ranking"></div>
            </div>
          </div>
        `);
        const $rank = $resultsRow.find('#crypto-ranking');
        $rank.append(`<div class="row"><div class="col"><h3>Cryptography Tools Ranking</h3></div></div>`);

        sorted.forEach(([key, pts], idx) => {
          const tool = specs[key];
          $rank.append(`
            <div class="row subtask-row align-items-center mt-2">
              <div class="col-1 subtask-index">${idx+1}.</div>
              <div class="col subtask-title">${tool.name}</div>
              <div class="col-auto ranking-points-crypto">${pts} pt${pts!==1?'s':''}</div>
            </div>
            <div class="row summary-row">
              <div class="col">
                <p class="crypto-summary px-3">${tool.summary}</p>
              </div>
            </div>
          `);
        });

        $container.after($resultsRow);
        $resultsRow.slideDown();
      }

      // Row 1: first 3 questions
      const $row1 = $('<div class="row question-row mb-4 justify-content-center align-items-stretch"></div>');
      qs.slice(0,3).forEach(q => {
        const $col = $('<div class="col-md-4 mb-4 d-flex flex-column"></div>');
        const $box = $(`
          <div class="question-box">
            <div class="question-text"><h3>${q.question}</h3></div>
            <div class="answers-container"><ul class="answers"></ul></div>
          </div>
        `);
        q.answers.forEach(a => {
          $box.find('.answers').append(`
            <li data-weights='${JSON.stringify(a.weights)}'>${a.text}</li>
          `);
        });
        $box.find('li').on('click', function() {
          $(this).closest('ul').find('li').removeClass('selected');
          $(this).addClass('selected');
          computeCryptoResults();
        });
        $col.append($box);
        $row1.append($col);
      });
      $container.append($row1);

      // Row 2: next 2 questions in 2/4/4/2 layout
      const $row2 = $('<div class="row question-row mb-4 align-items-stretch"></div>');
      const colWidths = [2,4,4,2];
      for (let i=0; i<4; i++) {
        const $col = $(`<div class="col-md-${colWidths[i]} mb-4 d-flex flex-column"></div>`);
        if (i===1 || i===2) {
          const q = qs[i+2];
          const $box = $(`
            <div class="question-box">
              <div class="question-text"><h3>${q.question}</h3></div>
              <div class="answers-container"><ul class="answers"></ul></div>
            </div>
          `);
          q.answers.forEach(a => {
            $box.find('.answers').append(`
              <li data-weights='${JSON.stringify(a.weights)}'>${a.text}</li>
            `);
          });
          $box.find('li').on('click', function() {
            $(this).closest('ul').find('li').removeClass('selected');
            $(this).addClass('selected');
            computeCryptoResults();
          });
          $col.append($box);
        }
        $row2.append($col);
      }
      $container.append($row2);

      // sync heights & show
      syncQuestionTextHeights();
      $container.slideToggle(() => {
        if ($container.is(':visible')) {
          syncQuestionTextHeights();
          scrollQuestionsToCenter($container);
        } else {
          $('.spacer-crypto-row, .crypto-intro-row').remove();
          $('.crypto-results-row').remove();
        }
      });
    })
    .catch(err => {
      console.error(err);
      $container.append('<p>Error loading cryptography questions.</p>').slideDown();
    });
  });
}
