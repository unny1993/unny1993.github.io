/**
 * 个人博客 - 9视图单页应用路由与数据管理
 * 管理后台：支持文章/瞬间/相册/文集/交易记录增删改，数据持久化到 localStorage
 * 数据仪表盘：从 blog_trade_records 动态计算指标和图表
 */


// ===== 数据持久化 =====
function loadFromStorage(key, defaults) {
    var stored = localStorage.getItem(key);
    if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
    }
    localStorage.setItem(key, JSON.stringify(defaults));
    return JSON.parse(JSON.stringify(defaults));
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ===== 默认数据 =====
const DEFAULT_ARTICLES = [];

const DEFAULT_MOMENTS = [
    { date: '2026-08-10', content: '最终还是放弃了线上修改并同步的路线，选择本地推送至仓库进行更新。' }
];

const DEFAULT_GALLERY = [
    { id: 'album-life-2026', name: '【生活·2026】', cover: '', photos: [] }
];

const DEFAULT_COLLECTIONS = [
    { name: '思考.', articleIds: [] }
];

const DEFAULT_TRADE_RECORDS = [
    { date: '2026-08-03', type: '逆回购买入', code: '', name: 'GC001', amount: 19000, fee: 0.19, id: 1 },
    { date: '2026-08-03', type: '逆回购买入', code: '', name: 'GC001', amount: 1000, fee: 0.01, id: 2 },
    { date: '2026-08-04', type: '逆回购卖出', code: '', name: 'GC001', amount: 1000.04, fee: 0, id: 3 },
    { date: '2026-08-04', type: '逆回购卖出', code: '', name: 'GC001', amount: 19000.77, fee: 0, id: 4 },
    { date: '2026-08-04', type: '逆回购买入', code: '', name: 'GC001', amount: 10000, fee: 0.1, id: 5 },
    { date: '2026-08-04', type: '逆回购买入', code: '', name: 'GC001', amount: 5000, fee: 0.05, id: 6 },
    { date: '2026-08-04', type: '逆回购买入', code: '', name: 'GC001', amount: 5000, fee: 0.05, id: 7 },
    { date: '2026-08-05', type: '逆回购卖出', code: '', name: 'GC001', amount: 5000.21, fee: 0, id: 8 },
    { date: '2026-08-05', type: '逆回购卖出', code: '', name: 'GC001', amount: 5000.21, fee: 0, id: 9 },
    { date: '2026-08-05', type: '逆回购卖出', code: '', name: 'GC001', amount: 10000.42, fee: 0, id: 10 },
    { date: '2026-08-06', type: '逆回购买入', code: '', name: 'R-001', amount: 20000, fee: 0.2, id: 11 },
    { date: '2026-08-07', type: '逆回购卖出', code: '', name: 'R-001', amount: 20002.23, fee: 0, id: 12 }
];

// ===== 数据版本控制 =====
const DATA_VERSION = 2;

(function checkDataVersion() {
    var storedVer = localStorage.getItem('blog_data_version');
    if (String(storedVer) !== String(DATA_VERSION)) {
        ['blog_articles', 'blog_moments', 'blog_gallery', 'blog_collections', 'blog_trade_records'].forEach(function(k) {
            localStorage.removeItem(k);
        });
        localStorage.setItem('blog_data_version', DATA_VERSION);
    }
})();


function renderCurrentView() {
    switch (currentView) {
        case 'home': break;
        case 'moments': renderMoments(); break;
        case 'articles': renderAllPosts(); break;
        case 'gallery': renderGallery(); break;
        case 'collections': renderCollections(); break;
        case 'data': window.refreshDashboard && window.refreshDashboard(); break;
        case 'admin': renderAdmin(); break;
    }
}


// ===== 运行时数据 =====
let articles = loadFromStorage('blog_articles', DEFAULT_ARTICLES);
let moments = loadFromStorage('blog_moments', DEFAULT_MOMENTS);
let galleryItems = loadFromStorage('blog_gallery', DEFAULT_GALLERY);
let currentAlbumId = null;
let collections = loadFromStorage('blog_collections', DEFAULT_COLLECTIONS);
let tradeRecords = loadFromStorage('blog_trade_records', DEFAULT_TRADE_RECORDS);

function initTradeRecords() {
    return loadFromStorage('blog_trade_records', DEFAULT_TRADE_RECORDS);
}

// ===== 认证管理 =====
const ADMIN_VERSION = 2;

function loadCredentials() {
    var storedVer = localStorage.getItem('blog_admin_version');
    var stored = localStorage.getItem('blog_admin_credentials');
    if (stored && String(storedVer) === String(ADMIN_VERSION)) {
        try { return JSON.parse(stored); } catch (e) {}
    }
    var defaults = { username: 'admin', password: '753951' };
    localStorage.setItem('blog_admin_credentials', JSON.stringify(defaults));
    localStorage.setItem('blog_admin_version', String(ADMIN_VERSION));
    return JSON.parse(JSON.stringify(defaults));
}

var adminCredentials = loadCredentials();

function isLoggedIn() {
    return sessionStorage.getItem('blog_admin_logged_in') === 'true';
}

function showLoginOverlay() {
    var overlay = document.getElementById('login-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    var userEl = document.getElementById('login-username');
    var passEl = document.getElementById('login-password');
    var errEl = document.getElementById('login-error');
    if (userEl) userEl.value = '';
    if (passEl) passEl.value = '';
    if (errEl) errEl.style.display = 'none';
    if (userEl) userEl.focus();
}

function hideLoginOverlay() {
    var overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'none';
}

function doLogin() {
    var userEl = document.getElementById('login-username');
    var passEl = document.getElementById('login-password');
    var errorEl = document.getElementById('login-error');
    if (!userEl || !passEl) return;
    var username = userEl.value.trim();
    var password = passEl.value.trim();
    if (!username || !password) {
        if (errorEl) { errorEl.textContent = '请输入账号和密码'; errorEl.style.display = 'block'; }
        return;
    }
    if (username === adminCredentials.username && password === adminCredentials.password) {
        sessionStorage.setItem('blog_admin_logged_in', 'true');
        hideLoginOverlay();
        renderAdmin();
    } else {
        if (errorEl) { errorEl.textContent = '账号或密码错误'; errorEl.style.display = 'block'; }
    }
}

function showPwdModal() {
    var modal = document.getElementById('pwd-modal-overlay');
    modal.style.display = 'flex';
    document.getElementById('pwd-old').value = '';
    document.getElementById('pwd-new').value = '';
    document.getElementById('pwd-confirm').value = '';
    document.getElementById('pwd-error').style.display = 'none';
    document.getElementById('pwd-old').focus();
}

function hidePwdModal() {
    document.getElementById('pwd-modal-overlay').style.display = 'none';
}

function doChangePwd() {
    var old = document.getElementById('pwd-old').value.trim();
    var newP = document.getElementById('pwd-new').value.trim();
    var confirm = document.getElementById('pwd-confirm').value.trim();
    var errorEl = document.getElementById('pwd-error');
    if (!old || !newP || !confirm) {
        errorEl.textContent = '请填写所有字段';
        errorEl.style.display = 'block';
        return;
    }
    if (old !== adminCredentials.password) {
        errorEl.textContent = '当前密码错误';
        errorEl.style.display = 'block';
        return;
    }
    if (newP.length < 4) {
        errorEl.textContent = '新密码至少 4 位';
        errorEl.style.display = 'block';
        return;
    }
    if (newP !== confirm) {
        errorEl.textContent = '两次输入的新密码不一致';
        errorEl.style.display = 'block';
        return;
    }
    adminCredentials.password = newP;
    localStorage.setItem('blog_admin_credentials', JSON.stringify(adminCredentials));
    hidePwdModal();
}

// ===== 视图注册 =====
let currentView = 'home';
let currentArticleId = null;

const views = {
    home: document.getElementById('view-home'),
    moments: document.getElementById('view-moments'),
    articles: document.getElementById('view-articles'),
    gallery: document.getElementById('view-gallery'),
    collections: document.getElementById('view-collections'),
    data: document.getElementById('view-data'),
    about: document.getElementById('view-about'),
    detail: document.getElementById('view-detail'),
    admin: document.getElementById('view-admin')
};

function switchView(viewName, data) {
    Object.values(views).forEach(function(v) { v.classList.remove('active'); });
    views[viewName].classList.add('active');
    currentView = viewName;

    document.querySelectorAll('.nav-link').forEach(function(link) {
        var target = link.dataset.view;
        link.classList.toggle('active',
            target === viewName ||
            (viewName === 'detail' && target === 'articles')
        );
    });

    switch (viewName) {
        case 'moments': renderMoments(); break;
        case 'articles': renderAllPosts(); break;
        case 'gallery': currentAlbumId = null; renderGallery(); break;
        case 'collections': renderCollections(); break;
        case 'detail': renderArticleDetail(data); break;
        case 'admin':
            if (!isLoggedIn()) {
                showLoginOverlay();
                return;
            }
            renderAdmin();
            break;
        case 'data': window.refreshDashboard && window.refreshDashboard(); break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== 渲染：文章卡片 =====
function createPostCard(article) {
    return '<article class="post-card" data-id="' + article.id + '">' +
        '<div class="post-card-header">' +
        '<span class="post-category">' + article.category + '</span>' +
        '<span class="post-date">' + article.date + '</span>' +
        '</div>' +
        '<h3 class="post-card-title">' + article.title + '</h3>' +
        '<p class="post-card-excerpt">' + article.excerpt + '</p>' +
        '</article>';
}

function createPostCardCompact(article) {
    return '<article class="post-card-compact" data-id="' + article.id + '">' +
        '<span class="post-date">' + article.date + '</span>' +
        '<h3 class="post-card-title">' + article.title + '</h3>' +
        '</article>';
}

// ===== 渲染：文章列表 =====
function renderAllPosts() {
    var container = document.getElementById('all-posts');
    container.innerHTML = articles.map(createPostCard).join('');
    bindPostClicks(container);
}

// ===== 渲染：文章详情 =====
function renderArticleDetail(article) {
    var container = document.getElementById('article-content');
    container.innerHTML = '<span class="back-btn">&#8592; 所有文章</span>' +
        '<h1>' + article.title + '</h1>' +
        '<div class="article-meta"><span>' + article.category + '</span><span>' + article.date + '</span></div>' +
        '<div class="article-body">' + article.content + '</div>';
    container.querySelector('.back-btn').addEventListener('click', function() {
        switchView('articles');
    });
}

function bindPostClicks(container) {
    container.querySelectorAll('.post-card, .post-card-compact').forEach(function(card) {
        card.addEventListener('click', function() {
            var id = parseInt(card.dataset.id);
            var article = articles.find(function(a) { return a.id === id; });
            if (article) switchView('detail', article);
        });
    });
}

// ===== 渲染：瞬间 =====
function renderMoments() {
    var container = document.getElementById('moments-list');
    container.innerHTML = moments.map(function(m) {
        return '<div class="moment-item"><span class="moment-date">' + m.date + '</span><p class="moment-content">' + m.content + '</p></div>';
    }).join('');
}

// ===== 渲染：相册 =====
function genId(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);
}

function renderGallery() {
    var container = document.getElementById('gallery-grid');
    if (currentAlbumId === null) {
        // 相册列表
        if (galleryItems.length === 0) {
            container.innerHTML = '<p class="empty-hint">还没有相册，去后台新建一个吧。</p>';
            return;
        }
        container.innerHTML = galleryItems.map(function(album) {
            var cover = album.cover || (album.photos[0] && album.photos[0].url) || '';
            var coverHtml = cover
                ? '<img src="' + cover + '" alt="" class="gallery-img">'
                : '<div class="gallery-item-placeholder">📷</div>';
            return '<div class="gallery-item album-card" data-album="' + album.id + '">' +
                coverHtml +
                '<div class="gallery-overlay"><div class="gallery-item-title">' + album.name + '</div>' +
                '<div class="gallery-item-desc">' + album.photos.length + ' 张</div></div>' +
                '</div>';
        }).join('');
        container.querySelectorAll('.album-card').forEach(function(card) {
            card.addEventListener('click', function() {
                currentAlbumId = card.dataset.album;
                renderGallery();
            });
        });
        return;
    }
    // 相册详情：照片网格
    var album = galleryItems.find(function(a) { return a.id === currentAlbumId; });
    if (!album) { currentAlbumId = null; renderGallery(); return; }
    var back = '<div class="gallery-back" data-back>&#8592; 返回相册</div>';
    if (album.photos.length === 0) {
        container.innerHTML = back + '<p class="empty-hint">这个相册还没有照片。</p>';
    } else {
        container.innerHTML = back + album.photos.map(function(p, i) {
            return '<div class="gallery-item" data-photo="' + i + '">' +
                '<img src="' + p.url + '" alt="' + (p.title || '') + '" loading="lazy" class="gallery-img">' +
                (p.title || p.description ? '<div class="gallery-overlay"><div class="gallery-item-title">' + (p.title || '') + '</div>' + (p.description ? '<div class="gallery-item-desc">' + p.description + '</div>' : '') + '</div>' : '') +
                '</div>';
        }).join('');
        container.querySelectorAll('.gallery-item[data-photo]').forEach(function(card) {
            card.addEventListener('click', function() { openLightbox(album, parseInt(card.dataset.photo)); });
        });
    }
    container.querySelector('[data-back]').addEventListener('click', function() {
        currentAlbumId = null;
        renderGallery();
    });
}

// ===== 灯箱（照片放大查看） =====
let lightboxAlbum = null;
let lightboxIndex = 0;

function openLightbox(album, index) {
    lightboxAlbum = album;
    lightboxIndex = index;
    renderLightbox();
    document.getElementById('gallery-lightbox').classList.add('active');
}

function renderLightbox() {
    if (!lightboxAlbum) return;
    var p = lightboxAlbum.photos[lightboxIndex];
    var box = document.getElementById('gallery-lightbox');
    box.querySelector('.lightbox-img').src = p.url;
    box.querySelector('.lightbox-caption').textContent = (p.title || '') + (p.description ? ' — ' + p.description : '');
    box.querySelector('.lightbox-count').textContent = (lightboxIndex + 1) + ' / ' + lightboxAlbum.photos.length;
}

function closeLightbox() {
    document.getElementById('gallery-lightbox').classList.remove('active');
    lightboxAlbum = null;
}

function lightboxNav(dir) {
    if (!lightboxAlbum) return;
    lightboxIndex = (lightboxIndex + dir + lightboxAlbum.photos.length) % lightboxAlbum.photos.length;
    renderLightbox();
}

// ===== 渲染：文集 =====
function renderCollections() {
    var container = document.getElementById('collections-list');
    container.innerHTML = collections.map(function(col) {
        var colArticles = col.articleIds.map(function(id) { return articles.find(function(a) { return a.id === id; }); }).filter(Boolean);
        return '<div class="collection-group">' +
            '<h3 class="collection-name">' + col.name + '</h3>' +
            '<div class="collection-articles">' + colArticles.map(createPostCardCompact).join('') + '</div>' +
            '</div>';
    }).join('');
    bindPostClicks(container);
}

// ==========================================
//  管理后台
// ==========================================

let editingArticleId = null;
let editingGalleryIndex = null;
let editingCollectionIndex = null;
let editingTradeId = null;

// ===== Token 状态栏 =====


function renderAdmin() {
    renderArticleCategorySelect();
    renderAdminArticles();
    renderAdminMoments();
    renderAdminGallery();
    renderAdminCollections();
    renderAdminTrades();
    bindAdminTabs();
}

function renderArticleCategorySelect() {
    var select = document.getElementById('admin-article-category');
    select.innerHTML = collections.map(function(col) {
        return '<option value="' + col.name + '">' + col.name + '</option>';
    }).join('');
}

// ---- 管理：文章 ----
function renderAdminArticles() {
    var list = document.getElementById('admin-articles-list');
    list.innerHTML = articles.map(function(a) {
        return '<div class="admin-item">' +
            '<div class="admin-item-info">' +
            '<div class="admin-item-title">' + a.title + '</div>' +
            '<div class="admin-item-meta">' + a.category + ' / ' + a.date + '</div>' +
            '</div>' +
            '<div class="admin-item-actions">' +
            '<button class="admin-btn-sm admin-btn-edit" data-edit-article="' + a.id + '">编辑</button>' +
            '<button class="admin-btn-sm admin-btn-del" data-del-article="' + a.id + '">删除</button>' +
            '</div>' +
            '</div>';
    }).join('');

    bindAdminArticleEvents();
}

function bindAdminArticleEvents() {
    document.querySelectorAll('[data-edit-article]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = parseInt(btn.dataset.editArticle);
            var a = articles.find(function(x) { return x.id === id; });
            if (!a) return;
            editingArticleId = id;
            document.getElementById('admin-article-form-title').textContent = '编辑文章';
            document.getElementById('admin-edit-article-id').value = id;
            document.getElementById('admin-article-title').value = a.title;
            document.getElementById('admin-article-category').value = a.category;
            document.getElementById('admin-article-date').value = a.date;
            document.getElementById('admin-article-excerpt').value = a.excerpt;
            document.getElementById('admin-article-content').innerHTML = a.content || '';
            document.getElementById('admin-article-submit').textContent = '更新文章';
            document.getElementById('admin-article-cancel').style.display = 'inline-flex';
        });
    });

    document.querySelectorAll('[data-del-article]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = parseInt(btn.dataset.delArticle);
            var delArt = articles.find(function(a) { return a.id === id; });
            if (!delArt) return;

            if (!confirm('确定删除文章「' + delArt.title + '」吗？')) return;
            articles = articles.filter(function(a) { return a.id !== id; });
            saveToStorage('blog_articles', articles);
            renderAdminArticles();
            renderAllPosts();
        });
    });
}

document.getElementById('admin-article-submit').addEventListener('click', function() {
    var title = document.getElementById('admin-article-title').value.trim();
    var category = document.getElementById('admin-article-category').value;
    var date = document.getElementById('admin-article-date').value;
    var excerpt = document.getElementById('admin-article-excerpt').value.trim();
    var editorEl = document.getElementById('admin-article-content');
    var content = (editorEl.innerHTML || '').trim();
    if (content === '<br>') content = '';
    if (!title || !date) return;

    if (editingArticleId) {
        var a = articles.find(function(x) { return x.id === editingArticleId; });
        if (a) {
            a.title = title; a.category = category; a.date = date; a.excerpt = excerpt; a.content = content;
        }
    } else {
        var maxId = articles.reduce(function(max, a) { return Math.max(max, a.id); }, 0);
        articles.push({ id: maxId + 1, title: title, category: category, date: date, excerpt: excerpt, content: content });
    }

    cancelEditArticle();
    renderAdminArticles();
    renderAllPosts();
});

document.getElementById('admin-article-cancel').addEventListener('click', cancelEditArticle);

function cancelEditArticle() {
    editingArticleId = null;
    document.getElementById('admin-article-form-title').textContent = '新增文章';
    document.getElementById('admin-edit-article-id').value = '';
    document.getElementById('admin-article-title').value = '';
    document.getElementById('admin-article-category').value = collections.length ? collections[0].name : '';
    document.getElementById('admin-article-date').value = '';
    document.getElementById('admin-article-excerpt').value = '';
    document.getElementById('admin-article-content').innerHTML = '';
    document.getElementById('admin-article-submit').textContent = '添加文章';
    document.getElementById('admin-article-cancel').style.display = 'none';
}

// ---- 管理：瞬间 ----
function renderAdminMoments() {
    var list = document.getElementById('admin-moments-list');
    list.innerHTML = moments.map(function(m, i) {
        return '<div class="admin-item">' +
            '<div class="admin-item-info">' +
            '<div class="admin-item-title">' + m.content + '</div>' +
            '<div class="admin-item-meta">' + m.date + '</div>' +
            '</div>' +
            '<div class="admin-item-actions">' +
            '<button class="admin-btn-sm admin-btn-del" data-del-moment="' + i + '">删除</button>' +
            '</div>' +
            '</div>';
    }).join('');

    document.querySelectorAll('[data-del-moment]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var i = parseInt(btn.dataset.delMoment);
            var dm = moments[i];
            moments.splice(i, 1);
            saveToStorage('blog_moments', moments);

            renderAdminMoments();
            renderMoments();
        });
    });
}

document.getElementById('admin-moment-submit').addEventListener('click', function() {
    var date = document.getElementById('admin-moment-date').value;
    var content = document.getElementById('admin-moment-content').value.trim();
    if (!date || !content) return;

    var newMoment = { date: date, content: content };
    moments.unshift(newMoment);
    saveToStorage('blog_moments', moments);

    document.getElementById('admin-moment-date').value = '';
    document.getElementById('admin-moment-content').value = '';
    renderAdminMoments();
    renderMoments();
});

// ---- 管理：相册（相册分组 + 照片上传） ----
let pendingPhotos = [];

function renderAdminAlbumSelect() {
    var sel = document.getElementById('admin-album-select');
    if (!sel) return;
    sel.innerHTML = galleryItems.map(function(a) {
        return '<option value="' + a.id + '">' + a.name + ' (' + a.photos.length + ')</option>';
    }).join('');
    updateCurrentAlbumName();
}

function updateCurrentAlbumName() {
    var sel = document.getElementById('admin-album-select');
    var nameEl = document.getElementById('admin-current-album-name');
    if (!sel || !nameEl) return;
    var album = galleryItems.find(function(a) { return a.id === sel.value; });
    nameEl.textContent = album ? album.name : '—';
}

function getCurrentAdminAlbum() {
    var sel = document.getElementById('admin-album-select');
    return galleryItems.find(function(a) { return a.id === sel.value; });
}

function renderAdminGallery() {
    renderAdminAlbumSelect();
    var list = document.getElementById('admin-gallery-list');
    if (galleryItems.length === 0) {
        list.innerHTML = '<p class="empty-hint">暂无相册。先在上方新建一个相册。</p>';
        return;
    }
    list.innerHTML = galleryItems.map(function(album) {
        var photosHtml = album.photos.map(function(p, i) {
            return '<div class="admin-gallery-photo">' +
                '<img src="' + p.url + '" class="admin-gallery-thumb" alt="">' +
                '<button class="admin-photo-del" data-album="' + album.id + '" data-photo="' + i + '" title="删除">&times;</button>' +
                '</div>';
        }).join('');
        return '<div class="admin-item admin-album-item">' +
            '<div class="admin-item-info"><div class="admin-item-title">' + album.name +
            ' <span class="admin-item-meta">(' + album.photos.length + ' 张)</span></div></div>' +
            '<div class="admin-album-photos">' + (photosHtml || '<span class="admin-item-meta">空相册</span>') + '</div>' +
            '</div>';
    }).join('');

    list.querySelectorAll('.admin-photo-del').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var album = galleryItems.find(function(a) { return a.id === btn.dataset.album; });
            if (!album) return;
            album.photos.splice(parseInt(btn.dataset.photo), 1);
            saveToStorage('blog_gallery', galleryItems);
            renderAdminGallery();
            renderGallery();
        });
    });
}

// 新建相册
document.getElementById('admin-album-create').addEventListener('click', function() {
    var name = document.getElementById('admin-new-album-name').value.trim();
    if (!name) return;
    galleryItems.push({ id: genId('album'), name: name, cover: '', photos: [] });
    saveToStorage('blog_gallery', galleryItems);
    document.getElementById('admin-new-album-name').value = '';
    renderAdminGallery();
    renderGallery();
});

// 删除相册
document.getElementById('admin-album-delete').addEventListener('click', function() {
    var album = getCurrentAdminAlbum();
    if (!album) return;
    if (!confirm('确定删除相册「' + album.name + '」及其所有照片？')) return;
    galleryItems = galleryItems.filter(function(a) { return a.id !== album.id; });
    saveToStorage('blog_gallery', galleryItems);
    renderAdminGallery();
    renderGallery();
});

// 相册下拉变化
document.getElementById('admin-album-select').addEventListener('change', updateCurrentAlbumName);

// 文件选择 -> 预览
document.getElementById('admin-photo-file').addEventListener('change', function(e) {
    var files = Array.prototype.slice.call(e.target.files || []);
    if (!files.length) return;
    files.forEach(function(file) {
        if (!file.type || !file.type.startsWith('image/')) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
            pendingPhotos.push({
                title: file.name.replace(/\.[^.]+$/, ''),
                description: '',
                url: ev.target.result
            });
            renderPendingPhotos();
        };
        reader.readAsDataURL(file);
    });
    e.target.value = '';
});

function renderPendingPhotos() {
    var box = document.getElementById('admin-pending-photos');
    var addBtn = document.getElementById('admin-photo-add');
    var clearBtn = document.getElementById('admin-photo-clear');
    if (pendingPhotos.length === 0) {
        box.innerHTML = '';
        addBtn.disabled = true;
        clearBtn.disabled = true;
        return;
    }
    addBtn.disabled = false;
    clearBtn.disabled = false;
    box.innerHTML = pendingPhotos.map(function(p, i) {
        return '<div class="pending-photo">' +
            '<img src="' + p.url + '" class="pending-thumb" alt="">' +
            '<div class="pending-fields">' +
            '<input type="text" class="admin-input pending-title" data-i="' + i + '" placeholder="标题（可选）" value="' + (p.title || '') + '">' +
            '<input type="text" class="admin-input pending-desc" data-i="' + i + '" placeholder="描述（可选）" value="' + (p.description || '') + '">' +
            '</div>' +
            '<button class="admin-btn-sm admin-btn-del pending-remove" data-i="' + i + '">移除</button>' +
            '</div>';
    }).join('');
    box.querySelectorAll('.pending-title').forEach(function(inp) {
        inp.addEventListener('input', function() { pendingPhotos[+inp.dataset.i].title = inp.value; });
    });
    box.querySelectorAll('.pending-desc').forEach(function(inp) {
        inp.addEventListener('input', function() { pendingPhotos[+inp.dataset.i].description = inp.value; });
    });
    box.querySelectorAll('.pending-remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
            pendingPhotos.splice(+btn.dataset.i, 1);
            renderPendingPhotos();
        });
    });
}

document.getElementById('admin-photo-clear').addEventListener('click', function() {
    pendingPhotos = [];
    renderPendingPhotos();
});

document.getElementById('admin-photo-add').addEventListener('click', function() {
    var album = getCurrentAdminAlbum();
    if (!album) { alert('请先选择或新建一个相册'); return; }
    if (pendingPhotos.length === 0) return;
    pendingPhotos.forEach(function(p) {
        album.photos.push({ id: genId('photo'), title: p.title, description: p.description, url: p.url });
    });
    saveToStorage('blog_gallery', galleryItems);
    pendingPhotos = [];
    renderPendingPhotos();
    renderAdminGallery();
    renderGallery();
});

// 灯箱交互
(function initLightbox() {
    var box = document.getElementById('gallery-lightbox');
    if (!box) return;
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev').addEventListener('click', function(e) { e.stopPropagation(); lightboxNav(-1); });
    document.getElementById('lightbox-next').addEventListener('click', function(e) { e.stopPropagation(); lightboxNav(1); });
    box.addEventListener('click', function(e) { if (e.target === box) closeLightbox(); });
    document.addEventListener('keydown', function(e) {
        if (!box.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') lightboxNav(-1);
        else if (e.key === 'ArrowRight') lightboxNav(1);
    });
})();

// ---- 管理：文集 ----
function renderAdminCollections() {
    var checklist = document.getElementById('admin-collection-articles-checklist');
    checklist.innerHTML = articles.map(function(a) {
        var checked = '';
        if (editingCollectionIndex !== null) {
            checked = collections[editingCollectionIndex].articleIds.indexOf(a.id) !== -1 ? ' checked' : '';
        }
        return '<label><input type="checkbox" value="' + a.id + '"' + checked + '> ' + a.title + '</label>';
    }).join('');

    var list = document.getElementById('admin-collections-list');
    list.innerHTML = collections.map(function(col, i) {
        var linkedArticles = col.articleIds.map(function(id) { return articles.find(function(a) { return a.id === id; }); }).filter(Boolean);
        var titles = linkedArticles.map(function(a) { return a.title; }).join('、') || '无关联文章';
        return '<div class="admin-item">' +
            '<div class="admin-item-info">' +
            '<div class="admin-item-title">' + col.name + '</div>' +
            '<div class="admin-item-meta">关联：' + titles + '</div>' +
            '</div>' +
            '<div class="admin-item-actions">' +
            '<button class="admin-btn-sm admin-btn-edit" data-edit-collection="' + i + '">编辑</button>' +
            '<button class="admin-btn-sm admin-btn-del" data-del-collection="' + i + '">删除</button>' +
            '</div>' +
            '</div>';
    }).join('');

    document.querySelectorAll('[data-edit-collection]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var i = parseInt(btn.dataset.editCollection);
            editingCollectionIndex = i;
            document.getElementById('admin-collection-form-title').textContent = '编辑文集';
            document.getElementById('admin-edit-collection-index').value = i;
            document.getElementById('admin-collection-name').value = collections[i].name;
            document.getElementById('admin-collection-submit').textContent = '更新文集';
            document.getElementById('admin-collection-cancel').style.display = 'inline-flex';
            renderAdminCollections();
        });
    });

    document.querySelectorAll('[data-del-collection]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var i = parseInt(btn.dataset.delCollection);
            var dc = collections[i];
            collections.splice(i, 1);
            saveToStorage('blog_collections', collections);

            renderAdminCollections();
            renderCollections();
        });
    });
}

document.getElementById('admin-collection-submit').addEventListener('click', function() {
    var name = document.getElementById('admin-collection-name').value.trim();
    if (!name) return;

    var checkedIds = [];
    document.querySelectorAll('#admin-collection-articles-checklist input[type="checkbox"]:checked').forEach(function(cb) {
        checkedIds.push(parseInt(cb.value));
    });

    if (editingCollectionIndex !== null) {
        collections[editingCollectionIndex] = { name: name, articleIds: checkedIds };
    } else {
        collections.push({ name: name, articleIds: checkedIds });
    }

    saveToStorage('blog_collections', collections);
    cancelEditCollection();
    renderAdminCollections();
    renderCollections();
});

document.getElementById('admin-collection-cancel').addEventListener('click', cancelEditCollection);

function cancelEditCollection() {
    editingCollectionIndex = null;
    document.getElementById('admin-collection-form-title').textContent = '新增文集';
    document.getElementById('admin-edit-collection-index').value = '';
    document.getElementById('admin-collection-name').value = '';
    document.getElementById('admin-collection-submit').textContent = '添加文集';
    document.getElementById('admin-collection-cancel').style.display = 'none';
    renderAdminCollections();
}

// ---- 管理：交易记录 ----
function getNextTradeId() {
    return tradeRecords.reduce(function(max, r) { return Math.max(max, r.id); }, 0) + 1;
}

function renderAdminTrades() {
    var list = document.getElementById('admin-trades-list');
    if (!tradeRecords.length) {
        list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-tertiary);">暂无交易记录，请在表单中添加</div>';
    } else {
        var sorted = tradeRecords.slice().sort(function(a, b) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        var rows = '';
        for (var i = 0; i < sorted.length; i++) {
            var r = sorted[i];
            var seq = i + 1;
            rows += '<tr>' +
                '<td>' + seq + '</td>' +
                '<td>' + r.date + '</td>' +
                '<td>' + r.type + '</td>' +
                '<td>' + (r.code || '') + '</td>' +
                '<td>' + (r.name || '') + '</td>' +
                '<td>¥' + (r.amount || 0).toFixed(2) + '</td>' +
                '<td>¥' + (r.fee || 0).toFixed(2) + '</td>' +
                '<td><button class="admin-btn-sm admin-btn-del" data-del-trade="' + r.id + '">删除</button></td>' +
                '</tr>';
        }
        list.innerHTML = '<table class="admin-trades-table"><thead><tr>' +
            '<th>序号</th><th>日期</th><th>类型</th><th>代码</th><th>名称</th><th>金额</th><th>手续费</th><th>操作</th>' +
            '</tr></thead><tbody>' + rows + '</tbody></table>';
    }

    document.querySelectorAll('[data-del-trade]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = parseInt(btn.dataset.delTrade);
            if (confirm('确认删除该交易记录？')) {
                var dt = tradeRecords.find(function(r) { return r.id === id; });
                tradeRecords = tradeRecords.filter(function(r) { return r.id !== id; });
                saveToStorage('blog_trade_records', tradeRecords);

                renderAdminTrades();
                window.refreshDashboard && window.refreshDashboard();
            }
        });
    });
}

// ---- 交易记录提交（简化版：6字段统一） ----
document.getElementById('admin-trade-submit').addEventListener('click', function() {
    var date = document.getElementById('admin-trade-date').value;
    var type = document.getElementById('admin-trade-type').value;
    var code = document.getElementById('admin-trade-code').value.trim();
    var name = document.getElementById('admin-trade-name').value.trim();
    var amount = parseFloat(document.getElementById('admin-trade-amount').value) || 0;
    var fee = parseFloat(document.getElementById('admin-trade-fee').value) || 0;

    if (!date) return;

    var record = { date: date, type: type, code: code, name: name, amount: amount, fee: fee };

    if (editingTradeId) {
        var existing = tradeRecords.find(function(r) { return r.id === editingTradeId; });
        if (existing) Object.assign(existing, record);
    } else {
        record.id = getNextTradeId();
        tradeRecords.push(record);
    }

    saveToStorage('blog_trade_records', tradeRecords);

    cancelEditTrade();
    renderAdminTrades();
    window.refreshDashboard && window.refreshDashboard();
});

document.getElementById('admin-trade-cancel').addEventListener('click', cancelEditTrade);

function cancelEditTrade() {
    editingTradeId = null;
    document.getElementById('admin-trade-form-title').textContent = '新增交易记录';
    document.getElementById('admin-edit-trade-id').value = '';
    document.getElementById('admin-trade-date').value = '';
    document.getElementById('admin-trade-type').value = '逆回购买入';
    document.getElementById('admin-trade-code').value = '';
    document.getElementById('admin-trade-name').value = '';
    document.getElementById('admin-trade-amount').value = '';
    document.getElementById('admin-trade-fee').value = '';
    document.getElementById('admin-trade-submit').textContent = '添加记录';
    document.getElementById('admin-trade-cancel').style.display = 'none';
}

// ---- 管理：Tab 切换 ----
function bindAdminTabs() {
    document.querySelectorAll('.admin-tab').forEach(function(tab) {
        tab.removeEventListener('click', handleAdminTabClick);
        tab.addEventListener('click', handleAdminTabClick);
    });
}

function handleAdminTabClick(e) {
    var tabName = e.target.dataset.adminTab;
    document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.remove('active'); });
    e.target.classList.add('active');
    document.querySelectorAll('.admin-panel').forEach(function(p) { p.classList.remove('active'); });
    document.getElementById('admin-panel-' + tabName).classList.add('active');
}

// ===== 导航事件 =====
document.querySelectorAll('[data-view]').forEach(function(link) {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        switchView(link.dataset.view);
    });
});

// ===== 导航栏搜索 =====
var headerSearchInput = document.querySelector('.header-search-input');
var searchDropdown = document.querySelector('.search-dropdown');
var searchDropdownInner = document.querySelector('.search-dropdown-inner');

headerSearchInput.addEventListener('input', function() {
    var query = headerSearchInput.value.trim().toLowerCase();

    if (!query) {
        searchDropdown.style.display = 'none';
        return;
    }

    var results = articles.filter(function(a) {
        return a.title.toLowerCase().indexOf(query) !== -1 ||
            a.excerpt.toLowerCase().indexOf(query) !== -1 ||
            a.category.toLowerCase().indexOf(query) !== -1;
    });

    if (results.length === 0) {
        searchDropdown.style.display = 'block';
        searchDropdownInner.innerHTML = '<p class="search-dropdown-empty">未找到匹配的文章</p>';
    } else {
        searchDropdown.style.display = 'block';
        searchDropdownInner.innerHTML = results.map(function(a) {
            return '<article class="post-card" data-id="' + a.id + '">' +
                '<div class="post-card-header">' +
                '<span class="post-category">' + a.category + '</span>' +
                '<span class="post-date">' + a.date + '</span>' +
                '</div>' +
                '<h3 class="post-card-title">' + a.title + '</h3>' +
                '</article>';
        }).join('');
        bindPostClicks(searchDropdownInner);
    }
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('.header-search')) {
        searchDropdown.style.display = 'none';
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        searchDropdown.style.display = 'none';
        headerSearchInput.blur();
    }
});

// ===== 富文本编辑器工具栏 =====
function rteWrapInline(tag) {
    var sel = window.getSelection();
    if (!sel.rangeCount) return;
    var range = sel.getRangeAt(0);
    if (range.collapsed) return;
    var text = range.toString();
    var el = document.createElement(tag);
    el.textContent = text;
    range.deleteContents();
    range.insertNode(el);
    sel.removeAllRanges();
    var r = document.createRange();
    r.selectNodeContents(el);
    sel.addRange(r);
}

function rteInsertNodeAtCursor(node) {
    var sel = window.getSelection();
    if (!sel.rangeCount) return;
    var range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
}

function rteHandleLink() {
    var url = prompt('输入链接地址 (以 http(s):// 开头)：');
    if (!url) return;
    var sel = window.getSelection();
    if (sel && sel.rangeCount && !sel.getRangeAt(0).collapsed) {
        document.execCommand('createLink', false, url);
    } else {
        var a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = url;
        rteInsertNodeAtCursor(a);
    }
}

(function initRichTextEditor() {
    var toolbar = document.getElementById('rte-toolbar');
    if (!toolbar) return;
    toolbar.addEventListener('mousedown', function(e) {
        var btn = e.target.closest('.rte-btn');
        if (!btn) return;
        e.preventDefault();
        var cmd = btn.dataset.cmd;
        var block = btn.dataset.block;
        var inline = btn.dataset.inline;
        if (cmd === 'createLink') { rteHandleLink(); return; }
        if (cmd === 'insertHorizontalRule') { document.execCommand('insertHorizontalRule'); return; }
        if (cmd) {
            document.execCommand(cmd, false, null);
        } else if (block) {
            document.execCommand('formatBlock', false, '<' + block + '>');
        } else if (inline) {
            rteWrapInline(inline);
        }
    });
})();

// ===== 导出数据到文件 =====
function exportDataToFile() {
    var data = {
        blog_articles: JSON.parse(localStorage.getItem('blog_articles') || '[]'),
        blog_moments: JSON.parse(localStorage.getItem('blog_moments') || '[]'),
        blog_gallery: JSON.parse(localStorage.getItem('blog_gallery') || '[]'),
        blog_collections: JSON.parse(localStorage.getItem('blog_collections') || '[]'),
        blog_trade_records: JSON.parse(localStorage.getItem('blog_trade_records') || '[]')
    };
    var jsonStr = JSON.stringify(data, null, 2);
    var blob = new Blob([jsonStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'blog-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    var btn = document.getElementById('admin-export-data');
    if (btn) {
        btn.textContent = '已导出';
        setTimeout(function() { btn.textContent = '导出文件'; }, 1500);
    }
}

// ===== 从文件导入数据 =====
function importDataFromFile(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var data = JSON.parse(e.target.result);
            var keys = ['blog_articles', 'blog_moments', 'blog_gallery', 'blog_collections', 'blog_trade_records'];
            var imported = 0;
            keys.forEach(function(k) {
                if (data[k] !== undefined) {
                    localStorage.setItem(k, JSON.stringify(data[k]));
                    imported++;
                }
            });
            if (imported === 0) {
                alert('导入失败：文件中未找到任何博客数据字段');
                return;
            }
            alert('导入成功（' + imported + ' 类数据），页面将刷新以加载新数据');
            location.reload();
        } catch (err) {
            alert('导入失败：文件不是有效的 blog-data.json');
        }
    };
    reader.readAsText(file);
}

// ===== 登录事件绑定（DOMContentLoaded 确保元素就绪）=====
document.addEventListener('DOMContentLoaded', function() {
    var loginSubmit = document.getElementById('login-submit');
    var loginPass = document.getElementById('login-password');
    var loginUser = document.getElementById('login-username');
    var adminPwdBtn = document.getElementById('admin-change-pwd');
    var adminExportBtn = document.getElementById('admin-export-data');
    var pwdSubmit = document.getElementById('pwd-submit');
    var pwdCancel = document.getElementById('pwd-cancel');
    var pwdModal = document.getElementById('pwd-modal-overlay');
    var pwdConfirm = document.getElementById('pwd-confirm');

    if (loginSubmit) loginSubmit.addEventListener('click', doLogin);
    if (loginPass) loginPass.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') doLogin();
    });
    if (loginUser) loginUser.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && loginPass) loginPass.focus();
    });

    if (adminPwdBtn) adminPwdBtn.addEventListener('click', showPwdModal);
    if (adminExportBtn) adminExportBtn.addEventListener('click', exportDataToFile);

    var adminImportBtn = document.getElementById('admin-import-data');
    var adminImportFile = document.getElementById('admin-import-file');
    if (adminImportBtn && adminImportFile) {
        adminImportBtn.addEventListener('click', function() { adminImportFile.click(); });
        adminImportFile.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                importDataFromFile(this.files[0]);
            }
            this.value = '';
        });
    }
    if (pwdSubmit) pwdSubmit.addEventListener('click', doChangePwd);
    if (pwdCancel) pwdCancel.addEventListener('click', hidePwdModal);
    if (pwdModal) pwdModal.addEventListener('click', function(e) {
        if (e.target === this) hidePwdModal();
    });
    if (pwdConfirm) pwdConfirm.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') doChangePwd();
    });
});
