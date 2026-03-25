window.onload = () => {

    // ── SVG 경로 상수 ──
    const SVG = {
        likeOff: "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z",
        likeOn: "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z",
        bmkOff: "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z",
        bmkOn: "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z",
        followAdd: "M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm13 4v3h2v-3h3V8h-3V5h-2v3h-3v2h3zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z",
        followDel: "M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"
    };

    // ── 유틸 ──
    function esc(str) {
        const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return String(str ?? "").replace(/[&<>"']/g, c => map[c] || c);
    }

    function showToast(msg) {
        const t = document.getElementById("postDetailMoreToast");
        if (!t) return;
        t.textContent = msg;
        t.hidden = false;
        clearTimeout(t._timer);
        t._timer = setTimeout(() => { t.hidden = true; }, 3000);
    }

    function getCardMeta(el) {
        const card = el.closest("[data-post-card]");
        if (!card) return null;
        return {
            card,
            postId: card.dataset.postId,
            targetMemberId: card.dataset.memberId,
            handle: card.querySelector(".postHandle")?.textContent?.trim() || "@user",
            name: card.querySelector(".postName")?.textContent?.trim() || ""
        };
    }

    function syncPath(btn, active) {
        const p = btn?.querySelector("path");
        if (!p) return;
        p.setAttribute("d", active ? (p.dataset.pathActive || p.getAttribute("d")) : (p.dataset.pathInactive || p.getAttribute("d")));
    }

    // ── 1. 인라인 답글 작성기 (본문 게시글에 댓글) ──
    const inlineEditor = document.querySelector(".post-detail-inline-reply-editor");
    const inlineSubmit = document.querySelector(".post-detail-inline-reply [data-testid='tweetButton']");

    if (inlineSubmit) inlineSubmit.disabled = true;

    inlineEditor?.addEventListener("input", () => {
        if (inlineSubmit) inlineSubmit.disabled = !inlineEditor.textContent.trim();
    });

    inlineSubmit?.addEventListener("click", async (e) => {
        e.preventDefault();
        const text = inlineEditor?.textContent?.trim();
        if (!text) return;
        await service.writeReply(postId, memberId, text);
        inlineEditor.innerHTML = "";
        inlineSubmit.disabled = true;
        await refreshReplies();
    });

    // ── 2. 댓글 목록 새로고침 ──
    async function refreshReplies() {
        const section = document.getElementById("postDetailReplies");
        if (!section) return;

        try {
            const replies = await service.getReplies(postId, memberId);
            console.log("replies 응답:", replies);

            if (!Array.isArray(replies) || replies.length === 0) {
                section.innerHTML = '<div style="padding:20px;color:#71767b;text-align:center;"><p>아직 댓글이 없습니다.</p></div>';
                return;
            }

            section.innerHTML = replies.map(r => {
                let html = buildReplyCard(r, false);
                if (r.subReplies && r.subReplies.length > 0) {
                    html += r.subReplies.map(sub => buildReplyCard(sub, true)).join("");
                }
                return html;
            }).join("");
        } catch (e) {
            console.error("댓글 로딩 실패:", e);
            section.innerHTML = '<div style="padding:20px;color:#71767b;text-align:center;"><p>댓글을 불러오지 못했습니다.</p></div>';
        }
    }

    function buildReplyCard(r, isSub) {
        const initial = (r.memberNickname || r.memberHandle || "?").charAt(0);
        const avatar = r.memberProfileFileName
            ? `<div class="post-detail-avatar post-detail-avatar--image"><img src="${esc(r.memberProfileFileName)}" alt="프로필"/></div>`
            : `<div class="post-detail-avatar"><span>${esc(initial)}</span></div>`;

        const subClass = isSub ? " post-detail-reply-card--sub" : "";
        const replyBtn = isSub ? "" :
                    `<button class="post-detail-action-button tweet-action-btn" type="button" data-testid="reply">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></svg>
                        <span class="tweet-action-count">${r.replyCount || 0}</span>
                    </button>`;

        return `
        <div class="post-detail-reply-card postCard${subClass}" data-post-card data-post-id="${r.id}" data-member-id="${r.memberId}">
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
                    <button class="post-detail-action-button tweet-action-btn" type="button" aria-label="조회수">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></svg>
                        <span class="tweet-action-count">${r.bookmarkCount || 0}</span>
                    </button>
                    <div class="post-detail-action-right">
                        <button class="post-detail-action-button post-detail-action-button--bookmark tweet-action-btn tweet-action-btn--bookmark ${r.bookmarked ? 'active' : ''}" type="button" data-testid="bookmark">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path data-path-inactive="${SVG.bmkOff}" data-path-active="${SVG.bmkOn}" d="${r.bookmarked ? SVG.bmkOn : SVG.bmkOff}"></path></svg>
                        </button>
                        <button class="post-detail-action-button tweet-action-btn tweet-action-btn--share" type="button" aria-label="공유">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }

    // ── 3. 좋아요 토글 (이벤트 위임) ──
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".tweet-action-btn--like");
        if (!btn) return;
        e.preventDefault();
        const meta = getCardMeta(btn);
        if (!meta) return;
        const isActive = btn.classList.contains("active");
        const countEl = btn.querySelector(".tweet-action-count");
        let count = parseInt(countEl?.textContent || "0");

        if (isActive) {
            await service.deleteLike(memberId, meta.postId);
            btn.classList.remove("active");
            if (countEl) countEl.textContent = count - 1;
        } else {
            await service.addLike(memberId, meta.postId);
            btn.classList.add("active");
            if (countEl) countEl.textContent = count + 1;
        }
        syncPath(btn, !isActive);
    });

    // ── 4. 북마크 토글 (이벤트 위임) ──
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".tweet-action-btn--bookmark");
        if (!btn) return;
        e.preventDefault();
        const meta = getCardMeta(btn);
        if (!meta) return;
        const isActive = btn.classList.contains("active");

        if (isActive) {
            await service.deleteBookmark(memberId, meta.postId);
            btn.classList.remove("active");
        } else {
            await service.addBookmark(memberId, meta.postId);
            btn.classList.add("active");
        }
        syncPath(btn, !isActive);
    });

    // ── 5. 공유 드롭다운 (이벤트 위임) ──
    const layers = document.getElementById("layers");
    let activeShareDrop = null;
    let activeShareBtn = null;

    function closeShareDrop() {
        activeShareDrop?.remove();
        activeShareDrop = null;
        activeShareBtn = null;
    }

    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".tweet-action-btn--share");
        if (!btn) {
            if (activeShareDrop && !activeShareDrop.contains(e.target)) closeShareDrop();
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (activeShareBtn === btn) { closeShareDrop(); return; }
        closeShareDrop();

        const meta = getCardMeta(btn);
        const rect = btn.getBoundingClientRect();
        const lc = document.createElement("div");
        lc.className = "layers-dropdown-container";
        lc.innerHTML =
            '<div class="layers-overlay"></div>' +
            '<div class="layers-dropdown-inner">' +
            '<div role="menu" class="dropdown-menu" style="top:' + (rect.bottom + 8) + 'px;right:' + (window.innerWidth - rect.right) + 'px;display:flex;">' +
            '<div><div class="dropdown-inner">' +
            '<button type="button" class="menu-item share-menu-item--copy"><span class="menu-item__icon"><svg viewBox="0 0 24 24"><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></svg></span><span class="menu-item__label">링크 복사하기</span></button>' +
            '<button type="button" class="menu-item share-menu-item--chat"><span class="menu-item__icon"><svg viewBox="0 0 24 24"><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z"></path></svg></span><span class="menu-item__label">Chat으로 전송하기</span></button>' +
            '</div></div></div></div>';

        lc.addEventListener("click", async (ev) => {
            const item = ev.target.closest(".menu-item");
            if (!item) return;
            ev.preventDefault();
            ev.stopPropagation();
            if (item.classList.contains("share-menu-item--copy")) {
                const url = window.location.origin + "/main/post/detail/" + (meta?.postId || postId) + "?memberId=" + memberId;
                await navigator.clipboard?.writeText(url);
                showToast("링크가 복사되었습니다.");
            } else if (item.classList.contains("share-menu-item--chat")) {
                showToast("Chat 전송 기능은 준비 중입니다.");
            }
            closeShareDrop();
        });

        if (layers) layers.appendChild(lc);
        else document.body.appendChild(lc);
        activeShareDrop = lc;
        activeShareBtn = btn;
    });

    // ── 6. 더보기 드롭다운 (이벤트 위임) ──
    const moreDropdown = document.getElementById("postDetailMoreDropdown");
    const moreMenu = document.getElementById("postDetailMoreMenu");
    const moreOwnerPanel = document.getElementById("postDetailMoreOwner");
    const moreOtherPanel = document.getElementById("postDetailMoreOther");
    const moreFollowLabel = document.getElementById("postDetailMoreFollowLabel");
    const moreFollowIconPath = document.getElementById("postDetailMoreFollowIconPath");
    const moreBlockLabel = document.getElementById("postDetailMoreBlockLabel");
    let activeMoreBtn = null;
    let activeMoreMeta = null;
    const followState = {};

    function closeMoreDrop() {
        if (moreDropdown) moreDropdown.hidden = true;
        activeMoreBtn = null;
        activeMoreMeta = null;
    }

    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".post-detail-more-trigger");
        if (!btn) {
            if (moreDropdown && !moreDropdown.hidden && !moreDropdown.contains(e.target)) closeMoreDrop();
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (activeMoreBtn === btn) { closeMoreDrop(); return; }

        const meta = getCardMeta(btn);
        if (!meta) return;
        activeMoreBtn = btn;
        activeMoreMeta = meta;

        const isMyPost = Number(meta.targetMemberId) === memberId;
        const isFollowing = followState[meta.handle] || false;

        if (isMyPost) {
            if (moreOwnerPanel) moreOwnerPanel.style.display = "";
            if (moreOtherPanel) moreOtherPanel.style.display = "none";
        } else {
            if (moreOwnerPanel) moreOwnerPanel.style.display = "none";
            if (moreOtherPanel) moreOtherPanel.style.display = "";
            if (moreFollowLabel) moreFollowLabel.textContent = isFollowing ? (meta.handle + " 님 언팔로우하기") : (meta.handle + " 님 팔로우하기");
            if (moreBlockLabel) moreBlockLabel.textContent = meta.handle + " 님 차단하기";
            if (moreFollowIconPath) moreFollowIconPath.setAttribute("d", isFollowing ? SVG.followDel : SVG.followAdd);
        }

        const rect = btn.getBoundingClientRect();
        if (moreMenu) {
            moreMenu.style.top = (rect.bottom + 8) + "px";
            moreMenu.style.left = Math.max(16, rect.right - 240) + "px";
        }
        if (moreDropdown) moreDropdown.hidden = false;
    });

    // 팔로우 토글
    document.getElementById("postDetailMoreFollow")?.addEventListener("click", async () => {
        if (!activeMoreMeta) return;
        const { handle, targetMemberId } = activeMoreMeta;
        const isF = followState[handle] || false;
        if (isF) await service.unfollow(memberId, targetMemberId);
        else await service.follow(memberId, targetMemberId);
        followState[handle] = !isF;
        closeMoreDrop();
        showToast(isF ? (handle + " 님 팔로우를 취소했습니다") : (handle + " 님을 팔로우했습니다"));
    });

    // 수정
    document.getElementById("postDetailMoreEdit")?.addEventListener("click", () => {
        if (!activeMoreMeta) return;
        closeMoreDrop();
        window.location.href = "/main/post/detail/" + activeMoreMeta.postId + "?memberId=" + memberId;
    });

    // 삭제
    document.getElementById("postDetailMoreDelete")?.addEventListener("click", async () => {
        if (!activeMoreMeta) return;
        closeMoreDrop();
        if (!confirm("게시물을 삭제할까요? 삭제된 게시물은 복구할 수 없습니다.")) return;
        // 본문 게시글이면 메인으로, 댓글이면 비동기 삭제
        if (activeMoreMeta.postId === String(postId)) {
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "/main/post/detail/delete/" + postId;
            document.body.appendChild(form);
            form.submit();
        } else {
            await service.deletePost(activeMoreMeta.postId);
            showToast("게시물이 삭제되었습니다");
            await refreshReplies();
        }
    });

    // ── 7. 차단/신고 다이얼로그 ──
    const blockDialog = document.getElementById("postDetailBlockDialog");
    const blockTitle = document.getElementById("postDetailBlockTitle");
    const blockDesc = document.getElementById("postDetailBlockDesc");
    const reportDialog = document.getElementById("postDetailReportDialog");

    function closeDialog(dialog) {
        if (dialog) dialog.hidden = true;
        document.body.classList.remove("modal-open");
    }

    document.getElementById("postDetailMoreBlock")?.addEventListener("click", () => {
        if (!activeMoreMeta || !blockDialog) return;
        closeMoreDrop();
        blockTitle.textContent = activeMoreMeta.handle + " 님을 차단할까요?";
        blockDesc.textContent = activeMoreMeta.handle + " 님은 나를 팔로우하거나 쪽지를 보낼 수 없으며, 이 계정과 관련된 알림도 내게 표시되지 않습니다.";
        blockDialog.hidden = false;
        document.body.classList.add("modal-open");
    });

    blockDialog?.addEventListener("click", (e) => {
        if (e.target.closest("[data-post-detail-block-close='true']")) {
            closeDialog(blockDialog);
            return;
        }
        if (e.target.closest("[data-post-detail-block-confirm='true']") && activeMoreMeta) {
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "/main/post/detail/block";
            form.innerHTML = '<input type="hidden" name="blockerId" value="' + memberId + '">' +
                '<input type="hidden" name="blockedId" value="' + activeMoreMeta.targetMemberId + '">';
            document.body.appendChild(form);
            form.submit();
        }
    });

    document.getElementById("postDetailMoreReport")?.addEventListener("click", () => {
        if (!activeMoreMeta || !reportDialog) return;
        closeMoreDrop();
        reportDialog.hidden = false;
        document.body.classList.add("modal-open");
    });

    reportDialog?.addEventListener("click", (e) => {
        if (e.target.closest("[data-post-detail-report-close='true']")) {
            closeDialog(reportDialog);
            return;
        }
        const item = e.target.closest(".post-detail-notification-report__item");
        if (item && activeMoreMeta) {
            const reason = item.dataset.reason || item.querySelector("span")?.textContent?.trim() || "";
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "/main/post/detail/report";
            form.innerHTML = '<input type="hidden" name="reporterId" value="' + memberId + '">' +
                '<input type="hidden" name="targetId" value="' + activeMoreMeta.postId + '">' +
                '<input type="hidden" name="targetType" value="post">' +
                '<input type="hidden" name="reason" value="' + esc(reason) + '">';
            document.body.appendChild(form);
            form.submit();
        }
    });

    // ── 8. 대댓글 모달 (댓글에 답글) ──
    const replyModal = document.querySelector("[data-reply-modal]");
    const replyEditor = replyModal?.querySelector("[data-testid='tweetTextarea_0']");
    const replySubmit = replyModal?.querySelector("[data-testid='tweetButton']");
    const replyClose = replyModal?.querySelector("[data-testid='app-bar-close']");
    const replySrcName = replyModal?.querySelector("[data-reply-source-name]");
    const replySrcHandle = replyModal?.querySelector("[data-reply-source-handle]");
    const replySrcTime = replyModal?.querySelector("[data-reply-source-time]");
    const replySrcText = replyModal?.querySelector("[data-reply-source-text]");
    const replySrcInitial = replyModal?.querySelector("[data-reply-source-initial]");
    let replyTargetPostId = null;

    function openReplyModal(meta) {
        if (!replyModal) return;
        replyTargetPostId = meta.postId;
        const card = meta.card;
        if (replySrcName) replySrcName.textContent = meta.name;
        if (replySrcHandle) replySrcHandle.textContent = meta.handle;
        if (replySrcTime) replySrcTime.textContent = card.querySelector(".post-detail-reply-identity span:last-child")?.textContent || "";
        if (replySrcText) replySrcText.textContent = card.querySelector(".post-detail-reply-text")?.textContent || "";
        if (replySrcInitial) replySrcInitial.textContent = (meta.name || "?").charAt(0);
        if (replyEditor) replyEditor.innerHTML = "";
        if (replySubmit) replySubmit.disabled = true;
        replyModal.hidden = false;
        document.body.classList.add("modal-open");
        replyEditor?.focus();
    }

    function closeReplyModal() {
        if (!replyModal) return;
        replyModal.hidden = true;
        document.body.classList.remove("modal-open");
        replyTargetPostId = null;
    }

    // 답글 버튼 (이벤트 위임): hero→인라인 포커스, 댓글→대댓글 모달
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-testid='reply']");
        if (!btn) return;
        const card = btn.closest("[data-post-card]");
        if (!card) return;
        e.preventDefault();

        if (card.classList.contains("post-detail-hero")) {
            inlineEditor?.focus();
            inlineEditor?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            const meta = getCardMeta(btn);
            if (meta) openReplyModal(meta);
        }
    });

    replyClose?.addEventListener("click", closeReplyModal);
    replyModal?.addEventListener("click", (e) => {
        if (e.target === replyModal) closeReplyModal();
    });

    replyEditor?.addEventListener("input", () => {
        if (replySubmit) replySubmit.disabled = !replyEditor.textContent.trim();
    });

    replySubmit?.addEventListener("click", async (e) => {
        e.preventDefault();
        const text = replyEditor?.textContent?.trim();
        if (!text || !replyTargetPostId) return;
        await service.writeReply(replyTargetPostId, memberId, text);
        closeReplyModal();
        showToast("답글이 게시되었습니다");
        await refreshReplies();
    });

    // ── 9. 뒤로 가기 ──
    document.getElementById("postDetailBack")?.addEventListener("click", () => {
        window.history.back();
    });

    // ── 10. ESC / 스크롤 시 메뉴 닫기 ──
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        closeMoreDrop();
        closeShareDrop();
        closeDialog(blockDialog);
        closeDialog(reportDialog);
        closeReplyModal();
    });

    window.addEventListener("scroll", () => {
        closeMoreDrop();
        closeShareDrop();
    }, { passive: true });

    // ── 11. 페이지 로드 시 댓글 비동기 로딩 ──
    refreshReplies();
};
