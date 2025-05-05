// static/js/home.js

document.addEventListener("DOMContentLoaded", () => {
    // --- Typewriter setup ---
    const words = [
      "privacy laws",
      "cryptography",
      "differential privacy",
      "anonymization"
    ];
    const typingSpeed   = 100;
    const deletingSpeed = 50;
    const pauseBetween  = 1500;
    const typedEl       = document.getElementById("typed-text");
    const wait = ms => new Promise(res => setTimeout(res, ms));
  
    async function typeText(txt) {
      for (let i = 1; i <= txt.length; i++) {
        typedEl.textContent = txt.slice(0, i);
        await wait(typingSpeed);
      }
    }
  
    async function deleteText(txt) {
      for (let i = txt.length; i >= 0; i--) {
        typedEl.textContent = txt.slice(0, i);
        await wait(deletingSpeed);
      }
    }
  
    async function typeLoop() {
      let idx = 0;
      while (true) {
        await typeText(words[idx]);
        await wait(pauseBetween);
        await deleteText(words[idx]);
        await wait(300);
        idx = (idx + 1) % words.length;
      }
    }
  
    typeLoop();
  
    const marquee = document.querySelector('.pill-marquee');
    if (marquee) {
      // 1) measure *before* we duplicate
      const groupHeight = marquee.scrollHeight;
  
      // 2) clone only the FIRST batch so we get exactly two identical groups
      const originalHTML = marquee.innerHTML;
      marquee.innerHTML += originalHTML;
  
      // 3) compute duration in ms
      const scrollSpeed = 30;  // pixels per second
      const durationMs  = (groupHeight / scrollSpeed) * 1000;
  
      // 4) launch infinitely‐looping, perfectly smooth scroll
      marquee.animate(
        [
          { transform: 'translateY(0)' },
          { transform: `translateY(-${groupHeight}px)` }
        ],
        {
          duration:    durationMs,
          iterations:  Infinity,
          easing:      'linear'
        }
      );
    }
  });

  
  