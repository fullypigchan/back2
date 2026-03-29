window.onload = () => {
    "use strict";

    let memberId = null;

    // ===== 1. DOM 참조 =====
    const scrollEl = document.getElementById("categoryScroll");
    const btnLeft = document.getElementById("scrollLeft");
    const btnRight = document.getElementById("scrollRight");

    const modal = document.getElementById("disconnectModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalConfirm = document.getElementById("modalConfirm");
    const modalCancel = document.getElementById("modalCancel");

    const headerBackButton = document.getElementById("headerBack");

    // ===== 2. 화면 상태 =====
    const originalChipsHTML = scrollEl ? scrollEl.innerHTML : "";
    let pendingDisconnectButton = null;

    // ===== 3. 페이징 + 무한스크롤 =====
    let page = 1;
    let checkScroll = true;
    let hasMore = true;

    // 초기 데이터 로드
    const loadInitialData = async () => {
        const member = await friendsService.getMyInfo();
        memberId = member.id;

        await friendsService.getFriendsList(page, memberId, (data) => {
            friendsLayout.showFriendsList(data.friends, page);
            hasMore = data.criteria.hasMore;
        });
    };

    loadInitialData();

    // 무한스크롤
    window.addEventListener("scroll", async () => {
        if (!checkScroll || !hasMore) return;
        const { scrollY, innerHeight } = window;
        const documentHeight = document.documentElement.scrollHeight;
        if (scrollY + innerHeight >= documentHeight - 1) {
            checkScroll = false;
            page++;
            await friendsService.getFriendsList(page, memberId, (data) => {
                friendsLayout.showFriendsList(data.friends, page);
                hasMore = data.criteria.hasMore;
            });
            setTimeout(() => { checkScroll = true; }, 1000);
        }
    });

    // ===== 4. 카테고리 배너 =====
    function updateScrollArrowVisibility() {
        if (!scrollEl || !btnLeft || !btnRight) return;
        btnLeft.style.display = scrollEl.scrollLeft > 0 ? "flex" : "none";
        btnRight.style.display =
            scrollEl.scrollLeft < scrollEl.scrollWidth - scrollEl.clientWidth - 1
                ? "flex" : "none";
    }

    function scheduleScrollArrowVisibilityUpdate() {
        window.setTimeout(updateScrollArrowVisibility, 50);
    }

    function restoreMainCategories() {
        if (!scrollEl) return;
        scrollEl.innerHTML = originalChipsHTML;
        scrollEl.scrollLeft = 0;
        scheduleScrollArrowVisibilityUpdate();
    }

    function renderSubCategories(categoryName, subCategories) {
        if (!scrollEl) return;
        let nextMarkup =
            '<button class="cat-back-btn" title="대카테고리로 돌아가기"><svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(270 12 12)"/></svg></button>';
        nextMarkup += `<button class="cat-chip parent-highlight">${categoryName}</button>`;
        subCategories.forEach((subCategory) => {
            nextMarkup += `<button class="cat-chip" data-cat="${subCategory}" data-is-sub="true">${subCategory}</button>`;
        });
        scrollEl.innerHTML = nextMarkup;
        scrollEl.scrollLeft = 0;
        scheduleScrollArrowVisibilityUpdate();
    }

    function setActiveChip(chip) {
        if (!scrollEl || !chip) return;
        const allChips = scrollEl.querySelectorAll(".cat-chip:not(.parent-highlight)");
        allChips.forEach((chipButton) => {
            chipButton.classList.remove("active", "sub-active");
        });
        if (chip.dataset.isSub) {
            chip.classList.add("sub-active");
            return;
        }
        chip.classList.add("active");
    }

    function handleCategoryClick(event) {
        const clickedChip = event.target.closest(".cat-chip");
        const clickedBackButton = event.target.closest(".cat-back-btn");

        if (clickedBackButton) {
            restoreMainCategories();
            return;
        }
        if (!clickedChip) return;

        if (clickedChip.classList.contains("has-subs")) {
            const categoryName = clickedChip.dataset.cat || "";
            const subCategories = (clickedChip.dataset.subs || "").split(",").filter(Boolean);
            renderSubCategories(categoryName, subCategories);
            return;
        }
        setActiveChip(clickedChip);
    }

    // ===== 5. Connect/Disconnect =====
    function getHandleFromButton(button) {
        const userCard = button.closest("[data-handle]");
        if (userCard) return userCard.dataset.handle || "";
        return "";
    }

    function getMemberIdFromButton(button) {
        const userCard = button.closest("[data-member-id]");
        if (userCard) return userCard.dataset.memberId;
        return button.dataset.memberId;
    }

    function openDisconnectModal(button) {
        if (!modal || !modalTitle) return;
        pendingDisconnectButton = button;
        const handle = getHandleFromButton(button);
        modalTitle.textContent = handle
            ? `${handle} 님과의 연결을 끊으시겠습니까?`
            : "연결을 끊으시겠습니까?";
        modal.classList.add("active");
    }

    function closeDisconnectModal() {
        if (!modal) return;
        modal.classList.remove("active");
        pendingDisconnectButton = null;
    }

    function resetButtonToDefault(button) {
        button.classList.remove("connected");
        button.classList.add("default");
        button.textContent = "Connect";
        button.style.borderColor = "";
        button.style.color = "";
        button.style.background = "";
    }

    function setButtonToConnected(button) {
        button.classList.remove("default");
        button.classList.add("connected");
        button.textContent = "Connected";
    }

    function updateConnectedButtonHoverState(button, isHovering) {
        if (isHovering) {
            button.textContent = "Disconnect";
            button.style.borderColor = "#f4212e";
            button.style.color = "#f4212e";
            button.style.background = "rgba(244,33,46,.1)";
            return;
        }
        button.textContent = "Connected";
        button.style.borderColor = "#cfd9de";
        button.style.color = "#0f1419";
        button.style.background = "transparent";
    }

    async function handleConnectButtonClick(event) {
        const clickedButton = event.target.closest(".connect-btn");
        if (!clickedButton) return;

        const followingId = getMemberIdFromButton(clickedButton);

        if (clickedButton.classList.contains("default")) {
            await friendsService.follow(memberId, followingId);
            setButtonToConnected(clickedButton);
            return;
        }

        if (clickedButton.classList.contains("connected")) {
            openDisconnectModal(clickedButton);
        }
    }

    function handleConnectedButtonMouseOver(event) {
        const hoveredButton = event.target.closest(".connect-btn.connected");
        if (!hoveredButton) return;
        updateConnectedButtonHoverState(hoveredButton, true);
    }

    function handleConnectedButtonMouseOut(event) {
        const hoveredButton = event.target.closest(".connect-btn.connected");
        if (!hoveredButton) return;
        updateConnectedButtonHoverState(hoveredButton, false);
    }

    // ===== 6. 이벤트 바인딩 =====
    if (scrollEl) {
        scrollEl.addEventListener("scroll", updateScrollArrowVisibility);
        scrollEl.addEventListener("click", handleCategoryClick);
        window.addEventListener("resize", updateScrollArrowVisibility);
        updateScrollArrowVisibility();
    }

    if (btnLeft && scrollEl) {
        btnLeft.addEventListener("click", () => {
            scrollEl.scrollBy({ left: -200, behavior: "smooth" });
        });
    }

    if (btnRight && scrollEl) {
        btnRight.addEventListener("click", () => {
            scrollEl.scrollBy({ left: 200, behavior: "smooth" });
        });
    }

    if (modalConfirm) {
        modalConfirm.addEventListener("click", async () => {
            if (pendingDisconnectButton) {
                const followingId = getMemberIdFromButton(pendingDisconnectButton);
                await friendsService.unfollow(memberId, followingId);
                resetButtonToDefault(pendingDisconnectButton);
            }
            closeDisconnectModal();
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener("click", closeDisconnectModal);
    }

    if (modal) {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeDisconnectModal();
            }
        });
    }

    document.addEventListener("click", handleConnectButtonClick);
    document.addEventListener("mouseover", handleConnectedButtonMouseOver);
    document.addEventListener("mouseout", handleConnectedButtonMouseOut);

    if (headerBackButton) {
        headerBackButton.addEventListener("click", () => {
            history.back();
        });
    }

    console.log("[Friends] 페이지 로드 완료.");
};
