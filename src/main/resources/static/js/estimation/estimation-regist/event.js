window.addEventListener("load", () => {
    const createPostButton = document.getElementById("createPostButton");
    const submitButton = document.getElementById("postSubmitButton");
    const productSelectButton = document.getElementById("productSelectButton");
    const productSelectModal = document.getElementById("productSelectModal");
    const productSelectBackdrop = document.getElementById(
        "productSelectBackdrop",
    );
    const productSelectClose = document.getElementById("productSelectClose");
    const productSelectConfirm = document.getElementById(
        "productSelectConfirm",
    );
    const productSelectList = document.getElementById("productSelectList");
    const productItems = Array.from(
        document.querySelectorAll(
            "#productSelectList .productSelectModal__item",
        ),
    );
    const productSelectEmpty = document.getElementById("productSelectEmpty");
    const selectedProductPreview = document.getElementById(
        "selectedProductPreview",
    );
    const selectedProductImage = document.getElementById(
        "selectedProductImage",
    );
    const selectedProductName = document.getElementById("selectedProductName");
    const selectedProductMeta = document.getElementById("selectedProductMeta");
    const selectedProductRemove = document.getElementById(
        "selectedProductRemove",
    );
    const userLinkButton = document.getElementById("composerUserLinkButton");
    const linkedProfile = document.getElementById("composerLinkedProfile");
    const linkedProfileAvatar = document.getElementById(
        "composerLinkedProfileAvatar",
    );
    const linkedProfileEmail = document.getElementById(
        "composerLinkedProfileEmail",
    );
    const shareChatSheet = document.getElementById("estimationShareChatSheet");
    const shareChatSearch = document.getElementById(
        "estimationShareChatSearch",
    );
    const shareChatCloseButtons = Array.from(
        document.querySelectorAll("[data-estimation-share-close]"),
    );
    const shareUserButtons = Array.from(
        document.querySelectorAll(
            "#estimationShareChatUserList .share-sheet__user",
        ),
    );
    const requiredFields = Array.from(
        document.querySelectorAll(
            'input[name="postName"], input[name="postPrice"], textarea[name="postContent"]',
        ),
    );
    let selectedProductId = "";

    const syncSubmitState = () => {
        if (!submitButton || requiredFields.length === 0) {
            return;
        }

        submitButton.disabled = requiredFields.some(
            (field) => !field.value.trim(),
        );
    };

    const renderSelectedProduct = () => {
        if (!selectedProductPreview) {
            return;
        }

        const product = productItems.find(
            (item) => item.dataset.productId === selectedProductId,
        );
        if (
            !product ||
            !selectedProductImage ||
            !selectedProductName ||
            !selectedProductMeta
        ) {
            selectedProductPreview.hidden = true;
            return;
        }

        selectedProductPreview.hidden = false;
        selectedProductImage.src = product.dataset.productImage || "";
        selectedProductImage.alt = product.dataset.productName || "";
        selectedProductName.textContent = product.dataset.productName || "";
        selectedProductMeta.textContent = product.dataset.productMeta || "";
    };

    const syncProductSelection = () => {
        if (!productSelectConfirm) {
            return;
        }

        if (productSelectEmpty) {
            productSelectEmpty.hidden = productItems.length > 0;
        }
        productItems.forEach((item) => {
            const isSelected = item.dataset.productId === selectedProductId;
            item.classList.toggle("is-selected", isSelected);
            item.setAttribute("aria-pressed", String(isSelected));
        });
        productSelectConfirm.disabled = !selectedProductId;
    };

    const openProductSelectModal = () => {
        if (!productSelectModal) {
            return;
        }

        syncProductSelection();
        productSelectModal.hidden = false;
    };

    const closeProductSelectModal = () => {
        if (!productSelectModal) {
            return;
        }

        productSelectModal.hidden = true;
    };

    const openShareChatSheet = () => {
        if (!shareChatSheet) {
            return;
        }

        shareChatSheet.hidden = false;
    };

    const closeShareChatSheet = () => {
        if (!shareChatSheet) {
            return;
        }

        shareChatSheet.hidden = true;
    };

    const syncShareUsers = () => {
        const keyword = shareChatSearch?.value.trim().toLowerCase() || "";

        shareUserButtons.forEach((button) => {
            const name = (button.dataset.shareUserName || "").toLowerCase();
            const email = (button.dataset.shareUserEmail || "").toLowerCase();
            button.hidden =
                Boolean(keyword) &&
                !name.includes(keyword) &&
                !email.includes(keyword);
        });
    };

    const selectLinkedProfile = (button) => {
        if (!linkedProfile || !linkedProfileAvatar || !linkedProfileEmail) {
            return;
        }

        linkedProfile.setAttribute("aria-hidden", "false");
        linkedProfileAvatar.src = button.dataset.shareUserAvatar || "";
        linkedProfileAvatar.alt = button.dataset.shareUserName || "";
        linkedProfileEmail.textContent = button.dataset.shareUserEmail || "";
        closeShareChatSheet();
    };

    if (!createPostButton) {
        return;
    }

    requiredFields.forEach((field) => {
        field.addEventListener("input", syncSubmitState);
    });

    productSelectButton?.addEventListener("click", openProductSelectModal);
    productSelectClose?.addEventListener("click", closeProductSelectModal);
    productSelectBackdrop?.addEventListener("click", closeProductSelectModal);
    productSelectConfirm?.addEventListener("click", () => {
        renderSelectedProduct();
        closeProductSelectModal();
    });
    selectedProductRemove?.addEventListener("click", () => {
        selectedProductId = "";
        renderSelectedProduct();
    });
    userLinkButton?.addEventListener("click", openShareChatSheet);
    shareChatCloseButtons.forEach((button) => {
        button.addEventListener("click", closeShareChatSheet);
    });
    shareChatSearch?.addEventListener("input", syncShareUsers);
    shareUserButtons.forEach((button) => {
        button.addEventListener("click", () => {
            selectLinkedProfile(button);
        });
    });
    productSelectList?.addEventListener("click", (event) => {
        const item = event.target.closest("[data-product-id]");
        if (!(item instanceof HTMLElement)) {
            return;
        }

        selectedProductId = item.dataset.productId || "";
        syncProductSelection();
    });

    syncSubmitState();
    syncProductSelection();
    renderSelectedProduct();
    syncShareUsers();

    const composerModalOverlay = document.getElementById("composerModalOverlay");
    const composerSection = document.getElementById("composerSection");
    const composerModalClose = document.getElementById("composerModalClose");

    const openComposerModal = () => {
        composerModalOverlay && (composerModalOverlay.hidden = false);
        composerSection && (composerSection.hidden = false);
    };

    const closeComposerModal = () => {
        composerModalOverlay && (composerModalOverlay.hidden = true);
        composerSection && (composerSection.hidden = true);
    };

    createPostButton?.addEventListener("click", openComposerModal);
    composerModalClose?.addEventListener("click", closeComposerModal);
    composerModalOverlay?.addEventListener("click", closeComposerModal);

// 자동 오픈
    window.setTimeout(openComposerModal, 0);


    window.setTimeout(() => {
        createPostButton.click();
    }, 0);
});
