// static/js/utils.js

// 0) Helper to sync all .question-text in each .question-row
export function syncQuestionTextHeights() {
    $('.question-row').each(function() {
      const $row = $(this);
      // reset any inline heights
      $row.find('.question-text').css('height','auto');
      // measure and find the max
      let maxH = 0;
      $row.find('.question-text').each(function() {
        maxH = Math.max(maxH, $(this).outerHeight());
      });
      // apply that height to all
      $row.find('.question-text').height(maxH);
    });
  }
  
  // whenever the window resizes, re-sync
  $(window).on('resize', syncQuestionTextHeights);
  
  // scrolling helper: center questions container
  export function scrollQuestionsToCenter($questionsContainer) {
    const $win = $(window);
    const containerTop = $questionsContainer.offset().top;
    const containerHeight = $questionsContainer.outerHeight();
    const viewportHeight = $win.height();
    const targetScroll = Math.max(
      0,
      containerTop + containerHeight / 2 - viewportHeight / 2
    );
    // animate over 1 second with a smooth swing easing
    $('html, body').animate(
      { scrollTop: targetScroll },
      1500,
      'linear'
    );
  }
  
  export function syncRankingBlockHeights() {
    const blocks = Array.from(document.querySelectorAll('.ranking-block'));
    if (blocks.length === 0) return;
  
    // reset any inline height
    blocks.forEach(b => b.style.height = 'auto');
  
    // find the tallest
    const maxH = blocks.reduce((h, b) => {
      const bh = b.getBoundingClientRect().height;
      return bh > h ? bh : h;
    }, 0);
  
    // force them all to that height
    blocks.forEach(b => b.style.height = `${maxH}px`);
  }
  