// layout-background.js

// particle setup (unchanged)
const particlesContainer = document.getElementById('particles-container');
const particleCount = 80;

for (let i = 0; i < particleCount; i++) createParticle();

function createParticle() {
  const p = document.createElement('div');
  p.className = 'particle';
  const size = Math.random() * 3 + 1;
  p.style.width = p.style.height = `${size}px`;
  resetParticle(p);
  particlesContainer.appendChild(p);
  animateParticle(p);
}

function resetParticle(particle) {
  const x = Math.random()*100, y = Math.random()*100;
  particle.style.left = `${x}%`;
  particle.style.top  = `${y}%`;
  particle.style.opacity = '0';
  return { x, y };
}

function animateParticle(p) {
  const { x, y } = resetParticle(p);
  const duration = Math.random()*10 + 10, delay = Math.random()*5;
  setTimeout(() => {
    p.style.transition = `all ${duration}s linear`;
    p.style.opacity    = Math.random()*0.3 + 0.1;
    p.style.left       = `${x + (Math.random()*20 - 10)}%`;
    p.style.top        = `${y - (Math.random()*30)}%`;
    setTimeout(() => animateParticle(p), duration*1000);
  }, delay*1000);
}

// on-hover particle spawns + slight sphere parallax
document.addEventListener('mousemove', e => {
  const mx = e.clientX/window.innerWidth*100;
  const my = e.clientY/window.innerHeight*100;

  // spawn a single hover particle
  const p = document.createElement('div');
  p.className = 'particle';
  const sz = Math.random()*4 + 2;
  p.style.width = p.style.height = `${sz}px`;
  p.style.left = `${mx}%`; p.style.top = `${my}%`;
  p.style.opacity = '0.6';
  particlesContainer.appendChild(p);
  setTimeout(() => {
    p.style.transition = 'all 2s ease-out';
    p.style.left = `${mx + (Math.random()*10 - 5)}%`;
    p.style.top  = `${my + (Math.random()*10 - 5)}%`;
    p.style.opacity = '0';
    setTimeout(()=>p.remove(), 2000);
  }, 10);

  // parallax on spheres
  document.querySelectorAll('.gradient-sphere').forEach(sp => {
    const moveX = (e.clientX/window.innerWidth - 0.5)*5;
    const moveY = (e.clientY/window.innerHeight - 0.5)*5;
    sp.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
});
