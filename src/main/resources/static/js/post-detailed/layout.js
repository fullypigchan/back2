const layout = (() => {

    const SVG = {
        likeOff: "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z",
        likeOn: "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z",
        followAdd: "M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm13 4v3h2v-3h3V8h-3V5h-2v3h-3v2h3zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z",
        followDel: "M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"
    };

    function esc(str) {
        const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return String(str ?? "").replace(/[&<>"']/g, c => map[c] || c);
    }

    function buildAvatarDataUri(label) {
        const safe = String(label || "?").slice(0, 1).replace(/[&<>"']/g, "");
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="#cfe8fc"></rect><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#1d9bf0">' + safe + '</text></svg>';
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

    const buildReplyCard = (r, inThread) => {
        const initial = (r.memberNickname || r.memberHandle || "?").charAt(0);
        const avatar = r.memberProfileFileName
            ? `<div class="post-detail-avatar post-detail-avatar--image"><img src="${esc(r.memberProfileFileName)}" alt="프로필"/></div>`
            : `<div class="post-detail-avatar post-detail-avatar--image"><img src="${buildAvatarDataUri(initial)}" alt="프로필"/></div>`;

        const threadClass = inThread ? " post-detail-thread-item" : "";

        if (r.reported) {
            return `
            <div class="post-detail-reply-card post-detail-reply-card--reported postCard${threadClass}" data-post-card data-post-id="${r.id}" data-member-id="${r.memberId}">
                <div class="post-detail-reply-content post-detail-reply-content--reported">
                    <p class="post-detail-reply-reported-text">신고한 글입니다.</p>
                </div>
            </div>`;
        }

        const replyBtn = `<button class="post-detail-action-button tweet-action-btn" type="button" data-testid="reply">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></svg>
                        <span class="tweet-action-count">${r.replyCount || 0}</span>
                    </button>`;

        return `
        <a href="/main/post/detail/${r.id}" class="post-detail-reply-card postCard${threadClass}" data-post-card data-post-id="${r.id}" data-member-id="${r.memberId}">
            ${avatar}
            <div class="post-detail-reply-content">
                <header class="post-detail-reply-header">
                    <div class="post-detail-reply-identity">
                        <strong class="postName">${esc(r.memberNickname || r.memberHandle)}</strong>
                        <span class="postHandle">${esc(r.memberHandle || "")}</span>
                        <span>·</span>
                        <span>${esc(r.createdDatetime || "")}</span>
                    </div>
                    <div class="post-detail-more-wrap">
                        <button class="post-detail-icon-button post-detail-more-trigger" type="button" aria-label="더 보기">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg>
                        </button>
                    </div>
                </header>
                <p class="post-detail-reply-text">${esc(r.postContent || "")}</p>
                <div class="post-detail-actions post-detail-actions--reply">
                    ${replyBtn}
                    <button class="post-detail-action-button post-detail-action-button--like tweet-action-btn tweet-action-btn--like ${r.liked ? 'active' : ''}" type="button" data-testid="like">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path data-path-inactive="${SVG.likeOff}" data-path-active="${SVG.likeOn}" d="${r.liked ? SVG.likeOn : SVG.likeOff}"></path></svg>
                        <span class="tweet-action-count">${r.likeCount || 0}</span>
                    </button>
                    <div class="post-detail-action-right">
                        <button class="post-detail-action-button post-detail-action-button--bookmark tweet-action-btn tweet-action-btn--bookmark" type="button" data-testid="bookmark" aria-label="북마크">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path data-path-inactive="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" data-path-active="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z" d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></svg>
                        </button>
                        <button class="post-detail-action-button tweet-action-btn tweet-action-btn--share" type="button" aria-label="댓글 공유하기" aria-haspopup="menu" aria-expanded="false">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        </a>`;
    };

    return { SVG: SVG, esc: esc, buildAvatarDataUri: buildAvatarDataUri, buildReplyCard: buildReplyCard };
})();
