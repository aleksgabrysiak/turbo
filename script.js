document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.instructor-card').forEach((card, index) => {
    const image = card.querySelector('img');
    const title = card.querySelector('h3');
    const details = card.querySelector('.instructor-info span');
    const bio = card.querySelector('.instructor-info p');
    if (image) {
      image.src = 'assets/osk-turbo3.jpg';
      image.alt = `Placeholder zdjęcia instruktora ${index + 1}`;
    }
    if (title) title.textContent = `Instruktor/ka ${String(index + 1).padStart(2, '0')}`;
    if (details) details.textContent = 'Miejsce na imię, specjalizację i doświadczenie';
    if (bio) bio.textContent = 'Placeholder na krótkie bio instruktora.';
  });

  if (window.lucide) lucide.createIcons();

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const toast = document.querySelector('.toast');
  const form = document.querySelector('.contact-form');

  menuButton?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
    lucide.createIcons();
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuButton?.setAttribute('aria-expanded', 'false');
      if (menuButton) menuButton.innerHTML = '<i data-lucide="menu"></i>';
      if (window.lucide) lucide.createIcons();
    });
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    form.reset();
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 4500);
  });

  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.carousel-track');
    const previousButton = carousel.querySelector('.carousel-button--prev');
    const nextButton = carousel.querySelector('.carousel-button--next');
    if (!track || !previousButton || !nextButton) return;

    const updateButtons = () => {
      const lastPosition = track.scrollWidth - track.clientWidth - 1;
      previousButton.disabled = track.scrollLeft <= 1;
      nextButton.disabled = track.scrollLeft >= lastPosition;
    };

    const move = (direction) => {
      const card = track.querySelector(':scope > article');
      const distance = card ? card.getBoundingClientRect().width + 16 : track.clientWidth;
      track.scrollBy({ left: direction * distance, behavior: 'smooth' });
    };

    previousButton.addEventListener('click', () => move(-1));
    nextButton.addEventListener('click', () => move(1));
    track.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();
  });

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
});
