
document.addEventListener("DOMContentLoaded", function () {
    console.log("[Twings] V6 严格嵌套脚本已加载");

    const contentId = "article-content";
    const contentClass = ".article-content"; 

    // --- 代码块折叠 (保持不变) ---
    function initCodeFolding(root) {
        if (!root) return;
        root.querySelectorAll('figure.highlight, pre').forEach(block => {
            if (block.closest('details.code-fold')) return;
            const details = document.createElement('details');
            details.className = 'code-fold';
            let lang = "CODE";
            if (block.className.includes('highlight')) {
                lang = block.className.split(' ').find(c => c!='highlight' && c!='hljs') || "CODE";
            }
            const summary = document.createElement('summary');
            summary.innerText = lang.toUpperCase();
            block.parentNode.insertBefore(details, block);
            details.appendChild(summary);
            details.appendChild(block);
            details.open = true; // 代码块默认展开
            if (block.offsetHeight > 300) {
                details.open = false;
                summary.innerText += " (点击展开)";
            }
        });
    }

    // --- 核心：标题严格嵌套 ---
    function initHeaderFolding(root) {
        if (!root) return;
        if (root.dataset.v6Processed === "true") return;
        root.dataset.v6Processed = "true";

        // 将所有直接子元素转为数组
        const children = Array.from(root.children);
        if (children.length === 0) return;

        const newContainer = document.createDocumentFragment();
        
        // 【栈】用于追踪当前的“父级”链条
        // 例子: [H1容器, H2容器]
        const stack = []; 

        const getHeaderLevel = (el) => {
            const tagName = el.tagName.toUpperCase();
            const match = tagName.match(/^H([1-6])$/);
            if (!match) return 0; // 不是标题
            
            // 检查内容是否包含 # (兼容有空格和没空格的情况)
            const text = el.innerText.trim();
            if (text.startsWith('#') || text.startsWith('＃')) {
                 return parseInt(match[1]); // 返回 1, 2, 3...
            }
            return 0; // 是标题但没加 #，当普通文字处理
        };

        children.forEach(el => {
            const level = getHeaderLevel(el);

            if (level > 0) {
                // === 遇到了一个带 # 的标题 ===
                
                // 1. 找到它的正确位置 (Pop)
                // 比如现在栈里是 [H1, H2, H3]，现在来了一个 H2
                // 因为 H2 不能装在 H3 里，也不能装在 H2 里，所以要把 H3 和 H2 踢出栈
                // 直到栈顶是 H1 (因为 H1 < H2，H1 可以装 H2)
                while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                    stack.pop();
                }

                // 2. 创建新的折叠组件
                const details = document.createElement('details');
                details.className = 'auto-collapse';
                // 【关键】默认关闭！必须点开才能看子内容
                details.open = false; 
                
                const summary = document.createElement('summary');
                // 去掉标题里的 # 号显示
                summary.innerText = el.innerText.replace(/^[#＃\s]+/, '');
                details.appendChild(summary);

                const contentDiv = document.createElement('div');
                contentDiv.className = 'collapse-content';
                details.appendChild(contentDiv);

                // 3. 放入父级 (Push DOM)
                if (stack.length > 0) {
                    // 放入栈顶元素的 contentDiv 中
                    stack[stack.length - 1].container.appendChild(details);
                } else {
                    // 没有父级，直接放最外层
                    newContainer.appendChild(details);
                }

                // 4. 入栈 (成为新的潜在父级)
                stack.push({ level: level, container: contentDiv });

            } else {
                // === 普通内容 (包括不带 # 的标题) ===
                // 放入当前栈顶的容器里
                if (stack.length > 0) {
                    stack[stack.length - 1].container.appendChild(el);
                } else {
                    newContainer.appendChild(el);
                }
            }
        });

        // 替换页面内容
        root.innerHTML = '';
        root.appendChild(newContainer);
    }

    // 初始化
    function initAll() {
        const root = document.getElementById(contentId) || document.querySelector(contentClass);
        if (root) {
            initHeaderFolding(root);
            initCodeFolding(root);
        }
    }

    setTimeout(initAll, 100);

    // 侧边栏监听
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link || !link.href.includes('.html')) return;
            setTimeout(initAll, 500);
        });
    }
});
