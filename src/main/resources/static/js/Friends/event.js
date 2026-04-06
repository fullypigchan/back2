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
    let pendingDisconnectButton = null;
    let selectedCategoryId = null;

    // ===== 3. 페이징 + 무한스크롤 =====
    let page = 1;
    let checkScroll = true;
    let hasMore = true;

    // 카테고리 데이터 (서버에서 로드)
    let categories = [];
    let originalChipsHTML = "";

    const loadFriendsList = async () => {
        await friendsService.getFriendsList(page, memberId, selectedCategoryId, (data) => {
            friendsLayout.showFriendsList(data.friends, page);
            hasMore = data.criteria.hasMore;
        });
    };

    // 카테고리 칩 렌더링 (대카테고리만)
    const renderCategoryChips = () => {
        if (!scrollEl) return;
        console.log("들어옴1 renderCategoryChips, categories:", categories);

        const parents = categories.filter(c => c.productCategoryParentId === null);

        let html = `<button class="cat-chip active" data-cat-id="">전체</button>`;
        parents.forEach(parent => {
            html += `<button class="cat-chip" data-cat-id="${parent.id}">${parent.categoryName}</button>`;
        });

        scrollEl.innerHTML = html;
        originalChipsHTML = html;
        scrollEl.scrollLeft = 0;
        scheduleScrollArrowVisibilityUpdate();
    };

    // 초기 데이터 로드
    const loadInitialData = async () => {
        const member = await friendsService.getMyInfo();
        memberId = member.id;

        await friendsService.getCategories((data) => {
            categories = data;
            renderCategoryChips();
        });

        await loadFriendsList();
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
            await loadFriendsList();
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

    function setActiveChip(chip) {
        if (!scrollEl || !chip) return;
        const allChips = scrollEl.querySelectorAll(".cat-chip");
        allChips.forEach((chipButton) => {
            chipButton.classList.remove("active");
        });
        chip.classList.add("active");
    }

    async function handleCategoryClick(event) {
        const clickedChip = event.target.closest(".cat-chip");
        if (!clickedChip) return;
        console.log("들어옴1 handleCategoryClick, catId:", clickedChip.dataset.catId);

        setActiveChip(clickedChip);

        // 카테고리 필터 적용
        const catId = clickedChip.dataset.catId;
        selectedCategoryId = catId || null;
        page = 1;
        await loadFriendsList();
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
