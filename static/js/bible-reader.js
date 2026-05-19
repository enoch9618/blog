(function() {
    'use strict';

    // 圣经元数据
    const BIBLE_DATA = [
        { name: "创世记", fhl: "创", chs: 50, type: "OT" }, { name: "出埃及记", fhl: "出", chs: 40, type: "OT" },
        { name: "利未记", fhl: "利", chs: 27, type: "OT" }, { name: "民数记", fhl: "民", chs: 36, type: "OT" },
        { name: "申命记", fhl: "申", chs: 34, type: "OT" }, { name: "约书亚记", fhl: "书", chs: 24, type: "OT" },
        { name: "士师记", fhl: "士", chs: 21, type: "OT" }, { name: "路得记", fhl: "得", chs: 4, type: "OT" },
        { name: "撒母耳记上", fhl: "撒上", chs: 31, type: "OT" }, { name: "撒母耳记下", fhl: "撒下", chs: 24, type: "OT" },
        { name: "列王纪上", fhl: "王上", chs: 22, type: "OT" }, { name: "列王纪下", fhl: "王下", chs: 25, type: "OT" },
        { name: "历代志上", fhl: "代上", chs: 29, type: "OT" }, { name: "历代志下", fhl: "代下", chs: 36, type: "OT" },
        { name: "以斯拉记", fhl: "斯", chs: 10, type: "OT" }, { name: "尼希米记", fhl: "尼", chs: 13, type: "OT" },
        { name: "以斯帖记", fhl: "帖", chs: 10, type: "OT" }, { name: "约伯记", fhl: "伯", chs: 42, type: "OT" },
        { name: "诗篇", fhl: "诗", chs: 150, type: "OT" }, { name: "箴言", fhl: "箴", chs: 31, type: "OT" },
        { name: "传道书", fhl: "传", chs: 12, type: "OT" }, { name: "雅歌", fhl: "歌", chs: 8, type: "OT" },
        { name: "以赛亚书", fhl: "赛", chs: 66, type: "OT" }, { name: "耶利米书", fhl: "耶", chs: 52, type: "OT" },
        { name: "耶利米哀歌", fhl: "哀", chs: 5, type: "OT" }, { name: "以西结书", fhl: "结", chs: 48, type: "OT" },
        { name: "但以理书", fhl: "但", chs: 12, type: "OT" }, { name: "何西阿书", fhl: "何", chs: 14, type: "OT" },
        { name: "约珥书", fhl: "珥", chs: 3, type: "OT" }, { name: "阿摩司书", fhl: "摩", chs: 9, type: "OT" },
        { name: "俄巴底亚书", fhl: "俄", chs: 1, type: "OT" }, { name: "约拿书", fhl: "拿", chs: 4, type: "OT" },
        { name: "弥迦书", fhl: "弥", chs: 7, type: "OT" }, { name: "那鸿书", fhl: "鸿", chs: 3, type: "OT" },
        { name: "哈巴谷书", fhl: "哈", chs: 3, type: "OT" }, { name: "西番雅书", fhl: "番", chs: 3, type: "OT" },
        { name: "哈该书", fhl: "该", chs: 2, type: "OT" }, { name: "撒迦利亚书", fhl: "亚", chs: 14, type: "OT" },
        { name: "玛拉基书", fhl: "玛", chs: 4, type: "OT" }, { name: "马太福音", fhl: "太", chs: 28, type: "NT" }, 
        { name: "马可福音", fhl: "可", chs: 16, type: "NT" }, { name: "路加福音", fhl: "路", chs: 24, type: "NT" }, 
        { name: "约翰福音", fhl: "约", chs: 21, type: "NT" }, { name: "使徒行传", fhl: "徒", chs: 28, type: "NT" }, 
        { name: "罗马书", fhl: "罗", chs: 16, type: "NT" }, { name: "哥林多前书", fhl: "林前", chs: 16, type: "NT" }, 
        { name: "哥林多后书", fhl: "林后", chs: 13, type: "NT" }, { name: "加拉太书", fhl: "加", chs: 6, type: "NT" }, 
        { name: "以弗所书", fhl: "弗", chs: 6, type: "NT" }, { name: "腓立比书", fhl: "腓", chs: 4, type: "NT" }, 
        { name: "歌罗西书", fhl: "西", chs: 4, type: "NT" }, { name: "帖撒罗尼迦前书", fhl: "帖前", chs: 5, type: "NT" }, 
        { name: "帖撒罗尼迦后书", fhl: "帖后", chs: 3, type: "NT" }, { name: "提摩太前书", fhl: "提前", chs: 6, type: "NT" }, 
        { name: "提摩太后书", fhl: "提后", chs: 4, type: "NT" }, { name: "提多书", fhl: "多", chs: 3, type: "NT" }, 
        { name: "腓利门书", fhl: "门", chs: 1, type: "NT" }, { name: "希伯来书", fhl: "来", chs: 13, type: "NT" }, 
        { name: "雅各书", fhl: "雅", chs: 5, type: "NT" }, { name: "彼得前书", fhl: "彼前", chs: 5, type: "NT" }, 
        { name: "彼得后书", fhl: "彼后", chs: 3, type: "NT" }, { name: "约翰一书", fhl: "约一", chs: 5, type: "NT" }, 
        { name: "约翰二书", fhl: "约二", chs: 1, type: "NT" }, { name: "约翰三书", fhl: "约三", chs: 1, type: "NT" }, 
        { name: "犹大书", fhl: "犹", chs: 1, type: "NT" }, { name: "启示录", fhl: "启", chs: 22, type: "NT" }
    ];

    const THEMES = {
        light: { bg: '#ffffff', text: '#1a202c', border: '#cbd5e0', accent: '#3182ce', highlight: '#fbd38d', card: '#f7fafc', btnBg: '#ffffff' },
        paper: { bg: '#f4f1ea', text: '#2d2621', border: '#d6cfbc', accent: '#8c6d46', highlight: '#e9d8a6', card: '#fdfcf9', btnBg: '#fdfcf9' },
        dark: { bg: '#121212', text: '#e2e8f0', border: '#2d3748', accent: '#63b3ed', highlight: '#443300', card: '#1a202c', btnBg: '#2d3748' }
    };

    // 状态管理
    let state = {
        book: BIBLE_DATA[0],
        chap: 1,
        list: [],
        loading: true,
        searchKey: '',
        searchResults: [],
        isSearching: false,
        hasSearched: false,
        activePanel: null,
        mobileTab: 'OT',
        fontSize: 18,
        themeMode: 'paper'
    };

    const bibleCache = {};
    let isGlobalLoaded = false;
    let touchStartPos = 0;

    // DOM 元素缓存
    const root = document.getElementById('bible-app');
    if (!root) return;

    // 工具函数
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function highlightText(text, highlight) {
        if (!highlight || !highlight.trim()) return text;
        const escaped = escapeRegExp(highlight);
        const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
        return parts.map((part, i) => 
            part.toLowerCase() === highlight.toLowerCase() 
                ? `<mark style="background: var(--bible-hl); color: inherit; border-radius: 2px;">${part}</mark>` 
                : part
        ).join('');
    }

    // 数据加载
    async function loadData(targetBook, targetChap, targetVerse = null) {
        state.loading = true;
        render();
        
        try {
            const key = targetBook.fhl;
            if (!bibleCache[key]) {
                const res = await fetch(`/bible-data/${key}.json`);
                if (!res.ok) throw new Error('加载失败');
                bibleCache[key] = await res.json();
            }
            
            state.list = bibleCache[key][String(targetChap)] || [];
            state.loading = false;
            render();
            
            setTimeout(() => {
                if (targetVerse) {
                    const el = document.getElementById(`v-${targetVerse}`);
                    if (el) {
                        window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' });
                        el.classList.add('verse-active-flash');
                        setTimeout(() => el.classList.remove('verse-active-flash'), 3000);
                    }
                } else {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                }
            }, 350);
        } catch (e) {
            state.list = ["加载失败"];
            state.loading = false;
            render();
        }
    }

    // 搜索
    async function runSearch() {
        const keyword = state.searchKey.trim();
        if (keyword.length < 2) return;
        
        state.isSearching = true;
        render();
        
        if (!isGlobalLoaded) {
            await Promise.all(BIBLE_DATA.map(async b => {
                if (!bibleCache[b.fhl]) {
                    try {
                        const res = await fetch(`/bible-data/${b.fhl}.json`);
                        if (res.ok) bibleCache[b.fhl] = await res.json();
                    } catch(e) {}
                }
            }));
            isGlobalLoaded = true;
        }
        
        const found = [];
        BIBLE_DATA.forEach(b => {
            Object.entries(bibleCache[b.fhl] || {}).forEach(([cNum, verses]) => {
                verses.forEach((text, i) => {
                    if (text.includes(keyword)) {
                        found.push({ book: b, chap: cNum, verse: i + 1, text });
                    }
                });
            });
        });
        
        state.searchResults = found;
        state.hasSearched = true;
        state.isSearching = false;
        state.activePanel = null;
        render();
        window.scrollTo(0, 0);
    }

    // 章节导航
    function goPrev() {
        if (state.chap > 1) {
            state.chap--;
        } else {
            const idx = BIBLE_DATA.findIndex(b => b.fhl === state.book.fhl);
            if (idx > 0) {
                state.book = BIBLE_DATA[idx - 1];
                state.chap = BIBLE_DATA[idx - 1].chs;
            }
        }
        state.hasSearched = false;
        saveState();
        loadData(state.book, state.chap);
        render();
    }

    function goNext() {
        if (state.chap < state.book.chs) {
            state.chap++;
        } else {
            const idx = BIBLE_DATA.findIndex(b => b.fhl === state.book.fhl);
            if (idx < BIBLE_DATA.length - 1) {
                state.book = BIBLE_DATA[idx + 1];
                state.chap = 1;
            }
        }
        state.hasSearched = false;
        saveState();
        loadData(state.book, state.chap);
        render();
    }

    // 本地存储
    function saveState() {
        try {
            localStorage.setItem('bible_last_book', state.book.fhl);
            localStorage.setItem('bible_last_chap', String(state.chap));
            localStorage.setItem('bible_fs', String(state.fontSize));
            localStorage.setItem('bible_theme', state.themeMode);
        } catch(e) {}
    }

    function loadState() {
        try {
            const savedBook = localStorage.getItem('bible_last_book');
            const savedChap = localStorage.getItem('bible_last_chap');
            const savedFS = localStorage.getItem('bible_fs');
            const savedTheme = localStorage.getItem('bible_theme');

            if (savedBook) {
                const b = BIBLE_DATA.find(x => x.fhl === savedBook);
                if (b) {
                    state.book = b;
                    state.chap = Number(savedChap || 1);
                }
            }
            if (savedFS) state.fontSize = Number(savedFS);
            if (savedTheme) state.themeMode = savedTheme;
        } catch(e) {}
    }

    // 主题切换
    function setTheme(theme) {
        state.themeMode = theme;
        const t = THEMES[theme];
        const root = document.documentElement;
        root.style.setProperty('--bible-bg', t.bg);
        root.style.setProperty('--bible-text', t.text);
        root.style.setProperty('--bible-border', t.border);
        root.style.setProperty('--bible-accent', t.accent);
        root.style.setProperty('--bible-card', t.card);
        root.style.setProperty('--bible-btn', t.btnBg);
        root.style.setProperty('--bible-hl', t.highlight);
        saveState();
        render();
    }

    // 渲染函数
    function render() {
        const t = state;
        const currentTheme = THEMES[t.themeMode];
        
        // 生成分组搜索结果
        const groupedResults = {};
        t.searchResults.forEach(res => {
            if (!groupedResults[res.book.name]) groupedResults[res.book.name] = [];
            groupedResults[res.book.name].push(res);
        });
        const groupedEntries = Object.entries(groupedResults);

        let html = '';

        // 搜索模式
        if (t.hasSearched) {
            html += `<div class="main-content"><div class="container">`;
            html += `<div style="display:flex;justify-content:space-between;margin-bottom:15px;align-items:center;padding:0 8px;">`;
            html += `<h3 style="margin:0">结果: ${t.searchResults.length} 条</h3>`;
            html += `<button class="ui-btn" onclick="window.bibleApp.exitSearch()">退出搜索</button>`;
            html += `</div>`;

            if (groupedEntries.length > 1) {
                html += `<div class="search-quick-nav">`;
                groupedEntries.forEach(([bName]) => {
                    html += `<span class="nav-tag" onclick="document.getElementById('group-${bName}').scrollIntoView({behavior:'smooth',block:'start'})">${bName}</span>`;
                });
                html += `</div>`;
            }

            if (groupedEntries.length === 0) {
                html += `<p style="text-align:center;opacity:0.5">未找到相关</p>`;
            } else {
                groupedEntries.forEach(([bName, items]) => {
                    html += `<div id="group-${bName}" style="margin-bottom:35px">`;
                    html += `<div style="padding:4px 10px;background:var(--bible-accent);color:white;border-radius:4px;display:inline-block;font-size:12px;font-weight:bold;margin-bottom:10px;margin-left:8px">${bName}</div>`;
                    items.forEach(item => {
                        html += `<div class="verse-row" onclick="window.bibleApp.goToVerse('${item.book.fhl}',${item.chap},${item.verse})">`;
                        html += `<div class="v-num">${item.chap}:${item.verse}</div>`;
                        html += `<div>${highlightText(item.text, t.searchKey)}</div>`;
                        html += `</div>`;
                    });
                    html += `</div>`;
                });
            }
            html += `</div></div>`;
        } 
        // 阅读模式
        else {
            html += `
            <aside class="sidebar">
                <input class="ui-input" placeholder="🔍 搜索..." value="${escapeHtml(t.searchKey)}" oninput="window.bibleApp.handleSearchInput(this.value)" onkeydown="if(event.key==='Enter')window.bibleApp.runSearch()">
                <div style="display:flex;gap:5px;margin-bottom:20px">
                    ${['light','paper','dark'].map(theme => `
                        <button onclick="window.bibleApp.setTheme('${theme}')" style="width:26px;height:26px;border-radius:50%;background:${THEMES[theme].bg};border:2px solid ${t.themeMode===theme?'var(--bible-accent)':'var(--bible-border)'}"></button>
                    `).join('')}
                </div>
                <select class="ui-input" onchange="window.bibleApp.selectBook(this.value)">
                    <optgroup label="旧约">
                        ${BIBLE_DATA.filter(b=>b.type==='OT').map(b => `<option value="${b.fhl}" ${t.book.fhl===b.fhl?'selected':''}>${b.name}</option>`).join('')}
                    </optgroup>
                    <optgroup label="新约">
                        ${BIBLE_DATA.filter(b=>b.type==='NT').map(b => `<option value="${b.fhl}" ${t.book.fhl===b.fhl?'selected':''}>${b.name}</option>`).join('')}
                    </optgroup>
                </select>
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">
                    ${Array.from({length:t.book.chs},(_,i)=>i+1).map(n => `
                        <button class="ui-btn ${t.chap===n?'active':''}" onclick="window.bibleApp.selectChap(${n})">${n}</button>
                    `).join('')}
                </div>
            </aside>
            <main class="main-content">
                <div class="container">
                    <article>
                        <header style="text-align:center;margin-bottom:50px">
                            <h1 style="font-size:2.8rem;margin:0">${t.book.name}</h1>
                            <p style="letter-spacing:4px;font-weight:bold;color:var(--bible-accent)">CHAPTER ${t.chap}</p>
                        </header>
                        <div class="bible-list">
                            ${t.loading ? '<div style="text-align:center;padding:40px">加载中...</div>' : 
                              t.list.map((v,i) => `
                                <div id="v-${i+1}" class="verse-row" onclick="window.bibleApp.copyVerse(${i+1})">
                                    <span class="v-num">${i+1}</span>
                                    <span>${highlightText(v, t.searchKey)}</span>
                                </div>
                              `).join('')}
                        </div>
                        <div style="display:flex;gap:15px;margin-top:60px">
                            <button class="ui-btn" style="flex:1;height:50px" onclick="window.bibleApp.goPrev()">上一章</button>
                            <button class="ui-btn" style="flex:1;height:50px" onclick="window.bibleApp.goNext()">下一章</button>
                        </div>
                    </article>
                </div>
            </main>`;

            // 移动端浮动导航
            html += `
            <div class="floating-nav">
                <button style="background:none;border:none;font-size:28px;color:var(--bible-accent)" onclick="window.bibleApp.goPrev()">‹</button>
                <div style="font-weight:bold;cursor:pointer" onclick="window.bibleApp.toggleMobilePanel()">${t.book.fhl} · ${t.chap} ▾</div>
                <button style="background:none;border:none;font-size:28px;color:var(--bible-accent)" onclick="window.bibleApp.goNext()">›</button>
            </div>`;

            // 移动端面板
            if (t.activePanel === 'nav') {
                html += `<div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(5px);z-index:2000;display:flex;align-items:flex-end" onclick="window.bibleApp.closeMobilePanel()">
                    <div style="width:100%;background:var(--bible-bg);border-radius:24px 24px 0 0;padding:20px;max-height:90vh;overflow-y:auto" onclick="event.stopPropagation()">
                        <div style="width:40px;height:5px;background:var(--bible-border);border-radius:3px;margin:0 auto 20px"></div>
                        <div style="display:flex;gap:6px;margin-bottom:20px">
                            <button class="ui-btn ${t.mobileTab==='OT'?'active':''}" style="flex:1" onclick="window.bibleApp.setMobileTab('OT')">旧约</button>
                            <button class="ui-btn ${t.mobileTab==='NT'?'active':''}" style="flex:1" onclick="window.bibleApp.setMobileTab('NT')">新约</button>
                            <button class="ui-btn ${t.mobileTab==='CH'?'active':''}" style="flex:1" onclick="window.bibleApp.setMobileTab('CH')">选章</button>
                            <button class="ui-btn ${t.mobileTab==='SEARCH'?'active':''}" style="flex:1" onclick="window.bibleApp.setMobileTab('SEARCH')">搜索</button>
                        </div>`;

                if (t.mobileTab === 'SEARCH') {
                    html += `<div>
                        <input class="ui-input" autofocus placeholder="输入搜索词..." value="${escapeHtml(t.searchKey)}" oninput="window.bibleApp.handleSearchInput(this.value)" onkeydown="if(event.key==='Enter')window.bibleApp.runSearch()">
                        <button class="ui-btn" style="width:100%;height:50px;background:var(--bible-accent);color:white" onclick="window.bibleApp.runSearch()">搜索全书</button>
                    </div>`;
                } else if (t.mobileTab === 'CH') {
                    html += `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px">
                        <div style="grid-column:span 5;font-size:18px;font-weight:bold;margin-bottom:10px">${t.book.name}</div>
                        ${Array.from({length:t.book.chs},(_,i)=>i+1).map(n => `
                            <button class="ui-btn ${t.chap===n?'active':''}" style="height:50px" onclick="window.bibleApp.selectChapMobile(${n})">${n}</button>
                        `).join('')}
                        <button style="grid-column:span 5;margin-top:15px" class="ui-btn" onclick="window.bibleApp.setMobileTab('${t.book.type}')">← 返回书卷</button>
                    </div>`;
                } else {
                    html += `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
                        ${BIBLE_DATA.filter(b=>b.type===t.mobileTab).map(b => `
                            <div style="padding:12px 2px;border-radius:8px;border:1px solid var(--bible-border);background:var(--bible-btn);font-size:13px;font-weight:600;text-align:center;cursor:pointer" onclick="window.bibleApp.selectBookMobile('${b.fhl}')">${b.name}</div>
                        `).join('')}
                    </div>`;
                }
                html += `<div style="height:40px"></div></div></div>`;
            }
        }

        root.innerHTML = html;
        document.title = `${t.book.name} ${t.chap} - 圣经阅读器`;

        // 绑定触摸事件
        root.addEventListener('touchstart', (e) => {
            touchStartPos = e.changedTouches[0].screenX;
        });
        root.addEventListener('touchend', (e) => {
            const distance = touchStartPos - e.changedTouches[0].screenX;
            if (distance > 70) goNext();
            if (distance < -70) goPrev();
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 暴露全局方法
    window.bibleApp = {
        runSearch,
        goPrev,
        goNext,
        setTheme,
        exitSearch() {
            state.hasSearched = false;
            state.searchResults = [];
            render();
            window.scrollTo(0, 0);
        },
        goToVerse(fhl, chap, verse) {
            const b = BIBLE_DATA.find(x => x.fhl === fhl);
            if (b) {
                state.book = b;
                state.chap = chap;
                state.hasSearched = false;
                saveState();
                loadData(b, chap, verse);
            }
        },
        selectBook(fhl) {
            const b = BIBLE_DATA.find(x => x.fhl === fhl);
            if (b) {
                state.book = b;
                state.chap = 1;
                state.hasSearched = false;
                saveState();
                loadData(b, 1);
            }
        },
        selectChap(n) {
            state.chap = n;
            state.hasSearched = false;
            saveState();
            loadData(state.book, n);
        },
        handleSearchInput(value) {
            state.searchKey = value;
        },
        copyVerse(verseNum) {
            const text = `${state.book.name} ${state.chap}:${verseNum} ${state.list[verseNum-1]}`;
            navigator.clipboard.writeText(text).then(() => {
                const toast = document.createElement('div');
                toast.textContent = '已复制';
                toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:10px 25px;border-radius:25px;z-index:9999';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 1500);
            });
        },
        toggleMobilePanel() {
            state.activePanel = state.activePanel === 'nav' ? null : 'nav';
            state.mobileTab = 'CH';
            render();
        },
        closeMobilePanel() {
            state.activePanel = null;
            render();
        },
        setMobileTab(tab) {
            state.mobileTab = tab;
            render();
        },
        selectBookMobile(fhl) {
            const b = BIBLE_DATA.find(x => x.fhl === fhl);
            if (b) {
                state.book = b;
                state.chap = 1;
                state.mobileTab = 'CH';
                render();
            }
        },
        selectChapMobile(n) {
            state.chap = n;
            state.activePanel = null;
            state.hasSearched = false;
            saveState();
            loadData(state.book, n);
        }
    };

    // 初始化
    loadState();
    setTheme(state.themeMode);
    loadData(state.book, state.chap);
})();