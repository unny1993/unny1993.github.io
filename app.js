/**
 * 个人博客 - 9视图单页应用路由与数据管理
 * 管理后台：支持文章/瞬间/相册/文集/交易记录增删改，数据持久化到 localStorage
 * 数据仪表盘：从 blog_trade_records 动态计算指标和图表
 */


// ===== GitHub Issues CMS 配置 =====
var GH_OWNER = 'unny1993';
var GH_REPO = 'unny1993.github.io';
var GH_API_BASE = 'https://api.github.com/repos/' + GH_OWNER + '/' + GH_REPO;
var GH_LABEL_MAP = {
    'blog_articles': 'article',
    'blog_moments': 'moment',
    'blog_gallery': 'album',
    'blog_collections': 'collection',
    'blog_trade_records': 'trade'
};
var GH_KEY_BY_LABEL = {
    'article': 'blog_articles',
    'moment': 'blog_moments',
    'album': 'blog_gallery',
    'collection': 'blog_collections',
    'trade': 'blog_trade_records'
};

// ===== 默认数据 =====
const DEFAULT_ARTICLES = [
    { id: 1, title: "JavaScript 异步编程深入理解", category: "前端", date: "2026-07-28", excerpt: "从回调地狱到 Promise，再到 async/await，深入探讨 JavaScript 异步编程的演进历程与最佳实践。", content: "<p>JavaScript 的异步编程模型经历了多次重大变革。理解这些变革背后的动机，对于写出高质量的前端代码至关重要。</p><h2>回调函数时代</h2><p>早期的 JavaScript 异步操作依赖回调函数。当多个异步操作需要按顺序执行时，代码会迅速变成所谓的\"回调地狱\"。</p><pre><code>fetchUser(userId, function(user) {\n    fetchPosts(user.id, function(posts) {\n        fetchComments(posts[0].id, function(comments) {\n            console.log(comments);\n        });\n    });\n});</code></pre><h2>Promise 的引入</h2><p>Promise 提供了一种更优雅的方式来处理异步操作。它将异步操作封装成一个对象，通过 <code>.then()</code> 链式调用来组织流程，避免了深层嵌套。</p><h2>async / await</h2><p>ES2017 引入的 async/await 语法将异步代码写成了同步风格，极大提升了可读性。它是基于 Promise 的语法糖，但让错误处理（try/catch）和条件逻辑变得更加自然。</p><blockquote>选择哪种异步方案取决于具体场景：简单串行用 async/await，需要并发控制时善用 Promise.all 和 Promise.race。</blockquote>" },
    { id: 2, title: "Python 数据分析入门指南", category: "后端", date: "2026-07-20", excerpt: "使用 Pandas、Matplotlib 和 NumPy 快速上手数据分析，从数据清洗到可视化一站式讲解。", content: "<p>Python 凭借其丰富的数据科学生态，已成为数据分析领域的首选语言。本文带你从零开始，掌握核心工具。</p><h2>环境准备</h2><p>建议使用 Anaconda 发行版或 pip 安装核心库：</p><pre><code>pip install pandas numpy matplotlib</code></pre><h2>Pandas 数据读取与清洗</h2><p>Pandas 的 DataFrame 是数据分析的核心数据结构。你可以轻松地从 CSV、Excel、SQL 等多种来源加载数据。</p><h3>常用操作</h3><ul><li><code>df.head()</code> — 查看前几行数据</li><li><code>df.info()</code> — 了解数据类型和缺失情况</li><li><code>df.dropna()</code> — 处理缺失值</li><li><code>df.groupby()</code> — 分组聚合</li></ul><h2>数据可视化</h2><p>Matplotlib 和 Seaborn 让你能用几行代码生成专业图表。从折线图到热力图，覆盖绝大多数分析场景。</p><blockquote>数据清洗通常占据数据分析 80% 的时间，掌握 Pandas 的清洗技巧是效率的关键。</blockquote>" },
    { id: 3, title: "CSS Grid 布局完全指南", category: "前端", date: "2026-07-12", excerpt: "掌握 CSS Grid 布局的核心概念，用最少的代码实现最灵活的页面布局方案。", content: "<p>CSS Grid 是二维布局系统，可以同时控制行和列，是构建复杂页面布局的终极方案。</p><h2>核心概念</h2><p>Grid 布局由容器（Grid Container）和项目（Grid Items）组成。在容器上定义网格轨道（行和列），项目自动放置到对应的单元格中。</p><pre><code>.container {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    grid-template-rows: auto;\n    gap: 20px;\n}</code></pre><h2>常用属性速查</h2><ul><li><code>grid-template-columns</code> — 定义列宽</li><li><code>grid-template-rows</code> — 定义行高</li><li><code>grid-gap / gap</code> — 网格间距</li><li><code>grid-column / grid-row</code> — 项目跨列/跨行</li></ul><blockquote>Grid 配合 Flexbox 使用，可以覆盖 99% 的布局需求。Grid 负责页面整体骨架，Flexbox 负责组件内部排列。</blockquote>" },
    { id: 4, title: "Git 工作流最佳实践", category: "工具", date: "2026-07-05", excerpt: "从分支策略到 commit 规范，打造高效的团队协作 Git 工作流。", content: "<p>Git 是现代软件开发不可或缺的工具。掌握规范的工作流，能让团队协作事半功倍。</p><h2>分支策略</h2><p>推荐使用 Git Flow 或 GitHub Flow。核心原则：主分支保持稳定可部署，功能开发在特性分支上进行，通过 Pull Request 合并。</p><h2>Commit 规范</h2><p>好的 commit message 遵循以下格式：</p><pre><code>type(scope): subject\n\nbody (optional)</code></pre><p>常用的 type 包括：feat（新功能）、fix（修复）、docs（文档）、refactor（重构）、style（格式）等。</p><h2>实用技巧</h2><ul><li><code>git rebase -i</code> — 整理提交历史</li><li><code>git stash</code> — 暂存未提交的修改</li><li><code>git cherry-pick</code> — 选择性合并提交</li><li><code>git bisect</code> — 二分法定位 bug</li></ul><blockquote>频繁提交、小步合并：每次 commit 只做一件事，每个 PR 保持合理的规模，这样 Code Review 才高效。</blockquote>" },
    { id: 5, title: "Web 性能优化实战", category: "前端", date: "2026-06-28", excerpt: "从资源加载、渲染优化到缓存策略，全面提升网站性能的实战指南。", content: "<p>网站性能直接影响用户体验和 SEO 排名。以下从几个关键维度梳理优化策略。</p><h2>资源加载优化</h2><ul><li><strong>代码分割</strong>：使用动态 import() 按需加载，减少首屏 JS 体积</li><li><strong>图片优化</strong>：使用 WebP 格式、响应式图片、懒加载</li><li><strong>字体优化</strong>：使用 font-display: swap，预加载关键字体</li></ul><h2>渲染优化</h2><ul><li>避免强制同步布局和布局抖动</li><li>使用 CSS contain 属性限制重排范围</li><li>虚拟列表处理长列表渲染</li></ul><h2>缓存策略</h2><p>合理配置 HTTP 缓存头（Cache-Control、ETag），利用 Service Worker 实现离线缓存。静态资源使用内容哈希命名，实现永久缓存。</p><blockquote>性能优化没有银弹。先用 Lighthouse 或 WebPageTest 测量，找到瓶颈再对症下药。</blockquote>" },
    { id: 6, title: "Docker 容器化入门与实践", category: "后端", date: "2026-06-20", excerpt: "从 Docker 基础概念到多容器编排，快速掌握应用容器化的核心技能。", content: "<p>Docker 让应用及其依赖打包在轻量级容器中运行，解决了\"在我机器上能跑\"的经典问题。</p><h2>核心概念</h2><ul><li><strong>镜像（Image）</strong>：应用的静态模板，包含运行环境和代码</li><li><strong>容器（Container）</strong>：镜像的运行实例，彼此隔离</li><li><strong>Dockerfile</strong>：定义镜像构建步骤的脚本</li><li><strong>Docker Compose</strong>：管理多容器应用的工具</li></ul><h2>常用命令</h2><pre><code>docker build -t my-app .       # 构建镜像\ndocker run -d -p 3000:3000 my-app  # 运行容器\ndocker-compose up -d           # 启动多容器应用\ndocker ps                      # 查看运行中的容器</code></pre><blockquote>容器化不是银弹，但对于微服务架构和 CI/CD 流程来说，Docker 几乎已是标配。</blockquote>" }
];

const DEFAULT_MOMENTS = [
    { date: '2026-08-09', content: '周末重构了博客主题，纯黑深色风格真舒服。' },
    { date: '2026-08-05', content: '今天学到了一个新技巧：用 CSS @container 做真正的响应式组件。' },
    { date: '2026-08-01', content: '八月的第一天，开始系统学习 Rust，从 The Book 啃起。' },
    { date: '2026-07-25', content: '读完了《设计模式》，对观察者模式和策略模式有了全新的理解。' },
    { date: '2026-07-18', content: '把博客从 4 个页面扩展到了 9 个栏目，虽然工作量不小但架构清爽了很多。' },
    { date: '2026-07-10', content: '在项目中引入了 Vitest，测试体验比 Jest 舒服太多了，强烈推荐。' },
    { date: '2026-07-01', content: '下半年开始了，列了 5 个技术目标：Rust、WebGPU、分布式系统、LLM 原理、开源贡献。' },
];

const DEFAULT_GALLERY = [
    { title: '东京街头', color: '#2d1b4e', url: '' },
    { title: '日落海岸', color: '#1a3a4a', url: '' },
    { title: '城市夜景', color: '#232038', url: '' },
    { title: '秋叶小径', color: '#3d1f0f', url: '' },
    { title: '雪山远眺', color: '#1e2e3d', url: '' },
    { title: '咖啡馆一角', color: '#2a1f1a', url: '' },
];

const DEFAULT_COLLECTIONS = [
    { name: 'JavaScript 系列', articleIds: [1, 3, 5] },
    { name: 'Python 系列', articleIds: [2] },
    { name: '工具系列', articleIds: [4, 6] },
];

const DATA_VERSION = 2;

const DEFAULT_TRADE_RECORDS = [
    { id: 1,  date: '2026-08-07', type: '逆回购卖出', code: '131810', name: 'R-001',  amount: 20002.23, fee: 0.00 },
    { id: 2,  date: '2026-08-06', type: '逆回购买入', code: '131810', name: 'R-001',  amount: 20000.00, fee: 0.20 },
    { id: 3,  date: '2026-08-05', type: '逆回购卖出', code: '204001', name: 'GC001', amount: 5000.21,  fee: 0.00 },
    { id: 4,  date: '2026-08-05', type: '逆回购卖出', code: '204001', name: 'GC001', amount: 5000.21,  fee: 0.00 },
    { id: 5,  date: '2026-08-05', type: '逆回购卖出', code: '204001', name: 'GC001', amount: 10000.42, fee: 0.00 },
    { id: 6,  date: '2026-08-04', type: '逆回购卖出', code: '204001', name: 'GC001', amount: 1000.04,  fee: 0.00 },
    { id: 7,  date: '2026-08-04', type: '逆回购卖出', code: '204001', name: 'GC001', amount: 19000.77, fee: 0.00 },
    { id: 8,  date: '2026-08-04', type: '逆回购买入', code: '204001', name: 'GC001', amount: 10000.00, fee: 0.10 },
    { id: 9,  date: '2026-08-04', type: '逆回购买入', code: '204001', name: 'GC001', amount: 5000.00,  fee: 0.05 },
    { id: 10, date: '2026-08-04', type: '逆回购买入', code: '204001', name: 'GC001', amount: 5000.00,  fee: 0.05 },
    { id: 11, date: '2026-08-03', type: '逆回购买入', code: '204001', name: 'GC001', amount: 19000.00, fee: 0.19 },
    { id: 12, date: '2026-08-03', type: '逆回购买入', code: '204001', name: 'GC001', amount: 1000.00,  fee: 0.01 },
];

// ===== 数据持久化 =====
function loadFromStorage(key, defaults) {
    var stored = localStorage.getItem(key);
    if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
    }
    return JSON.parse(JSON.stringify(defaults));
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ===== GitHub Token 管理 =====
function getToken() {
    return localStorage.getItem('gh_token') || '';
}

function setToken(token) {
    localStorage.setItem('gh_token', token);
}

function clearToken() {
    localStorage.removeItem('gh_token');
}

function showSyncError(msg) {
    var bar = document.getElementById('admin-token-bar');
    if (bar) {
        var existing = bar.querySelector('.sync-error-msg');
        if (existing) existing.remove();
        var el = document.createElement('span');
        el.className = 'sync-error-msg';
        el.style.cssText = 'color:#ff6b6b;font-size:12px;margin-left:12px;';
        el.textContent = msg;
        bar.appendChild(el);
    }
}

function showSyncSuccess(msg) {
    var bar = document.getElementById('admin-token-bar');
    if (bar) {
        var existing = bar.querySelector('.sync-success-msg');
        if (existing) existing.remove();
        var el = document.createElement('span');
        el.className = 'sync-success-msg';
        el.style.cssText = 'color:#4ade80;font-size:12px;margin-left:12px;';
        el.textContent = msg;
        bar.appendChild(el);
        setTimeout(function() { if (el.parentNode) el.remove(); }, 3000);
    }
}

function hasToken() {
    return !!localStorage.getItem('gh_token');
}

// ===== GitHub API 请求 =====
function ghApiRequest(endpoint, options) {
    var token = getToken();
    var headers = { 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    var fetchOpts = { headers: headers };
    if (options && options.method) {
        fetchOpts.method = options.method;
    }
    if (options && options.body) {
        fetchOpts.body = JSON.stringify(options.body);
    }
    return fetch(GH_API_BASE + endpoint, fetchOpts).then(function(res) {
        if (!res.ok) throw new Error('GitHub API ' + res.status + ': ' + endpoint);
        if (res.status === 204) return null;
        return res.json();
    });
}

// ===== 从 GitHub 拉取数据 =====
function ghFetchByLabel(label) {
    return fetch(GH_API_BASE + '/issues?labels=' + label + '&state=open&per_page=100', {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
    }).then(function(res) {
        if (res.status === 403) return { _blocked: true };
        if (!res.ok) throw new Error('GitHub API ' + res.status);
        return res.json();
    }).catch(function(err) {
        console.error('GitHub Issues 读取失败，降级使用本地数据:', err);
        return null;
    });
}

// ===== 一次性拉取所有 Issues（不带 label 过滤，减少 API 请求次数）=====
function ghFetchAllIssues() {
    return fetch(GH_API_BASE + '/issues?state=open&per_page=100', {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
    }).then(function(res) {
        if (res.status === 403) return { _blocked: true };
        if (!res.ok) throw new Error('GitHub API ' + res.status);
        return res.json();
    }).catch(function(err) {
        console.error('GitHub Issues 读取失败，降级使用本地数据:', err);
        return null;
    });
}

// ===== 读取：从 GitHub 拉取全部 Issues → 前端按 label 分类 → 合并到运行时数组 =====
function ghLoadAllData() {
    var validLabels = ['article', 'moment', 'album', 'collection', 'trade'];
    return ghFetchAllIssues().then(function(allIssues) {
        if (!allIssues || allIssues._blocked) {
            if (allIssues && allIssues._blocked) {
                showSyncBlocked(true);
            }
            return;
        }
        showSyncBlocked(false);

        // 按 label 分类到五个桶
        var buckets = {};
        for (var li = 0; li < validLabels.length; li++) {
            buckets[validLabels[li]] = [];
        }
        for (var i = 0; i < allIssues.length; i++) {
            var issue = allIssues[i];
            var issueLabels = issue.labels || [];
            for (var j = 0; j < issueLabels.length; j++) {
                var name = issueLabels[j].name;
                if (buckets.hasOwnProperty(name)) {
                    try {
                        var d = JSON.parse(issue.body || '');
                        d._ghIssueNumber = issue.number;
                        buckets[name].push(d);
                    } catch(e) { /* skip malformed */ }
                    break;
                }
            }
        }

        var changed = false;
        for (var li = 0; li < validLabels.length; li++) {
            var label = validLabels[li];
            var key = GH_KEY_BY_LABEL[label];
            if (!key) continue;
            var rData = buckets[label];
            if (rData.length > 0) {
                // 以 localStorage 为主，Issues 数据仅用于补充和回填 _ghIssueNumber
                var localRaw = localStorage.getItem(key);
                var localItems = localRaw ? (function(){ try { return JSON.parse(localRaw); } catch(e){ return []; } })() : [];
                var idKey = (key === 'blog_articles' || key === 'blog_trade_records') ? 'id'
                           : (key === 'blog_moments') ? null
                           : (key === 'blog_gallery') ? 'title'
                           : (key === 'blog_collections') ? 'name' : 'id';
                // 以 localStorage 为本体
                var merged = localItems.slice();
                for (var j = 0; j < rData.length; j++) {
                    var issueItem = rData[j];
                    var existingIdx = -1;
                    if (idKey === null) {
                        // moments: 用 date + content 匹配
                        for (var k = 0; k < merged.length; k++) {
                            if (merged[k].date === issueItem.date && merged[k].content === issueItem.content) {
                                existingIdx = k; break;
                            }
                        }
                    } else {
                        for (var k = 0; k < merged.length; k++) {
                            if (merged[k][idKey] === issueItem[idKey]) {
                                existingIdx = k; break;
                            }
                        }
                    }
                    if (existingIdx >= 0) {
                        // 已在本地存在：回填 _ghIssueNumber
                        if (!merged[existingIdx]._ghIssueNumber && issueItem._ghIssueNumber) {
                            merged[existingIdx]._ghIssueNumber = issueItem._ghIssueNumber;
                        }
                    } else {
                        // 本地不存在：来自其他设备的条目，合并进来
                        merged.push(issueItem);
                    }
                }
                if (key === 'blog_articles') {
                    articles = merged;
                    localStorage.setItem(key, JSON.stringify(merged));
                    changed = true;
                } else if (key === 'blog_moments') {
                    moments = merged;
                    localStorage.setItem(key, JSON.stringify(merged));
                    changed = true;
                } else if (key === 'blog_gallery') {
                    galleryItems = merged;
                    localStorage.setItem(key, JSON.stringify(galleryItems));
                    changed = true;
                } else if (key === 'blog_collections') {
                    collections = merged;
                    localStorage.setItem(key, JSON.stringify(collections));
                    changed = true;
                } else if (key === 'blog_trade_records') {
                    tradeRecords = merged;
                    localStorage.setItem(key, JSON.stringify(tradeRecords));
                    changed = true;
                }
            } else {
                // Issues 拉取为空/失败，降级使用 localStorage
                var localFallback = localStorage.getItem(key);
                if (localFallback) {
                    try {
                        var fb = JSON.parse(localFallback);
                        if (key === 'blog_articles') {
                            articles = fb;
                            changed = true;
                        } else if (key === 'blog_moments') {
                            moments = fb;
                            changed = true;
                        } else if (key === 'blog_gallery') {
                            galleryItems = fb;
                            changed = true;
                        } else if (key === 'blog_collections') {
                            collections = fb;
                            changed = true;
                        } else if (key === 'blog_trade_records') {
                            tradeRecords = fb;
                            changed = true;
                        }
                    } catch(e) { /* skip corrupt */ }
                }
            }
        }
        if (changed) {
            renderCurrentView();
        }
    });
}

// ===== 同步状态提示 =====
function showSyncBlocked(blocked) {
    var el = document.getElementById('sync-status');
    if (el) {
        el.style.display = blocked ? 'flex' : 'none';
    }
}

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

// ===== 写入：同步到 GitHub =====
function ghSyncCreate(label, bodyObj, title) {
    if (!hasToken()) return Promise.resolve(null);
    return ghApiRequest('/issues', {
        method: 'POST',
        body: { title: title, body: JSON.stringify(bodyObj), labels: [label] }
    }).then(function(issue) {
        if (issue) showSyncSuccess('✓ 同步成功');
        return issue ? issue.number : null;
    }).catch(function(err) {
        console.error('GitHub API 错误:', err);
        showSyncError('✗ 同步失败，请检查Token是否有效');
        return null;
    });
}

function ghSyncUpdate(issueNumber, bodyObj) {
    if (!hasToken()) return Promise.resolve(null);
    return ghApiRequest('/issues/' + issueNumber, {
        method: 'PATCH',
        body: { body: JSON.stringify(bodyObj) }
    }).then(function() {
        showSyncSuccess('✓ 同步成功');
    }).catch(function(err) {
        console.error('GitHub API 错误:', err);
        showSyncError('✗ 同步失败，请检查Token是否有效');
        return null;
    });
}

function ghSyncClose(issueNumber) {
    if (!hasToken()) return Promise.resolve(null);
    return ghApiRequest('/issues/' + issueNumber, {
        method: 'PATCH',
        body: { state: 'closed' }
    }).then(function() {
        showSyncSuccess('✓ 同步成功');
    }).catch(function(err) {
        console.error('GitHub API 错误:', err);
        showSyncError('✗ 同步失败，请检查Token是否有效');
        throw err;
    });
}

// ===== Seed 数据：如果 Issues 为空，用默认数据创建初始 Issues =====
function ghSeedDataIfEmpty() {
    if (!hasToken()) return;
    var labels = ['article', 'moment', 'album', 'collection', 'trade'];
    var task = Promise.resolve();
    labels.forEach(function(label) {
        task = task.then(function() {
            return ghFetchByLabel(label).then(function(issues) {
                if (issues && issues.length > 0) return;
                // 本地也没有数据（不是从 GitHub 来的）→ 用默认数据创建 seed
                var key = GH_KEY_BY_LABEL[label];
                var defs;
                if (key === 'blog_articles') defs = DEFAULT_ARTICLES;
                else if (key === 'blog_moments') defs = DEFAULT_MOMENTS;
                else if (key === 'blog_gallery') defs = DEFAULT_GALLERY;
                else if (key === 'blog_collections') defs = DEFAULT_COLLECTIONS;
                else if (key === 'blog_trade_records') defs = DEFAULT_TRADE_RECORDS;
                else return;
                if (!defs || !defs.length) return;
                var chain = Promise.resolve();
                defs.forEach(function(item) {
                    chain = chain.then(function() {
                        var body = JSON.parse(JSON.stringify(item));
                        delete body._ghIssueNumber;
                        var title = (label === 'trade')
                            ? ('trade_' + (item.id || ''))
                            : (item.title || item.name || item.date || item.content || '');
                        return ghSyncCreate(label, body, title).then(function(issueNum) {
                            if (issueNum) item._ghIssueNumber = issueNum;
                        });
                    });
                });
                return chain;
            });
        });
    });
    return task;
}

// ===== 从 GitHub 删除（关闭 Issue）=====
function ghSyncDeleteByLabel(key, itemId, matchFn) {
    if (!hasToken()) return;
    var item = matchFn(itemId);
    if (!item || !item._ghIssueNumber) return;
    ghSyncClose(item._ghIssueNumber);
}

// ===== 页面加载后尝试从 GitHub 同步 =====
(function initGitHubLoad() {
    ghLoadAllData();
})();

// ===== 运行时数据 =====
let articles = loadFromStorage('blog_articles', DEFAULT_ARTICLES);
let moments = loadFromStorage('blog_moments', DEFAULT_MOMENTS);
let galleryItems = loadFromStorage('blog_gallery', DEFAULT_GALLERY);
let collections = loadFromStorage('blog_collections', DEFAULT_COLLECTIONS);
let guestbookMessages = loadFromStorage('blog_guestbook', []);
let tradeRecords = (function() {
    var storedVersion = localStorage.getItem('data_version');
    if (!storedVersion || storedVersion !== String(DATA_VERSION)) {
        localStorage.setItem('blog_trade_records', JSON.stringify(DEFAULT_TRADE_RECORDS));
        localStorage.setItem('data_version', String(DATA_VERSION));
        return JSON.parse(JSON.stringify(DEFAULT_TRADE_RECORDS));
    }
    var raw = loadFromStorage('blog_trade_records', DEFAULT_TRADE_RECORDS);
    // 旧结构迁移（含 net 字段）
    if (raw.length > 0 && raw[0].hasOwnProperty('net')) {
        localStorage.setItem('blog_trade_records', JSON.stringify(DEFAULT_TRADE_RECORDS));
        localStorage.setItem('data_version', String(DATA_VERSION));
        return JSON.parse(JSON.stringify(DEFAULT_TRADE_RECORDS));
    }
    return raw;
})();

// ===== 认证管理 =====
function loadCredentials() {
    var stored = localStorage.getItem('blog_admin_credentials');
    if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
    }
    var defaults = { username: 'admin', password: 'admin123' };
    localStorage.setItem('blog_admin_credentials', JSON.stringify(defaults));
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
    guestbook: document.getElementById('view-guestbook'),
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
        case 'gallery': renderGallery(); break;
        case 'collections': renderCollections(); break;
        case 'guestbook': renderGuestbook(); break;
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
function renderGallery() {
    var container = document.getElementById('gallery-grid');
    container.innerHTML = galleryItems.map(function(item) {
        if (item.url) {
            return '<div class="gallery-item"><img src="' + item.url + '" alt="' + item.title + '" loading="lazy"><div class="gallery-item-title">' + item.title + '</div></div>';
        } else {
            return '<div class="gallery-item" style="background:' + item.color + ';min-height:200px;"><div class="gallery-item-title">' + item.title + '</div></div>';
        }
    }).join('');
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

// ===== 渲染：留言板 =====
function renderGuestbook() {
    var container = document.getElementById('guestbook-messages');
    container.innerHTML = guestbookMessages.map(function(msg) {
        return '<div class="gb-message">' +
            '<div class="gb-meta"><span class="gb-author">' + msg.author + '</span><span class="gb-time">' + msg.time + '</span></div>' +
            '<p class="gb-body">' + msg.content + '</p>' +
            '</div>';
    }).join('');

    var nameInput = document.querySelector('.gb-input-name');
    var textarea = document.querySelector('.gb-textarea');
    var submitBtn = document.getElementById('gb-submit-btn');

    function checkForm() {
        submitBtn.disabled = !(nameInput.value.trim() && textarea.value.trim());
    }

    nameInput.removeEventListener('input', checkForm);
    textarea.removeEventListener('input', checkForm);
    nameInput.addEventListener('input', checkForm);
    textarea.addEventListener('input', checkForm);

    submitBtn.replaceWith(submitBtn.cloneNode(true));
    submitBtn = document.getElementById('gb-submit-btn');
    submitBtn.addEventListener('click', function() {
        var author = nameInput.value.trim();
        var content = textarea.value.trim();
        if (!author || !content) return;
        var now = new Date();
        var time = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
        guestbookMessages.unshift({ author: author, time: time, content: content });
        saveToStorage('blog_guestbook', guestbookMessages);
        nameInput.value = '';
        textarea.value = '';
        submitBtn.disabled = true;
        renderGuestbook();
    });
}

// ==========================================
//  管理后台
// ==========================================

let editingArticleId = null;
let editingGalleryIndex = null;
let editingCollectionIndex = null;
let editingTradeId = null;

// ===== Token 状态栏 =====
function renderAdminToken() {
    var bar = document.getElementById('admin-token-bar');
    if (!bar) return;
    if (hasToken()) {
        bar.innerHTML = '<span style="color:#22c55e;font-size:13px;">Token 已设置 (****' + getToken().slice(-4) + ')</span>' +
            '<button class="admin-btn-sm" id="admin-token-clear" style="margin-left:8px;background:#3d1f0f;color:#ff6b6b;">清除</button>' +
            '<button class="admin-btn-sm" id="admin-token-seed" style="margin-left:8px;background:#1a2a1a;color:#4ade80;">推送默认数据</button>';
        document.getElementById('admin-token-clear').addEventListener('click', function() {
            clearToken();
            renderAdminToken();
            renderAdmin();
        });
        document.getElementById('admin-token-seed').addEventListener('click', function() {
            if (confirm('将默认数据（文章/瞬间/相册/文集/交易记录）推送到 GitHub Issues？')) {
                ghSeedDataIfEmpty().then(function() {
                    renderAdminToken();
                    renderAdmin();
                });
            }
        });
    } else {
        bar.innerHTML = '<input type="password" id="admin-token-input" class="admin-input" placeholder="GitHub Personal Access Token（repo 权限）" style="flex:1;max-width:400px;">' +
            '<button class="btn btn-primary" id="admin-token-save" style="margin-left:8px;">保存 Token</button>' +
            '<a href="https://github.com/settings/tokens" target="_blank" style="font-size:12px;color:var(--text-secondary);margin-left:8px;">获取 Token</a>';
        document.getElementById('admin-token-save').addEventListener('click', function() {
            var val = document.getElementById('admin-token-input').value.trim();
            if (val) {
                setToken(val);
                renderAdminToken();
                // token 已设置，后台静默同步
                ghLoadAllData();
            }
        });
    }
}


function renderAdmin() {
    renderAdminToken();
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
            document.getElementById('admin-article-content').value = a.content;
            document.getElementById('admin-article-submit').textContent = '更新文章';
            document.getElementById('admin-article-cancel').style.display = 'inline-flex';
        });
    });

    document.querySelectorAll('[data-del-article]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = parseInt(btn.dataset.delArticle);
            var delArt = articles.find(function(a) { return a.id === id; });
            if (!delArt) return;

            if (!hasToken() || !delArt._ghIssueNumber) {
                if (!hasToken() && !confirm('未设置 GitHub Token，删除仅在本浏览器生效，刷新后可能恢复。确定删除吗？')) return;
                if (!delArt._ghIssueNumber && !confirm('该文章缺少 GitHub Issue 关联，删除仅在本浏览器生效，刷新后可能恢复。确定删除吗？')) return;
                articles = articles.filter(function(a) { return a.id !== id; });
                saveToStorage('blog_articles', articles);
                renderAdminArticles();
                renderAllPosts();
                return;
            }

            ghSyncClose(delArt._ghIssueNumber).then(function() {
                articles = articles.filter(function(a) { return a.id !== id; });
                saveToStorage('blog_articles', articles);
                renderAdminArticles();
                renderAllPosts();
            }).catch(function() {});
        });
    });
}

document.getElementById('admin-article-submit').addEventListener('click', function() {
    var title = document.getElementById('admin-article-title').value.trim();
    var category = document.getElementById('admin-article-category').value;
    var date = document.getElementById('admin-article-date').value;
    var excerpt = document.getElementById('admin-article-excerpt').value.trim();
    var content = document.getElementById('admin-article-content').value.trim();
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

    saveToStorage('blog_articles', articles);
    var art = articles[articles.length - 1];
    if (!editingArticleId && hasToken()) { ghSyncCreate('article', {id:art.id,title:art.title,category:art.category,date:art.date,excerpt:art.excerpt,content:art.content}, art.title).then(function(n) { if (n) art._ghIssueNumber = n; localStorage.setItem('blog_articles', JSON.stringify(articles)); }); }
    if (editingArticleId && hasToken()) { var ea = articles.find(function(x) { return x.id === editingArticleId; }); if (ea && ea._ghIssueNumber) { var b = {id:ea.id,title:ea.title,category:ea.category,date:ea.date,excerpt:ea.excerpt,content:ea.content}; ghSyncUpdate(ea._ghIssueNumber, b); } }
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
    document.getElementById('admin-article-content').value = '';
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
            if (hasToken() && dm && dm._ghIssueNumber) { ghSyncClose(dm._ghIssueNumber); }
            renderAdminMoments();
            renderMoments();
        });
    });
}

document.getElementById('admin-moment-submit').addEventListener('click', function() {
    var date = document.getElementById('admin-moment-date').value;
    var content = document.getElementById('admin-moment-content').value.trim();
    if (!date || !content) return;

    // 清除上一次残留的同步状态提示
    var prevErr = document.querySelector('#admin-token-bar .sync-error-msg');
    if (prevErr) prevErr.remove();
    var prevOk = document.querySelector('#admin-token-bar .sync-success-msg');
    if (prevOk) prevOk.remove();

    // 显示"同步中..."状态
    var bar = document.getElementById('admin-token-bar');
    var syncingEl = document.createElement('span');
    syncingEl.className = 'sync-status-msg';
    syncingEl.style.cssText = 'color:#eab308;font-size:12px;margin-left:12px;';
    syncingEl.textContent = '同步中...';
    if (bar) bar.appendChild(syncingEl);

    var newMoment = { date: date, content: content };
    moments.unshift(newMoment);
    saveToStorage('blog_moments', moments);

    if (hasToken()) {
        ghSyncCreate('moment', {date:newMoment.date,content:newMoment.content}, newMoment.date)
            .then(function(n) {
                if (n) {
                    newMoment._ghIssueNumber = n;
                    localStorage.setItem('blog_moments', JSON.stringify(moments));
                } else {
                    // 同步失败：回滚本地数据
                    var idx = moments.indexOf(newMoment);
                    if (idx !== -1) moments.splice(idx, 1);
                    saveToStorage('blog_moments', moments);
                    renderAdminMoments();
                    renderMoments();
                }
            })
            .catch(function(err) {
                // 异常回滚
                var idx = moments.indexOf(newMoment);
                if (idx !== -1) moments.splice(idx, 1);
                saveToStorage('blog_moments', moments);
                renderAdminMoments();
                renderMoments();
            })
            .then(function() {
                // 清除"同步中..."状态
                if (syncingEl.parentNode) syncingEl.remove();
            });
    } else {
        if (syncingEl.parentNode) syncingEl.remove();
    }

    document.getElementById('admin-moment-date').value = '';
    document.getElementById('admin-moment-content').value = '';
    renderAdminMoments();
    renderMoments();
});

// ---- 管理：相册 ----
function renderAdminGallery() {
    var list = document.getElementById('admin-gallery-list');
    list.innerHTML = galleryItems.map(function(item, i) {
        return '<div class="admin-item">' +
            '<div class="admin-item-info">' +
            '<div class="admin-item-title">' + item.title + '</div>' +
            '<div class="admin-item-meta">' + (item.url || '无图片URL') + ' / <span style="display:inline-block;width:12px;height:12px;background:' + item.color + ';border-radius:2px;vertical-align:middle;"></span> ' + item.color + '</div>' +
            '</div>' +
            '<div class="admin-item-actions">' +
            '<button class="admin-btn-sm admin-btn-edit" data-edit-gallery="' + i + '">编辑</button>' +
            '<button class="admin-btn-sm admin-btn-del" data-del-gallery="' + i + '">删除</button>' +
            '</div>' +
            '</div>';
    }).join('');

    document.querySelectorAll('[data-edit-gallery]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var i = parseInt(btn.dataset.editGallery);
            var item = galleryItems[i];
            editingGalleryIndex = i;
            document.getElementById('admin-gallery-form-title').textContent = '编辑相册项';
            document.getElementById('admin-edit-gallery-index').value = i;
            document.getElementById('admin-gallery-title').value = item.title;
            document.getElementById('admin-gallery-url').value = item.url || '';
            document.getElementById('admin-gallery-color').value = item.color;
            document.getElementById('admin-gallery-submit').textContent = '更新';
            document.getElementById('admin-gallery-cancel').style.display = 'inline-flex';
        });
    });

    document.querySelectorAll('[data-del-gallery]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var i = parseInt(btn.dataset.delGallery);
            var dg = galleryItems[i];
            galleryItems.splice(i, 1);
            saveToStorage('blog_gallery', galleryItems);
            if (hasToken() && dg && dg._ghIssueNumber) { ghSyncClose(dg._ghIssueNumber); }
            renderAdminGallery();
            renderGallery();
        });
    });
}

document.getElementById('admin-gallery-submit').addEventListener('click', function() {
    var title = document.getElementById('admin-gallery-title').value.trim();
    var url = document.getElementById('admin-gallery-url').value.trim();
    var color = document.getElementById('admin-gallery-color').value;
    if (!title) return;

    if (editingGalleryIndex !== null) {
        galleryItems[editingGalleryIndex] = { title: title, url: url, color: color };
    } else {
        galleryItems.push({ title: title, url: url, color: color });
    }

    saveToStorage('blog_gallery', galleryItems);
    if (!editingGalleryIndex && hasToken()) { var ng = galleryItems[galleryItems.length - 1]; ghSyncCreate('album', {title:ng.title,url:ng.url,color:ng.color}, ng.title).then(function(n) { if (n) ng._ghIssueNumber = n; localStorage.setItem('blog_gallery', JSON.stringify(galleryItems)); }); }
    if (editingGalleryIndex !== null && editingGalleryIndex >= 0 && hasToken()) { var eg = galleryItems[editingGalleryIndex]; if (eg && eg._ghIssueNumber) ghSyncUpdate(eg._ghIssueNumber, {title:eg.title,url:eg.url,color:eg.color}); }
    cancelEditGallery();
    renderAdminGallery();
    renderGallery();
});

document.getElementById('admin-gallery-cancel').addEventListener('click', cancelEditGallery);

function cancelEditGallery() {
    editingGalleryIndex = null;
    document.getElementById('admin-gallery-form-title').textContent = '新增相册项';
    document.getElementById('admin-edit-gallery-index').value = '';
    document.getElementById('admin-gallery-title').value = '';
    document.getElementById('admin-gallery-url').value = '';
    document.getElementById('admin-gallery-color').value = '#2d1b4e';
    document.getElementById('admin-gallery-submit').textContent = '添加';
    document.getElementById('admin-gallery-cancel').style.display = 'none';
}

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
            if (hasToken() && dc && dc._ghIssueNumber) { ghSyncClose(dc._ghIssueNumber); }
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
    if (!editingCollectionIndex && hasToken()) { var nc = collections[collections.length - 1]; ghSyncCreate('collection', {name:nc.name,articleIds:nc.articleIds}, nc.name).then(function(n) { if (n) nc._ghIssueNumber = n; localStorage.setItem('blog_collections', JSON.stringify(collections)); }); }
    if (editingCollectionIndex !== null && editingCollectionIndex >= 0 && hasToken()) { var ec = collections[editingCollectionIndex]; if (ec && ec._ghIssueNumber) ghSyncUpdate(ec._ghIssueNumber, {name:ec.name,articleIds:ec.articleIds}); }
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
                if (hasToken() && dt && dt._ghIssueNumber) { ghSyncClose(dt._ghIssueNumber); }
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
    var tr = editingTradeId ? tradeRecords.find(function(r) { return r.id === editingTradeId; }) : tradeRecords[tradeRecords.length - 1];
    if (tr && hasToken()) {
        var trBody = {id:tr.id,date:tr.date,type:tr.type,code:tr.code,name:tr.name,amount:tr.amount,fee:tr.fee};
        if (tr._ghIssueNumber) { ghSyncUpdate(tr._ghIssueNumber, trBody); }
        else { ghSyncCreate('trade', trBody, 'trade_' + tr.id).then(function(n) { if (n) { tr._ghIssueNumber = n; localStorage.setItem('blog_trade_records', JSON.stringify(tradeRecords)); } }); }
    }
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

// ===== 登录事件绑定（DOMContentLoaded 确保元素就绪）=====
document.addEventListener('DOMContentLoaded', function() {
    var loginSubmit = document.getElementById('login-submit');
    var loginPass = document.getElementById('login-password');
    var loginUser = document.getElementById('login-username');
    var adminPwdBtn = document.getElementById('admin-change-pwd');
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
    if (pwdSubmit) pwdSubmit.addEventListener('click', doChangePwd);
    if (pwdCancel) pwdCancel.addEventListener('click', hidePwdModal);
    if (pwdModal) pwdModal.addEventListener('click', function(e) {
        if (e.target === this) hidePwdModal();
    });
    if (pwdConfirm) pwdConfirm.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') doChangePwd();
    });
});
