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
    if (title && !title.textContent.trim()) title.textContent = `Instruktor/ka ${String(index + 1).padStart(2, '0')}`;
    if (details && !details.textContent.trim()) details.textContent = 'Miejsce na specjalizację i doświadczenie';
    if (bio) bio.textContent = 'Placeholder na krótkie bio instruktora.';
  });

  if (window.lucide) lucide.createIcons();

  const themeToggle = document.querySelector('.theme-toggle');
  const savedTheme = window.localStorage.getItem('osk-turbo-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const setTheme = (isDark) => {
    document.body.classList.toggle('dark-theme', isDark);
    themeToggle?.setAttribute('aria-pressed', String(isDark));
    themeToggle?.setAttribute('aria-label', isDark ? 'Włącz tryb jasny' : 'Włącz tryb ciemny');
    if (themeToggle) themeToggle.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}"></i>`;
    if (window.lucide) lucide.createIcons();
  };

  setTheme(savedTheme ? savedTheme === 'dark' : prefersDark);
  themeToggle?.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-theme');
    setTheme(isDark);
    window.localStorage.setItem('osk-turbo-theme', isDark ? 'dark' : 'light');
  });

  const processModals = document.querySelectorAll('.process-modal');
  const closeProcessModal = (modal) => {
    modal.hidden = true;
    document.body.classList.remove('process-modal-open');
  };

  document.querySelectorAll('[data-process-modal]').forEach((button) => {
    button.addEventListener('click', () => {
      const modal = document.querySelector(`[data-process-dialog="${button.dataset.processModal}"]`);
      if (!modal) return;
      modal.hidden = false;
      document.body.classList.add('process-modal-open');
      modal.querySelector('.process-modal__close')?.focus();
    });
  });

  processModals.forEach((modal) => {
    modal.querySelectorAll('[data-process-close]').forEach((closeButton) => {
      closeButton.addEventListener('click', () => closeProcessModal(modal));
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.process-modal:not([hidden])').forEach(closeProcessModal);
  });

  const fleetGallery = document.querySelector('.fleet-gallery');
  if (fleetGallery) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Podgląd zdjęcia floty');
    lightbox.innerHTML = '<button class="lightbox__close" type="button" aria-label="Zamknij zdjęcie">&times;</button><button class="lightbox__arrow lightbox__arrow--prev" type="button" aria-label="Poprzednie zdjęcie">&#8592;</button><img class="lightbox__image" alt="" /><button class="lightbox__arrow lightbox__arrow--next" type="button" aria-label="Następne zdjęcie">&#8594;</button>';
    document.body.append(lightbox);

    const lightboxImage = lightbox.querySelector('.lightbox__image');
    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      document.body.classList.remove('lightbox-open');
    };
    let lightboxImageIndex = 0;
    const openLightbox = (index) => {
      if (!fleetSlides.length) return;
      lightboxImageIndex = (index + fleetSlides.length) % fleetSlides.length;
      lightboxImage.src = fleetSlides[lightboxImageIndex].src;
      lightboxImage.alt = fleetSlides[lightboxImageIndex].alt;
      lightbox.classList.add('is-open');
      document.body.classList.add('lightbox-open');
    };

    const fleetStage = document.querySelector('.fleet-image');
    const stageImage = fleetStage?.querySelector('img');
    const fleetFigures = [...fleetGallery.querySelectorAll('figure')];
    const fleetSlides = stageImage
      ? [{ src: stageImage.src, alt: stageImage.alt }, ...fleetFigures.map((figure) => {
        const image = figure.querySelector('img');
        return { src: image?.src, alt: image?.alt };
      })].filter((slide) => slide.src)
      : [];
    let currentFleetImage = 0;

    const showFleetImage = (index) => {
      if (!stageImage) return;
      currentFleetImage = (index + fleetSlides.length) % fleetSlides.length;
      stageImage.src = fleetSlides[currentFleetImage].src;
      stageImage.alt = fleetSlides[currentFleetImage].alt;
      fleetFigures.forEach((figure, figureIndex) => {
        figure.classList.toggle('is-active', figureIndex + 1 === currentFleetImage);
      });
    };

    if (fleetStage && stageImage) {
      stageImage.tabIndex = 0;
      stageImage.setAttribute('role', 'button');
      stageImage.setAttribute('aria-label', 'Otwórz duże zdjęcie floty');
      fleetStage.insertAdjacentHTML('beforeend', '<button class="fleet-arrow fleet-arrow--prev" type="button" aria-label="Poprzednie zdjęcie floty">&#8592;</button><button class="fleet-arrow fleet-arrow--next" type="button" aria-label="Następne zdjęcie floty">&#8594;</button>');
      const previousButton = fleetStage.querySelector('.fleet-arrow--prev');
      const nextButton = fleetStage.querySelector('.fleet-arrow--next');
      previousButton.addEventListener('click', () => showFleetImage(currentFleetImage - 1));
      nextButton.addEventListener('click', () => showFleetImage(currentFleetImage + 1));
      stageImage.addEventListener('click', () => openLightbox(currentFleetImage));
      stageImage.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          showFleetImage(currentFleetImage - 1);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          showFleetImage(currentFleetImage + 1);
        }
        if (event.key === 'Enter' || event.key === ' ' || event.code === 'Space') {
          event.preventDefault();
          openLightbox(currentFleetImage);
        }
      });
    }

    fleetFigures.forEach((figure, index) => {
      figure.tabIndex = 0;
      figure.setAttribute('role', 'button');
      figure.addEventListener('click', () => showFleetImage(index + 1));
      figure.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ' || event.code === 'Space') {
          event.preventDefault();
          showFleetImage(index + 1);
        }
      });
    });

    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__arrow--prev').addEventListener('click', () => openLightbox(lightboxImageIndex - 1));
    lightbox.querySelector('.lightbox__arrow--next').addEventListener('click', () => openLightbox(lightboxImageIndex + 1));
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeLightbox();
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'ArrowLeft') openLightbox(lightboxImageIndex - 1);
      if (event.key === 'ArrowRight') openLightbox(lightboxImageIndex + 1);
    });
  }

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');

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
