window.onload = () => {
    let memberId = null;

    // 장소 검색 객체 (검색 시 초기화)
    var ps = null;

    // ── 1. 탭 전환 + 데이터 로드 + 무한스크롤 ──
    let activeTab = "feed";
    let postPage = 1;
    let postCheckScroll = true;
    let postHasMore = true;
    let expertPage = 1;
    let expertCheckScroll = true;
    let expertHasMore = true;
    let expertLoaded = false;

    const tabFeed = document.getElementById("tabFeed");
    const tabFriends = document.getElementById("tabFriends");
    const feedSection = document.getElementById("feedSection");
    const friendsSection = document.getElementById("friendsSection");

    tabFeed.addEventListener("click", (e) => {
        activeTab = "feed";
        tabFeed.classList.add("isActive");
        tabFriends.classList.remove("isActive");
        feedSection.classList.add("isActive");
        friendsSection.classList.remove("isActive");
    });

    tabFriends.addEventListener("click", async (e) => {
        activeTab = "expert";
        tabFriends.classList.add("isActive");
        tabFeed.classList.remove("isActive");
        friendsSection.classList.add("isActive");
        feedSection.classList.remove("isActive");

        if (!expertLoaded) {
            await service.getExpertList(expertPage, memberId, (data) => {
                layout.showExpertList(data.experts, expertPage);
                expertHasMore = data.criteria.hasMore;
            });
            expertLoaded = true;
        }
    });

    // 광고 데이터 준비 후 게시글 렌더링 (게시글 3개마다 광고 1개 삽입)
    const initFollowState = (posts) => {
        posts.forEach((post) => {
            const handle = post.memberHandle ? post.memberHandle : "";
            if (post.followed) {
                followState[handle] = true;
            }
        });
    };

    const loadFeed = () => {
        service.getPostList(postPage, memberId, (data) => {
            const posts = layout.showPostList(data.posts, postPage);
            initFollowState(posts);
            postHasMore = data.criteria.hasMore;
        });
    };

    window.addEventListener("scroll", async (e) => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight < scrollHeight - 100) return;

        if (activeTab === "feed" && postCheckScroll && postHasMore) {
            postCheckScroll = false;
            postPage++;
            await service.getPostList(postPage, memberId, (data) => {
                const posts = layout.showPostList(data.posts, postPage);
                initFollowState(posts);
                postHasMore = data.criteria.hasMore;
            });
            setTimeout(() => { postCheckScroll = true; }, 1000);
        }

        if (activeTab === "expert" && expertCheckScroll && expertHasMore) {
            expertCheckScroll = false;
            expertPage++;
            await service.getExpertList(expertPage, memberId, (data) => {
                layout.showExpertList(data.experts, expertPage);
                expertHasMore = data.criteria.hasMore;
            });
            setTimeout(() => { expertCheckScroll = true; }, 1000);
        }
    });

    // ── 2. 게시물 버튼 이벤트 (이벤트 위임) ──
    const mainShareDropdown = document.getElementById("mainShareDropdown");
    let activeMoreDropdown = null;
    let activeMoreButton = null;
    let activeMoreModal = null;
    let followState = {};
    const reportReasons = [
        "다른 회사 제품 도용 신고",
        "실제 존재하지 않는 제품 등록 신고",
        "스펙·원산지 허위 표기 신고",
        "특허 제품 무단 판매 신고",
        "수출입 제한 품목 신고",
        "반복적인 동일 게시물 신고"
    ];

    function getUserMetaFromButton(button) {
        const card = button.closest(".postCard");
        const handleEl = card ? card.querySelector(".postHandle") : null;
        const handle = handleEl ? (handleEl.textContent || "").trim() : "@user";
        return { handle: handle };
    }

    function getPostMemberIdFromButton(button) {
        const card = button.closest(".postCard");
        return card ? card.dataset.memberId : null;
    }

    function getPostIdFromButton(button) {
        const card = button.closest(".postCard");
        return card ? card.dataset.postId : null;
    }

    function closeAllMenus() {
        closePostMoreDropdown();
        mainShareDropdown.classList.add("off");
    }

    function showPostMoreToast(message) {
        const existing = document.querySelector(".notification-toast");
        if (existing) { existing.remove(); }
        const toast = document.createElement("div");
        toast.className = "notification-toast";
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function () { toast.remove(); }, 3000);
    }

    function closePostMoreDropdown() {
        if (!activeMoreDropdown) { return; }
        activeMoreDropdown.remove();
        activeMoreDropdown = null;
        activeMoreButton = null;
    }

    function closePostMoreModal() {
        if (!activeMoreModal) { return; }
        activeMoreModal.remove();
        activeMoreModal = null;
        document.body.classList.remove("modal-open");
    }

    function openDeleteModal(button, postId) {
        closePostMoreDropdown();
        closePostMoreModal();
        const modal = document.createElement("div");
        modal.className = "notification-dialog notification-dialog--delete";
        modal.innerHTML =
            '<div class="notification-dialog__backdrop"></div>' +
            '<div class="notification-dialog__card notification-dialog__card--small" role="alertdialog" aria-modal="true">' +
            '<h2 class="notification-dialog__title">게시물을 삭제할까요?</h2>' +
            '<p class="notification-dialog__description">삭제된 게시물은 복구할 수 없습니다.</p>' +
            '<div class="notification-dialog__actions">' +
            '<button type="button" class="notification-dialog__danger notification-dialog__confirm-delete">삭제</button>' +
            '<button type="button" class="notification-dialog__secondary notification-dialog__close">취소</button>' +
            '</div>' +
            '</div>';
        modal.addEventListener("click", async function (e) {
            if (e.target.classList.contains("notification-dialog__backdrop") || e.target.closest(".notification-dialog__close")) {
                e.preventDefault();
                closePostMoreModal();
                return;
            }
            if (e.target.closest(".notification-dialog__confirm-delete")) {
                e.preventDefault();
                await service.deletePost(postId);
                const card = document.querySelector(`.postCard[data-post-id="${postId}"]`);
                if (card) card.remove();
                showPostMoreToast("게시물이 삭제되었습니다");
                closePostMoreModal();
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeMoreModal = modal;
    }

    function openBlockModal(button) {
        const meta = getUserMetaFromButton(button);
        const handle = meta.handle;
        const targetMemberId = getPostMemberIdFromButton(button);
        closePostMoreDropdown();
        closePostMoreModal();
        const modal = document.createElement("div");
        modal.className = "notification-dialog notification-dialog--block";
        modal.innerHTML =
            '<div class="notification-dialog__backdrop"></div>' +
            '<div class="notification-dialog__card notification-dialog__card--small" role="alertdialog" aria-modal="true">' +
            '<h2 class="notification-dialog__title">' + handle + ' 님을 차단할까요?</h2>' +
            '<p class="notification-dialog__description">내 공개 게시물을 볼 수 있지만 더 이상 게시물에 참여할 수 없습니다. 또한 ' + handle + ' 님은 나를 팔로우하거나 쪽지를 보낼 수 없으며, 이 계정과 관련된 알림도 내게 표시되지 않습니다.</p>' +
            '<div class="notification-dialog__actions">' +
            '<button type="button" class="notification-dialog__danger notification-dialog__confirm-block">차단</button>' +
            '<button type="button" class="notification-dialog__secondary notification-dialog__close">취소</button>' +
            '</div>' +
            '</div>';
        modal.addEventListener("click", async function (e) {
            if (e.target.classList.contains("notification-dialog__backdrop") || e.target.closest(".notification-dialog__close")) {
                e.preventDefault();
                closePostMoreModal();
                return;
            }
            if (e.target.closest(".notification-dialog__confirm-block")) {
                e.preventDefault();
                if (targetMemberId) {
                    await service.block(memberId, targetMemberId);
                    document.querySelectorAll(`.postCard[data-member-id="${targetMemberId}"]`).forEach(card => card.remove());
                    document.querySelectorAll(`.user-card[data-expert-id="${targetMemberId}"]`).forEach(card => card.remove());
                    document.querySelectorAll(`.suggestionItem .connect-btn-sm[data-member-id="${targetMemberId}"]`).forEach(btn => btn.closest(".suggestionItem").remove());
                }
                showPostMoreToast(handle + " 님을 차단했습니다");
                closePostMoreModal();
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeMoreModal = modal;
    }

    function openReportModal(button) {
        const postId = getPostIdFromButton(button);
        closePostMoreDropdown();
        closePostMoreModal();
        let listHtml = "";
        for (let i = 0; i < reportReasons.length; i++) {
            listHtml +=
                '<li><button type="button" class="notification-report__item" data-reason="' + reportReasons[i] + '">' +
                '<span>' + reportReasons[i] + '</span>' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.293 6.293 10.707 4.88 17.828 12l-7.121 7.12-1.414-1.413L14.999 12z"></path></g></svg>' +
                '</button></li>';
        }
        const modal = document.createElement("div");
        modal.className = "notification-dialog notification-dialog--report";
        modal.innerHTML =
            '<div class="notification-dialog__backdrop"></div>' +
            '<div class="notification-dialog__card notification-dialog__card--report" role="dialog" aria-modal="true">' +
            '<div class="notification-dialog__header">' +
            '<button type="button" class="notification-dialog__icon-btn notification-dialog__close" aria-label="돌아가기">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg>' +
            '</button>' +
            '<h2 class="notification-dialog__title">신고하기</h2>' +
            '</div>' +
            '<div class="notification-dialog__body">' +
            '<p class="notification-dialog__question">이 게시물에 어떤 문제가 있나요?</p>' +
            '<ul class="notification-report__list">' + listHtml + '</ul>' +
            '</div>' +
            '</div>';
        modal.addEventListener("click", async function (e) {
            if (e.target.classList.contains("notification-dialog__backdrop") || e.target.closest(".notification-dialog__close")) {
                e.preventDefault();
                closePostMoreModal();
                return;
            }
            const reportItem = e.target.closest(".notification-report__item");
            if (reportItem) {
                e.preventDefault();
                if (postId) {
                    await service.report(memberId, postId, 'post', reportItem.dataset.reason);
                    const card = document.querySelector(`.postCard[data-post-id="${postId}"]`);
                    if (card) card.remove();
                }
                showPostMoreToast("신고가 접수되었습니다");
                closePostMoreModal();
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeMoreModal = modal;
    }

    async function handleDropdownAction(button, actionClass) {
        const meta = getUserMetaFromButton(button);
        const handle = meta.handle;
        const targetMemberId = getPostMemberIdFromButton(button);

        if (actionClass === "menu-item--follow-toggle") {
            if (!targetMemberId) return;
            const isF = followState[handle] ? true : false;
            if (isF) {
                await service.unfollow(memberId, targetMemberId);
            } else {
                await service.follow(memberId, targetMemberId);
            }
            followState[handle] = !isF;
            closePostMoreDropdown();
            showPostMoreToast(isF ? (handle + " 님 팔로우를 취소했습니다") : (handle + " 님을 팔로우했습니다"));
            return;
        }
        if (actionClass === "menu-item--block") {
            openBlockModal(button);
            return;
        }
        if (actionClass === "menu-item--report") {
            openReportModal(button);
            return;
        }
        if (actionClass === "menu-item--edit") {
            const postId = getPostIdFromButton(button);
            closePostMoreDropdown();
            openEditModal(postId);
            return;
        }
        if (actionClass === "menu-item--delete") {
            const postId = getPostIdFromButton(button);
            openDeleteModal(button, postId);
            return;
        }
    }

    function openPostMoreDropdown(button) {
        closePostMoreDropdown();
        const meta = getUserMetaFromButton(button);
        const handle = meta.handle;
        const isF = followState[handle] ? true : false;
        const rect = button.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 8;
        const right = Math.max(16, window.innerWidth - rect.right);

        const followIcon = isF
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>'
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm13 4v3h2v-3h3V8h-3V5h-2v3h-3v2h3zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>';
        const followLabel = isF ? (handle + " 님 언팔로우하기") : (handle + " 님 팔로우하기");

        const targetMemberId = getPostMemberIdFromButton(button);
        const isMyPost = targetMemberId && Number(targetMemberId) === memberId;

        let menuItemsHtml = "";
        if (isMyPost) {
            menuItemsHtml =
                '<button type="button" role="menuitem" class="menu-item menu-item--edit">' +
                '<span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></g></svg></span>' +
                '<span class="menu-item__label">게시물 수정하기</span>' +
                '</button>' +
                '<button type="button" role="menuitem" class="menu-item menu-item--delete">' +
                '<span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"></path></g></svg></span>' +
                '<span class="menu-item__label">게시물 삭제하기</span>' +
                '</button>';
        } else {
            menuItemsHtml =
                '<button type="button" role="menuitem" class="menu-item menu-item--follow-toggle">' +
                '<span class="menu-item__icon">' + followIcon + '</span>' +
                '<span class="menu-item__label">' + followLabel + '</span>' +
                '</button>' +
                '<button type="button" role="menuitem" class="menu-item menu-item--block">' +
                '<span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M12 3.75c-4.55 0-8.25 3.69-8.25 8.25 0 1.92.66 3.68 1.75 5.08L17.09 5.5C15.68 4.4 13.92 3.75 12 3.75zm6.5 3.17L6.92 18.5c1.4 1.1 3.16 1.75 5.08 1.75 4.56 0 8.25-3.69 8.25-8.25 0-1.92-.65-3.68-1.75-5.08zM1.75 12C1.75 6.34 6.34 1.75 12 1.75S22.25 6.34 22.25 12 17.66 22.25 12 22.25 1.75 17.66 1.75 12z"></path></g></svg></span>' +
                '<span class="menu-item__label">' + handle + ' 님 차단하기</span>' +
                '</button>' +
                '<button type="button" role="menuitem" class="menu-item menu-item--report">' +
                '<span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z"></path></g></svg></span>' +
                '<span class="menu-item__label">게시물 신고하기</span>' +
                '</button>';
        }

        const lc = document.createElement("div");
        lc.className = "layers-dropdown-container";
        lc.style.position = "absolute";
        lc.style.top = "0";
        lc.style.left = "0";
        lc.style.width = "100%";
        lc.style.height = "0";
        lc.style.pointerEvents = "none";
        lc.style.zIndex = "30";
        lc.innerHTML =
            '<div class="layers-overlay"></div>' +
            '<div class="layers-dropdown-inner">' +
            '<div role="menu" class="dropdown-menu" style="top:' + top + 'px;right:' + right + 'px;display:flex;">' +
            '<div><div class="dropdown-inner">' +
            menuItemsHtml +
            '</div></div>' +
            '</div>' +
            '</div>';
        lc.addEventListener("click", function (e) {
            const item = e.target.closest(".menu-item");
            if (!item) { e.stopPropagation(); return; }
            e.preventDefault();
            e.stopPropagation();
            let ac = "";
            if (item.classList.contains("menu-item--follow-toggle")) { ac = "menu-item--follow-toggle"; }
            else if (item.classList.contains("menu-item--block")) { ac = "menu-item--block"; }
            else if (item.classList.contains("menu-item--report")) { ac = "menu-item--report"; }
            else if (item.classList.contains("menu-item--edit")) { ac = "menu-item--edit"; }
            else if (item.classList.contains("menu-item--delete")) { ac = "menu-item--delete"; }
            if (ac && activeMoreButton) {
                handleDropdownAction(activeMoreButton, ac);
            }
        });
        document.body.appendChild(lc);
        activeMoreDropdown = lc;
        activeMoreButton = button;
    }

    // 더보기 버튼 클릭 (이벤트 위임)
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".postMoreButton");
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            if (activeMoreButton === btn) {
                closePostMoreDropdown();
                return;
            }
            openPostMoreDropdown(btn);
            return;
        }
        if (activeMoreDropdown && !activeMoreDropdown.contains(e.target)) {
            closePostMoreDropdown();
        }
    });

    // 좋아요 토글 (이벤트 위임)
    document.addEventListener("click", async (e) => {
        const likeBtn = e.target.closest(".tweet-action-btn--like");
        if (!likeBtn) return;
        const postId = likeBtn.closest(".postCard").dataset.postId;
        let isActive = likeBtn.classList.contains("active");
        const countSpan = likeBtn.querySelector(".tweet-action-count");
        let count = parseInt(countSpan.textContent);

        if (isActive) {
            await service.deleteLike(memberId, postId);
            likeBtn.classList.remove("active");
            countSpan.textContent = count - 1;
        } else {
            await service.addLike(memberId, postId);
            likeBtn.classList.add("active");
            countSpan.textContent = count + 1;
        }
    });

    // 북마크 토글 (이벤트 위임)
    document.addEventListener("click", async (e) => {
        const bookmarkBtn = e.target.closest(".tweet-action-btn--bookmark");
        if (!bookmarkBtn) return;
        const postId = bookmarkBtn.closest(".postCard").dataset.postId;
        let isActive = bookmarkBtn.classList.contains("active");

        if (isActive) {
            await service.deleteBookmark(memberId, postId);
            bookmarkBtn.classList.remove("active");
        } else {
            await service.addBookmark(memberId, postId);
            bookmarkBtn.classList.add("active");
        }
    });

    // 공유 드롭다운 토글 (이벤트 위임)
    let shareTargetPostId = null;
    document.addEventListener("click", (e) => {
        const shareBtn = e.target.closest(".tweet-action-btn--share");
        if (!shareBtn) return;
        e.stopPropagation();
        const card = shareBtn.closest(".postCard");
        shareTargetPostId = card ? card.dataset.postId : null;
        let isOpen = !mainShareDropdown.classList.contains("off");
        closeAllMenus();
        if (!isOpen) {
            let rect = shareBtn.getBoundingClientRect();
            let menu = document.getElementById("mainShareDropdownMenu");
            menu.style.position = "fixed";
            menu.style.left = rect.left + "px";
            menu.style.top = (rect.bottom + 4) + "px";
            mainShareDropdown.classList.remove("off");
        }
    });

    // 공유 드롭다운 항목
    const mainShareChatSheet = document.getElementById("mainShareChatSheet");

    function showShareToast(message) {
        const existing = document.querySelector(".share-toast");
        if (existing) { existing.remove(); }
        const toast = document.createElement("div");
        toast.className = "share-toast";
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function () { toast.remove(); }, 3000);
    }

    document.querySelector(".share-menu-item--copy").addEventListener("click", (e) => {
        const url = window.location.origin + "/post/detail/" + shareTargetPostId;
        navigator.clipboard.writeText(url);
        closeAllMenus();
        showShareToast("링크가 복사되었습니다.");
    });

    document.querySelector(".share-menu-item--chat").addEventListener("click", async (e) => {
        closeAllMenus();
        const followings = await service.getFollowings(memberId);
        const userList = document.getElementById("shareChatUserList");
        if (followings.length === 0) {
            userList.innerHTML = '<p style="padding:16px;color:#71767b;text-align:center;">팔로우 중인 사용자가 없습니다.</p>';
        } else {
            userList.innerHTML = followings.map(f => {
                const initial = (f.memberNickname || f.memberHandle || "?").charAt(0);
                const avatarHtml = f.memberProfileFileName
                    ? `<span class="share-sheet__user-avatar"><img src="${f.memberProfileFileName}" alt="${f.memberNickname || ''}"/></span>`
                    : `<span class="share-sheet__user-avatar"><img src="${layout.buildAvatarDataUri(initial)}" alt="${f.memberNickname || ''}"/></span>`;
                return `<button type="button" class="share-sheet__user" data-share-user-id="${f.followingId}">
                    ${avatarHtml}
                    <span class="share-sheet__user-body">
                        <span class="share-sheet__user-name">${f.memberNickname || f.memberHandle || ""}</span>
                        <span class="share-sheet__user-handle">${f.memberHandle || ""}</span>
                    </span>
                </button>`;
            }).join("");
        }
        mainShareChatSheet.classList.remove("off");
    });

    // 공유 사용자 클릭 시 전송 (채팅 API 연결 시 교체)
    document.getElementById("shareChatUserList").addEventListener("click", (e) => {
        const userBtn = e.target.closest(".share-sheet__user");
        if (!userBtn) return;
        const userName = userBtn.querySelector(".share-sheet__user-name").textContent;
        mainShareChatSheet.classList.add("off");
        showShareToast(userName + " 님에게 공유했습니다.");
    });

    mainShareChatSheet.querySelector(".share-sheet__backdrop").addEventListener("click", (e) => {
        mainShareChatSheet.classList.add("off");
    });
    mainShareChatSheet.querySelector(".share-sheet__icon-btn").addEventListener("click", (e) => {
        mainShareChatSheet.classList.add("off");
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest("#mainShareDropdown") && !e.target.closest(".tweet-action-btn--share")) {
            mainShareDropdown.classList.add("off");
        }
    });

    // ── 3. 이미지 미리보기 (이벤트 위임) ──
    const mediaPreviewOverlay = document.getElementById("mediaPreviewOverlay");
    const mediaPreviewImage = document.getElementById("mediaPreviewImage");
    const mediaPreviewClose = document.getElementById("mediaPreviewClose");

    document.addEventListener("click", (e) => {
        const img = e.target.closest(".postMediaImage");
        if (!img) return;
        mediaPreviewImage.src = img.src;
        mediaPreviewOverlay.classList.remove("off");
    });

    mediaPreviewClose.addEventListener("click", (e) => {
        mediaPreviewOverlay.classList.add("off");
    });

    mediaPreviewOverlay.addEventListener("click", (e) => {
        if (e.target === mediaPreviewOverlay) {
            mediaPreviewOverlay.classList.add("off");
        }
    });

    // ── 3-1. 게시글 클릭 시 상세 이동 ──
    document.addEventListener("click", (e) => {
        if (e.target.closest(".postAvatar, .postHeader, .postMedia, .tweet-action-bar")) return;
        const card = e.target.closest(".postCard");
        if (!card || card.classList.contains("postCard--ad")) return;
        const postId = card.dataset.postId;
        if (postId) {
            window.location.href = `/main/post/detail/${postId}?memberId=${memberId}`;
        }
    });

    // ── 4. 좌측 네비게이션 ──
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            navItems.forEach((nav) => { nav.classList.remove("active"); });
            item.classList.add("active");
        });
    });

    const navMore = document.getElementById("navMore");
    const navMoreLayer = document.getElementById("navMoreLayer");

    navMore.addEventListener("click", (e) => {
        e.stopPropagation();
        let isOpen = !navMoreLayer.classList.contains("off");
        if (isOpen) {
            navMoreLayer.classList.add("off");
        } else {
            let rect = navMore.getBoundingClientRect();
            let popover = document.getElementById("navMorePopover");
            popover.style.visibility = "hidden";
            navMoreLayer.classList.remove("off");
            popover.style.left = rect.left + "px";
            popover.style.top = (rect.top - popover.offsetHeight - 8) + "px";
            popover.style.visibility = "";
        }
    });

    navMoreLayer.querySelector(".nav-more-overlay").addEventListener("click", (e) => {
        navMoreLayer.classList.add("off");
    });

    const accountCard = document.getElementById("accountCard");
    const accountMenuPopup = document.getElementById("accountMenuPopup");

    accountCard.addEventListener("click", (e) => {
        e.stopPropagation();
        let isOpen = !accountMenuPopup.classList.contains("off");
        if (isOpen) {
            accountMenuPopup.classList.add("off");
        } else {
            accountMenuPopup.classList.remove("off");
        }
    });

    document.getElementById("accountLogoutButton").addEventListener("click", (e) => {
        let result = confirm("로그아웃 하시겠습니까?");
        if (result) {
            alert("로그아웃되었습니다.");
            accountMenuPopup.classList.add("off");
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest("#accountMenuPopup") && !e.target.closest("#accountCard")) {
            accountMenuPopup.classList.add("off");
        }
        if (!e.target.closest("#navMoreLayer") && !e.target.closest("#navMore")) {
            navMoreLayer.classList.add("off");
        }
    });

    // ── 5. 검색 ──
    const searchInput = document.getElementById("searchInput");
    const searchPanel = document.getElementById("searchPanel");
    const searchPanelEmpty = document.getElementById("searchPanelEmpty");
    const searchResults = document.getElementById("searchResults");

    const searchHistoryList = [];

    function renderSearchHistories(histories) {
        const panelEmpty = document.getElementById("searchPanelEmpty");
        if (!histories || histories.length === 0) {
            panelEmpty.innerHTML = '<p class="searchPanelText">인물이나 키워드를 검색해 보세요.</p>';
            return;
        }
        let html = '<div class="searchHistoryHeader" style="display:flex;justify-content:space-between;align-items:center;padding:8px 16px;">' +
            '<span style="font-weight:700;font-size:18px;">최근 검색</span>' +
            '<button type="button" id="clearAllHistories" style="color:#1d9bf0;font-size:13px;background:none;border:none;cursor:pointer;">전체 삭제</button></div>';
        html += '<div class="searchHistoryItems">';
        histories.forEach(h => {
            html += '<div class="searchHistoryItem" data-history-id="' + h.id + '" style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;cursor:pointer;">' +
                '<div style="display:flex;align-items:center;gap:12px;">' +
                '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:#71767b;"><g><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path></g></svg>' +
                '<span>' + h.searchKeyword + '</span></div>' +
                '<button type="button" class="deleteHistoryBtn" data-history-id="' + h.id + '" style="background:none;border:none;cursor:pointer;color:#71767b;font-size:16px;">✕</button></div>';
        });
        html += '</div>';
        panelEmpty.innerHTML = html;

        panelEmpty.querySelector("#clearAllHistories").addEventListener("click", async (e) => {
            e.stopPropagation();
            await service.deleteAllSearchHistories(memberId);
            renderSearchHistories([]);
        });

        panelEmpty.querySelectorAll(".deleteHistoryBtn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const historyId = btn.dataset.historyId;
                await service.deleteSearchHistory(historyId);
                btn.closest(".searchHistoryItem").remove();
            });
        });

        panelEmpty.querySelectorAll(".searchHistoryItem").forEach(item => {
            item.addEventListener("click", (e) => {
                if (e.target.closest(".deleteHistoryBtn")) return;
                const keyword = item.querySelector("span").textContent;
                searchInput.value = keyword;
                searchInput.dispatchEvent(new Event("input"));
            });
        });
    }

    searchInput.addEventListener("focus", async (e) => {
        searchPanel.classList.remove("off");
        if (searchInput.value.trim().length === 0) {
            const histories = await service.getSearchHistories(memberId);
            renderSearchHistories(histories);
            searchPanelEmpty.classList.remove("off");
            searchResults.classList.add("off");
        }
    });

    let searchTimer = null;
    searchInput.addEventListener("input", (e) => {
        const keyword = searchInput.value.trim();
        if (keyword.length > 0) {
            searchPanelEmpty.classList.add("off");
            searchResults.classList.remove("off");
            document.getElementById("searchResultLabel").textContent = keyword;

            clearTimeout(searchTimer);
            searchTimer = setTimeout(async () => {
                const members = await service.searchMembers(keyword);
                const listEl = document.getElementById("searchResultList");
                if (members.length === 0) {
                    listEl.innerHTML = '<p style="padding:16px;color:#71767b;text-align:center;">검색 결과가 없습니다.</p>';
                } else {
                    listEl.innerHTML = members.map(m => {
                        const initial = (m.memberNickname || m.memberName || "?").charAt(0);
                        const avatarHtml = m.memberProfileFileName
                            ? `<img class="searchResultAvatar" src="${m.memberProfileFileName}" />`
                            : `<img class="searchResultAvatar" src="${layout.buildAvatarDataUri(initial)}" />`;
                        return `<div class="searchResultItem" data-member-id="${m.id}">
                            ${avatarHtml}
                            <div class="searchResultProfile">
                                <span class="searchResultName">${m.memberNickname || m.memberName || ""}</span>
                                <span class="searchResultHandle">${m.memberHandle || ""}</span>
                            </div>
                        </div>`;
                    }).join("");
                }
            }, 300);
        } else {
            searchPanelEmpty.classList.remove("off");
            searchResults.classList.add("off");
        }
    });

    document.getElementById("searchResultTopic").addEventListener("click", async (e) => {
        const keyword = searchInput.value.trim();
        if (keyword) {
            await service.saveSearchHistory(memberId, keyword);
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".searchForm")) {
            searchPanel.classList.add("off");
        }
    });

    // ── 5-1. 팔로우 추천 (사이드바) ──
    const suggestionTitle = document.getElementById("suggestionTitle");
    const suggestionContainer = suggestionTitle ? suggestionTitle.closest(".suggestionCard") : null;

    // ── 6. Connect 버튼 토글 (이벤트 위임) ──
    const disconnectModal = document.getElementById("disconnectModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalConfirm = document.getElementById("modalConfirm");
    const modalCancel = document.getElementById("modalCancel");
    let disconnectTarget = null;

    function openDisconnectModal(btn) {
        if (!disconnectModal || !modalTitle) { return; }
        disconnectTarget = btn;
        const userCard = btn.closest("[data-handle]");
        const handle = userCard ? (userCard.dataset.handle || "") : "";
        modalTitle.textContent = handle ? (handle + " 님과의 연결을 끊으시겠습니까?") : "연결을 끊으시겠습니까?";
        disconnectModal.classList.add("active");
    }

    function closeDisconnectModal() {
        if (!disconnectModal) { return; }
        disconnectModal.classList.remove("active");
        disconnectTarget = null;
    }

    document.addEventListener("click", async (e) => {
        const connectBtn = e.target.closest(".connect-btn, .connect-btn-sm");
        if (!connectBtn) return;
        e.stopPropagation();
        const targetMemberId = connectBtn.dataset.memberId;
        if (connectBtn.classList.contains("default")) {
            await service.follow(memberId, targetMemberId);
            connectBtn.classList.remove("default");
            connectBtn.classList.add("connected");
            connectBtn.textContent = "Connected";
        } else {
            openDisconnectModal(connectBtn);
        }
    });

    if (modalConfirm) {
        modalConfirm.addEventListener("click", async (e) => {
            if (disconnectTarget) {
                const targetMemberId = disconnectTarget.dataset.memberId;
                await service.unfollow(memberId, targetMemberId);
                disconnectTarget.classList.remove("connected");
                disconnectTarget.classList.add("default");
                disconnectTarget.textContent = "Connect";
            }
            closeDisconnectModal();
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener("click", (e) => {
            closeDisconnectModal();
        });
    }

    if (disconnectModal) {
        disconnectModal.addEventListener("click", (e) => {
            if (e.target === disconnectModal) { closeDisconnectModal(); }
        });
    }

    // ── 7. 게시글 작성 모달 ──
    let resetCompose = null;
    let resetReply = null;
    const composeOverlay = document.querySelector("[data-compose-modal]");
    const composeClose = composeOverlay.querySelector(".tweet-modal__close");
    const composeEditor = composeOverlay.querySelector(".tweet-modal__editor");
    const composeGaugeText = composeOverlay.querySelector(".composerGaugeText");
    const composeSubmit = composeOverlay.querySelector(".tweet-modal__submit");
    const composeMaxLength = 500;
    let editPostId = null;

    const createPostButton = document.getElementById("createPostButton");
    createPostButton.addEventListener("click", (e) => {
        composeOverlay.classList.remove("off");
        composeEditor.focus();
        const cs = composeOverlay.querySelector(".category-scroll");
        if (cs) { requestAnimationFrame(() => { cs.dispatchEvent(new Event("scroll")); }); }
    });

    async function openEditModal(postId) {
        const post = await service.getPost(postId, memberId);
        editPostId = postId;

        composeOverlay.classList.remove("off");
        composeEditor.textContent = post.postContent || "";
        composeEditor.dispatchEvent(new Event("input"));
        composeSubmit.textContent = "수정";

        // 태그 복원
        if (post.hashtags && post.hashtags.length > 0) {
            post.hashtags.forEach(h => composeCtx.addTag(h.tagName));
        }

        // 위치 복원
        if (post.location) {
            composeCtx.setLocation(post.location);
        }

        // 첨부파일 복원
        if (post.postFiles && post.postFiles.length > 0) {
            composeCtx.setExistingFiles(post.postFiles);
        }

        composeEditor.focus();
    }

    function closeComposeModal() {
        composeOverlay.classList.add("off");
        composeEditor.innerHTML = "";
        composeGaugeText.textContent = composeMaxLength;
        composeGaugeText.style.color = "";
        composeSubmit.disabled = true;
        editPostId = null;
        composeSubmit.textContent = "게시";
        if (resetCompose) { resetCompose(); }
    }

    composeClose.addEventListener("click", (e) => { closeComposeModal(); });

    composeOverlay.addEventListener("click", (e) => {
        if (e.target === composeOverlay) { closeComposeModal(); }
    });

    composeEditor.addEventListener("input", (e) => {
        let length = composeEditor.textContent.length;
        let remaining = composeMaxLength - length;
        composeGaugeText.textContent = remaining;
        if (remaining < 0) {
            composeGaugeText.style.color = "rgb(244, 33, 46)";
            composeSubmit.disabled = true;
        } else if (remaining < 20) {
            composeGaugeText.style.color = "rgb(255, 173, 31)";
            composeSubmit.disabled = false;
        } else {
            composeGaugeText.style.color = "";
            composeSubmit.disabled = length === 0;
        }
    });

    composeSubmit.addEventListener("click", async (e) => {
        if (composeEditor.textContent.length === 0) { return; }

        const formData = new FormData();
        formData.append("memberId", memberId);
        formData.append("postContent", composeEditor.textContent);

        const files = composeCtx.getAttachedFiles();
        if (files.length > 0) {
            files.forEach(f => formData.append("files", f));
        }

        const tags = composeCtx.getTags();
        tags.forEach((tag, i) => {
            formData.append(`hashtags[${i}].tagName`, tag.textContent.replace("#", ""));
        });

        const location = composeCtx.getSelectedLocation();
        if (location) {
            formData.append("location", location);
        }

        if (editPostId) {
            await service.updatePost(editPostId, formData);
        } else {
            await service.writePost(formData);
        }
        closeComposeModal();

        postPage = 1;
        await service.getPostList(postPage, memberId, (data) => {
            const posts = layout.showPostList(data.posts, postPage);
            initFollowState(posts);
            postHasMore = data.criteria.hasMore;
        });
    });

    // ── 8. 답글 모달 ──
    const replyOverlay = document.querySelector("[data-reply-modal]");
    const replyClose = replyOverlay.querySelector(".tweet-modal__close");
    const replyEditor = replyOverlay.querySelector(".tweet-modal__editor");
    const replyGaugeText = replyOverlay.querySelector(".composerGaugeText");
    const replySubmit = replyOverlay.querySelector(".tweet-modal__submit");
    const replyMaxLength = 500;
    let replyTargetPostId = null;

    document.addEventListener("click", (e) => {
        const replyBtn = e.target.closest(".tweet-action-btn[data-action='reply']");
        if (!replyBtn) return;
        const card = replyBtn.closest(".postCard");
        replyTargetPostId = card ? card.dataset.postId : null;

        // 원글 작성자 정보를 답글 모달에 세팅
        if (card) {
            const sourceName = card.querySelector(".postName")?.textContent || "";
            const sourceHandle = card.querySelector(".postHandle")?.textContent || "";
            const sourceTime = card.querySelector(".postTime")?.textContent || "";
            const sourceText = card.querySelector(".postText")?.textContent || "";
            const sourceAvatarImg = card.querySelector(".postAvatarImage");
            const sourceInitial = card.querySelector(".postAvatar")?.textContent?.trim() || "?";

            document.getElementById("replyContextButton").textContent = sourceName + " " + sourceHandle + " 님에게 보내는 답글";
            document.getElementById("replySourceName").textContent = sourceName;
            document.getElementById("replySourceHandle").textContent = sourceHandle;
            document.getElementById("replySourceTime").textContent = sourceTime;
            document.getElementById("replySourceText").textContent = sourceText;

            const sourceAvatarEl = document.getElementById("replySourceAvatar");
            if (sourceAvatarEl) {
                sourceAvatarEl.innerHTML = sourceAvatarImg
                    ? `<img src="${sourceAvatarImg.src}" alt="" />`
                    : `<img src="${layout.buildAvatarDataUri(sourceInitial)}" alt="" />`;
            }
        }

        replyOverlay.classList.remove("off");
        replyEditor.focus();
    });

    function closeReplyModal() {
        replyOverlay.classList.add("off");
        replyEditor.innerHTML = "";
        replyGaugeText.textContent = replyMaxLength;
        replyGaugeText.style.color = "";
        replySubmit.disabled = true;
        replyTargetPostId = null;
        if (resetReply) { resetReply(); }
    }

    replyClose.addEventListener("click", (e) => { closeReplyModal(); });

    replyOverlay.addEventListener("click", (e) => {
        if (e.target === replyOverlay) { closeReplyModal(); }
    });

    replyEditor.addEventListener("input", (e) => {
        let length = replyEditor.textContent.length;
        let remaining = replyMaxLength - length;
        replyGaugeText.textContent = remaining;
        if (remaining < 0) {
            replyGaugeText.style.color = "rgb(244, 33, 46)";
            replySubmit.disabled = true;
        } else if (remaining < 20) {
            replyGaugeText.style.color = "rgb(255, 173, 31)";
            replySubmit.disabled = false;
        } else {
            replyGaugeText.style.color = "";
            replySubmit.disabled = length === 0;
        }
    });

    replySubmit.addEventListener("click", async (e) => {
        if (replyEditor.textContent.length === 0) { return; }
        if (replyTargetPostId) {
            const replyFormData = new FormData();
            replyFormData.append("memberId", memberId);
            replyFormData.append("postContent", replyEditor.textContent);
            await service.writeReply(replyTargetPostId, replyFormData);
        }
        closeReplyModal();
    });

    // ── 9. 서브뷰 토글 (게시물 + 답글 공통) ──
    // main.js의 setupSubViews 그대로 가져옴 (태그, 카테고리, 임시저장, 위치, 판매글, 볼드/이탤릭, 이모지, 파일첨부)
    function setupSubViews(overlay) {
        const composeView = overlay.querySelector(".tweet-modal__compose-view");
        const locationView = overlay.querySelector(".tweet-modal__location-view");
        const tagView = overlay.querySelector(".tweet-modal__tag-view");
        const mediaView = overlay.querySelector(".tweet-modal__media-view");
        const postTempView = overlay.querySelector(".tweet-modal__draft-view");
        const productView = overlay.querySelector(".tweet-modal__product-view");

        const allSubViews = [locationView, tagView, mediaView, postTempView, productView];

        function showSubView(view) {
            composeView.classList.add("off");
            for (let i = 0; i < allSubViews.length; i++) {
                if (allSubViews[i]) { allSubViews[i].classList.add("off"); }
            }
            if (view) { view.classList.remove("off"); }
        }

        function backToCompose() {
            for (let i = 0; i < allSubViews.length; i++) {
                if (allSubViews[i]) { allSubViews[i].classList.add("off"); }
            }
            composeView.classList.remove("off");
        }

        // 게시판 선택
        const audienceBtn = overlay.querySelector(".audienceButton");
        const boardMenu = document.getElementById("boardMenu");
        const boardOptions = document.querySelectorAll(".boardMenuOption");
        const communityItems = document.querySelectorAll(".communityMenuItem");

        if (audienceBtn && boardMenu) {
            audienceBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                let isOpen = !boardMenu.classList.contains("off");
                if (isOpen) {
                    boardMenu.classList.add("off");
                } else {
                    const rect = audienceBtn.getBoundingClientRect();
                    boardMenu.style.left = rect.left + "px";
                    boardMenu.style.top = (rect.bottom + 8) + "px";
                    boardMenu.classList.remove("off");
                }
            });
            boardOptions.forEach((option) => {
                option.addEventListener("click", (e) => {
                    boardOptions.forEach((opt) => { opt.classList.remove("isSelected"); });
                    communityItems.forEach((ci) => { ci.classList.remove("isSelected"); });
                    option.classList.add("isSelected");
                    audienceBtn.textContent = option.querySelector(".boardMenuOptionLabel").textContent;
                    boardMenu.classList.add("off");
                });
            });
            communityItems.forEach((item) => {
                item.addEventListener("click", (e) => {
                    boardOptions.forEach((opt) => { opt.classList.remove("isSelected"); });
                    communityItems.forEach((ci) => { ci.classList.remove("isSelected"); });
                    item.classList.add("isSelected");
                    audienceBtn.textContent = item.querySelector(".communityMenuName").textContent;
                    boardMenu.classList.add("off");
                });
            });
        }

        // 태그 추가
        const tagToggle = overlay.querySelector(".composerTagLabel");
        const tagEditor = overlay.querySelector(".composerTagEditor");
        const tagField = overlay.querySelector(".composerTagField");
        const tagDock = overlay.querySelector(".composerAudienceTagDock");
        const tagInput = overlay.querySelector(".tag-input");
        const specialCharRegex = /[\{\}\[\]\?.,;:|\)*~`!^\-_+<>@\#$%&\\=\(\'\"]/;
        let isTagEditorOpen = false;

        function getTagDivs() {
            if (!tagInput) { return []; }
            const nodes = tagInput.querySelectorAll(".tagDiv");
            let result = [];
            for (let i = 0; i < nodes.length; i++) { result.push(nodes[i]); }
            return result;
        }

        function syncTagUI() {
            if (!tagToggle || !tagEditor) { return; }
            const hasTags = getTagDivs().length > 0;
            tagEditor.classList.toggle("off", !isTagEditorOpen);
            if (tagInput) { tagInput.classList.toggle("off", !hasTags); }
            if (isTagEditorOpen) {
                tagToggle.textContent = "태그 닫기";
            } else {
                tagToggle.textContent = "태그 추가";
                if (tagField) { tagField.value = ""; }
            }
        }

        function addTag(rawTag) {
            const tag = (rawTag || "").trim();
            if (!tag) { return false; }
            if (getTagDivs().length >= 5) { alert("태그는 최대 5개까지 추가할 수 있어요"); if (tagField) { tagField.value = ""; } return false; }
            if (specialCharRegex.test(tag)) { alert("특수문자는 입력 못해요"); if (tagField) { tagField.value = ""; } return false; }
            const existing = getTagDivs();
            for (let i = 0; i < existing.length; i++) {
                if (existing[i].textContent === "#" + tag) { alert("중복된 태그가 있어요"); if (tagField) { tagField.value = ""; } return false; }
            }
            const span = document.createElement("span");
            span.className = "tagDiv";
            span.textContent = "#" + tag;
            if (tagInput) { tagInput.appendChild(span); }
            if (tagField) { tagField.value = ""; }
            isTagEditorOpen = false;
            syncTagUI();
            return true;
        }

        if (tagToggle) {
            tagToggle.addEventListener("click", (e) => {
                isTagEditorOpen = !isTagEditorOpen;
                syncTagUI();
                if (isTagEditorOpen && tagField) { tagField.focus(); }
            });
        }
        if (tagField) {
            tagField.addEventListener("keyup", (e) => {
                if (e.key === "Enter" && tagField.value) { e.preventDefault(); addTag(tagField.value); }
                if (e.key === "Escape") { isTagEditorOpen = false; syncTagUI(); if (tagToggle) { tagToggle.focus(); } }
            });
            tagField.addEventListener("focus", (e) => { isTagEditorOpen = true; syncTagUI(); });
        }
        if (tagInput) {
            tagInput.addEventListener("click", (e) => {
                if (e.target.classList.contains("tagDiv")) { e.target.remove(); syncTagUI(); }
            });
        }

        // 카테고리 칩 + 스크롤
        const catScroll = overlay.querySelector(".category-scroll");
        const catLeft = overlay.querySelector(".category-scroll-left");
        const catRight = overlay.querySelector(".category-scroll-right");
        let originalChipsHTML = catScroll ? catScroll.innerHTML : "";

        function checkCatScroll() {
            if (!catScroll || !catLeft || !catRight) { return; }
            catLeft.classList.toggle("off", catScroll.scrollLeft <= 0);
            catRight.classList.toggle("off", catScroll.scrollLeft >= catScroll.scrollWidth - catScroll.clientWidth - 1);
        }

        if (catScroll) {
            catScroll.addEventListener("scroll", (e) => { checkCatScroll(); });
            catScroll.addEventListener("click", (e) => {
                const chip = e.target.closest(".cat-chip");
                const backBtn = e.target.closest(".cat-back-btn");
                if (backBtn) { catScroll.innerHTML = originalChipsHTML; catScroll.scrollLeft = 0; setTimeout(checkCatScroll, 50); return; }
                if (!chip) { return; }
                if (chip.classList.contains("has-subs")) {
                    const catName = chip.textContent.replace(" ›", "");
                    const subs = chip.getAttribute("data-subs");
                    if (!subs) { return; }
                    const subList = subs.split(",");
                    let html = '<button type="button" class="cat-back-btn"><svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(180 12 12)" fill="currentColor"/></svg></button>';
                    html += '<button type="button" class="cat-chip parent-highlight">' + catName + '</button>';
                    for (let i = 0; i < subList.length; i++) { html += '<button type="button" class="cat-chip" data-is-sub="true">' + subList[i] + '</button>'; }
                    catScroll.innerHTML = html;
                    catScroll.scrollLeft = 0;
                    setTimeout(checkCatScroll, 50);
                    return;
                }
                const chipText = chip.textContent.trim();
                if (chipText === "전체") { return; }
                addTag(chipText);
                const allChips = catScroll.querySelectorAll(".cat-chip:not(.parent-highlight)");
                for (let i = 0; i < allChips.length; i++) { allChips[i].classList.remove("active", "sub-active"); }
                if (chip.getAttribute("data-is-sub")) { chip.classList.add("sub-active"); } else { chip.classList.add("active"); }
            });
        }
        if (catLeft) { catLeft.addEventListener("click", (e) => { catScroll.scrollBy({ left: -200, behavior: "smooth" }); }); }
        if (catRight) { catRight.addEventListener("click", (e) => { catScroll.scrollBy({ left: 200, behavior: "smooth" }); }); }
        checkCatScroll();

        // 임시저장
        const postTempBtn = overlay.querySelector(".tweet-modal__draft");
        const postTempList = postTempView ? postTempView.querySelector(".draft-panel__list") : null;
        const postTempEmpty = postTempView ? postTempView.querySelector(".draft-panel__empty") : null;
        const postTempFooter = postTempView ? postTempView.querySelector(".draft-panel__footer") : null;
        const postTempSelectAll = postTempView ? postTempView.querySelector(".draft-panel__select-all") : null;
        const postTempFooterDelete = postTempView ? postTempView.querySelector(".draft-panel__footer-delete") : null;
        const postTempConfirmOverlay = postTempView ? postTempView.querySelector(".draft-panel__confirm-overlay") : null;
        const postTempConfirmPrimary = postTempConfirmOverlay ? postTempConfirmOverlay.querySelector(".draft-panel__confirm-primary") : null;
        const postTempConfirmSecondary = postTempConfirmOverlay ? postTempConfirmOverlay.querySelector(".draft-panel__confirm-secondary") : null;
        const modalEditor = overlay.querySelector(".tweet-modal__editor");
        let postTemps = [];
        let selectedPostTempIndexes = [];

        async function loadPostTemps() {
            postTemps = await service.getPostTemps(memberId);
            console.log("목록들어옴", postTemps.length, postTemps);
        }

        function updatePostTempFooter() {
            if (!postTempFooter) { return; }
            postTempFooter.classList.toggle("off", postTemps.length === 0);
            if (postTempFooterDelete) { postTempFooterDelete.disabled = selectedPostTempIndexes.length === 0; }
            if (postTempSelectAll) { postTempSelectAll.textContent = (postTemps.length > 0 && selectedPostTempIndexes.length === postTemps.length) ? "전체 해제" : "모두 선택"; }
        }

        function isSelected(idx) { for (let i = 0; i < selectedPostTempIndexes.length; i++) { if (selectedPostTempIndexes[i] === idx) { return true; } } return false; }
        function togglePostTempSelect(idx) {
            if (isSelected(idx)) { let next = []; for (let i = 0; i < selectedPostTempIndexes.length; i++) { if (selectedPostTempIndexes[i] !== idx) { next.push(selectedPostTempIndexes[i]); } } selectedPostTempIndexes = next; }
            else { selectedPostTempIndexes.push(idx); }
            syncPostTempCheckboxes(); updatePostTempFooter();
        }

        function syncPostTempCheckboxes() {
            if (!postTempList) { return; }
            const items = postTempList.querySelectorAll(".draft-panel__item");
            for (let i = 0; i < items.length; i++) {
                const idx = parseInt(items[i].getAttribute("data-draft-index"));
                const cb = items[i].querySelector(".draft-panel__item-checkbox");
                if (isSelected(idx)) { items[i].classList.add("draft-panel__item--selected"); if (cb) { cb.checked = true; } }
                else { items[i].classList.remove("draft-panel__item--selected"); if (cb) { cb.checked = false; } }
            }
        }

        function renderPostTempList() {
            console.log("목록그림 개수:", postTemps.length);
            selectedPostTempIndexes = [];
            if (!postTempList) { return; }
            if (postTemps.length === 0) { postTempList.innerHTML = ""; if (postTempEmpty) { postTempEmpty.classList.remove("off"); } updatePostTempFooter(); return; }
            if (postTempEmpty) { postTempEmpty.classList.add("off"); }
            let html = "";
            for (let i = 0; i < postTemps.length; i++) {
                const d = postTemps[i];
                html += '<div class="draft-panel__item" data-draft-index="' + i + '" data-draft-id="' + d.id + '"><input type="checkbox" class="draft-panel__item-checkbox" data-draft-check="' + i + '" /><button type="button" class="draft-panel__item-load" data-draft-load="' + i + '"><span class="draft-panel__item-body"><span class="draft-panel__text">' + d.postTempContent + '</span><span class="draft-panel__date">' + (d.createdDatetime || "") + '</span></span></button><span class="draft-panel__item-delete" data-draft-delete="' + i + '">✕</span></div>';
            }
            postTempList.innerHTML = html;
            updatePostTempFooter();
        }

        async function savePostTempFromEditor() {
            if (!modalEditor) { return; }
            const text = modalEditor.textContent.trim();
            if (!text) { return; }
            const tempLocation = selectedLocation || null;
            const tagDivs = getTagDivs();
            const tempTags = tagDivs.length > 0 ? JSON.stringify(tagDivs.map(t => t.textContent.replace("#", ""))) : null;
            console.log("임시저장함 내용:", text, "위치:", tempLocation, "태그:", tempTags);
            await service.savePostTemp(memberId, text, tempLocation, tempTags);
            await loadPostTemps();
        }

        async function loadPostTempToEditor(index) {
            console.log("목록불러옴 index:", index, "id:", postTemps[index]?.id);
            if (!modalEditor || !postTemps[index]) { return; }
            const loaded = await service.loadPostTemp(postTemps[index].id);
            console.log("목록가져옴 내용:", loaded.postTempContent, "위치:", loaded.postTempLocation, "태그:", loaded.postTempTags);
            modalEditor.textContent = loaded.postTempContent;

            // 기존 태그 초기화 후 복원
            const oldTags = getTagDivs();
            for (let i = 0; i < oldTags.length; i++) { oldTags[i].remove(); }
            if (loaded.postTempTags) {
                JSON.parse(loaded.postTempTags).forEach(tag => addTag(tag));
            }
            syncTagUI();

            // 위치 복원
            selectedLocation = loaded.postTempLocation || null;
            updateLocationUI();

            postTemps.splice(index, 1);
            modalEditor.dispatchEvent(new Event("input"));
            backToCompose();
        }

        if (postTempBtn && postTempView) {
            postTempBtn.addEventListener("click", async (e) => {
                if (modalEditor && modalEditor.textContent.trim()) {
                    await savePostTempFromEditor(); modalEditor.innerHTML = "";
                    modalEditor.dispatchEvent(new Event("input"));
                    // 태그/위치 초기화
                    const oldTags = getTagDivs();
                    for (let i = 0; i < oldTags.length; i++) { oldTags[i].remove(); }
                    syncTagUI();
                    selectedLocation = null;
                    updateLocationUI();
                }
                await loadPostTemps();
                renderPostTempList();
                showSubView(postTempView);
            });
        }
        const postTempBack = postTempView ? postTempView.querySelector(".draft-panel__back") : null;
        if (postTempBack) { postTempBack.addEventListener("click", (e) => { backToCompose(); }); }
        let pendingDeleteIndexes = [];

        if (postTempList) {
            postTempList.addEventListener("click", (e) => {
                const checkbox = e.target.closest("[data-draft-check]");
                if (checkbox) { togglePostTempSelect(parseInt(checkbox.getAttribute("data-draft-check"))); return; }
                const deleteBtn = e.target.closest("[data-draft-delete]");
                if (deleteBtn) { pendingDeleteIndexes = [parseInt(deleteBtn.getAttribute("data-draft-delete"))]; if (postTempConfirmOverlay) { postTempConfirmOverlay.classList.remove("off"); } return; }
                const loadBtn = e.target.closest("[data-draft-load]");
                if (loadBtn) { loadPostTempToEditor(parseInt(loadBtn.getAttribute("data-draft-load"))); }
            });
        }
        if (postTempSelectAll) {
            postTempSelectAll.addEventListener("click", (e) => {
                if (selectedPostTempIndexes.length === postTemps.length) { selectedPostTempIndexes = []; }
                else { selectedPostTempIndexes = []; for (let i = 0; i < postTemps.length; i++) { selectedPostTempIndexes.push(i); } }
                syncPostTempCheckboxes(); updatePostTempFooter();
            });
        }
        if (postTempFooterDelete) {
            postTempFooterDelete.addEventListener("click", (e) => {
                if (selectedPostTempIndexes.length === 0) { return; }
                pendingDeleteIndexes = []; for (let i = 0; i < selectedPostTempIndexes.length; i++) { pendingDeleteIndexes.push(selectedPostTempIndexes[i]); }
                if (postTempConfirmOverlay) { postTempConfirmOverlay.classList.remove("off"); }
            });
        }
        if (postTempConfirmPrimary) {
            postTempConfirmPrimary.addEventListener("click", async (e) => {
                const idsToDelete = pendingDeleteIndexes.map(idx => postTemps[idx].id);
                await service.deletePostTemps(idsToDelete);
                pendingDeleteIndexes = [];
                await loadPostTemps();
                if (postTempConfirmOverlay) { postTempConfirmOverlay.classList.add("off"); }
                renderPostTempList();
            });
        }
        if (postTempConfirmSecondary) { postTempConfirmSecondary.addEventListener("click", (e) => { if (postTempConfirmOverlay) { postTempConfirmOverlay.classList.add("off"); } }); }

        // 위치

        const geoBtn = overlay.querySelector(".tweet-modal__tool-btn--geo");
        const locationList = locationView ? locationView.querySelector("[data-location-list]") : null;
        const locationSearchInput = locationView ? locationView.querySelector("[data-location-search]") : null;
        const locationSearchBtn = locationView ? locationView.querySelector("[data-location-search-btn]") : null;
        const locationClose = locationView ? locationView.querySelector(".tweet-modal__location-close") : null;
        const locationDeleteBtn = locationView ? locationView.querySelector("[data-location-delete]") : null;
        const locationCompleteBtn = locationView ? locationView.querySelector("[data-location-complete]") : null;
        const locationDisplay = overlay.querySelector(".tweet-modal__location-display");
        const locationDisplayText = locationDisplay ? locationDisplay.querySelector(".tweet-modal__location-display-text-inner") : null;
        let selectedLocation = null;

        function updateLocationUI() {
            if (locationDisplay && locationDisplayText) {
                if (selectedLocation) { locationDisplayText.value = selectedLocation; locationDisplay.removeAttribute("hidden"); }
                else { locationDisplayText.value = ""; locationDisplay.setAttribute("hidden", ""); }
            }
            if (locationDeleteBtn) { locationDeleteBtn.hidden = !selectedLocation; }
            if (locationCompleteBtn) { locationCompleteBtn.disabled = !selectedLocation; }
        }

        function searchPlaces() {
            console.log("searchPlaces 호출됨");
            var keyword = locationSearchInput.value;
            console.log("keyword:", keyword);
            if (!keyword.replace(/^\s+|\s+$/g, '')) {
                alert('키워드를 입력해주세요!');
                return false;
            }
            if (!ps) { ps = new kakao.maps.services.Places(); }
            console.log("카카오받아옴");
            ps.keywordSearch(keyword, placesSearchCB);
        }

        function placesSearchCB(datas, status) {
            if (status === kakao.maps.services.Status.OK) {
                const addressNameSet = new Set();
                datas.forEach((data) => {
                    let addressName = data.address_name;
                    const addressNames = addressName.split(" ");
                    const lastPart = addressNames[addressNames.length - 1];
                    const addressRegex = /^[0-9-]+$/;
                    if (addressRegex.test(lastPart)) {
                        addressName = addressNames.slice(0, -1).join(" ");
                    }
                    addressNameSet.add(addressName);
                });
                let html = '';
                addressNameSet.forEach((addressName) => {
                    html += '<button type="button" class="tweet-modal__location-item">' +
                        '<span class="tweet-modal__location-item-label">' + addressName + '</span>' +
                        '<span class="tweet-modal__location-item-check"></span>' +
                        '</button>';
                });
                locationList.innerHTML = html;
            } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
                alert('검색 결과가 존재하지 않습니다.');
                return;
            } else if (status === kakao.maps.services.Status.ERROR) {
                alert('검색 결과 중 오류가 발생했습니다.');
                return;
            }
        }

        if (geoBtn && locationView) {
            geoBtn.addEventListener("click", (e) => {
                showSubView(locationView);
                if (locationSearchInput) { locationSearchInput.value = ''; }
                if (locationList) { locationList.innerHTML = ''; }
                updateLocationUI();
            });
        }

        if (locationSearchBtn) {
            locationSearchBtn.addEventListener("click", (e) => {
                searchPlaces();
            });
        }

        if (locationList) {
            locationList.addEventListener("click", (e) => {
                const item = e.target.closest(".tweet-modal__location-item");
                if (!item) { return; }
                const allItems = locationList.querySelectorAll(".tweet-modal__location-item");
                for (let i = 0; i < allItems.length; i++) { allItems[i].classList.remove("isSelected"); }
                item.classList.add("isSelected");
                selectedLocation = item.querySelector(".tweet-modal__location-item-label").textContent;
                updateLocationUI();
                backToCompose();
            });
        }

        if (locationDeleteBtn) {
            locationDeleteBtn.addEventListener("click", (e) => {
                selectedLocation = null;
                updateLocationUI();
                if (locationList) { const allItems = locationList.querySelectorAll(".tweet-modal__location-item"); for (let i = 0; i < allItems.length; i++) { allItems[i].classList.remove("isSelected"); } }
                backToCompose();
            });
        }

        if (locationCompleteBtn) {
            locationCompleteBtn.addEventListener("click", (e) => { backToCompose(); });
        }

        if (locationClose) { locationClose.addEventListener("click", (e) => { backToCompose(); }); }

        // 태그 서브뷰
        const tagClose = tagView ? tagView.querySelector(".tweet-modal__tag-close") : null;
        if (tagClose) { tagClose.addEventListener("click", (e) => { backToCompose(); }); }
        const tagComplete = tagView ? tagView.querySelector("[data-tag-complete]") : null;
        if (tagComplete) { tagComplete.addEventListener("click", (e) => { backToCompose(); }); }

        // 미디어
        const mediaBack = mediaView ? mediaView.querySelector(".tweet-modal__media-header-btn--ghost") : null;
        if (mediaBack) { mediaBack.addEventListener("click", (e) => { backToCompose(); }); }
        const mediaSave = mediaView ? mediaView.querySelector("[data-media-save]") : null;
        if (mediaSave) { mediaSave.addEventListener("click", (e) => { backToCompose(); }); }

        // 판매글 선택
        const productBtn = overlay.querySelector(".tweet-modal__tool-btn--product");
        const productClose = productView ? productView.querySelector("[data-product-select-close]") : null;
        const productComplete = productView ? productView.querySelector("[data-product-select-complete]") : null;
        const productList = productView ? productView.querySelector("[data-product-select-list]") : null;
        const productEmpty = productView ? productView.querySelector("[data-product-empty]") : null;
        let selectedProduct = null;

        function renderProductList(products) {
            if (!productList) { return; }
            if (!products || products.length === 0) { productList.innerHTML = ""; if (productEmpty) { productEmpty.classList.remove("off"); } return; }
            if (productEmpty) { productEmpty.classList.add("off"); }
            let html = "";
            for (let i = 0; i < products.length; i++) {
                const p = products[i];
                const img = (p.postFiles && p.postFiles.length > 0) ? p.postFiles[0].filePath : "";
                const tags = (p.hashtags && p.hashtags.length > 0) ? p.hashtags.map(t => "#" + t.tagName).join(" ") : "";
                html += '<button type="button" class="draft-panel__item draft-panel__item--selectable" data-product-id="' + p.id + '">' +
                    '<span class="draft-panel__checkbox"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9 20c-.264 0-.518-.104-.707-.293l-4.785-4.785 1.414-1.414L9 17.586 19.072 7.5l1.42 1.416L9.708 19.7c-.188.19-.442.3-.708.3z"></path></g></svg></span>' +
                    (img ? '<img class="draft-panel__avatar" src="' + img + '" />' : '') +
                    '<span class="draft-panel__item-body">' +
                    '<span class="draft-panel__text">' + (p.postTitle || "") + '</span>' +
                    '<span class="draft-panel__meta">' + tags + '</span>' +
                    '<span class="draft-panel__date">₩' + (p.productPrice || 0).toLocaleString() + ' · ' + (p.productStock || 0) + '개</span>' +
                    '</span></button>';
            }
            productList.innerHTML = html;
        }

        function renderSelectedProduct() {
            const existing = overlay.querySelector("[data-selected-product]");
            if (existing) { existing.remove(); }
            if (!selectedProduct) { return; }
            const editorWrap = overlay.querySelector(".tweet-modal__input-wrap");
            if (!editorWrap) { return; }
            const card = document.createElement("div");
            card.setAttribute("data-selected-product", "");
            card.className = "tweet-modal__selected-product";
            card.innerHTML = '<div class="selected-product__card">' +
                (selectedProduct.image ? '<img class="selected-product__image" src="' + selectedProduct.image + '" />' : '') +
                '<div class="selected-product__info"><strong class="selected-product__name">' + selectedProduct.name + '</strong><span class="selected-product__price">' + selectedProduct.price + '</span></div>' +
                '<button type="button" class="selected-product__remove"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div>';
            card.querySelector(".selected-product__remove").addEventListener("click", (e) => {
                selectedProduct = null; card.remove(); if (productBtn) { productBtn.disabled = false; }
            });
            editorWrap.appendChild(card);
        }

        if (productBtn && productView) {
            productBtn.addEventListener("click", async (e) => {
                const products = await service.getMyProducts(memberId);
                renderProductList(products);
                showSubView(productView);
            });
        }
        if (productClose) { productClose.addEventListener("click", (e) => { backToCompose(); }); }
        if (productComplete) {
            productComplete.addEventListener("click", (e) => {
                const checkedItem = productList ? productList.querySelector(".draft-panel__item--selected") : null;
                if (checkedItem) {
                    selectedProduct = {
                        name: checkedItem.querySelector(".draft-panel__text").textContent,
                        price: checkedItem.querySelector(".draft-panel__date").textContent,
                        image: checkedItem.querySelector(".draft-panel__avatar") ? checkedItem.querySelector(".draft-panel__avatar").src : "",
                        id: checkedItem.getAttribute("data-product-id")
                    };
                    renderSelectedProduct();
                    if (productBtn) { productBtn.disabled = true; }
                }
                backToCompose();
            });
        }
        if (productList) {
            productList.addEventListener("click", (e) => {
                const item = e.target.closest(".draft-panel__item");
                if (!item) { return; }
                const wasSelected = item.classList.contains("draft-panel__item--selected");
                const allItems = productList.querySelectorAll(".draft-panel__item--selected");
                for (let i = 0; i < allItems.length; i++) { allItems[i].classList.remove("draft-panel__item--selected"); const cb = allItems[i].querySelector(".draft-panel__checkbox"); if (cb) { cb.classList.remove("draft-panel__checkbox--checked"); } }
                if (!wasSelected) { item.classList.add("draft-panel__item--selected"); const cb = item.querySelector(".draft-panel__checkbox"); if (cb) { cb.classList.add("draft-panel__checkbox--checked"); } }
                if (productComplete) { productComplete.disabled = !productList.querySelector(".draft-panel__item--selected"); }
            });
        }

        // 볼드/이탤릭
        const boldBtn = overlay.querySelector(".tweet-modal__tool-btn--bold");
        const italicBtn = overlay.querySelector(".tweet-modal__tool-btn--italic");
        const editorEl = overlay.querySelector(".tweet-modal__editor");

        function syncFormatButtons() {
            if (boldBtn) { boldBtn.classList.toggle("active", document.queryCommandState("bold")); }
            if (italicBtn) { italicBtn.classList.toggle("active", document.queryCommandState("italic")); }
        }
        if (boldBtn && editorEl) { boldBtn.addEventListener("click", (e) => { editorEl.focus(); document.execCommand("bold"); syncFormatButtons(); }); }
        if (italicBtn && editorEl) { italicBtn.addEventListener("click", (e) => { editorEl.focus(); document.execCommand("italic"); syncFormatButtons(); }); }
        if (editorEl) { editorEl.addEventListener("keyup", (e) => { syncFormatButtons(); }); editorEl.addEventListener("mouseup", (e) => { syncFormatButtons(); }); }

        // 이모지 피커
        const emojiBtn = overlay.querySelector(".tweet-modal__tool-btn--emoji");
        const editor = overlay.querySelector(".tweet-modal__editor");
        let savedRange = null;

        if (editor) {
            editor.addEventListener("keyup", (e) => { const sel = window.getSelection(); if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) { savedRange = sel.getRangeAt(0).cloneRange(); } });
            editor.addEventListener("mouseup", (e) => { const sel = window.getSelection(); if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) { savedRange = sel.getRangeAt(0).cloneRange(); } });
            editor.addEventListener("input", (e) => { const sel = window.getSelection(); if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) { savedRange = sel.getRangeAt(0).cloneRange(); } });
        }

        function insertEmojiToEditor(emoji) {
            if (!editor) { return; }
            editor.focus();
            const sel = window.getSelection();
            if (savedRange && editor.contains(savedRange.startContainer)) { sel.removeAllRanges(); sel.addRange(savedRange); }
            const textNode = document.createTextNode(emoji);
            if (sel.rangeCount > 0 && editor.contains(sel.getRangeAt(0).startContainer)) {
                const range = sel.getRangeAt(0); range.deleteContents(); range.insertNode(textNode); range.setStartAfter(textNode); range.setEndAfter(textNode); sel.removeAllRanges(); sel.addRange(range);
            } else { editor.appendChild(textNode); const range = document.createRange(); range.setStartAfter(textNode); range.setEndAfter(textNode); sel.removeAllRanges(); sel.addRange(range); }
            savedRange = sel.getRangeAt(0).cloneRange();
            editor.dispatchEvent(new Event("input"));
        }

        if (emojiBtn && editor) {
            const picker = new EmojiButton({ position: "top-start", rootElement: overlay.querySelector(".tweet-modal") });
            picker.on("emoji", (emoji) => { insertEmojiToEditor(emoji); });
            emojiBtn.addEventListener("click", (e) => { picker.togglePicker(emojiBtn); });
        }

        // 파일 첨부
        const fileBtn = overlay.querySelector(".tweet-modal__tool-file .tweet-modal__tool-btn");
        const imageInput = overlay.querySelector(".tweet-modal__file-input");
        const attachmentPreview = overlay.querySelector("[data-attachment-preview]");
        const attachmentMedia = overlay.querySelector("[data-attachment-media]");
        let attachedFiles = [];
        let attachedUrls = [];

        if (fileBtn && imageInput) { fileBtn.addEventListener("click", (e) => { imageInput.click(); }); }

        function makeImageCell(index, url, cls) {
            return '<div class="media-cell ' + cls + '"><div class="media-cell-inner"><div class="media-img-container"><div class="media-bg" style="background-image:url(\'' + url + '\');"></div><img src="' + url + '" class="media-img" /></div><div class="media-btn-row"><button type="button" class="media-btn" data-edit-index="' + index + '"><span>수정</span></button></div><button type="button" class="media-btn-delete" data-remove-index="' + index + '"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div>';
        }

        function renderImageGrid() {
            const n = attachedUrls.length;
            if (!attachmentMedia || n === 0) { return; }
            let html = "";
            if (n === 1) { html = '<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer">' + makeImageCell(0, attachedUrls[0], "media-cell--single") + '</div>'; }
            else if (n === 2) { html = '<div class="media-aspect-ratio"></div><div class="media-absolute-layer"><div class="media-row"><div class="media-col">' + makeImageCell(0, attachedUrls[0], "media-cell--left") + '</div><div class="media-col">' + makeImageCell(1, attachedUrls[1], "media-cell--right") + '</div></div></div>'; }
            else if (n === 3) { html = '<div class="media-aspect-ratio"></div><div class="media-absolute-layer"><div class="media-row"><div class="media-col">' + makeImageCell(0, attachedUrls[0], "media-cell--left-tall") + '</div><div class="media-col">' + makeImageCell(1, attachedUrls[1], "media-cell--right-top") + makeImageCell(2, attachedUrls[2], "media-cell--right-bottom") + '</div></div></div>'; }
            else { html = '<div class="media-aspect-ratio"></div><div class="media-absolute-layer"><div class="media-row"><div class="media-col">' + makeImageCell(0, attachedUrls[0], "media-cell--top-left") + makeImageCell(2, attachedUrls[2], "media-cell--bottom-left") + '</div><div class="media-col">' + makeImageCell(1, attachedUrls[1], "media-cell--top-right") + makeImageCell(3, attachedUrls[3], "media-cell--bottom-right") + '</div></div></div>'; }
            attachmentMedia.innerHTML = html;
        }

        function renderVideoAttachment() {
            if (!attachmentMedia || attachedFiles.length === 0) { return; }
            const file = attachedFiles[0]; const url = attachedUrls[0];
            attachmentMedia.innerHTML = '<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer"><div class="media-cell media-cell--single"><div class="media-cell-inner"><div class="media-img-container"><video class="tweet-modal__attachment-video" controls><source src="' + url + '" type="' + file.type + '"></video></div><div class="media-btn-row"><button type="button" class="media-btn" data-edit-index="0"><span>수정</span></button></div><button type="button" class="media-btn-delete" data-remove-index="0"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div></div>';
        }

        function updateAttachmentView() {
            if (attachedFiles.length === 0) { attachmentPreview.classList.add("off"); attachmentMedia.innerHTML = ""; return; }
            attachmentPreview.classList.remove("off");
            if (attachedFiles[0].type.includes("video")) { renderVideoAttachment(); } else { renderImageGrid(); }
        }

        let editIndex = -1;
        function readFile(file, callback) { const reader = new FileReader(); reader.readAsDataURL(file); reader.addEventListener("load", (e) => { callback(e.target.result); }); }
        function readFilesSequential(fileList, startIdx, done) {
            if (startIdx >= fileList.length || attachedFiles.length >= 4) { done(); return; }
            const file = fileList[startIdx];
            if (file.type.includes("video")) { readFile(file, (path) => { attachedFiles = [file]; attachedUrls = [path]; done(); }); return; }
            if (attachedFiles.length > 0 && attachedFiles[0].type.includes("video")) { attachedFiles = []; attachedUrls = []; }
            readFile(file, (path) => { attachedFiles.push(file); attachedUrls.push(path); readFilesSequential(fileList, startIdx + 1, done); });
        }

        function resetModal() {
            const modalEditor = overlay.querySelector(".tweet-modal__editor");
            if (modalEditor) { modalEditor.innerHTML = ""; }
            backToCompose();
            attachedFiles = []; attachedUrls = [];
            if (attachmentPreview) { attachmentPreview.classList.add("off"); }
            if (attachmentMedia) { attachmentMedia.innerHTML = ""; }
            if (imageInput) { imageInput.value = ""; }
            editIndex = -1;
            if (tagInput) { const tags = tagInput.querySelectorAll(".tagDiv"); for (let i = 0; i < tags.length; i++) { tags[i].remove(); } tagInput.classList.add("off"); }
            isTagEditorOpen = false;
            if (tagEditor) { tagEditor.classList.add("off"); }
            if (tagToggle) { tagToggle.textContent = "태그 추가"; }
            if (tagField) { tagField.value = ""; }
            if (boldBtn) { boldBtn.classList.remove("active"); }
            if (italicBtn) { italicBtn.classList.remove("active"); }
            if (boardMenu) { boardMenu.classList.add("off"); }
            if (catScroll && originalChipsHTML) { catScroll.innerHTML = originalChipsHTML; }
            selectedLocation = null;
            if (locationDisplay && locationDisplayText) { locationDisplayText.value = ""; locationDisplay.setAttribute("hidden", ""); }
            if (locationList) { const allItems = locationList.querySelectorAll(".tweet-modal__location-item"); for (let i = 0; i < allItems.length; i++) { allItems[i].classList.remove("isSelected"); } }
            selectedPostTempIndexes = [];
            if (postTempConfirmOverlay) { postTempConfirmOverlay.classList.add("off"); }
            updatePostTempFooter();
            selectedProduct = null;
            const existingProduct = overlay.querySelector("[data-selected-product]");
            if (existingProduct) { existingProduct.remove(); }
            if (productBtn) { productBtn.disabled = false; }
        }

        if (imageInput && attachmentPreview && attachmentMedia) {
            imageInput.addEventListener("change", (e) => {
                const files = e.target.files;
                if (files.length === 0) { return; }
                if (editIndex >= 0) {
                    const file = files[0];
                    readFile(file, (path) => {
                        if (path.includes("video")) { attachedFiles = [file]; attachedUrls = [path]; }
                        else { attachedFiles[editIndex] = file; attachedUrls[editIndex] = path; }
                        editIndex = -1; imageInput.value = ""; updateAttachmentView();
                    });
                    return;
                }
                readFilesSequential(files, 0, () => { imageInput.value = ""; updateAttachmentView(); });
            });

            attachmentMedia.addEventListener("click", (e) => {
                const removeBtn = e.target.closest("[data-remove-index]");
                if (removeBtn) { const idx = parseInt(removeBtn.getAttribute("data-remove-index")); attachedFiles.splice(idx, 1); attachedUrls.splice(idx, 1); updateAttachmentView(); return; }
                const editBtn = e.target.closest("[data-edit-index]");
                if (editBtn) { editIndex = parseInt(editBtn.getAttribute("data-edit-index")); imageInput.click(); }
            });
        }

        return {
            reset: resetModal,
            getAttachedFiles: () => attachedFiles,
            getTags: () => getTagDivs(),
            getSelectedProduct: () => selectedProduct,
            getSelectedLocation: () => selectedLocation,
            addTag: (tagName) => addTag(tagName),
            setLocation: (loc) => { selectedLocation = loc; updateLocationUI(); },
            setExistingFiles: (postFiles) => {
                attachedFiles = [];
                attachedUrls = postFiles.map(pf => pf.filePath);
                if (attachedUrls.length > 0) {
                    attachmentPreview.classList.remove("off");
                    const isVideo = postFiles[0].contentType === "video";
                    if (isVideo) {
                        attachmentMedia.innerHTML = '' +
                            '<div class="media-aspect-ratio media-aspect-ratio--single"></div>' +
                            '<div class="media-absolute-layer">' +
                                '<div class="media-cell media-cell--single">' +
                                    '<div class="media-cell-inner">' +
                                        '<div class="media-img-container">' +
                                            '<video class="tweet-modal__attachment-video" controls><source src="' + attachedUrls[0] + '"></video>' +
                                        '</div><button type="button" class="media-btn-delete" data-remove-index="0"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div></div>';
                    } else {
                        renderImageGrid();
                    }
                }
            }
        };
    }

    const composeCtx = setupSubViews(composeOverlay);
    const replyCtx = setupSubViews(replyOverlay);
    resetCompose = composeCtx.reset;
    resetReply = replyCtx.reset;

    document.addEventListener("click", (e) => {
        const boardMenu = document.getElementById("boardMenu");
        if (boardMenu && !e.target.closest("#boardMenu") && !e.target.closest(".audienceButton")) {
            boardMenu.classList.add("off");
        }
    });

    // ── 10. 뉴스 로딩 ──
    const newsFeedList = document.getElementById("newsFeedList");
    if (newsFeedList) {
        service.getLatestNews((newsList) => {
            if (!newsList || newsList.length === 0) {
                newsFeedList.innerHTML = '<p style="padding:16px;color:#71767b;text-align:center;">뉴스가 없습니다.</p>';
                return;
            }
            newsFeedList.innerHTML = newsList.map(news => `
                <div class="newsFeedItem">
                    <div class="newsFeedContent">
                        <h3 class="newsFeedHeadline">${news.newsTitle || ""}</h3>
                        <p class="newsFeedSummary">${news.newsContent || ""}</p>
                    </div>
                </div>
            `).join("");
        });
    }

    // ── 11. 모바일 네비게이션 ──
    const mobileItems = document.querySelectorAll(".mobileItem");
    mobileItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            mobileItems.forEach((mi) => { mi.classList.remove("active"); });
            item.classList.add("active");
        });
    });

    // ── 11. 환율 피드 ──
    const exchangeRateFeedContent = document.getElementById("exchangeRateFeedContent");
    const exchangeRateFeedSubtitle = document.getElementById("exchangeRateFeedSubtitle");

    if (exchangeRateFeedContent) {
        const currencyLabels = { KRW: "대한민국 원", EUR: "유로", JPY: "일본 엔", CNY: "중국 위안", GBP: "영국 파운드" };
        const codes = ["KRW", "EUR", "JPY", "CNY", "GBP"];

        function renderRates(rates, dateStr) {
            let html = "";
            for (let i = 0; i < codes.length; i++) {
                const code = codes[i]; const label = currencyLabels[code] || code; const value = rates[code];
                const digits = code === "JPY" ? 2 : 4;
                const formatted = value.toLocaleString("ko-KR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
                html += '<div class="exchangeRateRow"><div class="exchangeRateMain"><div class="exchangeRateCurrencyLine"><span class="exchangeRateCurrency">' + code + '</span><span class="exchangeRateCurrencyName">' + label + '</span></div><span class="exchangeRateMeta">1 USD</span></div><div class="exchangeRateValueWrap"><span class="exchangeRateValue">' + formatted + '</span></div></div>';
            }
            exchangeRateFeedContent.innerHTML = html;
            if (exchangeRateFeedSubtitle && dateStr) {
                const d = new Date(dateStr); const month = (d.getMonth() + 1); const day = d.getDate();
                exchangeRateFeedSubtitle.textContent = "USD 기준 주요 통화 · " + month + "월 " + day + "일 기준";
            }
        }

        fetch("https://open.er-api.com/v6/latest/USD")
            .then((res) => { return res.json(); })
            .then((data) => { renderRates(data.rates, data.time_last_update_utc); })
            .catch((err) => { exchangeRateFeedContent.innerHTML = '<p class="exchangeRateFeedState">환율 정보를 불러오지 못했습니다.</p>'; });
    }

    // ── 12. 사이드바 sticky ──
    const trendPanel = document.querySelector(".trendPanel");
    if (trendPanel) {
        const updateStickyTop = () => {
            const panelH = trendPanel.offsetHeight; const viewH = window.innerHeight;
            if (panelH > viewH) { trendPanel.style.top = -(panelH - viewH) + "px"; } else { trendPanel.style.top = "0px"; }
        };
        setTimeout(updateStickyTop, 0);
        window.addEventListener("resize", updateStickyTop);
    }

    // ── 초기 데이터 로딩 ──
    function load() {
        memberId = loginMember.id;

        layout.setLoginMemberId(memberId);
        layout.setAdInterval(loginMember.tier);

        // 프로필 이미지 없으면 SVG 아바타 동적 생성
        const myInitial = (loginMember.memberNickname || loginMember.memberHandle || "?").charAt(0);
        const avatarTargets = [
            document.getElementById("accountAvatar"),
            document.getElementById("composeAvatar"),
            document.getElementById("replyAvatar")
        ];
        avatarTargets.forEach(el => {
            if (!el) return;
            if (el.querySelector("img")) return;
            el.innerHTML = `<img src="${layout.buildAvatarDataUri(myInitial)}" alt="" />`;
        });

        service.getAds((ads) => {
            layout.setAds(ads || []);
            loadFeed();
        }).catch((err) => {
            console.error("광고 로딩 실패:", err);
            loadFeed();
        });

        if (suggestionContainer) {
            service.getSuggestions(memberId, (members) => {
                const itemsContainer = suggestionContainer.querySelectorAll(".suggestionItem");
                itemsContainer.forEach(item => item.remove());
                const moreLink = suggestionContainer.querySelector(".suggestionLink");
                if (!members || members.length === 0) {
                    const empty = document.createElement("p");
                    empty.style.cssText = "padding:16px;color:#71767b;text-align:center;";
                    empty.textContent = "추천할 회원이 없습니다.";
                    suggestionContainer.insertBefore(empty, moreLink);
                    return;
                }
                members.forEach(m => {
                    const initial = (m.memberNickname || m.memberHandle || "?").charAt(0);
                    const avatarHtml = m.fileName
                        ? `<img class="suggestionAvatarImg" src="${m.fileName}" />`
                        : `<img class="suggestionAvatarImg" src="${layout.buildAvatarDataUri(initial)}" />`;
                    const div = document.createElement("div");
                    div.className = "suggestionItem trend-item";
                    div.innerHTML =
                        `<div class="suggestionAvatar">${avatarHtml}</div>` +
                        `<div class="suggestionProfile">` +
                            `<span class="suggestionName">${m.memberNickname || ""}</span>` +
                            `<span class="sidebar-user-handle">${m.memberHandle || ""}</span>` +
                        `</div>` +
                        `<button class="connect-btn-sm default" data-member-id="${m.id}">Connect</button>`;
                    suggestionContainer.insertBefore(div, moreLink);
                });
            });
        }
    }

    load();
};
