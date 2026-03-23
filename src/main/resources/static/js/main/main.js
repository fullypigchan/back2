window.onload = () => {
    // 1. 탭 전환
    const tabFeed = document.getElementById("tabFeed");
    const tabFriends = document.getElementById("tabFriends");
    const feedSection = document.getElementById("feedSection");
    const friendsSection = document.getElementById("friendsSection");
    const tabs = [tabFeed, tabFriends];
    const sections = [feedSection, friendsSection];

    tabs.forEach((tab, i) => {
        tab.addEventListener("click", (e) => {
            tabs.forEach((t) => {
                t.classList.remove("isActive");
            });
            sections.forEach((s) => {
                s.classList.remove("isActive");
            });
            tab.classList.add("isActive");
            sections[i].classList.add("isActive");
        });
    });

    // 2. 게시물 버튼 이벤트
    const postCards = document.querySelectorAll(".postCard");
    const mainShareDropdown = document.getElementById("mainShareDropdown");

    // 2-1. 헬퍼
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
        if (activeMoreButton) {
            activeMoreButton = null;
        }
    }

    function closePostMoreModal() {
        if (!activeMoreModal) { return; }
        activeMoreModal.remove();
        activeMoreModal = null;
        document.body.classList.remove("modal-open");
    }

    function openBlockModal(button) {
        const meta = getUserMetaFromButton(button);
        const handle = meta.handle;
        closePostMoreDropdown();
        closePostMoreModal();
        const modal = document.createElement("div");
        modal.className = "notification-dialog";
        modal.classList.add("notification-dialog--block");
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
        modal.addEventListener("click", function (e) {
            if (
                e.target.classList.contains("notification-dialog__backdrop") ||
                e.target.closest(".notification-dialog__close")
            ) {
                e.preventDefault();
                closePostMoreModal();
                return;
            }
            if (e.target.closest(".notification-dialog__confirm-block")) {
                e.preventDefault();
                showPostMoreToast(handle + " 님을 차단했습니다");
                closePostMoreModal();
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeMoreModal = modal;
    }

    function openReportModal() {
        closePostMoreDropdown();
        closePostMoreModal();
        let listHtml = "";
        for (let i = 0; i < reportReasons.length; i++) {
            listHtml +=
                '<li><button type="button" class="notification-report__item">' +
                '<span>' + reportReasons[i] + '</span>' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.293 6.293 10.707 4.88 17.828 12l-7.121 7.12-1.414-1.413L14.999 12z"></path></g></svg>' +
                '</button></li>';
        }
        const modal = document.createElement("div");
        modal.className = "notification-dialog";
        modal.classList.add("notification-dialog--report");
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
        modal.addEventListener("click", function (e) {
            if (
                e.target.classList.contains("notification-dialog__backdrop") ||
                e.target.closest(".notification-dialog__close")
            ) {
                e.preventDefault();
                closePostMoreModal();
                return;
            }
            if (e.target.closest(".notification-report__item")) {
                e.preventDefault();
                showPostMoreToast("신고가 접수되었습니다");
                closePostMoreModal();
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeMoreModal = modal;
    }

    function handleDropdownAction(button, actionClass) {
        const meta = getUserMetaFromButton(button);
        const handle = meta.handle;
        if (actionClass === "menu-item--follow-toggle") {
            const isF = followState[handle] ? true : false;
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
            openReportModal();
        }
    }

    // 2-2. 더보기 드롭다운 (동적 생성, 버튼 위치 기준)
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
            '</button>' +
            '</div></div>' +
            '</div>' +
            '</div>';
        lc.addEventListener("click", function (e) {
            const item = e.target.closest(".menu-item");
            if (!item) {
                e.stopPropagation();
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            let ac = "";
            if (item.classList.contains("menu-item--follow-toggle")) { ac = "menu-item--follow-toggle"; }
            else if (item.classList.contains("menu-item--block")) { ac = "menu-item--block"; }
            else if (item.classList.contains("menu-item--report")) { ac = "menu-item--report"; }
            if (ac && activeMoreButton) {
                handleDropdownAction(activeMoreButton, ac);
            }
        });
        document.body.appendChild(lc);
        activeMoreDropdown = lc;
        activeMoreButton = button;
    }

    // 2-3. 더보기 버튼 클릭 (이벤트 위임)
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

    // 2-6. 좋아요 토글
    document.querySelectorAll(".tweet-action-btn--like").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            let isActive = btn.classList.contains("active");
            btn.classList.toggle("active", !isActive);
            const countSpan = btn.querySelector(".tweet-action-count");
            let count = parseInt(countSpan.textContent);
            countSpan.textContent = isActive ? count - 1 : count + 1;
        });
    });

    // 2-7. 북마크 토글
    document.querySelectorAll(".tweet-action-btn--bookmark").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            let isActive = btn.classList.contains("active");
            btn.classList.toggle("active", !isActive);
        });
    });

    // 2-8. 공유 드롭다운 토글
    document.querySelectorAll(".tweet-action-btn--share").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            let isOpen = !mainShareDropdown.classList.contains("off");
            closeAllMenus();
            if (!isOpen) {
                let rect = btn.getBoundingClientRect();
                let menu = document.getElementById("mainShareDropdownMenu");
                menu.style.position = "fixed";
                menu.style.left = rect.left + "px";
                menu.style.top = (rect.bottom + 4) + "px";
                mainShareDropdown.classList.remove("off");
            }
        });
    });

    // 2-9. 공유 드롭다운 항목 클릭
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
        closeAllMenus();
        showShareToast("링크가 복사되었습니다.");
    });

    document.querySelector(".share-menu-item--chat").addEventListener("click", (e) => {
        closeAllMenus();
        mainShareChatSheet.classList.remove("off");
    });

    // 2-10. 공유 시트 닫기
    mainShareChatSheet.querySelector(".share-sheet__backdrop").addEventListener("click", (e) => {
        mainShareChatSheet.classList.add("off");
    });
    mainShareChatSheet.querySelector(".share-sheet__icon-btn").addEventListener("click", (e) => {
        mainShareChatSheet.classList.add("off");
    });
    // 2-11. 외부 클릭 시 공유 드롭다운 닫기
    document.addEventListener("click", (e) => {
        if (!e.target.closest("#mainShareDropdown") && !e.target.closest(".tweet-action-btn--share")) {
            mainShareDropdown.classList.add("off");
        }
    });

    // 3. 이미지 미리보기
    const mediaPreviewOverlay = document.getElementById("mediaPreviewOverlay");
    const mediaPreviewImage = document.getElementById("mediaPreviewImage");
    const mediaPreviewClose = document.getElementById("mediaPreviewClose");

    document.querySelectorAll(".postMediaImage").forEach((img) => {
        img.addEventListener("click", (e) => {
            mediaPreviewImage.src = img.src;
            mediaPreviewOverlay.classList.remove("off");
        });
    });

    mediaPreviewClose.addEventListener("click", (e) => {
        mediaPreviewOverlay.classList.add("off");
    });

    mediaPreviewOverlay.addEventListener("click", (e) => {
        if (e.target === mediaPreviewOverlay) {
            mediaPreviewOverlay.classList.add("off");
        }
    });

    // 4. 좌측 네비게이션
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            navItems.forEach((nav) => {
                nav.classList.remove("active");
            });
            item.classList.add("active");
        });
    });

    // 4-1. 더보기 팝오버
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

    // 4-2. 계정 메뉴 팝업
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

    // 5. 우측 사이드바 검색
    const searchInput = document.getElementById("searchInput");
    const searchPanel = document.getElementById("searchPanel");
    const searchPanelEmpty = document.getElementById("searchPanelEmpty");
    const searchResults = document.getElementById("searchResults");

    searchInput.addEventListener("focus", (e) => {
        searchPanel.classList.remove("off");
    });

    searchInput.addEventListener("input", (e) => {
        if (searchInput.value.length > 0) {
            searchPanelEmpty.classList.add("off");
            searchResults.classList.remove("off");
            document.getElementById("searchResultLabel").textContent = searchInput.value;
        } else {
            searchPanelEmpty.classList.remove("off");
            searchResults.classList.add("off");
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".searchForm")) {
            searchPanel.classList.add("off");
        }
    });

    // 6. Connect 버튼 토글 (추천 + Experts)
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

    document.querySelectorAll(".connect-btn, .connect-btn-sm").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (btn.classList.contains("default")) {
                btn.classList.remove("default");
                btn.classList.add("connected");
                btn.textContent = "Connected";
            } else {
                openDisconnectModal(btn);
            }
        });
    });

    // 6-1. 연결 끊기 모달
    if (modalConfirm) {
        modalConfirm.addEventListener("click", (e) => {
            if (disconnectTarget) {
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

    // 7. 게시글 작성 모달
    let resetCompose = null;
    let resetReply = null;
    const composeOverlay = document.querySelector("[data-compose-modal]");
    const composeClose = composeOverlay.querySelector(".tweet-modal__close");
    const composeEditor = composeOverlay.querySelector(".tweet-modal__editor");
    const composeGaugeText = composeOverlay.querySelector(".composerGaugeText");
    const composeSubmit = composeOverlay.querySelector(".tweet-modal__submit");
    const composeMaxLength = 500;

    const createPostButton = document.getElementById("createPostButton");
    createPostButton.addEventListener("click", (e) => {
        composeOverlay.classList.remove("off");
        composeEditor.focus();
        const cs = composeOverlay.querySelector(".category-scroll");
        if (cs) { requestAnimationFrame(() => { cs.dispatchEvent(new Event("scroll")); }); }
    });

    function closeComposeModal() {
        composeOverlay.classList.add("off");
        composeEditor.innerHTML = "";
        composeGaugeText.textContent = composeMaxLength;
        composeGaugeText.style.color = "";
        composeSubmit.disabled = true;
        if (resetCompose) { resetCompose(); }
    }

    composeClose.addEventListener("click", (e) => {
        closeComposeModal();
    });

    composeOverlay.addEventListener("click", (e) => {
        if (e.target === composeOverlay) {
            closeComposeModal();
        }
    });

    // 7-1. 글자 수 게이지
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

    // 7-2. 게시하기 버튼
    composeSubmit.addEventListener("click", (e) => {
        if (composeEditor.textContent.length === 0) { return; }
        alert("게시되었습니다.");
        closeComposeModal();
    });

    // 7-3. 답글 모달
    const replyOverlay = document.querySelector("[data-reply-modal]");
    const replyClose = replyOverlay.querySelector(".tweet-modal__close");
    const replyEditor = replyOverlay.querySelector(".tweet-modal__editor");
    const replyGaugeText = replyOverlay.querySelector(".composerGaugeText");
    const replySubmit = replyOverlay.querySelector(".tweet-modal__submit");
    const replyMaxLength = 500;

    document.querySelectorAll(".tweet-action-btn").forEach((btn) => {
        if (btn.classList.contains("tweet-action-btn--like") ||
            btn.classList.contains("tweet-action-btn--views") ||
            btn.classList.contains("tweet-action-btn--bookmark") ||
            btn.classList.contains("tweet-action-btn--share")) {
            return;
        }
        btn.addEventListener("click", (e) => {
            replyOverlay.classList.remove("off");
            replyEditor.focus();
        });
    });

    function closeReplyModal() {
        replyOverlay.classList.add("off");
        replyEditor.innerHTML = "";
        replyGaugeText.textContent = replyMaxLength;
        replyGaugeText.style.color = "";
        replySubmit.disabled = true;
        if (resetReply) { resetReply(); }
    }

    replyClose.addEventListener("click", (e) => {
        closeReplyModal();
    });

    replyOverlay.addEventListener("click", (e) => {
        if (e.target === replyOverlay) {
            closeReplyModal();
        }
    });

    // 7-4. 답글 글자 수 게이지
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

    // 7-5. 답글 제출 버튼
    replySubmit.addEventListener("click", (e) => {
        if (replyEditor.textContent.length === 0) { return; }
        alert("답글이 게시되었습니다.");
        closeReplyModal();
    });

    // 7-6. 서브뷰 토글 (게시물 + 답글 공통)
    function setupSubViews(overlay) {
        const composeView = overlay.querySelector(".tweet-modal__compose-view");
        const locationView = overlay.querySelector(".tweet-modal__location-view");
        const tagView = overlay.querySelector(".tweet-modal__tag-view");
        const mediaView = overlay.querySelector(".tweet-modal__media-view");
        const draftView = overlay.querySelector(".tweet-modal__draft-view");
        const productView = overlay.querySelector(".tweet-modal__product-view");

        const allSubViews = [locationView, tagView, mediaView, draftView, productView];

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
                    boardOptions.forEach((opt) => {
                        opt.classList.remove("isSelected");
                    });
                    communityItems.forEach((ci) => {
                        ci.classList.remove("isSelected");
                    });
                    option.classList.add("isSelected");
                    audienceBtn.textContent = option.querySelector(".boardMenuOptionLabel").textContent;
                    boardMenu.classList.add("off");
                });
            });

            communityItems.forEach((item) => {
                item.addEventListener("click", (e) => {
                    boardOptions.forEach((opt) => {
                        opt.classList.remove("isSelected");
                    });
                    communityItems.forEach((ci) => {
                        ci.classList.remove("isSelected");
                    });
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
            for (let i = 0; i < nodes.length; i++) {
                result.push(nodes[i]);
            }
            return result;
        }

        function syncTagUI() {
            if (!tagToggle || !tagEditor) { return; }
            const hasTags = getTagDivs().length > 0;
            tagEditor.classList.toggle("off", !isTagEditorOpen);
            if (tagInput) {
                if (hasTags) {
                    tagInput.classList.remove("off");
                } else {
                    tagInput.classList.add("off");
                }
            }
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
            if (getTagDivs().length >= 5) {
                alert("태그는 최대 5개까지 추가할 수 있어요");
                if (tagField) { tagField.value = ""; }
                return false;
            }
            if (specialCharRegex.test(tag)) {
                alert("특수문자는 입력 못해요");
                if (tagField) { tagField.value = ""; }
                return false;
            }
            const existing = getTagDivs();
            for (let i = 0; i < existing.length; i++) {
                if (existing[i].textContent === "#" + tag) {
                    alert("중복된 태그가 있어요");
                    if (tagField) { tagField.value = ""; }
                    return false;
                }
            }
            const span = document.createElement("span");
            span.className = "tagDiv";
            span.textContent = "#" + tag;
            if (tagInput) {
                tagInput.appendChild(span);
            }
            if (tagField) { tagField.value = ""; }
            isTagEditorOpen = false;
            syncTagUI();
            return true;
        }

        if (tagToggle) {
            tagToggle.addEventListener("click", (e) => {
                isTagEditorOpen = !isTagEditorOpen;
                syncTagUI();
                if (isTagEditorOpen && tagField) {
                    tagField.focus();
                }
            });
        }
        if (tagField) {
            tagField.addEventListener("keyup", (e) => {
                if (e.key === "Enter" && tagField.value) {
                    e.preventDefault();
                    addTag(tagField.value);
                }
                if (e.key === "Escape") {
                    isTagEditorOpen = false;
                    syncTagUI();
                    if (tagToggle) { tagToggle.focus(); }
                }
            });
            tagField.addEventListener("focus", (e) => {
                isTagEditorOpen = true;
                syncTagUI();
            });
        }
        if (tagInput) {
            tagInput.addEventListener("click", (e) => {
                if (e.target.classList.contains("tagDiv")) {
                    e.target.remove();
                    syncTagUI();
                }
            });
        }

        // 카테고리 칩 + 스크롤
        const catScroll = overlay.querySelector(".category-scroll");
        const catLeft = overlay.querySelector(".category-scroll-left");
        const catRight = overlay.querySelector(".category-scroll-right");
        let originalChipsHTML = catScroll ? catScroll.innerHTML : "";

        function checkCatScroll() {
            if (!catScroll || !catLeft || !catRight) { return; }
            if (catScroll.scrollLeft > 0) {
                catLeft.classList.remove("off");
            } else {
                catLeft.classList.add("off");
            }
            if (catScroll.scrollLeft < catScroll.scrollWidth - catScroll.clientWidth - 1) {
                catRight.classList.remove("off");
            } else {
                catRight.classList.add("off");
            }
        }

        if (catScroll) {
            catScroll.addEventListener("scroll", (e) => { checkCatScroll(); });
            catScroll.addEventListener("click", (e) => {
                const chip = e.target.closest(".cat-chip");
                const backBtn = e.target.closest(".cat-back-btn");

                if (backBtn) {
                    catScroll.innerHTML = originalChipsHTML;
                    catScroll.scrollLeft = 0;
                    setTimeout(checkCatScroll, 50);
                    return;
                }
                if (!chip) { return; }

                if (chip.classList.contains("has-subs")) {
                    const catName = chip.textContent.replace(" ›", "");
                    const subs = chip.getAttribute("data-subs");
                    if (!subs) { return; }
                    const subList = subs.split(",");
                    let html = '<button type="button" class="cat-back-btn"><svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(180 12 12)" fill="currentColor"/></svg></button>';
                    html += '<button type="button" class="cat-chip parent-highlight">' + catName + '</button>';
                    for (let i = 0; i < subList.length; i++) {
                        html += '<button type="button" class="cat-chip" data-is-sub="true">' + subList[i] + '</button>';
                    }
                    catScroll.innerHTML = html;
                    catScroll.scrollLeft = 0;
                    setTimeout(checkCatScroll, 50);
                    return;
                }

                const chipText = chip.textContent.trim();
                if (chipText === "전체") { return; }
                addTag(chipText);

                const allChips = catScroll.querySelectorAll(".cat-chip:not(.parent-highlight)");
                for (let i = 0; i < allChips.length; i++) {
                    allChips[i].classList.remove("active", "sub-active");
                }
                if (chip.getAttribute("data-is-sub")) {
                    chip.classList.add("sub-active");
                } else {
                    chip.classList.add("active");
                }
            });
        }
        if (catLeft) {
            catLeft.addEventListener("click", (e) => {
                catScroll.scrollBy({ left: -200, behavior: "smooth" });
            });
        }
        if (catRight) {
            catRight.addEventListener("click", (e) => {
                catScroll.scrollBy({ left: 200, behavior: "smooth" });
            });
        }
        checkCatScroll();

        // 임시저장
        const draftBtn = overlay.querySelector(".tweet-modal__draft");
        const draftList = draftView ? draftView.querySelector(".draft-panel__list") : null;
        const draftEmpty = draftView ? draftView.querySelector(".draft-panel__empty") : null;
        const draftFooter = draftView ? draftView.querySelector(".draft-panel__footer") : null;
        const draftSelectAll = draftView ? draftView.querySelector(".draft-panel__select-all") : null;
        const draftFooterDelete = draftView ? draftView.querySelector(".draft-panel__footer-delete") : null;
        const draftConfirmOverlay = draftView ? draftView.querySelector(".draft-panel__confirm-overlay") : null;
        const draftConfirmPrimary = draftConfirmOverlay ? draftConfirmOverlay.querySelector(".draft-panel__confirm-primary") : null;
        const draftConfirmSecondary = draftConfirmOverlay ? draftConfirmOverlay.querySelector(".draft-panel__confirm-secondary") : null;
        const modalEditor = overlay.querySelector(".tweet-modal__editor");
        let drafts = [];
        let selectedDraftIndexes = [];

        function loadDrafts() {
            // 서버 연결 시 fetch로 교체 예정
        }

        function saveDrafts() {
            // 서버 연결 시 fetch로 교체 예정
        }

        function updateDraftFooter() {
            if (!draftFooter) { return; }
            if (drafts.length === 0) {
                draftFooter.classList.add("off");
            } else {
                draftFooter.classList.remove("off");
            }
            if (draftFooterDelete) {
                draftFooterDelete.disabled = selectedDraftIndexes.length === 0;
            }
            if (draftSelectAll) {
                if (drafts.length > 0 && selectedDraftIndexes.length === drafts.length) {
                    draftSelectAll.textContent = "전체 해제";
                } else {
                    draftSelectAll.textContent = "모두 선택";
                }
            }
        }

        function isSelected(idx) {
            for (let i = 0; i < selectedDraftIndexes.length; i++) {
                if (selectedDraftIndexes[i] === idx) { return true; }
            }
            return false;
        }

        function toggleDraftSelect(idx) {
            if (isSelected(idx)) {
                let next = [];
                for (let i = 0; i < selectedDraftIndexes.length; i++) {
                    if (selectedDraftIndexes[i] !== idx) { next.push(selectedDraftIndexes[i]); }
                }
                selectedDraftIndexes = next;
            } else {
                selectedDraftIndexes.push(idx);
            }
            syncDraftCheckboxes();
            updateDraftFooter();
        }

        function syncDraftCheckboxes() {
            if (!draftList) { return; }
            const items = draftList.querySelectorAll(".draft-panel__item");
            for (let i = 0; i < items.length; i++) {
                const idx = parseInt(items[i].getAttribute("data-draft-index"));
                const cb = items[i].querySelector(".draft-panel__item-checkbox");
                if (isSelected(idx)) {
                    items[i].classList.add("draft-panel__item--selected");
                    if (cb) { cb.checked = true; }
                } else {
                    items[i].classList.remove("draft-panel__item--selected");
                    if (cb) { cb.checked = false; }
                }
            }
        }

        function renderDraftList() {
            selectedDraftIndexes = [];
            if (!draftList) { return; }
            if (drafts.length === 0) {
                draftList.innerHTML = "";
                if (draftEmpty) { draftEmpty.classList.remove("off"); }
                updateDraftFooter();
                return;
            }
            if (draftEmpty) { draftEmpty.classList.add("off"); }
            let html = "";
            for (let i = 0; i < drafts.length; i++) {
                const d = drafts[i];
                html += '<div class="draft-panel__item" data-draft-index="' + i + '">' +
                    '<input type="checkbox" class="draft-panel__item-checkbox" data-draft-check="' + i + '" />' +
                    '<button type="button" class="draft-panel__item-load" data-draft-load="' + i + '">' +
                    '<span class="draft-panel__item-body">' +
                    '<span class="draft-panel__text">' + d.text + '</span>' +
                    '<span class="draft-panel__date">' + d.date + '</span>' +
                    '</span>' +
                    '</button>' +
                    '<span class="draft-panel__item-delete" data-draft-delete="' + i + '">✕</span>' +
                    '</div>';
            }
            draftList.innerHTML = html;
            updateDraftFooter();
        }

        function saveDraft() {
            if (!modalEditor) { return; }
            const text = modalEditor.textContent.trim();
            if (!text) { return; }
            const now = new Date();
            const dateStr = (now.getMonth() + 1) + "월 " + now.getDate() + "일 " +
                (now.getHours() < 12 ? "오전" : "오후") + " " +
                (now.getHours() % 12 || 12) + ":" +
                (now.getMinutes() < 10 ? "0" : "") + now.getMinutes();
            drafts.push({ text: text, date: dateStr });
            saveDrafts();
        }

        function loadDraftToEditor(index) {
            if (!modalEditor || !drafts[index]) { return; }
            modalEditor.textContent = drafts[index].text;
            drafts.splice(index, 1);
            saveDrafts();
            modalEditor.dispatchEvent(new Event("input"));
            backToCompose();
        }

        loadDrafts();

        if (draftBtn && draftView) {
            draftBtn.addEventListener("click", (e) => {
                if (modalEditor && modalEditor.textContent.trim()) {
                    saveDraft();
                    modalEditor.innerHTML = "";
                    modalEditor.dispatchEvent(new Event("input"));
                }
                renderDraftList();
                showSubView(draftView);
            });
        }
        const draftBack = draftView ? draftView.querySelector(".draft-panel__back") : null;
        if (draftBack) {
            draftBack.addEventListener("click", (e) => { backToCompose(); });
        }
        let pendingDeleteIndexes = [];

        if (draftList) {
            draftList.addEventListener("click", (e) => {
                // 체크박스 클릭
                const checkbox = e.target.closest("[data-draft-check]");
                if (checkbox) {
                    const idx = parseInt(checkbox.getAttribute("data-draft-check"));
                    toggleDraftSelect(idx);
                    return;
                }

                // 개별 삭제 → confirm 모달
                const deleteBtn = e.target.closest("[data-draft-delete]");
                if (deleteBtn) {
                    const idx = parseInt(deleteBtn.getAttribute("data-draft-delete"));
                    pendingDeleteIndexes = [idx];
                    if (draftConfirmOverlay) {
                        draftConfirmOverlay.classList.remove("off");
                    }
                    return;
                }

                // 불러오기
                const loadBtn = e.target.closest("[data-draft-load]");
                if (loadBtn) {
                    const idx = parseInt(loadBtn.getAttribute("data-draft-load"));
                    loadDraftToEditor(idx);
                }
            });
        }

        // 임시저장 모두 선택 / 삭제하기
        if (draftSelectAll) {
            draftSelectAll.addEventListener("click", (e) => {
                if (selectedDraftIndexes.length === drafts.length) {
                    selectedDraftIndexes = [];
                } else {
                    selectedDraftIndexes = [];
                    for (let i = 0; i < drafts.length; i++) {
                        selectedDraftIndexes.push(i);
                    }
                }
                syncDraftCheckboxes();
                updateDraftFooter();
            });
        }

        if (draftFooterDelete) {
            draftFooterDelete.addEventListener("click", (e) => {
                if (selectedDraftIndexes.length === 0) { return; }
                pendingDeleteIndexes = [];
                for (let i = 0; i < selectedDraftIndexes.length; i++) {
                    pendingDeleteIndexes.push(selectedDraftIndexes[i]);
                }
                if (draftConfirmOverlay) {
                    draftConfirmOverlay.classList.remove("off");
                }
            });
        }

        if (draftConfirmPrimary) {
            draftConfirmPrimary.addEventListener("click", (e) => {
                pendingDeleteIndexes.sort((a, b) => { return b - a; });
                for (let i = 0; i < pendingDeleteIndexes.length; i++) {
                    drafts.splice(pendingDeleteIndexes[i], 1);
                }
                pendingDeleteIndexes = [];
                saveDrafts();
                if (draftConfirmOverlay) { draftConfirmOverlay.classList.add("off"); }
                renderDraftList();
            });
        }

        if (draftConfirmSecondary) {
            draftConfirmSecondary.addEventListener("click", (e) => {
                if (draftConfirmOverlay) { draftConfirmOverlay.classList.add("off"); }
            });
        }

        // 위치
        const geoBtn = overlay.querySelector(".tweet-modal__tool-btn--geo");
        const locationList = locationView ? locationView.querySelector("[data-location-list]") : null;
        const locationClose = locationView ? locationView.querySelector(".tweet-modal__location-close") : null;
        const locationDisplay = overlay.querySelector(".tweet-modal__location-display");
        const locationDisplayText = locationDisplay ? locationDisplay.querySelector(".tweet-modal__location-display-text-inner") : null;
        let selectedLocation = null;

        function updateLocationUI() {
            if (locationDisplay && locationDisplayText) {
                if (selectedLocation) {
                    locationDisplayText.textContent = selectedLocation;
                    locationDisplay.removeAttribute("hidden");
                } else {
                    locationDisplayText.textContent = "";
                    locationDisplay.setAttribute("hidden", "");
                }
            }
        }

        if (geoBtn && locationView) {
            geoBtn.addEventListener("click", (e) => {
                showSubView(locationView);
            });
        }
        if (locationList) {
            locationList.addEventListener("click", (e) => {
                const item = e.target.closest(".tweet-modal__location-item");
                if (!item) { return; }
                const allItems = locationList.querySelectorAll(".tweet-modal__location-item");
                for (let i = 0; i < allItems.length; i++) {
                    allItems[i].classList.remove("isSelected");
                }
                item.classList.add("isSelected");
                selectedLocation = item.querySelector(".tweet-modal__location-item-label").textContent;
                updateLocationUI();
                backToCompose();
            });
        }
        if (locationClose) {
            locationClose.addEventListener("click", (e) => { backToCompose(); });
        }

        // 태그
        const tagClose = tagView ? tagView.querySelector(".tweet-modal__tag-close") : null;
        if (tagClose) {
            tagClose.addEventListener("click", (e) => { backToCompose(); });
        }
        const tagComplete = tagView ? tagView.querySelector("[data-tag-complete]") : null;
        if (tagComplete) {
            tagComplete.addEventListener("click", (e) => { backToCompose(); });
        }

        // 미디어
        const mediaBack = mediaView ? mediaView.querySelector(".tweet-modal__media-header-btn--ghost") : null;
        if (mediaBack) {
            mediaBack.addEventListener("click", (e) => { backToCompose(); });
        }
        const mediaSave = mediaView ? mediaView.querySelector("[data-media-save]") : null;
        if (mediaSave) {
            mediaSave.addEventListener("click", (e) => { backToCompose(); });
        }

        // 판매글 선택
        const productBtn = overlay.querySelector(".tweet-modal__tool-btn--product");
        const productClose = productView ? productView.querySelector("[data-product-select-close]") : null;
        const productComplete = productView ? productView.querySelector("[data-product-select-complete]") : null;
        const productList = productView ? productView.querySelector("[data-product-select-list]") : null;
        const productEmpty = productView ? productView.querySelector("[data-product-empty]") : null;
        let selectedProduct = null;

        const sampleProducts = [
            { id: "1", name: "상품 이름 1", price: "₩50,000", stock: "100개", image: "../../static/images/main/global-gates-logo.png", tags: "#부품 #전자" },
            { id: "2", name: "상품 이름 2", price: "₩30,000", stock: "50개", image: "../../static/images/main/global-gates-logo.png", tags: "#부품 #기계" },
            { id: "3", name: "상품 이름 3", price: "₩80,000", stock: "200개", image: "../../static/images/main/global-gates-logo.png", tags: "#부품 #소재" }
        ];

        function renderProductList() {
            if (!productList) { return; }
            if (sampleProducts.length === 0) {
                productList.innerHTML = "";
                if (productEmpty) { productEmpty.classList.remove("off"); }
                return;
            }
            if (productEmpty) { productEmpty.classList.add("off"); }
            let html = "";
            for (let i = 0; i < sampleProducts.length; i++) {
                const p = sampleProducts[i];
                html += '<button type="button" class="draft-panel__item draft-panel__item--selectable" data-product-id="' + p.id + '">' +
                    '<span class="draft-panel__checkbox">' +
                    '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9 20c-.264 0-.518-.104-.707-.293l-4.785-4.785 1.414-1.414L9 17.586 19.072 7.5l1.42 1.416L9.708 19.7c-.188.19-.442.3-.708.3z"></path></g></svg>' +
                    '</span>' +
                    '<img class="draft-panel__avatar" src="' + p.image + '" />' +
                    '<span class="draft-panel__item-body">' +
                    '<span class="draft-panel__text">' + p.name + '</span>' +
                    '<span class="draft-panel__meta">' + p.tags + '</span>' +
                    '<span class="draft-panel__date">' + p.price + ' · ' + p.stock + '</span>' +
                    '</span>' +
                    '</button>';
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
                '<img class="selected-product__image" src="' + selectedProduct.image + '" />' +
                '<div class="selected-product__info">' +
                '<strong class="selected-product__name">' + selectedProduct.name + '</strong>' +
                '<span class="selected-product__price">' + selectedProduct.price + '</span>' +
                '</div>' +
                '<button type="button" class="selected-product__remove">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg>' +
                '</button>' +
                '</div>';
            card.querySelector(".selected-product__remove").addEventListener("click", (e) => {
                selectedProduct = null;
                card.remove();
                if (productBtn) { productBtn.disabled = false; }
            });
            editorWrap.appendChild(card);
        }

        if (productBtn && productView) {
            productBtn.addEventListener("click", (e) => {
                renderProductList();
                showSubView(productView);
            });
        }
        if (productClose) {
            productClose.addEventListener("click", (e) => { backToCompose(); });
        }
        if (productComplete) {
            productComplete.addEventListener("click", (e) => {
                const checkedItem = productList ? productList.querySelector(".draft-panel__item--selected") : null;
                if (checkedItem) {
                    selectedProduct = {
                        name: checkedItem.querySelector(".draft-panel__text").textContent,
                        price: checkedItem.querySelector(".draft-panel__date").textContent,
                        image: checkedItem.querySelector(".draft-panel__avatar").src,
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
                for (let i = 0; i < allItems.length; i++) {
                    allItems[i].classList.remove("draft-panel__item--selected");
                    const cb = allItems[i].querySelector(".draft-panel__checkbox");
                    if (cb) { cb.classList.remove("draft-panel__checkbox--checked"); }
                }
                if (!wasSelected) {
                    item.classList.add("draft-panel__item--selected");
                    const cb = item.querySelector(".draft-panel__checkbox");
                    if (cb) { cb.classList.add("draft-panel__checkbox--checked"); }
                }
                if (productComplete) {
                    productComplete.disabled = !productList.querySelector(".draft-panel__item--selected");
                }
            });
        }

        // 볼드/이탤릭
        const boldBtn = overlay.querySelector(".tweet-modal__tool-btn--bold");
        const italicBtn = overlay.querySelector(".tweet-modal__tool-btn--italic");
        const editorEl = overlay.querySelector(".tweet-modal__editor");

        function syncFormatButtons() {
            if (boldBtn) {
                if (document.queryCommandState("bold")) {
                    boldBtn.classList.add("active");
                } else {
                    boldBtn.classList.remove("active");
                }
            }
            if (italicBtn) {
                if (document.queryCommandState("italic")) {
                    italicBtn.classList.add("active");
                } else {
                    italicBtn.classList.remove("active");
                }
            }
        }

        if (boldBtn && editorEl) {
            boldBtn.addEventListener("click", (e) => {
                editorEl.focus();
                document.execCommand("bold");
                syncFormatButtons();
            });
        }
        if (italicBtn && editorEl) {
            italicBtn.addEventListener("click", (e) => {
                editorEl.focus();
                document.execCommand("italic");
                syncFormatButtons();
            });
        }

        if (editorEl) {
            editorEl.addEventListener("keyup", (e) => {
                syncFormatButtons();
            });
            editorEl.addEventListener("mouseup", (e) => {
                syncFormatButtons();
            });
        }

        // 이모지 피커
        const emojiBtn = overlay.querySelector(".tweet-modal__tool-btn--emoji");
        const editor = overlay.querySelector(".tweet-modal__editor");
        let savedRange = null;

        if (editor) {
            editor.addEventListener("keyup", (e) => {
                const sel = window.getSelection();
                if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
                    savedRange = sel.getRangeAt(0).cloneRange();
                }
            });
            editor.addEventListener("mouseup", (e) => {
                const sel = window.getSelection();
                if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
                    savedRange = sel.getRangeAt(0).cloneRange();
                }
            });
            editor.addEventListener("input", (e) => {
                const sel = window.getSelection();
                if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
                    savedRange = sel.getRangeAt(0).cloneRange();
                }
            });
        }

        function insertEmojiToEditor(emoji) {
            if (!editor) { return; }
            editor.focus();
            const sel = window.getSelection();
            if (savedRange && editor.contains(savedRange.startContainer)) {
                sel.removeAllRanges();
                sel.addRange(savedRange);
            }
            const textNode = document.createTextNode(emoji);
            if (sel.rangeCount > 0 && editor.contains(sel.getRangeAt(0).startContainer)) {
                const range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(textNode);
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                sel.removeAllRanges();
                sel.addRange(range);
            } else {
                editor.appendChild(textNode);
                const range = document.createRange();
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                sel.removeAllRanges();
                sel.addRange(range);
            }
            savedRange = sel.getRangeAt(0).cloneRange();
            editor.dispatchEvent(new Event("input"));
        }

        if (emojiBtn && editor) {
            const picker = new EmojiButton({
                position: "top-start",
                rootElement: overlay.querySelector(".tweet-modal")
            });
            picker.on("emoji", (emoji) => {
                insertEmojiToEditor(emoji);
            });
            emojiBtn.addEventListener("click", (e) => {
                picker.togglePicker(emojiBtn);
            });
        }

        // 파일 첨부
        const fileBtn = overlay.querySelector(".tweet-modal__tool-file .tweet-modal__tool-btn");
        const imageInput = overlay.querySelector(".tweet-modal__file-input");
        const attachmentPreview = overlay.querySelector("[data-attachment-preview]");
        const attachmentMedia = overlay.querySelector("[data-attachment-media]");
        let attachedFiles = [];
        let attachedUrls = [];

        if (fileBtn && imageInput) {
            fileBtn.addEventListener("click", (e) => {
                imageInput.click();
            });
        }

        function makeImageCell(index, url, cls) {
            return '<div class="media-cell ' + cls + '">' +
                '<div class="media-cell-inner">' +
                '<div class="media-img-container">' +
                '<div class="media-bg" style="background-image:url(\'' + url + '\');"></div>' +
                '<img src="' + url + '" class="media-img" />' +
                '</div>' +
                '<div class="media-btn-row">' +
                '<button type="button" class="media-btn" data-edit-index="' + index + '"><span>수정</span></button>' +
                '</div>' +
                '<button type="button" class="media-btn-delete" data-remove-index="' + index + '">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg>' +
                '</button>' +
                '</div>' +
                '</div>';
        }

        function renderImageGrid() {
            const n = attachedUrls.length;
            if (!attachmentMedia || n === 0) { return; }
            let html = "";
            if (n === 1) {
                html = '<div class="media-aspect-ratio media-aspect-ratio--single"></div>' +
                    '<div class="media-absolute-layer">' + makeImageCell(0, attachedUrls[0], "media-cell--single") + '</div>';
            } else if (n === 2) {
                html = '<div class="media-aspect-ratio"></div>' +
                    '<div class="media-absolute-layer"><div class="media-row">' +
                    '<div class="media-col">' + makeImageCell(0, attachedUrls[0], "media-cell--left") + '</div>' +
                    '<div class="media-col">' + makeImageCell(1, attachedUrls[1], "media-cell--right") + '</div>' +
                    '</div></div>';
            } else if (n === 3) {
                html = '<div class="media-aspect-ratio"></div>' +
                    '<div class="media-absolute-layer"><div class="media-row">' +
                    '<div class="media-col">' + makeImageCell(0, attachedUrls[0], "media-cell--left-tall") + '</div>' +
                    '<div class="media-col">' + makeImageCell(1, attachedUrls[1], "media-cell--right-top") + makeImageCell(2, attachedUrls[2], "media-cell--right-bottom") + '</div>' +
                    '</div></div>';
            } else {
                html = '<div class="media-aspect-ratio"></div>' +
                    '<div class="media-absolute-layer"><div class="media-row">' +
                    '<div class="media-col">' + makeImageCell(0, attachedUrls[0], "media-cell--top-left") + makeImageCell(2, attachedUrls[2], "media-cell--bottom-left") + '</div>' +
                    '<div class="media-col">' + makeImageCell(1, attachedUrls[1], "media-cell--top-right") + makeImageCell(3, attachedUrls[3], "media-cell--bottom-right") + '</div>' +
                    '</div></div>';
            }
            attachmentMedia.innerHTML = html;
        }

        function renderVideoAttachment() {
            if (!attachmentMedia || attachedFiles.length === 0) { return; }
            const file = attachedFiles[0];
            const url = attachedUrls[0];
            attachmentMedia.innerHTML = '<div class="media-aspect-ratio media-aspect-ratio--single"></div>' +
                '<div class="media-absolute-layer">' +
                '<div class="media-cell media-cell--single">' +
                '<div class="media-cell-inner">' +
                '<div class="media-img-container">' +
                '<video class="tweet-modal__attachment-video" controls><source src="' + url + '" type="' + file.type + '"></video>' +
                '</div>' +
                '<div class="media-btn-row">' +
                '<button type="button" class="media-btn" data-edit-index="0"><span>수정</span></button>' +
                '</div>' +
                '<button type="button" class="media-btn-delete" data-remove-index="0">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg>' +
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>';
        }

        function updateAttachmentView() {
            if (attachedFiles.length === 0) {
                attachmentPreview.classList.add("off");
                attachmentMedia.innerHTML = "";
                return;
            }
            attachmentPreview.classList.remove("off");
            if (attachedFiles[0].type.includes("video")) {
                renderVideoAttachment();
            } else {
                renderImageGrid();
            }
        }

        let editIndex = -1;

        function readFile(file, callback) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.addEventListener("load", (e) => {
                callback(e.target.result);
            });
        }

        function readFilesSequential(fileList, startIdx, done) {
            if (startIdx >= fileList.length) {
                done();
                return;
            }
            if (attachedFiles.length >= 4) {
                done();
                return;
            }
            const file = fileList[startIdx];
            if (file.type.includes("video")) {
                readFile(file, (path) => {
                    attachedFiles = [file];
                    attachedUrls = [path];
                    done();
                });
                return;
            }
            if (attachedFiles.length > 0 && attachedFiles[0].type.includes("video")) {
                attachedFiles = [];
                attachedUrls = [];
            }
            readFile(file, (path) => {
                attachedFiles.push(file);
                attachedUrls.push(path);
                readFilesSequential(fileList, startIdx + 1, done);
            });
        }

        function resetModal() {
            // 에디터 초기화
            const modalEditor = overlay.querySelector(".tweet-modal__editor");
            if (modalEditor) { modalEditor.innerHTML = ""; }

            // 서브뷰 → 작성뷰로 복귀
            backToCompose();

            // 첨부파일 초기화
            attachedFiles = [];
            attachedUrls = [];
            if (attachmentPreview) { attachmentPreview.classList.add("off"); }
            if (attachmentMedia) { attachmentMedia.innerHTML = ""; }
            if (imageInput) { imageInput.value = ""; }
            editIndex = -1;

            // 태그 초기화
            if (tagInput) {
                const tags = tagInput.querySelectorAll(".tagDiv");
                for (let i = 0; i < tags.length; i++) {
                    tags[i].remove();
                }
                tagInput.classList.add("off");
            }
            isTagEditorOpen = false;
            if (tagEditor) { tagEditor.classList.add("off"); }
            if (tagToggle) { tagToggle.textContent = "태그 추가"; }
            if (tagField) { tagField.value = ""; }

            // 볼드/이태릭 버튼 초기화
            if (boldBtn) { boldBtn.classList.remove("active"); }
            if (italicBtn) { italicBtn.classList.remove("active"); }

            // 게시판 선택 초기화
            if (boardMenu) { boardMenu.classList.add("off"); }

            // 카테고리 칩 초기화
            if (catScroll && originalChipsHTML) {
                catScroll.innerHTML = originalChipsHTML;
            }

            // 위치 초기화
            selectedLocation = null;
            if (locationDisplay && locationDisplayText) {
                locationDisplayText.textContent = "";
                locationDisplay.setAttribute("hidden", "");
            }
            if (locationList) {
                const allItems = locationList.querySelectorAll(".tweet-modal__location-item");
                for (let i = 0; i < allItems.length; i++) {
                    allItems[i].classList.remove("isSelected");
                }
            }

            // 임시저장 상태 초기화
            selectedDraftIndexes = [];
            if (draftConfirmOverlay) { draftConfirmOverlay.classList.add("off"); }
            updateDraftFooter();
        }

        if (imageInput && attachmentPreview && attachmentMedia) {
            imageInput.addEventListener("change", (e) => {
                const files = e.target.files;
                if (files.length === 0) { return; }

                // 수정 모드
                if (editIndex >= 0) {
                    const file = files[0];
                    readFile(file, (path) => {
                        if (path.includes("video")) {
                            attachedFiles = [file];
                            attachedUrls = [path];
                        } else {
                            attachedFiles[editIndex] = file;
                            attachedUrls[editIndex] = path;
                        }
                        editIndex = -1;
                        imageInput.value = "";
                        updateAttachmentView();
                    });
                    return;
                }

                // 새로 첨부
                readFilesSequential(files, 0, () => {
                    imageInput.value = "";
                    updateAttachmentView();
                });
            });

            attachmentMedia.addEventListener("click", (e) => {
                // 삭제 버튼
                const removeBtn = e.target.closest("[data-remove-index]");
                if (removeBtn) {
                    const idx = parseInt(removeBtn.getAttribute("data-remove-index"));
                    attachedFiles.splice(idx, 1);
                    attachedUrls.splice(idx, 1);
                    updateAttachmentView();
                    return;
                }

                // 수정 버튼
                const editBtn = e.target.closest("[data-edit-index]");
                if (editBtn) {
                    editIndex = parseInt(editBtn.getAttribute("data-edit-index"));
                    imageInput.click();
                }
            });
        }

        return resetModal;
    }

    resetCompose = setupSubViews(composeOverlay);
    resetReply = setupSubViews(replyOverlay);

    // boardMenu 외부 클릭 닫기 (한 번만 등록)
    document.addEventListener("click", (e) => {
        const boardMenu = document.getElementById("boardMenu");
        if (boardMenu && !e.target.closest("#boardMenu") && !e.target.closest(".audienceButton")) {
            boardMenu.classList.add("off");
        }
    });

    // 8. 모바일 네비게이션
    const mobileItems = document.querySelectorAll(".mobileItem");

    mobileItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            mobileItems.forEach((mi) => {
                mi.classList.remove("active");
            });
            item.classList.add("active");
        });
    });

    // 9. 환율 피드
    const exchangeRateFeedContent = document.getElementById("exchangeRateFeedContent");
    const exchangeRateFeedSubtitle = document.getElementById("exchangeRateFeedSubtitle");

    if (exchangeRateFeedContent) {
        const currencyLabels = {
            KRW: "대한민국 원",
            EUR: "유로",
            JPY: "일본 엔",
            CNY: "중국 위안",
            GBP: "영국 파운드"
        };
        const codes = ["KRW", "EUR", "JPY", "CNY", "GBP"];

        function renderRates(rates, dateStr) {
            let html = "";
            for (let i = 0; i < codes.length; i++) {
                const code = codes[i];
                const label = currencyLabels[code] || code;
                const value = rates[code];
                const digits = code === "JPY" ? 2 : 4;
                const formatted = value.toLocaleString("ko-KR", {
                    minimumFractionDigits: digits,
                    maximumFractionDigits: digits
                });
                html += '<div class="exchangeRateRow">' +
                    '<div class="exchangeRateMain">' +
                    '<div class="exchangeRateCurrencyLine">' +
                    '<span class="exchangeRateCurrency">' + code + '</span>' +
                    '<span class="exchangeRateCurrencyName">' + label + '</span>' +
                    '</div>' +
                    '<span class="exchangeRateMeta">1 USD</span>' +
                    '</div>' +
                    '<div class="exchangeRateValueWrap">' +
                    '<span class="exchangeRateValue">' + formatted + '</span>' +
                    '</div>' +
                    '</div>';
            }
            exchangeRateFeedContent.innerHTML = html;

            if (exchangeRateFeedSubtitle && dateStr) {
                const d = new Date(dateStr);
                const month = (d.getMonth() + 1);
                const day = d.getDate();
                exchangeRateFeedSubtitle.textContent = "USD 기준 주요 통화 · " + month + "월 " + day + "일 기준";
            }
        }

        fetch("https://open.er-api.com/v6/latest/USD")
            .then((res) => { return res.json(); })
            .then((data) => {
                renderRates(data.rates, data.time_last_update_utc);
            })
            .catch((err) => {
                exchangeRateFeedContent.innerHTML = '<p class="exchangeRateFeedState">환율 정보를 불러오지 못했습니다.</p>';
            });
    }

    // 10. 오른쪽 사이드바 sticky top 계산
    const trendPanel = document.querySelector(".trendPanel");
    if (trendPanel) {
        const updateStickyTop = () => {
            const panelH = trendPanel.offsetHeight;
            const viewH = window.innerHeight;
            if (panelH > viewH) {
                trendPanel.style.top = -(panelH - viewH) + "px";
            } else {
                trendPanel.style.top = "0px";
            }
        };
        setTimeout(updateStickyTop, 0);
        window.addEventListener("resize", updateStickyTop);
    }

};

