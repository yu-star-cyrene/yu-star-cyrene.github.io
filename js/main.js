
document.addEventListener("DOMContentLoaded", function () {
    const items = document.querySelectorAll(".post-item");
    const content = document.getElementById("post-content");

    items.forEach(item => {
        item.addEventListener("click", () => {
            const path = item.getAttribute("data-path");

            fetch(path)
                .then(res => res.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, "text/html");
                    const article = doc.querySelector("article");
                    content.innerHTML = "";
                    content.appendChild(article);
                    
                    // 添加淡入动画
                    content.style.opacity = "0";
                    content.style.transition = "opacity 0.3s ease";
                    setTimeout(() => {
                        content.style.opacity = "1";
                    }, 50);
                });
        });
    });
});
