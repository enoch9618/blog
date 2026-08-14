/**
 * 证主圣经百科全书 - 核心程序
 */

const CONFIG = {
    pageSize: 20,
    excerptLength: 100
};

let STATE = {
    allRecords: [],
    searchResults: [],
    displayedCount: 0,
    keyword: ''
};

// 元素引用
const els = {
    viewSearch: document.getElementById('view-search'),
    viewArticle: document.getElementById('view-article'),
    resultsList: document.getElementById('results-list'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    searchInfo: document.getElementById('search-info'),
    loadMoreBtn: document.getElementById('load-more'),
    pagination: document.getElementById('pagination'),
    loading: document.getElementById('loading-overlay'),
    stats: document.getElementById('stats'),
    articleTitle: document.getElementById('article-title'),
    articleContent: document.getElementById('article-content'),
    backBtn: document.getElementById('back-to-results')
};

// 初始化：加载数据
async function init() {
    try {
        const response = await fetch('encyclopedia.json');
        if (!response.ok) throw new Error('无法读取数据文件');
        const data = await response.json();
        STATE.allRecords = data.records;
        els.stats.textContent = `共 ${data.count || STATE.allRecords.length} 个词条`;
        els.loading.classList.add('hidden');
    } catch (err) {
        showError("加载失败: " + err.message);
    }
}

// 搜索排序算法
function performSearch() {
    const query = els.searchInput.value.trim().toLowerCase();
    if (!query) return;

    STATE.keyword = query;
    const results = [];

    for (const item of STATE.allRecords) {
        let score = 0;
        const title = item.title.toLowerCase();
        const content = item.content.toLowerCase();

        // 匹配度打分
        if (title === query) score += 1000;
        else if (title.startsWith(query)) score += 500;
        else if (title.includes(query)) score += 200;

        if (content.includes(query)) {
            const occurrences = content.split(query).length - 1;
            score += 50 + (occurrences * 5);
        }

        if (score > 0) {
            results.push({ ...item, score });
        }
    }

    // 排序：分数高在前
    results.sort((a, b) => b.score - a.score);

    STATE.searchResults = results;
    STATE.displayedCount = 0;
    els.resultsList.innerHTML = '';
    els.searchInfo.textContent = `找到 ${results.length} 个相关词条`;

    if (results.length === 0) {
        els.resultsList.innerHTML = '<div class="meta">没有找到匹配的词条。</div>';
        els.pagination.classList.add('hidden');
    } else {
        renderNextPage();
    }
}

// 渲染结果页
function renderNextPage() {
    const start = STATE.displayedCount;
    const end = start + CONFIG.pageSize;
    const batch = STATE.searchResults.slice(start, end);

    batch.forEach(item => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.onclick = () => showArticle(item.id);
        
        const excerpt = getExcerpt(item.content, STATE.keyword);
        
        div.innerHTML = `
            <h3>${highlight(item.title, STATE.keyword)}</h3>
            <div class="excerpt">${highlight(excerpt, STATE.keyword)}</div>
        `;
        els.resultsList.appendChild(div);
    });

    STATE.displayedCount = end;
    if (STATE.displayedCount >= STATE.searchResults.length) {
        els.pagination.classList.add('hidden');
    } else {
        els.pagination.classList.remove('hidden');
    }
}

// 提取并高亮
function getExcerpt(content, kw) {
    const idx = content.toLowerCase().indexOf(kw);
    const start = Math.max(0, idx - 40);
    let excerpt = content.substring(start, start + CONFIG.excerptLength);
    return (start > 0 ? '...' : '') + excerpt + '...';
}

function highlight(text, kw) {
    if (!kw) return text;
    const regex = new RegExp(`(${escapeRegExp(kw)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 视图切换：阅读文章
function showArticle(id) {
    const item = STATE.allRecords.find(r => r.id === id);
    if (!item) return;

    els.viewSearch.classList.add('hidden');
    els.viewArticle.classList.remove('hidden');
    
    els.articleTitle.textContent = item.title;
    // 插入HTML并由CSS处理经文链接
    els.articleContent.innerHTML = item.content_html;
    
    window.scrollTo(0, 0);
}

function showSearch() {
    els.viewArticle.classList.add('hidden');
    els.viewSearch.classList.remove('hidden');
}

function showError(msg) {
    const box = document.getElementById('error-box');
    box.querySelector('.error-msg').textContent = msg;
    box.classList.remove('hidden');
    els.loading.classList.add('hidden');
}

// 事件监听
els.searchBtn.onclick = performSearch;
els.searchInput.onkeypress = (e) => { if (e.key === 'Enter') performSearch(); };
els.loadMoreBtn.onclick = renderNextPage;
els.backBtn.onclick = showSearch;

// 启动
init();