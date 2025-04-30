// static/js/control.js
$(document).ready(() => {
    fetch('/static/nist.json')
      .then(res => res.json())
      .then(data => {
        const info = data.find(item => item.category === 'Control');
        if (!info) return console.error('No "Control" entry found');
  
        $('#category').text(info.category);
        $('#goal').text(info.goal);
  
        // build insights list
        const list = info.insights.map(txt => `<li>${txt}</li>`).join('');
        const credit = `
          <div class="insights-credit">
            <span>
              Inspired by 
              <img src="/static/images/nist-icon.png"
                   alt="NIST logo"
                   class="nist-logo" />
              : Functions and Subcategories
            </span>
          </div>
        `;
  
        const $panel  = $('#insights-container');
        const $credit = $(credit).hide();
        $panel.html(`<ul>${list}</ul>`).append($credit);
  
        $('#insights-toggle').on('click', function() {
          const $btn = $(this);
          const isOpen = $panel.is(':visible');
  
          if (isOpen) $credit.hide();
  
          $panel.slideToggle(600, 'swing', function() {
            const nowOpen = $panel.is(':visible');
            $btn.text(nowOpen ? 'Hide Insights' : 'Show Insights');
            if (nowOpen) $credit.fadeIn(400);
          });
        });
      })
      .catch(err => console.error('Error loading NIST JSON:', err));
  });
  