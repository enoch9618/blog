/* 站点质感增强：阅读进度条 + 图片灯箱 */
(function () {
  'use strict';

  /* —— 阅读进度条 —— */
  function initReadingProgress() {
    var bar = document.createElement('div');
    bar.className = 'reading-progress';
    document.body.appendChild(bar);

    var update = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var p = max > 0 ? doc.scrollTop / max : 0;
      bar.style.width = (p * 100).toFixed(2) + '%';
    };

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* —— 图片灯箱 —— */
  function initLightbox() {
    var imgs = Array.prototype.slice.call(document.querySelectorAll('.post-figure img'));
    if (!imgs.length) return;

    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('hidden', '');
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="关闭">×</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('figcaption');
    var lbClose = lb.querySelector('.lightbox-close');

    function open(img) {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      var figure = img.closest ? img.closest('figure') : null;
      var cap = figure && figure.querySelector('figcaption')
        ? figure.querySelector('figcaption').textContent.trim()
        : '';
      lbCap.textContent = cap;
      lbCap.style.display = cap ? '' : 'none';
      lb.hidden = false;
      document.body.classList.add('lightbox-open');
    }

    function close() {
      lb.hidden = true;
      lbImg.src = '';
      document.body.classList.remove('lightbox-open');
    }

    imgs.forEach(function (img) {
      img.addEventListener('click', function () { open(img); });
    });

    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target === lbClose) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lb.hidden) close();
    });
  }

  function init() {
    initReadingProgress();
    initLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
