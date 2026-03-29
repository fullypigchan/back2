/**
 * bookmark/layout.js — 북마크 페이지 UI 렌더링 모듈
 */
const BookmarkLayout = (function () {
    "use strict";

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function renderFolderItem(folder) {
        return `<button class="bookmark-item" type="button" data-bookmark-folder="${escapeHtml(folder.folderName)}" data-folder-id="${folder.id}" aria-label="${escapeHtml(folder.folderName)} 북마크 열기">
            <span class="bookmark-item-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6.75 3h10.5A2.25 2.25 0 0119.5 5.25v15.07a.75.75 0 01-1.2.6L12 16.2l-6.3 4.72a.75.75 0 01-1.2-.6V5.25A2.25 2.25 0 016.75 3z"/></svg></span>
            <span class="bookmark-item-label">${escapeHtml(folder.folderName)}</span>
            <span class="bookmark-item-count">${folder.bookmarkCount || 0}</span>
            <span class="bookmark-item-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14.586 12L7.543 4.96l1.414-1.42L17.414 12l-8.457 8.46-1.414-1.42L14.586 12z"/></svg></span>
        </button>`;
    }

    function renderFolderList(container, folders) {
        if (!container) return;
        let html = `<button class="bookmark-item" type="button" data-bookmark-folder="미분류" data-folder-id="" aria-label="미분류 북마크 열기">
            <span class="bookmark-item-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6.75 3h10.5A2.25 2.25 0 0119.5 5.25v15.07a.75.75 0 01-1.2.6L12 16.2l-6.3 4.72a.75.75 0 01-1.2-.6V5.25A2.25 2.25 0 016.75 3z"/></svg></span>
            <span class="bookmark-item-label">미분류</span>
            <span class="bookmark-item-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14.586 12L7.543 4.96l1.414-1.42L17.414 12l-8.457 8.46-1.414-1.42L14.586 12z"/></svg></span>
        </button>`;
        html += folders.map(renderFolderItem).join("");
        container.innerHTML = html;
    }

    function renderPostCard(b) {
        const title = b.postTitle ? escapeHtml(b.postTitle) : "삭제된 게시물";
        const content = b.postContent ? escapeHtml(b.postContent) : "";
        const isDeleted = !b.postTitle;
        return `<article class="bookmark-post${isDeleted ? " bookmark-post--deleted" : ""}" data-post-id="${b.postId}" data-bookmark-id="${b.id}">
            <div class="bookmark-post-avatar">${title.charAt(0)}</div>
            <div class="bookmark-post-body">
                <header class="bookmark-post-header">
                    <div class="bookmark-post-identity">
                        <strong class="bookmark-post-name">${title}</strong>
                    </div>
                    <div class="bookmark-post-more-wrap">
                        <button class="bookmark-post-more" type="button" aria-label="게시물 더 보기" aria-haspopup="menu" aria-expanded="false" data-post-more>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg>
                        </button>
                    </div>
                </header>
                <p class="bookmark-post-text">${content}</p>
                <footer class="bookmark-post-metrics">
                    <div class="bookmark-post-actions">
                        <div class="bookmark-post-action-right">
                            <button type="button" class="bookmark-post-action bookmark-post-action--bookmark active" data-action="bookmark" aria-label="북마크에 추가됨">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z" data-path-inactive="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" data-path-active="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"/></svg>
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </article>`;
    }

    function renderPostList(container, bookmarks, emptyEl) {
        if (!container) return;
        if (!bookmarks || bookmarks.length === 0) {
            container.innerHTML = "";
            if (emptyEl) emptyEl.hidden = false;
            return;
        }
        if (emptyEl) emptyEl.hidden = true;
        container.innerHTML = bookmarks.map(renderPostCard).join("");
    }

    return {
        escapeHtml,
        renderFolderList,
        renderPostList,
        renderPostCard,
    };
})();