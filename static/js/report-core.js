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

  // 3) Pick the top tool
  const topTool = sortedEntries(combined)[0]?.[0] || 'None';

  // 4) Block renderer
  function renderBlock(cellId, title, scoreObj) {
    const entries = sortedEntries(scoreObj);
    const $cell = $(`#cell-${cellId}`);
    const $block = $(`
      <div class="ranking-block">
        <h3>${title}</h3>
        <ol class="ranking-list"></ol>
      </div>
    `);
    entries.forEach(([tool, pts], idx) => {
      $block.find('.ranking-list').append(`
        <li>
          <span class="ranking-item">${idx+1}. ${tool}</span>
          <span class="ranking-points">${pts} pt${pts !== 1 ? 's' : ''}</span>
        </li>
      `);
    });

    if (cellId !== 'overall') {
      const $link = $(`<a href="${cellId}.html" class="ranking-link"></a>`);
      $link.append($block);
      $cell.append($link);
    } else {
      $cell.append($block);
    }
  }

  // 5) Fetch description and then render everything
  $.getJSON('/static/tools1.json', tools => {
    // fill the blue pane
    const entry = tools.find(t => t.tool === topTool);
    if (!entry) {
      $('#tech-descr-container').append('<p>No description available.</p>');
    } else {
      let html = `<h2>${entry.tool}</h2><h3>Overview</h3><p>${entry.overview}</p>`;
      categories.forEach(cat => {
        html += `<h3>${cat}</h3><p>${entry[cat]}</p>`;
      });
      html += `<h3>Final Thoughts</h3><p>${entry.finalThoughts}</p>`;
      $('#tech-descr-container').append(html);
    }

    // render all six ranking blocks
    renderBlock('overall', 'Overall Ranking', combined);
    categories.forEach(cat => {
      const scores = JSON.parse(sessionStorage.getItem(`${cat}_scores`) || '{}');
      renderBlock(cat.toLowerCase(), cat, scores);
    });

    // 6) Equalize _all_ .ranking-blocks to the tallest one
    syncRankingBlockHeights();

    // re-sync on resize
    $(window).on('resize', () => {
      // you can debounce if you like
      syncRankingBlockHeights();
    });

    // dynamically load specifics
    import('./report-crypto.js')
      .then(mod => mod.maybeInitCrypto(topTool, syncQuestionTextHeights, scrollQuestionsToCenter));
    import('./report-dp.js')
      .then(mod => mod.maybeInitDP(topTool, syncQuestionTextHeights, scrollQuestionsToCenter));
  });
});
