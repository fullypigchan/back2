(() => {
    const SVG_LIKE_OFF = "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z";
    const SVG_LIKE_ON = "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z";
    const SVG_BOOKMARK_OFF = "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z";
    const SVG_BOOKMARK_ON = "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z";

    const MAX_REPLY_LENGTH = 500;

    const newsId = window.newsId;
    const memberId = window.memberId;

    function esc(str) {
        const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return String(str ?? "").replace(/[&<>"']/g, c => map[c] || c);
    }

    function formatCount(n) {
        const num = Number(n) || 0;
        if (num < 1000) return String(num);
        if (num < 1000000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1).replace(/\.0$/, "") + "천";
        return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }

    function showToast(message) {
        const toast = document.getElementById("newsToast");
        if (!toast) return;
        toast.textContent = message;
        toast.hidden = false;
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => { toast.hidden = true; }, 2400);
    }

    function setActionPath(button, active) {
        const path = button?.querySelector("path");
        if (!path) return;
        const next = active ? path.dataset.pathActive : path.dataset.pathInactive;
        if (next) path.setAttribute("d", next);
    }

    function setActionCount(button, count) {
        const span = button?.querySelector(".tweet-action-count");
        if (span) span.textContent = formatCount(count);
    }

    // ── 액션바 ──
    function initActionBar() {
        const likeBtn = document.querySelector(".post-detail-action-button-like");
        const bookmarkBtn = document.querySelector(".post-detail-action-button-bookmark");
        const replyBtn = document.querySelector('.post-detail-actions [data-testid="reply"]');
        const shareBtn = document.querySelector(".tweet-action-btn-share");

        if (likeBtn) {
            likeBtn.addEventListener("click", async () => {
                if (!memberId) { showToast("로그인이 필요합니다."); return; }
                try {
                    const res = await fetch(`/api/news/${newsId}/likes`, { method: "POST" });
                    if (!res.ok) throw new Error("like failed");
                    const data = await res.json();
                    likeBtn.classList.toggle("active", data.liked);
                    setActionPath(likeBtn, data.liked);
                    setActionCount(likeBtn, data.likeCount);
                } catch (e) {
                    console.error(e);
                    showToast("좋아요 처리에 실패했습니다.");
                }
            });
        }

        if (bookmarkBtn) {
            bookmarkBtn.addEventListener("click", async () => {
                if (!memberId) { showToast("로그인이 필요합니다."); return; }
                try {
                    const res = await fetch(`/api/news/${newsId}/bookmarks`, { method: "POST" });
                    if (!res.ok) throw new Error("bookmark failed");
                    const data = await res.json();
                    bookmarkBtn.classList.toggle("active", data.bookmarked);
                    setActionPath(bookmarkBtn, data.bookmarked);
                    showToast(data.bookmarked ? "북마크에 추가했습니다." : "북마크를 해제했습니다.");
                } catch (e) {
                    console.error(e);
                    showToast("북마크 처리에 실패했습니다.");
                }
            });
        }

        if (replyBtn) {
            replyBtn.addEventListener("click", () => {
                const editor = document.querySelector(".post-detail-inline-reply-editor");
                editor?.focus();
                editor?.scrollIntoView({ behavior: "smooth", block: "center" });
            });
        }

        if (shareBtn) {
            initShareDropdown(shareBtn);
        }
    }

    // ── 공유 드롭다운 (post-detailed 패턴과 동일) ──
    function initShareDropdown(shareBtn) {
        let activeDrop = null;

        const close = () => {
            activeDrop?.remove();
            activeDrop = null;
            shareBtn.setAttribute("aria-expanded", "false");
        };

        shareBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (activeDrop) { close(); return; }

            const rect = shareBtn.getBoundingClientRect();
            const lc = document.createElement("div");
            lc.className = "layers-dropdown-container";
            lc.innerHTML =
                '<div class="layers-overlay"></div>' +
                '<div class="layers-dropdown-inner">' +
                '<div role="menu" class="dropdown-menu" style="top:' + (rect.bottom + 8) + 'px;right:' + (window.innerWidth - rect.right) + 'px;display:flex;">' +
                '<div><div class="dropdown-inner">' +
                '<button type="button" class="menu-item share-menu-item--copy">' +
                '<span class="menu-item__icon"><svg viewBox="0 0 24 24"><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></svg></span>' +
                '<span class="menu-item__label">링크 복사하기</span>' +
                '</button>' +
                '</div></div></div></div>';

            lc.addEventListener("click", async (ev) => {
                const item = ev.target.closest(".menu-item");
                if (!item) return;
                ev.preventDefault();
                ev.stopPropagation();
                if (item.classList.contains("share-menu-item--copy")) {
                    if (!navigator.clipboard?.writeText) {
                        showToast("이 브라우저에서는 링크 복사를 지원하지 않습니다.");
                    } else {
                        try {
                            await navigator.clipboard.writeText(window.location.href);
                            showToast("링크가 복사되었습니다.");
                        } catch (err) {
                            showToast("링크 복사에 실패했습니다.");
                        }
                    }
                }
                close();
            });

            document.body.appendChild(lc);
            activeDrop = lc;
            shareBtn.setAttribute("aria-expanded", "true");
        });

        document.addEventListener("click", (e) => {
            if (!activeDrop) return;
            if (e.target === shareBtn || shareBtn.contains(e.target)) return;
            if (activeDrop.contains(e.target)) return;
            close();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") close();
        });

        window.addEventListener("scroll", () => close(), { passive: true });
    }

    // ── 인라인 답글 작성기 ──
    function initComposer() {
        const editor = document.querySelector(".post-detail-inline-reply-editor");
        const submit = document.querySelector("[data-reply-submit]");
        const gauge = document.querySelector("[data-reply-gauge]");
        const gaugeText = document.querySelector("[data-reply-gauge-text]");
        if (!editor || !submit) return;

        const updateGauge = () => {
            const text = editor.textContent || "";
            const len = text.length;
            const trimmedLen = text.trim().length;
            const remaining = MAX_REPLY_LENGTH - len;

            if (gauge) {
                gauge.setAttribute("aria-valuenow", String(len));
                if (remaining <= 20) gauge.classList.add("composerGauge--warn");
                else gauge.classList.remove("composerGauge--warn");
                if (remaining < 0) gauge.classList.add("composerGauge--over");
                else gauge.classList.remove("composerGauge--over");
            }
            if (gaugeText) {
                gaugeText.textContent = remaining < 0 ? String(remaining) : (remaining <= 20 ? String(remaining) : "");
            }
            submit.disabled = trimmedLen === 0 || len > MAX_REPLY_LENGTH;
        };

        editor.addEventListener("input", updateGauge);
        editor.addEventListener("blur", updateGauge);
        updateGauge();

        editor.addEventListener("paste", (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData)?.getData("text") ?? "";
            document.execCommand("insertText", false, text);
        });

        submit.addEventListener("click", async () => {
            if (!memberId) { showToast("로그인이 필요합니다."); return; }
            const content = (editor.textContent || "").trim();
            if (!content) return;
            submit.disabled = true;
            try {
                const res = await fetch(`/api/news/${newsId}/replies`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content })
                });
                if (!res.ok) throw new Error("write failed");
                const data = await res.json();
                editor.textContent = "";
                updateGauge();
                showToast("답글을 게시했습니다.");
                updateReplyCount(data.replyCount);
                await loadReplies(currentSort);
            } catch (e) {
                console.error(e);
                showToast("답글 게시에 실패했습니다.");
                submit.disabled = false;
            }
        });
    }

    function updateReplyCount(count) {
        const replyBtn = document.querySelector('.post-detail-actions [data-testid="reply"]');
        setActionCount(replyBtn, count);
    }

    // ── 답글 카드 빌더 ──
    function buildReplyCard(r) {
        const profile = r.memberProfileFileName
            ? esc(r.memberProfileFileName)
            : "/images/profile/default_image.png";
        const handle = r.memberHandle ? `@${esc(r.memberHandle)}` : "";
        const name = esc(r.memberName || r.memberHandle || "사용자");
        const time = esc(r.createdDatetime || "");
        const content = esc(r.content || "");
        const likeCount = formatCount(r.likeCount || 0);
        const liked = !!r.liked;
        const isAuthor = memberId && r.memberId === memberId;

        return `
        <article class="post-detail-reply-card postCard" data-reply-id="${r.id}" data-member-id="${r.memberId}">
            <div class="post-detail-avatar post-detail-avatar--image">
                <img src="${profile}" alt="프로필" onerror="this.src='/images/profile/default_image.png'"/>
            </div>
            <div class="post-detail-reply-content">
                <header class="post-detail-reply-header">
                    <div class="post-detail-reply-identity">
                        <strong class="postName">${name}</strong>
                        <span class="postHandle">${handle}</span>
                        <span class="postTime">·&nbsp;${time}</span>
                    </div>
                    ${isAuthor ? `
                    <div class="post-detail-more-wrap">
                        <button class="post-detail-icon-button post-detail-more-trigger" type="button" aria-label="더 보기" aria-haspopup="menu" aria-expanded="false" data-action="reply-more">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg>
                        </button>
                        <div class="dropdown-menu post-detail-reply-more-menu" role="menu" hidden>
                            <button type="button" class="dropdown-item post-detail-reply-more-delete" role="menuitem" data-action="reply-delete">삭제</button>
                        </div>
                    </div>` : ""}
                </header>
                <p class="post-detail-reply-text">${content}</p>
                <div class="post-detail-actions post-detail-actions--reply">
                    <div class="post-detail-action-slot">
                        <button class="post-detail-action-button post-detail-action-button--like tweet-action-btn tweet-action-btn--like ${liked ? "active" : ""}"
                                type="button" data-action="reply-like">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path data-path-inactive="${SVG_LIKE_OFF}" data-path-active="${SVG_LIKE_ON}" d="${liked ? SVG_LIKE_ON : SVG_LIKE_OFF}"></path>
                            </svg>
                            <span class="tweet-action-count">${likeCount}</span>
                        </button>
                    </div>
                </div>
            </div>
        </article>`;
    }

    // ── 답글 목록 로드 ──
    let currentSort = "latest";

    async function loadReplies(sort) {
        currentSort = sort || "latest";
        const container = document.getElementById("newsReplies");
        if (!container) return;
        try {
            const res = await fetch(`/api/news/${newsId}/replies?sort=${currentSort}`);
            if (!res.ok) throw new Error("load failed");
            const list = await res.json();
            if (!list || list.length === 0) {
                container.innerHTML = `<div class="post-detail-replies-empty">아직 답글이 없습니다.</div>`;
                return;
            }
            container.innerHTML = list.map(buildReplyCard).join("");
        } catch (e) {
            console.error(e);
            container.innerHTML = `<div class="post-detail-replies-empty">답글을 불러오지 못했습니다.</div>`;
        }
    }

    function closeAllReplyMenus(except) {
        document.querySelectorAll(".post-detail-reply-more-menu").forEach(menu => {
            if (menu === except) return;
            menu.hidden = true;
            const trigger = menu.parentElement?.querySelector(".post-detail-more-trigger");
            trigger?.setAttribute("aria-expanded", "false");
        });
    }

    // ── 답글 카드 동작 (위임) ──
    function initReplyDelegation() {
        const container = document.getElementById("newsReplies");
        if (!container) return;

        container.addEventListener("click", async (e) => {
            const likeBtn = e.target.closest('[data-action="reply-like"]');
            const moreBtn = e.target.closest('[data-action="reply-more"]');
            const deleteBtn = e.target.closest('[data-action="reply-delete"]');

            if (likeBtn) {
                if (!memberId) { showToast("로그인이 필요합니다."); return; }
                const card = likeBtn.closest("[data-reply-id]");
                const replyId = card?.dataset.replyId;
                if (!replyId) return;
                try {
                    const res = await fetch(`/api/news/replies/${replyId}/likes`, { method: "POST" });
                    if (!res.ok) throw new Error("reply like failed");
                    const data = await res.json();
                    likeBtn.classList.toggle("active", data.liked);
                    setActionPath(likeBtn, data.liked);
                    const span = likeBtn.querySelector(".tweet-action-count");
                    if (span) {
                        const cur = parseInt(span.textContent.replace(/[^0-9]/g, ""), 10) || 0;
                        span.textContent = formatCount(data.liked ? cur + 1 : Math.max(0, cur - 1));
                    }
                } catch (err) {
                    console.error(err);
                    showToast("좋아요 처리에 실패했습니다.");
                }
                return;
            }

            if (moreBtn) {
                e.stopPropagation();
                const wrap = moreBtn.closest(".post-detail-more-wrap");
                const menu = wrap?.querySelector(".post-detail-reply-more-menu");
                if (!menu) return;
                const willOpen = menu.hidden;
                closeAllReplyMenus(willOpen ? menu : null);
                menu.hidden = !willOpen;
                moreBtn.setAttribute("aria-expanded", String(willOpen));
                return;
            }

            if (deleteBtn) {
                e.stopPropagation();
                const card = deleteBtn.closest("[data-reply-id]");
                const replyId = card?.dataset.replyId;
                if (!replyId) return;
                closeAllReplyMenus(null);
                if (!confirm("이 답글을 삭제하시겠습니까?")) return;
                try {
                    const res = await fetch(`/api/news/replies/${replyId}`, { method: "DELETE" });
                    if (!res.ok) throw new Error("delete failed");
                    showToast("답글을 삭제했습니다.");
                    await loadReplies(currentSort);
                    const replyBtn = document.querySelector('.post-detail-actions [data-testid="reply"]');
                    const span = replyBtn?.querySelector(".tweet-action-count");
                    if (span) {
                        const cur = parseInt(span.textContent.replace(/[^0-9]/g, ""), 10) || 0;
                        span.textContent = formatCount(Math.max(0, cur - 1));
                    }
                } catch (err) {
                    console.error(err);
                    showToast("답글 삭제에 실패했습니다.");
                }
            }
        });

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".post-detail-reply-more-menu") &&
                !e.target.closest('[data-action="reply-more"]')) {
                closeAllReplyMenus(null);
            }
        });
    }

    // ── 정렬 드롭다운 ──
    function initSortDropdown() {
        const wrap = document.querySelector(".post-detail-sort");
        const trigger = wrap?.querySelector(".post-detail-sort-button");
        const menu = wrap?.querySelector(".post-detail-sort-menu");
        if (!wrap || !trigger || !menu) return;

        const triggerLabel = trigger.querySelector("span");

        const close = () => {
            menu.hidden = true;
            trigger.setAttribute("aria-expanded", "false");
        };
        const open = () => {
            menu.hidden = false;
            trigger.setAttribute("aria-expanded", "true");
        };

        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.hidden ? open() : close();
        });

        menu.addEventListener("click", async (e) => {
            const item = e.target.closest("[data-sort]");
            if (!item) return;
            const sort = item.dataset.sort;
            if (triggerLabel) triggerLabel.textContent = sort === "popular" ? "인기순" : "최신순";
            trigger.dataset.sort = sort;
            close();
            await loadReplies(sort);
        });

        document.addEventListener("click", (e) => {
            if (!wrap.contains(e.target)) close();
        });
    }

    // ── 뒤로 가기 ──
    function initBack() {
        const backBtn = document.getElementById("newsBackButton");
        if (!backBtn) return;
        backBtn.addEventListener("click", () => {
            if (window.history.length > 1) window.history.back();
            else window.location.href = "/explore?tab=news";
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        initBack();
        initActionBar();
        initComposer();
        initReplyDelegation();
        initSortDropdown();
        loadReplies("latest");
    });
})();
