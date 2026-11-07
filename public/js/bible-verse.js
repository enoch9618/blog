
(() => {
  'use strict';

  // 防止重复初始化
  if (window.bibleVerseInitialized) return;
  window.bibleVerseInitialized = true;

  // 缓存已加载的圣经数据
  const bibleCache = new Map();

  let activeButton = null;

  // 创建弹窗
  const modal = document.createElement('div');
  modal.id = 'bible-verse-modal';
  modal.className = 'bible-verse-modal';
  modal.hidden = true;

  modal.innerHTML = `
    <div class="bible-verse-overlay"></div>

    <div class="bible-verse-dialog"
         role="dialog"
         aria-modal="true"
         aria-labelledby="bible-verse-title">

      <div class="bible-verse-header">
        <h3 id="bible-verse-title"></h3>

        <button type="button"
                class="bible-verse-close"
                aria-label="关闭">×</button>
      </div>

      <div class="bible-verse-body"></div>

    </div>
  `;

  document.body.appendChild(modal);

  const title = modal.querySelector('#bible-verse-title');
  const body = modal.querySelector('.bible-verse-body');
  const closeButton = modal.querySelector('.bible-verse-close');
  const overlay = modal.querySelector('.bible-verse-overlay');

  // 加载圣经 JSON
  async function loadBible(book, base) {
    if (!bibleCache.has(book)) {
      const url = base + encodeURIComponent(book) + '.json';

      const request = fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`经文数据加载失败：${response.status}`);
          }

          return response.json();
        })
        .catch(error => {
          bibleCache.delete(book);
          throw error;
        });

      bibleCache.set(book, request);
    }

    return bibleCache.get(book);
  }

  // 解析经文范围
  function parseVerses(input) {
    const result = [];

    const parts = input.trim().split(/\s+/);

    for (const part of parts) {
      const match = part.match(/^(\d+)(?:-(\d+))?$/);

      if (!match) {
        throw new Error(`无效的经文范围：${part}`);
      }

      const start = Number(match[1]);
      const end = match[2] ? Number(match[2]) : start;

      if (
        start < 1 ||
        end < start ||
        end - start > 200
      ) {
        throw new Error(`经文范围不正确：${part}`);
      }

      for (let i = start; i <= end; i++) {
        if (!result.includes(i)) {
          result.push(i);
        }
      }
    }

    return result;
  }

  // 打开弹窗
  async function openVerse(button) {
    activeButton = button;

    const book = button.dataset.book;
    const chapter = button.dataset.chapter;
    const verseInput = button.dataset.verse;
    const base = button.dataset.base;

    title.textContent = `${book}${chapter}:${verseInput}`;
    body.textContent = '正在加载经文……';

    modal.hidden = false;

    try {
      const [data, verses] = await Promise.all([
        loadBible(book, base),
        Promise.resolve(parseVerses(verseInput))
      ]);

      // 防止快速切换引用时显示旧结果
      if (activeButton !== button || modal.hidden) return;

      const chapterData = data[chapter];

      if (!Array.isArray(chapterData)) {
        throw new Error(`找不到${book}${chapter}章`);
      }

      body.replaceChildren();

      verses.forEach(number => {
        const text = chapterData[number - 1];

        if (typeof text !== 'string' || !text) {
          return;
        }

        const paragraph = document.createElement('p');
        paragraph.className = 'bible-verse-text';

        const verseNumber = document.createElement('span');
        verseNumber.className = 'bible-verse-number';
        verseNumber.textContent = `${number}. `;

        paragraph.appendChild(verseNumber);
        paragraph.appendChild(document.createTextNode(text));

        body.appendChild(paragraph);
      });

      if (!body.children.length) {
        body.textContent = '没有找到对应经文。';
      }

      closeButton.focus();

    } catch (error) {
      console.error('经文加载错误：', error);

      if (activeButton === button) {
        body.textContent = '经文加载失败，请检查圣经数据文件。';
      }
    }
  }

  // 关闭弹窗
  function closeModal() {
    modal.hidden = true;

    if (activeButton) {
      activeButton.focus();
      activeButton = null;
    }
  }

  // 点击经文引用
  document.addEventListener('click', event => {
    const button = event.target.closest('.bible-verse-button');

    if (button) {
      openVerse(button);
    }
  });

  // 点击关闭按钮
  closeButton.addEventListener('click', closeModal);

  // 点击遮罩关闭
  overlay.addEventListener('click', closeModal);

  // ESC 关闭
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });

})();
