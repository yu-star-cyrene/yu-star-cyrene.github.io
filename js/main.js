
document.addEventListener("DOMContentLoaded", function() {
    const contentDiv = document.querySelector('.article-content');
    if (contentDiv) {
        const children = Array.from(contentDiv.children);
        if (children.length === 0) return;

        const newContainer = document.createDocumentFragment();
        let currentDetails = null;
        let currentContentDiv = null;

        children.forEach(el => {
            const isHeaderTag = /^H[1-6]$/.test(el.tagName);
            const isTextHeader = el.innerText.trim().startsWith('#');

            if (isHeaderTag || isTextHeader) {
                if (currentDetails) {
                    currentDetails.appendChild(currentContentDiv);
                    newContainer.appendChild(currentDetails);
                }
                currentDetails = document.createElement('details');
                currentDetails.className = 'auto-collapse';
                
                const summary = document.createElement('summary');
                summary.innerText = el.innerText.replace(/^[#\s]+/, ''); 
                currentDetails.appendChild(summary);

                currentContentDiv = document.createElement('div');
                currentContentDiv.className = 'collapse-content';
            } else {
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
            contentDiv.innerHTML = '';
            contentDiv.appendChild(newContainer);
        }
    }
});
