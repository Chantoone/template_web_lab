(() => {
  const element = document.querySelector('#mentor-swiper');
  // All mentor content is already in HTML if the CDN or JavaScript is unavailable.
  if (!element || typeof Swiper === 'undefined') return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const en = document.documentElement.lang === 'en';
  const carousel = new Swiper(element, {
    slidesPerView: 1,
    spaceBetween: 24,
    speed: reduced.matches ? 0 : 350,
    grabCursor: true,
    keyboard: { enabled: true, onlyInViewport: true },
    navigation: { nextEl: '.mentor-next', prevEl: '.mentor-prev' },
    pagination: { el: '.mentor-pagination', clickable: true },
    a11y: {
      prevSlideMessage: en ? 'Previous mentor' : 'Mentor trước đó',
      nextSlideMessage: en ? 'Next mentor' : 'Mentor tiếp theo',
      paginationBulletMessage: en ? 'Go to mentor {{index}}' : 'Đến mentor {{index}}'
    },
    breakpoints: { 640: { slidesPerView: 2 }, 1100: { slidesPerView: 3 } }
  });
  element.closest('.mentor-wrap').classList.add('carousel-ready');
  reduced.addEventListener('change', () => { carousel.params.speed = reduced.matches ? 0 : 350; });
})();
