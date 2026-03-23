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
    const mainShareBookmarkSheet = document.getElementById("mainShareBookmarkSheet");

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

    document.querySelector(".share-menu-item--bookmark").addEventListener("click", (e) => {
        closeAllMenus();
        mainShareBookmarkSheet.classList.remove("off");
    });

    // 2-10. 공유 시트 닫기
    mainShareChatSheet.querySelector(".share-sheet__backdrop").addEventListener("click", (e) => {
        mainShareChatSheet.classList.add("off");
    });
    mainShareChatSheet.querySelector(".share-sheet__icon-btn").addEventListener("click", (e) => {
        mainShareChatSheet.classList.add("off");
    });
    mainShareBookmarkSheet.querySelector(".share-sheet__backdrop").addEventListener("click", (e) => {
        mainShareBookmarkSheet.classList.add("off");
    });
    mainShareBookmarkSheet.querySelector(".share-sheet__icon-btn").addEventListener("click", (e) => {
        mainShareBookmarkSheet.classList.add("off");
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
    const composeOverlay = document.querySelector("[data-compose-modal]");
    const composeClose = composeOverlay.querySelector(".tweet-modal__close");
    const composeEditor = composeOverlay.querySelector(".tweet-modal__editor");
    const composeGaugeText = composeOverlay.querySelector(".composerGaugeText");
    const composeSubmit = composeOverlay.querySelector(".tweet-modal__submit");
    const composeMaxLength = 300;

    const createPostButton = document.getElementById("createPostButton");
    createPostButton.addEventListener("click", (e) => {
        composeOverlay.classList.remove("off");
        composeEditor.focus();
    });

    composeClose.addEventListener("click", (e) => {
        composeOverlay.classList.add("off");
    });

    composeOverlay.addEventListener("click", (e) => {
        if (e.target === composeOverlay) {
            composeOverlay.classList.add("off");
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
        composeEditor.textContent = "";
        composeGaugeText.textContent = composeMaxLength;
        composeGaugeText.style.color = "";
        composeSubmit.disabled = true;
        composeOverlay.classList.add("off");
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

    replyClose.addEventListener("click", (e) => {
        replyOverlay.classList.add("off");
    });

    replyOverlay.addEventListener("click", (e) => {
        if (e.target === replyOverlay) {
            replyOverlay.classList.add("off");
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
        replyEditor.textContent = "";
        replyGaugeText.textContent = replyMaxLength;
        replyGaugeText.style.color = "";
        replySubmit.disabled = true;
        replyOverlay.classList.add("off");
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

        // 임시저장
        const draftBtn = overlay.querySelector(".tweet-modal__draft");
        if (draftBtn && draftView) {
            draftBtn.addEventListener("click", (e) => { showSubView(draftView); });
        }
        const draftBack = draftView ? draftView.querySelector(".draft-panel__back") : null;
        if (draftBack) {
            draftBack.addEventListener("click", (e) => { backToCompose(); });
        }

        // 위치
        const geoBtn = overlay.querySelector(".tweet-modal__tool-btn--geo");
        if (geoBtn && locationView) {
            geoBtn.addEventListener("click", (e) => { showSubView(locationView); });
        }
        const locationClose = locationView ? locationView.querySelector(".tweet-modal__location-close") : null;
        if (locationClose) {
            locationClose.addEventListener("click", (e) => { backToCompose(); });
        }
        const locationComplete = locationView ? locationView.querySelector("[data-location-complete]") : null;
        if (locationComplete) {
            locationComplete.addEventListener("click", (e) => { backToCompose(); });
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

        // 판매글
        const productClose = productView ? productView.querySelector("[data-product-select-close]") : null;
        if (productClose) {
            productClose.addEventListener("click", (e) => { backToCompose(); });
        }
        const productComplete = productView ? productView.querySelector("[data-product-select-complete]") : null;
        if (productComplete) {
            productComplete.addEventListener("click", (e) => { backToCompose(); });
        }
    }

    setupSubViews(composeOverlay);
    setupSubViews(replyOverlay);

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

