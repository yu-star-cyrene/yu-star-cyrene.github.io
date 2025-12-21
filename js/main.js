
document.addEventListener("DOMContentLoaded", function () {
    const contentId = "article-content";
    const contentClass = ".article-content"; 

    // 1. 代码块折叠 (保持不变)
    function initCodeFolding(root) {
        if (!root) return;
        const blocks = root.querySelectorAll('figure.highlight, pre');
        
        blocks.forEach(block => {
            if (block.closest('details.code-fold')) return;

            const details = document.createElement('details');
            details.className = 'code-fold';
            
            let lang = "CODE";
            if (block.tagName === 'FIGURE' && block.className.includes('highlight')) {
                const classes = block.className.split(' ');
                const langClass = classes.find(c => c !== 'highlight' && c !== 'hljs');
                if (langClass) lang = langClass.toUpperCase();
            } else if (block.tagName === 'PRE') {
                const code = block.querySelector('code');
                if (code && code.className) lang = code.className.replace('language-', '').toUpperCase();
            }

            const summary = document.createElement('summary');
            summary.innerText = lang;
            
            block.parentNode.insertBefore(details, block);
            details.appendChild(summary);
            details.appendChild(block);

            details.open = true;
            if (block.offsetHeight > 300) {
                details.open = false;
                summary.innerText += " (点击展开)";
            }
        });
    }

    // 2. 标题折叠 (严格模式：只认 # 号)
    function initHeaderFolding(root) {
        if (!root) return;
        if (root.dataset.headerProcessed === "true") return;
        root.dataset.headerProcessed = "true";

        const children = Array.from(root.children);
        if (children.length === 0) return;

        const newContainer = document.createDocumentFragment();
        let currentDetails = null;
        let currentContentDiv = null;

        // === 判别规则 (已修改) ===
        const isHeader = (el) => {
            const text = el.innerText.trim();
            
            // 【核心修改】
            // 只有当文字内容以 # 或 ＃ 开头时，才认为是折叠标题！
            // 即使它是 H1/H2 标签，如果没有 #，也不折叠。
            if (text.startsWith('#') || text.startsWith('＃')) {
                 // 稍微限制一下长度，防止把整段以#开头的代码注释也折叠了
                 if (text.length < 100) {
                     return { match: true, text: text.replace(/^[#＃\s]+/, '') };
                 }
            }
            
            return { match: false };
        };

        children.forEach(el => {
            const check = isHeader(el);

            if (check.match) {
                // 命中带 # 的标题 -> 开启新折叠
                if (currentDetails) {
                    currentDetails.appendChild(currentContentDiv);
                    newContainer.appendChild(currentDetails);
                }

                currentDetails = document.createElement('details');
                currentDetails.className = 'auto-collapse';
                
                const summary = document.createElement('summary');
                summary.innerText = check.text;
                currentDetails.appendChild(summary);

                currentContentDiv = document.createElement('div');
                currentContentDiv.className = 'collapse-content';
            } else {
                // 普通内容 (包括不带 # 的普通标题) -> 放入当前折叠块(如果有)或直接显示
                if (currentContentDiv) {
                    currentContentDiv.appendChild(el);
                } else {
                    newContainer.appendChild(el);
                }
            }
        });

        if (currentDetails) {
            currentDetails.appendChild(currentContentDiv);
            newContainer.appendChild(currentDetails);
        }

        if (newContainer.children.length > 0) {
            root.innerHTML = '';
            root.appendChild(newContainer);
        }
    }

    // 3. 初始化与监听
    function getArticleRoot() {
        return document.getElementById(contentId) || document.querySelector(contentClass);
    }

    function initAll() {
        const root = getArticleRoot();
        if (root) {
            initHeaderFolding(root);
            initCodeFolding(root);
        }
    }

    initAll();

    // 侧边栏点击监听 (无刷新加载)
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (!link) return;
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.includes('javascript')) return;
            if (href.includes('/archives') || href.includes('/categories') || href.includes('http')) return;

            e.preventDefault();
            const container = document.querySelector('.content-wrapper');
            if(container) container.style.opacity = "0.5";

            fetch(href)
                .then(res => res.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, "text/html");
                    let newArticle = doc.querySelector("article") || doc.querySelector(".article-content");
                    const targetArea = document.querySelector(".content-wrapper");

                    if (newArticle && targetArea) {
                        targetArea.innerHTML = "";
                        targetArea.appendChild(newArticle);
                        setTimeout(() => {
                            const newRoot = targetArea.querySelector(".article-content") || targetArea.querySelector("#article-content") || targetArea;
                            initHeaderFolding(newRoot);
                            initCodeFolding(newRoot);
                        }, 10);
                    } else {
                        window.location.href = href;
                    }
                    if(container) container.style.opacity = "1";
                })
                .catch(() => window.location.href = href);
        });
    }
});
