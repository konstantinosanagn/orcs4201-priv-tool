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
  
    // --- Smooth marquee for info panel ---
    const marquee = document.querySelector('.pill-marquee');
    if (marquee) {
      // 1) Duplicate content so it loops seamlessly
      marquee.innerHTML += marquee.innerHTML;
  
      // 2) Compute duration based on content height and desired speed
      const scrollSpeed = 30; // pixels per second
      const singleHeight = marquee.scrollHeight / 2;
      const duration     = singleHeight / scrollSpeed;
  
      // 3) Apply the CSS animation
      marquee.style.animation = `scroll-up ${duration}s linear infinite`;
    }
  });

  
  