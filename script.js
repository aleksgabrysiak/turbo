document.addEventListener('DOMContentLoaded', () => {
  const ticker = document.querySelector('.ticker-inner');
  const tickerItems = ticker ? [...ticker.querySelectorAll('span')] : [];
  const previousTickerButton = document.querySelector('.ticker-button--prev');
  const nextTickerButton = document.querySelector('.ticker-button--next');
  let tickerIndex = 0;
  let tickerDirection = 1;
  const showTickerItem = (nextIndex) => {
    if (!ticker || !tickerItems.length) return;
    tickerIndex = Math.max(0, Math.min(tickerItems.length - 1, nextIndex));
    ticker.scrollTo({ left: tickerIndex * ticker.clientWidth, behavior: 'smooth' });
  };
  const advanceTicker = () => {
    if (!ticker || window.innerWidth > 820 || tickerItems.length < 2) return;
    if (tickerIndex === tickerItems.length - 1) tickerDirection = -1;
    if (tickerIndex === 0) tickerDirection = 1;
    showTickerItem(tickerIndex + tickerDirection);
  };
  if (ticker) window.setInterval(advanceTicker, 3200);
  previousTickerButton?.addEventListener('click', () => {
    tickerDirection = -1;
    showTickerItem(tickerIndex - 1);
  });
  nextTickerButton?.addEventListener('click', () => {
    tickerDirection = 1;
    showTickerItem(tickerIndex + 1);
  });

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

  const instructorsTrack = document.querySelector('[data-instructors-manifest]');
  if (instructorsTrack) {
    const renderInstructors = async () => {
      try {
        const response = await fetch(instructorsTrack.dataset.instructorsManifest, { cache: 'no-store' });
        if (!response.ok) throw new Error('Nie udało się wczytać instruktorów.');
        const instructors = await response.json();
        if (!Array.isArray(instructors)) throw new Error('Nieprawidłowy format pliku instruktorów.');

        const fragment = document.createDocumentFragment();
        instructors.forEach((instructor) => {
          const card = document.createElement('article');
          card.className = 'instructor-card';
          const photo = document.createElement('div');
          photo.className = 'instructor-photo';
          const image = document.createElement('img');
          image.src = instructor.image || 'assets/osk-turbo3.jpg';
          image.alt = instructor.imageAlt || `${instructor.name}, instruktor jazdy`;
          const chip = document.createElement('span');
          chip.className = 'instructor-chip';
          chip.textContent = instructor.categories || '';
          photo.append(image, chip);

          const info = document.createElement('div');
          info.className = 'instructor-info';
          const heading = document.createElement('div');
          const title = document.createElement('h3');
          title.textContent = instructor.name || 'Instruktor/ka';
          const specialization = document.createElement('span');
          specialization.textContent = instructor.specialization || '';
          heading.append(title, specialization);
          const bio = document.createElement('p');
          bio.textContent = instructor.bio || '';
          info.append(heading, bio);
          card.append(photo, info);
          fragment.append(card);
        });
        instructorsTrack.replaceChildren(fragment);
        window.dispatchEvent(new Event('resize'));
      } catch (error) {
        console.warn('Instruktorzy nie zostali wczytani z JSON.', error);
      }
    };
    renderInstructors();
  }

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

  const testimonialsTrack = document.querySelector('[data-testimonials-manifest]');
  if (testimonialsTrack) {
    const initialsFromName = (name) => name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const formatAuthor = (name) => {
      const parts = String(name || 'Kursant').trim().split(/\s+/).filter(Boolean);
      if (parts.length < 2 || /^\p{L}\.?$/u.test(parts[parts.length - 1])) return parts.join(' ');
      const surnameInitial = parts[parts.length - 1].charAt(0).toUpperCase();
      return `${parts[0]} ${surnameInitial}.`;
    };
    const renderTestimonials = async () => {
      try {
        const response = await fetch(testimonialsTrack.dataset.testimonialsManifest, { cache: 'no-store' });
        if (!response.ok) throw new Error('Nie udało się wczytać opinii.');
        const testimonials = await response.json();
        if (!Array.isArray(testimonials)) throw new Error('Nieprawidłowy format pliku opinii.');

        const fragment = document.createDocumentFragment();
        testimonials.forEach((testimonial) => {
          const card = document.createElement('article');
          card.className = 'testimonial-card';

          const rating = document.createElement('div');
          rating.className = 'testimonial-rating';
          const score = Math.max(0, Math.min(5, Number(testimonial.rating) || 0));
          rating.setAttribute('aria-label', `Ocena: ${score} na 5`);
          for (let starIndex = 1; starIndex <= 5; starIndex += 1) {
            const star = document.createElement('i');
            star.dataset.lucide = 'star';
            star.setAttribute('aria-hidden', 'true');
            if (starIndex > score) star.classList.add('testimonial-rating__empty');
            rating.append(star);
          }

          const quoteMark = document.createElement('div');
          quoteMark.className = 'quote-mark';
          quoteMark.textContent = '“';
          const quote = document.createElement('blockquote');
          quote.textContent = testimonial.opinion || '';

          const author = document.createElement('div');
          author.className = 'quote-author';
          const avatar = document.createElement('span');
          avatar.className = 'author-avatar';
          avatar.textContent = testimonial.avatar || initialsFromName(testimonial.author || 'Kursant');
          const authorDetails = document.createElement('span');
          const authorName = document.createElement('strong');
          authorName.textContent = formatAuthor(testimonial.author);
          const authorMeta = document.createElement('small');
          authorMeta.textContent = testimonial.category || '';
          authorDetails.append(authorName, authorMeta);
          author.append(avatar, authorDetails);
          card.append(rating, quoteMark, quote, author);
          fragment.append(card);
        });
        testimonialsTrack.replaceChildren(fragment);
        if (window.lucide) lucide.createIcons();
        window.dispatchEvent(new Event('resize'));
      } catch (error) {
        testimonialsTrack.innerHTML = '<p class="testimonials__status">Nie udało się wczytać opinii.</p>';
        console.warn('Opinie nie zostały wczytane.', error);
      }
    };
    renderTestimonials();
  }

  const courseCategoryDetails = new Map();
  const coursesTrack = document.querySelector('[data-courses-manifest]');
  if (coursesTrack) {
    const renderCourses = async () => {
      try {
        const response = await fetch(coursesTrack.dataset.coursesManifest, { cache: 'no-store' });
        if (!response.ok) throw new Error('Nie udało się wczytać kursów.');
        const courses = await response.json();
        if (!Array.isArray(courses)) throw new Error('Nieprawidłowy format pliku kursów.');

        const fragment = document.createDocumentFragment();
        courses.forEach((course, index) => {
          courseCategoryDetails.set(course.category, {
            age: course.minimumAge,
            paragraphs: course.categoryDescription,
            sourceUrl: course.sourceUrl,
          });
          const card = document.createElement('article');
          card.className = `course-card${index === 0 ? ' course-card--featured' : ''}`;
          card.dataset.category = course.category;
          card.tabIndex = 0;

          const top = document.createElement('div');
          top.className = 'course-card__top';
          const tag = document.createElement('span');
          tag.className = `course-tag${index === 0 ? '' : ' course-tag--light'}`;
          tag.textContent = course.tag;
          const number = document.createElement('span');
          number.className = 'course-number';
          number.textContent = String(index + 1).padStart(2, '0');
          top.append(tag, number);

          const title = document.createElement('h3');
          title.textContent = course.title;
          const description = document.createElement('p');
          description.textContent = course.description;
          const meta = document.createElement('div');
          meta.className = 'course-meta';
          (course.meta || []).forEach(({ icon, text }) => {
            const item = document.createElement('span');
            const iconElement = document.createElement('i');
            iconElement.dataset.lucide = icon;
            item.append(iconElement, ` ${text}`);
            meta.append(item);
          });

          const price = document.createElement('div');
          price.className = 'course-price';
          const priceText = document.createElement('div');
          const priceLabel = document.createElement('small');
          priceLabel.textContent = 'cena';
          const priceValue = document.createElement('strong');
          priceValue.textContent = course.price;
          const currency = document.createElement('sup');
          currency.textContent = 'PLN';
          priceValue.append(' ', currency);
          priceText.append(priceLabel, priceValue);
          const contactLink = document.createElement('a');
          contactLink.className = 'circle-link';
          contactLink.href = '#kontakt';
          contactLink.setAttribute('aria-label', `Zapytaj o kurs kategorii ${course.category}`);
          const arrow = document.createElement('i');
          arrow.dataset.lucide = 'arrow-up-right';
          contactLink.append(arrow);
          price.append(priceText, contactLink);
          card.append(top, title, description, meta, price);
          fragment.append(card);
        });
        coursesTrack.replaceChildren(fragment);
        if (window.lucide) lucide.createIcons();
        window.dispatchEvent(new Event('resize'));
      } catch (error) {
        console.warn('Kursy nie zostały wczytane z JSON.', error);
      }
    };
    renderCourses();
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.process-modal:not([hidden])').forEach(closeProcessModal);
  });

  const categoryDetails = {
    AM: {
      age: 'Minimalny wiek: 14 lat.',
      description: '<p>Uprawnia do kierowania motorowerami oraz czterokołowcami lekkimi.</p><p>Motorower to pojazd z silnikiem do 50 cm³ albo z silnikiem elektrycznym do 4 kW, którego konstrukcja ogranicza prędkość do 45 km/h.</p>',
    },
    A1: {
      age: 'Minimalny wiek: 16 lat.',
      description: '<p>Uprawnia do kierowania motocyklami o pojemności silnika do 125 cm³, mocy do 11 kW i stosunku mocy do masy własnej do 0,1 kW/kg.</p><p>Obejmuje także trójkołowe motocykle o mocy do 15 kW oraz pojazdy kategorii AM.</p>',
    },
    A2: {
      age: 'Minimalny wiek: 18 lat.',
      description: '<p>Uprawnia do kierowania motocyklami o mocy do 35 kW i stosunku mocy do masy własnej do 0,2 kW/kg.</p><p>Motocykl nie może powstać w wyniku przeróbki pojazdu o mocy ponad dwukrotnie większej. Kategoria obejmuje także pojazdy kategorii AM.</p>',
    },
    A: {
      age: 'Minimalny wiek: 24 lata lub 20 lat, jeśli posiadasz kategorię A2 od co najmniej 2 lat.',
      description: '<p>Uprawnia do kierowania wszystkimi motocyklami, a także pojazdami kategorii AM.</p><p>Obejmuje również trójkołowe motocykle o mocy powyżej 15 kW.</p>',
    },
    B: {
      age: 'Minimalny wiek: 17 lat.',
      description: '<p>Uprawnia do kierowania pojazdami samochodowymi o dopuszczalnej masie całkowitej do 3,5 t, z wyjątkiem autobusów i motocykli.</p><p>Obejmuje także pojazdy kategorii AM oraz zestawy z lekką przyczepą do 750 kg, z zachowaniem ograniczeń określonych w przepisach.</p>',
    },
  };

  const categoryModal = document.querySelector('[data-category-dialog]');
  if (categoryModal) {
    const modalTitle = categoryModal.querySelector('#category-modal-title');
    const modalAge = categoryModal.querySelector('.category-modal__age');
    const modalDescription = categoryModal.querySelector('.category-modal__description');
    const modalSource = categoryModal.querySelector('.category-modal__source');
    const closeCategoryModal = () => {
      categoryModal.hidden = true;
      document.body.classList.remove('category-modal-open');
    };
    const openCategoryModal = (category) => {
      const details = courseCategoryDetails.get(category) || categoryDetails[category];
      if (!details) return;
      modalTitle.textContent = `Kategoria ${category}`;
      modalAge.textContent = details.age;
      if (Array.isArray(details.paragraphs)) {
        modalDescription.replaceChildren(...details.paragraphs.map((paragraph) => {
          const element = document.createElement('p');
          element.textContent = paragraph;
          return element;
        }));
      } else {
        modalDescription.innerHTML = details.description;
      }
      if (modalSource && details.sourceUrl) modalSource.href = details.sourceUrl;
      categoryModal.hidden = false;
      document.body.classList.add('category-modal-open');
      categoryModal.querySelector('.category-modal__close')?.focus();
      if (window.lucide) lucide.createIcons();
    };

    document.addEventListener('click', (event) => {
      const card = event.target.closest('[data-category]');
      if (!card || event.target.closest('a, button')) return;
      openCategoryModal(card.dataset.category);
    });
    document.addEventListener('keydown', (event) => {
      const card = event.target.closest('[data-category]');
      if (!card || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      openCategoryModal(card.dataset.category);
    });

    categoryModal.querySelectorAll('[data-category-close]').forEach((closeButton) => {
      closeButton.addEventListener('click', closeCategoryModal);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !categoryModal.hidden) closeCategoryModal();
    });
  }

  const fleetGallery = document.querySelector('.fleet-gallery');
  if (fleetGallery) {
    const initializeFleetGallery = async () => {
      const manifestPath = fleetGallery.dataset.galleryManifest;
      if (manifestPath) {
        try {
          const response = await fetch(manifestPath, { cache: 'no-store' });
          if (!response.ok) throw new Error(`Nie udało się wczytać ${manifestPath}`);
          const galleryImages = await response.json();
          if (Array.isArray(galleryImages) && galleryImages.length) {
            fleetGallery.replaceChildren(...galleryImages.map(({ src, alt, caption }) => {
              const figure = document.createElement('figure');
              const image = document.createElement('img');
              image.src = src;
              image.alt = alt || 'Pojazd floty OSK Turbo';
              const figcaption = document.createElement('figcaption');
              figcaption.textContent = caption || image.alt;
              figure.append(image, figcaption);
              return figure;
            }));
          }
        } catch (error) {
          console.warn('Galeria floty używa zdjęć domyślnych.', error);
        }
      }

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Podgląd zdjęcia floty');
    lightbox.innerHTML = '<button class="lightbox__close" type="button" aria-label="Zamknij zdjęcie">&times;</button><button class="lightbox__arrow lightbox__arrow--prev" type="button" aria-label="Poprzednie zdjęcie">&#8592;</button><img class="lightbox__image" alt="" /><button class="lightbox__arrow lightbox__arrow--next" type="button" aria-label="Następne zdjęcie">&#8594;</button><div class="lightbox__zoom-controls" aria-label="Powiększenie zdjęcia"><button type="button" data-zoom="out" aria-label="Pomniejsz zdjęcie">−</button><button type="button" data-zoom="reset" aria-label="Resetuj powiększenie">100%</button><button type="button" data-zoom="in" aria-label="Powiększ zdjęcie">+</button></div>';
    document.body.append(lightbox);

    const lightboxImage = lightbox.querySelector('.lightbox__image');
    lightbox.style.touchAction = 'none';
    lightboxImage.draggable = false;
    const processGallery = document.querySelector('.process-modal__screenshots');
    const processSlides = processGallery
      ? [...processGallery.querySelectorAll('figure')].map((figure) => {
        const image = figure.querySelector('img');
        return { src: image?.src, alt: image?.alt };
      }).filter((slide) => slide.src)
      : [];
    let activeSlides = [];
    let zoomLevel = 1;
    let panX = 0;
    let panY = 0;
    const activePointers = new Map();
    let gestureStart = null;
    const applyZoom = () => {
      lightboxImage.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoomLevel})`;
      lightboxImage.closest('.lightbox')?.style.setProperty('--lightbox-zoom', zoomLevel);
      lightbox.querySelector('[data-zoom="reset"]').textContent = `${Math.round(zoomLevel * 100)}%`;
    };
    const setZoom = (nextZoom, focalPoint) => {
      const previousZoom = zoomLevel;
      const boundedZoom = Math.min(3, Math.max(1, nextZoom));
      if (focalPoint && previousZoom > 0) {
        const centerX = lightbox.clientWidth / 2;
        const centerY = lightbox.clientHeight / 2;
        const imagePointX = (focalPoint.x - centerX - panX) / previousZoom;
        const imagePointY = (focalPoint.y - centerY - panY) / previousZoom;
        panX = focalPoint.x - centerX - imagePointX * boundedZoom;
        panY = focalPoint.y - centerY - imagePointY * boundedZoom;
      }
      zoomLevel = boundedZoom;
      if (zoomLevel === 1) {
        panX = 0;
        panY = 0;
      }
      applyZoom();
    };
    const getPointerPair = () => [...activePointers.values()].slice(0, 2);
    const getPointerDistance = (first, second) => Math.hypot(second.x - first.x, second.y - first.y);
    const getPointerMidpoint = (first, second) => ({
      x: (first.x + second.x) / 2,
      y: (first.y + second.y) / 2,
    });
    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      document.body.classList.remove('lightbox-open');
      lightboxImage.style.transform = '';
    };
    let lightboxImageIndex = 0;
    const openLightbox = (index, slides = activeSlides) => {
      if (!slides.length) return;
      activeSlides = slides;
      lightboxImageIndex = (index + activeSlides.length) % activeSlides.length;
      lightboxImage.src = activeSlides[lightboxImageIndex].src;
      lightboxImage.alt = activeSlides[lightboxImageIndex].alt;
      zoomLevel = 1;
      panX = 0;
      panY = 0;
      applyZoom();
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
      stageImage.addEventListener('click', () => openLightbox(currentFleetImage, fleetSlides));
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
          openLightbox(currentFleetImage, fleetSlides);
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
    lightbox.querySelectorAll('[data-zoom]').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.zoom === 'in') setZoom(zoomLevel + 0.25);
        if (button.dataset.zoom === 'out') setZoom(zoomLevel - 0.25);
        if (button.dataset.zoom === 'reset') setZoom(1);
      });
    });
    lightboxImage.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      lightboxImage.setPointerCapture(event.pointerId);
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (activePointers.size === 2) {
        const [first, second] = getPointerPair();
        gestureStart = {
          distance: getPointerDistance(first, second),
          zoom: zoomLevel,
        };
      } else {
        gestureStart = { x: event.clientX, y: event.clientY, panX, panY };
      }
    });
    lightboxImage.addEventListener('dragstart', (event) => event.preventDefault());
    lightboxImage.addEventListener('pointermove', (event) => {
      if (!activePointers.has(event.pointerId)) return;
      event.preventDefault();
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (activePointers.size >= 2 && gestureStart?.distance) {
        const [first, second] = getPointerPair();
        const midpoint = getPointerMidpoint(first, second);
        const distanceRatio = getPointerDistance(first, second) / gestureStart.distance;
        setZoom(gestureStart.zoom * distanceRatio, midpoint);
        return;
      }
      if (activePointers.size === 1 && zoomLevel > 1 && gestureStart?.x !== undefined) {
        panX = gestureStart.panX + event.clientX - gestureStart.x;
        panY = gestureStart.panY + event.clientY - gestureStart.y;
        applyZoom();
      }
    });
    const endPointerGesture = (event) => {
      activePointers.delete(event.pointerId);
      if (activePointers.size === 1) {
        const [remaining] = getPointerPair();
        gestureStart = { x: remaining.x, y: remaining.y, panX, panY };
      } else if (!activePointers.size) {
        gestureStart = null;
      }
    };
    lightboxImage.addEventListener('pointerup', endPointerGesture);
    lightboxImage.addEventListener('pointercancel', endPointerGesture);
    processGallery?.querySelectorAll('figure').forEach((figure, index) => {
      const image = figure.querySelector('img');
      if (!image) return;
      figure.tabIndex = 0;
      figure.setAttribute('role', 'button');
      figure.setAttribute('aria-label', `Otwórz ${image.alt}`);
      figure.addEventListener('click', () => openLightbox(index, processSlides));
      figure.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openLightbox(index, processSlides);
      });
    });
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeLightbox();
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'ArrowLeft') openLightbox(lightboxImageIndex - 1);
      if (event.key === 'ArrowRight') openLightbox(lightboxImageIndex + 1);
      if (event.key === '+' || event.key === '=') {
        setZoom(zoomLevel + 0.25);
      }
      if (event.key === '-') {
        setZoom(zoomLevel - 0.25);
      }
      if (event.key === '0') {
        setZoom(1);
      }
    });
    };
    initializeFleetGallery();
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

  document.querySelectorAll('.nav-socials').forEach((socialMenu) => {
    socialMenu.addEventListener('focusout', (event) => {
      if (!socialMenu.contains(event.relatedTarget)) socialMenu.removeAttribute('open');
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
