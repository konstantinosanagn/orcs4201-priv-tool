// static/js/report-core.js
import {
  syncQuestionTextHeights,
  scrollQuestionsToCenter,
  syncRankingBlockHeights
} from './utils.js';

$(document).ready(() => {
  const categories = ['Identify','Govern','Control','Communicate','Protect'];
  const combined = {};

  // 1) Build combined overall scores
  categories.forEach(cat => {
    const scores = JSON.parse(sessionStorage.getItem(`${cat}_scores`) || '{}');
    Object.entries(scores).forEach(([tool, pts]) => {
      combined[tool] = (combined[tool] || 0) + pts;
    });
  });

  // 2) Sort helper
  function sortedEntries(obj) {
    return Object.entries(obj).sort((a, b) => b[1] - a[1]);
  }

  // 3) Block renderer
  function renderBlock(cellId, title, scoreObj) {
    const entries = sortedEntries(scoreObj);
    const $cell = $(`#cell-${cellId}`);
    const $block = $(
      `<div class="ranking-block">
        <h3>${title}</h3>
        <ol class="ranking-list"></ol>
      </div>`
    );

    entries.forEach(([tool, pts], idx) => {
      $block.find('.ranking-list').append(
        `<li data-tool="${tool}">
           <span class="ranking-item">${idx+1}. ${tool}</span>
           <span class="ranking-points">${pts} pt${pts !== 1 ? 's' : ''}</span>
         </li>`
      );
    });

    if (cellId !== 'overall') {
      const $link = $(`<a href="${cellId}.html" class="ranking-link"></a>`);
      $link.append($block);
      $cell.append($link);
    } else {
      $cell.append($block);
    }
  }

  // 4) Fetch description and render UI
  $.getJSON('/static/tools1.json', tools => {
    function renderTechDescription(toolName) {
      const entry = tools.find(t => t.tool === toolName);
      const $descr = $('#tech-descr-container').empty();
      if (!entry) {
        $descr.append('<p>No description available.</p>');
        return;
      }
      let html = `<h2>${entry.tool}</h2>
                  <h3>Overview</h3><p>${entry.overview}</p>`;
      categories.forEach(cat => {
        html += `<h3>${cat}</h3><p>${entry[cat]}</p>`;
      });
      html += `<h3>Final Thoughts</h3><p>${entry.finalThoughts}</p>`;
      $descr.append(html);
    }

    function showSpecificsFor(toolName) {
      // hide containers
      $('#crypto-questions-container, .crypto-bar-row').hide();
      $('#dp-questions-container, .dp-bar-row').hide();
      // remove any intro/spacer/results rows
      $('.spacer-crypto-row, .crypto-intro-row, .crypto-results-row').remove();
      $('.spacer-dp-row, .dp-intro-row, .dp-results-row').remove();

      if (toolName === 'Cryptography') {
        import('./report-crypto.js')
          .then(mod => mod.maybeInitCrypto(toolName, syncQuestionTextHeights, scrollQuestionsToCenter));
      } else if (toolName === 'Differential Privacy') {
        import('./report-dp.js')
          .then(mod => mod.maybeInitDP(toolName, syncQuestionTextHeights, scrollQuestionsToCenter));
      }
    }

    // initial load
    const topTool = sortedEntries(combined)[0]?.[0] || 'None';
    renderTechDescription(topTool);
    showSpecificsFor(topTool);

    // render ranking blocks
    renderBlock('overall', 'Overall Ranking', combined);
    categories.forEach(cat => {
      const scores = JSON.parse(sessionStorage.getItem(`${cat}_scores`) || '{}');
      renderBlock(cat.toLowerCase(), cat, scores);
    });

    // click handler for overall
    $('#cell-overall .ranking-list').on('click', 'li', function() {
      const toolName = $(this).data('tool');
      renderTechDescription(toolName);
      showSpecificsFor(toolName);
    });

    // equalize heights
    syncRankingBlockHeights();
    $(window).on('resize', syncRankingBlockHeights);
  });
});
