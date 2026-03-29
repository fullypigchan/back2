(function () {
    "use strict";

    const headerTitle = document.getElementById("headerTitle");
    const defaultHeaderTitle =
        headerTitle?.dataset.defaultTitle || "모든 북마크";
    const backButton = document.getElementById("headerBack");
    const modalOpenButton = document.getElementById("modalOpenButton");
    const detailMoreButton = document.getElementById("detailMoreButton");
    const listView = document.getElementById("bookmarkListView");
    const detailView = document.getElementById("bookmarkDetailView");
    const bookmarkPosts = document.getElementById("bookmarkPosts");
    const searchInput = document.getElementById("bookmarkSearch");
    const searchBox = document.getElementById("searchBox");
    const bookmarkFolderButton = document.getElementById("bookmarkFolderButton");
    const bookmarkFolderLabel = document.getElementById("bookmarkFolderLabel");
    const bookmarkList = document.querySelector(".bookmark-list");
    const bookmarkPostsEmpty = document.getElementById("bookmarkPostsEmpty");
    const detailFolderMenu = document.getElementById("detailFolderMenu");
    const detailFolderEditButton = document.getElementById(
        "detailFolderEditButton",
    );
    const shareChatModal = document.getElementById("shareChatModal");
    const shareChatSearchInput = document.getElementById("shareChatSearchInput");
    const shareChatList = document.getElementById("shareChatList");
    const shareDropdown = document.getElementById("shareDropdown");
    const shareBookmarkModal = document.getElementById("shareBookmarkModal");
    const shareBookmarkCreateFolder = document.getElementById(
        "shareBookmarkCreateFolder",
    );
    const shareBookmarkFolderButton = document.getElementById(
        "shareBookmarkFolderButton",
    );
    const shareBookmarkFolderCheck = document.getElementById(
        "shareBookmarkFolderCheck",
    );

    const bookmarkModal = document.getElementById("bookmarkModal");
    const modalCloseButton = document.getElementById("modalCloseButton");
    const modalSubmitButton = document.getElementById("modalSubmitButton");
    const folderNameInput = document.getElementById("folderNameInput");
    const folderNameCount = document.getElementById("folderNameCount");
    const bookmarkEditModal = document.getElementById("bookmarkEditModal");
    const editModalCloseButton = document.getElementById("editModalCloseButton");
    const editModalSubmitButton = document.getElementById(
        "editModalSubmitButton",
    );
    const editModalDeleteButton = document.getElementById(
        "editModalDeleteButton",
    );
    const editFolderNameInput = document.getElementById("editFolderNameInput");
    const editFolderNameCount = document.getElementById("editFolderNameCount");
    const bookmarkDeleteModal = document.getElementById("bookmarkDeleteModal");
    const deleteModalSubmitButton = document.getElementById(
        "deleteModalSubmitButton",
    );
    const deleteModalCancelButton = document.getElementById(
        "deleteModalCancelButton",
    );
    const bookmarkToast = document.getElementById("bookmarkToast");
    const bookmarkBlockModal = document.getElementById("bookmarkBlockModal");
    const bookmarkBlockTitle = document.getElementById("bookmarkBlockTitle");
    const bookmarkBlockDesc = document.getElementById("bookmarkBlockDesc");
    const bookmarkBlockConfirmButton = document.getElementById(
        "bookmarkBlockConfirmButton",
    );
    const bookmarkBlockCancelButton = document.getElementById(
        "bookmarkBlockCancelButton",
    );
    const bookmarkReportModal = document.getElementById("bookmarkReportModal");

    const mediaPreviewOverlay = document.getElementById("mediaPreviewOverlay");
    const mediaPreviewImage = document.getElementById("mediaPreviewImage");
    const mediaPreviewClose = document.getElementById("mediaPreviewClose");

    const replyModalOverlay = document.getElementById("bookmarkReplyModal");
    const q = (sel) => replyModalOverlay?.querySelector(sel);
    const qAll = (sel) => replyModalOverlay?.querySelectorAll(sel) ?? [];

    const replyModal = q(".tweet-modal");
    const replyCloseButton = q(".tweet-modal__close");
    const replyEditor = q(".tweet-modal__editor");
    const replySubmitButton = q("[data-testid='tweetButton']");
    const replyGauge = q("#bookmarkReplyGauge");
    const replyGaugeText = q("#bookmarkReplyGaugeText");
    const replySourceAvatar = q(".tweet-modal__source-avatar");
    const replySourceName = q(".tweet-modal__source-name");
    const replySourceHandle = q(".tweet-modal__source-handle");
    const replySourceTime = q(".tweet-modal__source-time");
    const replySourceText = q(".tweet-modal__source-text");
    const replyContextButton = q(".tweet-modal__context-button");
    const replyFooterMeta = q(".tweet-modal__footer-meta");
    const replyFormatButtons = qAll("[data-format]");
    const replyEmojiButton = q("[data-testid='emojiButton']");
    const replyMediaUploadButton = q("[data-testid='mediaUploadButton']");
    const replyFileInput = q("[data-testid='fileInput']");
    const replyAttachmentPreview = q("[data-attachment-preview]");
    const replyAttachmentMedia = q("[data-attachment-media]");
    const composeView = q(".tweet-modal__compose-view");
    const replyGeoButton = q("[data-testid='geoButton']");
    const replyLocationDisplayButton = q("[data-location-display]");
    const replyLocationName = q("[data-location-name]");
    const replyLocationView = q(".tweet-modal__location-view");
    const replyLocationCloseButton = q(".tweet-modal__location-close");
    const replyLocationDeleteButton = q("[data-location-delete]");
    const replyLocationCompleteButton = q("[data-location-complete]");
    const replyLocationSearchInput = q("[data-location-search]");
    const replyLocationList = q("[data-location-list]");
    const replyUserTagTrigger = q("[data-user-tag-trigger]");
    const replyUserTagLabel = q("[data-user-tag-label]");
    const replyTagView = q(".tweet-modal__tag-view");
    const replyTagCloseButton = q("[data-testid='tag-back']");
    const replyTagCompleteButton = q("[data-tag-complete]");
    const replyTagSearchForm = q("[data-tag-search-form]");
    const replyTagSearchInput = q("[data-tag-search]");
    const replyTagChipList = q("[data-tag-chip-list]");
    const replyTagResults = q("[data-tag-results]");
    const replyMediaAltTrigger = q("[data-media-alt-trigger]");
    const replyMediaAltLabel = q("[data-media-alt-label]");
    const replyMediaView = q(".tweet-modal__media-view");
    const replyMediaBackButton = q("[data-testid='media-back']");
    const replyMediaPrevButton = q("[data-media-prev]");
    const replyMediaNextButton = q("[data-media-next]");
    const replyMediaSaveButton = q("[data-media-save]");
    const replyMediaTitle = q("[data-media-title]");
    const replyMediaPreviewImages = qAll("[data-media-preview-image]");
    const replyMediaAltInput = q("[data-media-alt-input]");
    const replyMediaAltCount = q("[data-media-alt-count]");
    const replyDraftView = q(".tweet-modal__draft-view");
    const replyDraftButton = q("[data-testid='unsentButton']");
    const replyProductButton = q("[data-testid='productSelectButton']");
    const replyProductView = q("[data-product-select-modal]");
    const productSelectClose = replyProductView?.querySelector("[data-product-select-close]");
    const productSelectList = replyProductView?.querySelector("[data-product-select-list]");
    const productSelectComplete = replyProductView?.querySelector("[data-product-select-complete]");
    const productSelectEmpty = replyProductView?.querySelector("[data-product-empty]");

    let isDetailViewOpen = false;
    let activeShareDropdown = null;
    let activeShareButton = null;
    let activeShareModal = null;
    let activeShareBookmarkButton = null;
    let activeShareBookmarkPostId = "";
    let activeMorePostMeta = null;
    let toastTimer = null;
    let currentFolderId = null;
    let currentFolderName = "모든 북마크";
    let currentFolderDeleted = false;
    const bookmarkFollowState = new Map();
    const bookmarkFolderList = document.getElementById("bookmarkFolderList");

    // ── API + 렌더링은 service.js, layout.js 모듈 사용 ──

    function handleResult(result) {
        if (!result.ok && result.message) showToast(result.message);
        return result.ok ? result.data : null;
    }

    async function loadFolders() {
        if (typeof memberId === "undefined" || !memberId) return;
        const result = await BookmarkService.getFolders(memberId);
        if (result.ok) BookmarkLayout.renderFolderList(bookmarkFolderList, result.data);
        else if (result.message) showToast(result.message);
    }

    async function loadAllBookmarks() {
        if (typeof memberId === "undefined" || !memberId) return;
        const result = await BookmarkService.getAll(memberId);
        if (result.ok) BookmarkLayout.renderPostList(bookmarkPosts, result.data, bookmarkPostsEmpty);
        else if (result.message) showToast(result.message);
    }

    async function loadFolderBookmarks(folderId) {
        const result = await BookmarkService.getByFolder(folderId);
        if (result.ok) BookmarkLayout.renderPostList(bookmarkPosts, result.data, bookmarkPostsEmpty);
        else if (result.message) showToast(result.message);
    }

    async function loadUncategorizedBookmarks() {
        if (typeof memberId === "undefined" || !memberId) return;
        const result = await BookmarkService.getUncategorized(memberId);
        if (result.ok) BookmarkLayout.renderPostList(bookmarkPosts, result.data, bookmarkPostsEmpty);
        else if (result.message) showToast(result.message);
    }

    let activeReplyTrigger = null;
    let attachedReplyFiles = [];
    let attachedReplyFileUrls = [];
    let replyEmojiLibraryPicker = null;
    const replyMaxLength = 500;
    const maxReplyImages = 4;
    const maxReplyMediaAltLength = 1000;

    let selectedLocation = null, pendingLocation = null;
    let selectedTaggedUsers = [], pendingTaggedUsers = [];
    let replyMediaEdits = [], pendingReplyMediaEdits = [], activeReplyMediaIndex = 0;
    let pendingAttachmentEditIndex = null, cachedLocationNames = [];
    let selectedProduct = null;

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function buildShareAvatarDataUri(label) {
        const safeLabel = escapeHtml((label || "?").slice(0, 2));
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="#1d9bf0"></rect><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#ffffff">${safeLabel}</text></svg>`;
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    }

    function getBookmarkPostCards() {
        return Array.from(bookmarkPosts?.querySelectorAll(".bookmark-post") ?? []);
    }

    function toggleClassModal(modal, isOpen) {
        if (!modal) {
            return;
        }
        modal.classList.toggle("is-open", isOpen);
        modal.setAttribute("aria-hidden", String(!isOpen));
    }

    function toggleHiddenLayer(layer, isOpen) {
        if (!layer) {
            return;
        }
        layer.hidden = !isOpen;
    }

    function resetFloatingLayer(layer, button) {
        if (!layer) {
            return;
        }
        layer.hidden = true;
        layer.style.removeProperty("top");
        layer.style.removeProperty("left");
        button?.setAttribute("aria-expanded", "false");
    }

    function resetPostMoreMenus() {
        document.querySelectorAll(".bookmark-post-more-menu").forEach((menu) => {
            menu.hidden = true;
        });
        document.querySelectorAll("[data-post-more]").forEach((button) => {
            button.setAttribute("aria-expanded", "false");
        });
    }

    function syncBookmarkPostsEmpty() {
        if (bookmarkPostsEmpty) {
            bookmarkPostsEmpty.hidden = getBookmarkPostCards().length !== 0;
        }
    }

    function setHeaderTitle(title) {
        if (headerTitle) {
            headerTitle.textContent = title;
        }
    }

    function getTextContent(element) {
        return element?.textContent?.replace(/\s+/g, " ").trim() || "";
    }

    function syncFolderNameUI() {
        if (isDetailViewOpen) {
            setHeaderTitle(currentFolderName);
        }
    }

    function showToast(message) {
        if (!bookmarkToast) {
            return;
        }
        bookmarkToast.textContent = message;
        bookmarkToast.hidden = false;
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => {
            bookmarkToast.hidden = true;
        }, 3000);
    }

    function closeShareModal() {
        if (!activeShareModal) {
            return;
        }
        toggleHiddenLayer(activeShareModal, false);
        activeShareModal = null;
        activeShareBookmarkButton = null;
        activeShareBookmarkPostId = "";
        if (shareChatSearchInput) {
            shareChatSearchInput.value = "";
        }
        updateBodyScrollLock();
    }

    function closeShareDropdown() {
        resetFloatingLayer(shareDropdown, activeShareButton);
        activeShareDropdown = null;
        activeShareButton = null;
    }

    function closeDetailFolderMenu() {
        resetFloatingLayer(detailFolderMenu, detailMoreButton);
    }

    function closePostMenus() {
        closeShareModal();
        closeShareDropdown();
        closeDetailFolderMenu();
        activeMorePostMeta = null;
        resetPostMoreMenus();
    }

    function setBookmarkButtonState(button, isActive) {
        const path = button?.querySelector("path");
        if (!button || !path) {
            return;
        }
        button.classList.toggle("active", isActive);
        button.setAttribute(
            "aria-label",
            isActive ? "북마크에 추가됨" : "북마크",
        );
        path.setAttribute(
            "d",
            isActive
                ? path.dataset.pathActive || path.getAttribute("d")
                : path.dataset.pathInactive || path.getAttribute("d"),
        );
    }

    function getShareUsers() {
        return getBookmarkPostCards().map((postCard) => {
            const name =
                postCard.querySelector(".bookmark-post-name")?.textContent?.trim() ||
                "사용자";
            const handle =
                postCard.querySelector(".bookmark-post-handle")?.textContent?.trim() ||
                "@user";
            const avatarImage = postCard.querySelector(".bookmark-post-avatar img");
            const avatarText =
                postCard.querySelector(".bookmark-post-avatar")?.textContent?.trim() ||
                name.charAt(0);
            return {
                id: `post-${postCard.dataset.postId || ""}`,
                name,
                handle,
                avatar:
                    avatarImage?.getAttribute("src") ||
                    buildShareAvatarDataUri(avatarText),
            };
        });
    }

    function getSharePostMeta(button) {
        const postCard = button.closest(".bookmark-post");
        const handle =
            postCard?.querySelector(".bookmark-post-handle")?.textContent?.trim() ||
            "@user";
        const postId = postCard?.dataset.postId || "1";
        const bookmarkButton =
            postCard?.querySelector("[data-action='bookmark']") ?? null;
        const url = new URL(window.location.href);
        url.pathname = `/${handle.replace("@", "")}/status/${postId}`;
        url.hash = "";
        url.search = "";
        return {permalink: url.toString(), bookmarkButton, postId};
    }

    function getBookmarkMoreMeta(button) {
        const postCard = button.closest(".bookmark-post");
        const handle =
            postCard?.querySelector(".bookmark-post-handle")?.textContent?.trim() ||
            "@user";
        return {postCard, handle};
    }

    function getFollowMenuIcon(isFollowing) {
        return isFollowing
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></svg>'
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm4 7c-3.053 0-5.563 1.193-7.443 3.596l1.548 1.207C5.573 15.922 7.541 15 10 15s4.427.922 5.895 2.803l1.548-1.207C15.563 14.193 13.053 13 10 13zm8-6V5h-3V3h-2v2h-3v2h3v3h2V7h3z"></path></svg>';
    }

    function syncBookmarkMoreMenu(menu, handle) {
        const isFollowing = bookmarkFollowState.get(handle) ?? false;
        const followLabel = menu.querySelector("[data-follow-label]");
        const followIcon = menu.querySelector("[data-follow-icon]");
        if (followLabel) {
            followLabel.textContent = isFollowing
                ? `${handle} 님 언팔로우하기`
                : `${handle} 님 팔로우하기`;
        }
        if (followIcon) {
            followIcon.innerHTML = getFollowMenuIcon(isFollowing);
        }
    }

    function copyShareLink(button) {
        const {permalink} = getSharePostMeta(button);
        closeShareDropdown();
        if (!navigator.clipboard?.writeText) {
            showToast("링크를 복사하지 못했습니다");
            return;
        }
        navigator.clipboard
            .writeText(permalink)
            .then(() => showToast("클립보드로 복사함"))
            .catch(() => showToast("링크를 복사하지 못했습니다"));
    }

    function getShareUserRows(users) {
        if (users.length === 0) {
            return '<div class="bookmark-share-sheet-empty"><p>전송할 수 있는 사용자가 없습니다.</p></div>';
        }

        return users
            .map(
                (user) => `
                    <button type="button" class="bookmark-share-sheet-user" data-share-user-name="${escapeHtml(user.name)}">
                        <span class="bookmark-share-sheet-user-avatar">
                            <img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}" />
                        </span>
                        <span class="bookmark-share-sheet-user-body">
                            <span class="bookmark-share-sheet-user-name">${escapeHtml(user.name)}</span>
                            <span class="bookmark-share-sheet-user-handle">${escapeHtml(user.handle)}</span>
                        </span>
                    </button>
                `,
            )
            .join("");
    }

    function openShareChatModal() {
        closeShareDropdown();
        closeShareModal();
        const users = getShareUsers();
        if (shareChatList) {
            shareChatList.innerHTML = getShareUserRows(users);
        }
        if (shareChatSearchInput) {
            shareChatSearchInput.value = "";
        }
        if (!shareChatModal) {
            return;
        }
        toggleHiddenLayer(shareChatModal, true);
        activeShareModal = shareChatModal;
        updateBodyScrollLock();
    }

    function openShareBookmarkModal(button) {
        const {bookmarkButton, postId} = getSharePostMeta(button);
        closeShareDropdown();
        closeShareModal();
        activeShareBookmarkButton = bookmarkButton;
        activeShareBookmarkPostId = postId;
        shareBookmarkFolderCheck?.classList.toggle(
            "bookmark-share-sheet-folder-check--active",
            bookmarkButton?.classList.contains("active") ?? false,
        );
        if (!shareBookmarkModal) {
            return;
        }
        toggleHiddenLayer(shareBookmarkModal, true);
        activeShareModal = shareBookmarkModal;
        updateBodyScrollLock();
    }

    function positionDropdownLayer(layer, anchorRect) {
        const menu = layer.querySelector(".dropdown-menu");
        if (!menu) {
            return;
        }
        const wasHidden = layer.hidden;
        if (wasHidden) {
            layer.hidden = false;
            layer.style.visibility = "hidden";
        }
        const spacing = 8;
        const viewportPadding = 8;
        const menuRect = menu.getBoundingClientRect();
        const top = Math.min(
            Math.max(viewportPadding, anchorRect.bottom + spacing),
            Math.max(
                viewportPadding,
                window.innerHeight - menuRect.height - viewportPadding,
            ),
        );
        const left = Math.min(
            Math.max(
                viewportPadding,
                anchorRect.right - menuRect.width,
            ),
            Math.max(
                viewportPadding,
                window.innerWidth - menuRect.width - viewportPadding,
            ),
        );
        if (wasHidden) {
            layer.hidden = true;
            layer.style.removeProperty("visibility");
        }
        layer.style.top = `${top}px`;
        layer.style.left = `${left}px`;
    }

    function positionDetailFolderMenu() {
        if (!detailFolderMenu || !detailMoreButton) {
            return;
        }
        const rect = detailMoreButton.getBoundingClientRect();
        const spacing = 8;
        const viewportPadding = 8;
        const menuRect = detailFolderMenu.getBoundingClientRect();
        const top = Math.min(
            Math.max(viewportPadding, rect.bottom + spacing),
            Math.max(
                viewportPadding,
                window.innerHeight - menuRect.height - viewportPadding,
            ),
        );
        const left = Math.min(
            Math.max(viewportPadding, rect.right - menuRect.width),
            Math.max(
                viewportPadding,
                window.innerWidth - menuRect.width - viewportPadding,
            ),
        );
        detailFolderMenu.style.top = `${top}px`;
        detailFolderMenu.style.left = `${left}px`;
    }

    function openDetailFolderMenu() {
        if (!detailFolderMenu || !detailMoreButton || detailMoreButton.hidden) {
            return;
        }
        closePostMenus();
        detailFolderMenu.hidden = false;
        detailMoreButton.setAttribute("aria-expanded", "true");
        positionDetailFolderMenu();
    }

    function closeDeleteModal() {
        toggleClassModal(bookmarkDeleteModal, false);
        updateBodyScrollLock();
    }

    function openDeleteModal() {
        if (!bookmarkDeleteModal) {
            return;
        }
        closeDetailFolderMenu();
        toggleClassModal(bookmarkDeleteModal, true);
        updateBodyScrollLock();
        window.setTimeout(() => deleteModalSubmitButton?.focus(), 0);
    }

    async function deleteCurrentFolder() {
        if (!currentFolderId) return;
        await BookmarkService.deleteFolder(currentFolderId);
        currentFolderDeleted = true;
        closeDeleteModal();
        if (isDetailViewOpen) {
            closeBookmarkDetail();
        }
        await loadFolders();
        showToast("폴더를 삭제했습니다");
    }

    function openShareDropdown(button) {
        if (!shareDropdown) {
            return;
        }
        closePostMenus();
        const rect = button.getBoundingClientRect();
        positionDropdownLayer(shareDropdown, rect);
        toggleHiddenLayer(shareDropdown, true);
        activeShareDropdown = shareDropdown;
        activeShareButton = button;
        activeShareButton.setAttribute("aria-expanded", "true");
    }

    function isBookmarkNotificationModalOpen() {
        return (
            bookmarkBlockModal?.hidden === false ||
            bookmarkReportModal?.hidden === false
        );
    }

    function closeBookmarkNotificationModal() {
        toggleHiddenLayer(bookmarkBlockModal, false);
        toggleHiddenLayer(bookmarkReportModal, false);
        activeMorePostMeta = null;
        updateBodyScrollLock();
    }

    function openBookmarkBlockModal(meta) {
        if (!bookmarkBlockModal || !bookmarkBlockTitle || !bookmarkBlockDesc) {
            return;
        }
        closePostMenus();
        activeMorePostMeta = meta;
        bookmarkBlockTitle.textContent = `${meta.handle} 님을 차단할까요?`;
        bookmarkBlockDesc.textContent = `내 공개 게시물을 볼 수 있지만 더 이상 게시물에 참여할 수 없습니다. 또한 ${meta.handle} 님은 나를 팔로우하거나 쪽지를 보낼 수 없으며, 이 계정과 관련된 알림도 내게 표시되지 않습니다.`;
        toggleHiddenLayer(bookmarkBlockModal, true);
        updateBodyScrollLock();
    }

    function openBookmarkReportModal(meta) {
        if (!bookmarkReportModal) {
            return;
        }
        closePostMenus();
        activeMorePostMeta = meta;
        toggleHiddenLayer(bookmarkReportModal, true);
        updateBodyScrollLock();
    }

    function handleBookmarkMoreAction(action, menuItem) {
        const button = menuItem
            .closest(".bookmark-post-more-wrap")
            ?.querySelector("[data-post-more]");
        const meta = button ? getBookmarkMoreMeta(button) : null;
        if (!meta) {
            return;
        }
        if (action === "follow-toggle") {
            const isFollowing = bookmarkFollowState.get(meta.handle) ?? false;
            bookmarkFollowState.set(meta.handle, !isFollowing);
            closePostMenus();
            showToast(
                isFollowing
                    ? `${meta.handle} 님 팔로우를 취소했습니다`
                    : `${meta.handle} 님을 팔로우했습니다`,
            );
            return;
        }
        if (action === "block") {
            openBookmarkBlockModal(meta);
            return;
        }
        if (action === "report") {
            openBookmarkReportModal(meta);
        }
    }

    async function removeBookmarkedPost(postId) {
        const postCard = bookmarkPosts?.querySelector(
            `.bookmark-post[data-post-id="${postId}"]`,
        );
        if (!postCard) return false;
        const bookmarkId = postCard.dataset.bookmarkId;
        if (bookmarkId) {
            await BookmarkService.remove(bookmarkId);
        } else if (typeof memberId !== "undefined" && memberId) {
            await BookmarkService.removeByPost(memberId, postId);
        }
        postCard.remove();
        syncBookmarkPostsEmpty();
        showToast("북마크에서 삭제했습니다");
        return true;
    }

    function updateBodyScrollLock() {
        const shouldLock =
            Boolean(activeShareModal) ||
            isBookmarkNotificationModalOpen() ||
            bookmarkModal?.classList.contains("is-open") ||
            bookmarkEditModal?.classList.contains("is-open") ||
            bookmarkDeleteModal?.classList.contains("is-open") ||
            mediaPreviewOverlay?.hidden === false ||
            replyModalOverlay?.hidden === false;
        document.body.classList.toggle("modal-open", shouldLock);
    }

    function closeMediaPreview() {
        if (!mediaPreviewOverlay || !mediaPreviewImage) {
            return;
        }
        mediaPreviewOverlay.hidden = true;
        mediaPreviewImage.removeAttribute("src");
        mediaPreviewImage.removeAttribute("alt");
        updateBodyScrollLock();
    }

    function openBookmarkDetail(folderName) {
        if (!listView || !detailView || isDetailViewOpen || currentFolderDeleted) {
            return;
        }
        currentFolderName = folderName || currentFolderName;
        syncFolderNameUI();
        syncBookmarkPostsEmpty();
        isDetailViewOpen = true;
        listView.hidden = true;
        detailView.hidden = false;
        modalOpenButton?.setAttribute("hidden", "");
        detailMoreButton?.removeAttribute("hidden");
        setHeaderTitle(currentFolderName);
        window.scrollTo({top: 0, behavior: "auto"});
    }

    function closeBookmarkDetail() {
        if (!listView || !detailView || !isDetailViewOpen) {
            return;
        }
        isDetailViewOpen = false;
        closePostMenus();
        closeMediaPreview();
        listView.hidden = false;
        detailView.hidden = true;
        modalOpenButton?.removeAttribute("hidden");
        detailMoreButton?.setAttribute("hidden", "");
        setHeaderTitle(defaultHeaderTitle);
    }

    syncFolderNameUI();

    if (backButton) {
        backButton.addEventListener("click", () => {
            if (isDetailViewOpen) {
                closeBookmarkDetail();
                return;
            }
            window.history.back();
        });
    }

    document.addEventListener("click", (event) => {
        const folderButton = event.target.closest("[data-bookmark-folder]");
        if (folderButton) {
            const folderName = folderButton.dataset.bookmarkFolder || "북마크";
            const folderId = folderButton.dataset.folderId || "";
            currentFolderId = folderId || null;
            openBookmarkDetail(folderName);
            if (!folderId || folderId === "") {
                loadUncategorizedBookmarks();
            } else {
                loadFolderBookmarks(folderId);
            }
            return;
        }
    });

    if (detailMoreButton) {
        detailMoreButton.addEventListener("click", (event) => {
            event.stopPropagation();
            if (detailFolderMenu && !detailFolderMenu.hidden) {
                closeDetailFolderMenu();
                return;
            }
            openDetailFolderMenu();
        });
    }

    if (searchInput && searchBox) {
        const syncSearchState = () => {
            searchBox.classList.toggle(
                "is-active",
                document.activeElement === searchInput ||
                searchInput.value.trim().length > 0,
            );
        };
        searchInput.addEventListener("focus", syncSearchState);
        searchInput.addEventListener("blur", syncSearchState);
        searchInput.addEventListener("input", syncSearchState);
        syncSearchState();
    }

    if (
        modalOpenButton &&
        bookmarkModal &&
        modalCloseButton &&
        modalSubmitButton &&
        folderNameInput &&
        folderNameCount
    ) {
        function updateModalState() {
            const value = folderNameInput.value.trim();
            folderNameCount.textContent = `${folderNameInput.value.length} / 25`;
            modalSubmitButton.disabled = value.length === 0;
        }

        function resetModalForm() {
            folderNameInput.value = "";
            updateModalState();
        }

        function closeModal({reset = true} = {}) {
            toggleClassModal(bookmarkModal, false);
            if (reset) {
                resetModalForm();
            }
            updateBodyScrollLock();
        }

        function openModal() {
            resetModalForm();
            toggleClassModal(bookmarkModal, true);
            updateBodyScrollLock();
            window.setTimeout(() => folderNameInput.focus(), 0);
        }

        modalOpenButton.addEventListener("click", openModal);
        modalCloseButton.addEventListener("click", () => closeModal());
        bookmarkModal.addEventListener("click", (event) => {
            if (event.target === bookmarkModal) {
                closeModal({reset: false});
            }
        });
        folderNameInput.addEventListener("input", updateModalState);
        modalSubmitButton.addEventListener("click", async () => {
            const value = folderNameInput.value.trim();
            if (!value) return;
            modalSubmitButton.disabled = true;
            const result = await BookmarkService.createFolder(memberId, value);
            if (result.ok) {
                showToast(`${value} 폴더를 만들었습니다`);
                await loadFolders();
            } else if (result.message) {
                showToast(result.message);
            }
            closeModal();
        });
    }

    if (
        bookmarkEditModal &&
        editModalCloseButton &&
        editModalSubmitButton &&
        editFolderNameInput &&
        editFolderNameCount
    ) {
        function updateEditModalState() {
            const value = editFolderNameInput.value.trim();
            editFolderNameCount.textContent = `${editFolderNameInput.value.length} / 25`;
            editModalSubmitButton.disabled =
                value.length === 0 || value === currentFolderName;
        }

        function resetEditModalForm() {
            editFolderNameInput.value = currentFolderName;
            updateEditModalState();
        }

        function closeEditModal() {
            toggleClassModal(bookmarkEditModal, false);
            updateBodyScrollLock();
        }

        function openEditModal() {
            closeDetailFolderMenu();
            resetEditModalForm();
            toggleClassModal(bookmarkEditModal, true);
            updateBodyScrollLock();
            window.setTimeout(() => {
                editFolderNameInput.focus();
                editFolderNameInput.select();
            }, 0);
        }

        detailFolderEditButton?.addEventListener("click", () => {
            openEditModal();
        });
        editModalDeleteButton?.addEventListener("click", () => {
            closeEditModal();
            openDeleteModal();
        });
        editModalCloseButton.addEventListener("click", closeEditModal);
        bookmarkEditModal.addEventListener("click", (event) => {
            if (event.target === bookmarkEditModal) {
                closeEditModal();
            }
        });
        editFolderNameInput.addEventListener("input", updateEditModalState);
        editModalSubmitButton.addEventListener("click", async () => {
            const value = editFolderNameInput.value.trim();
            if (!value || value === currentFolderName) return;
            if (!currentFolderId) return;
            editModalSubmitButton.disabled = true;
            await BookmarkService.updateFolder(currentFolderId, value);
            currentFolderName = value;
            syncFolderNameUI();
            setHeaderTitle(value);
            closeEditModal();
            await loadFolders();
            showToast("폴더를 수정했습니다");
        });
    }

    if (
        bookmarkDeleteModal &&
        deleteModalSubmitButton &&
        deleteModalCancelButton
    ) {
        deleteModalSubmitButton.addEventListener("click", deleteCurrentFolder);
        deleteModalCancelButton.addEventListener("click", closeDeleteModal);
        bookmarkDeleteModal.addEventListener("click", (event) => {
            if (event.target === bookmarkDeleteModal) {
                closeDeleteModal();
            }
        });
    }

    shareChatSearchInput?.addEventListener("input", () => {
        const query = shareChatSearchInput.value.trim().toLowerCase();
        const filtered = getShareUsers().filter((user) => {
            return (
                user.name.toLowerCase().includes(query) ||
                user.handle.toLowerCase().includes(query)
            );
        });
        if (shareChatList) {
            shareChatList.innerHTML = getShareUserRows(filtered);
        }
    });

    shareChatModal?.addEventListener("click", (event) => {
        const userButton = event.target.closest(".bookmark-share-sheet-user");
        if (
            event.target.closest("[data-share-close='true']") ||
            event.target.classList.contains("bookmark-share-sheet-backdrop")
        ) {
            closeShareModal();
            return;
        }
        if (userButton) {
            closeShareModal();
            showToast(
                `${userButton.dataset.shareUserName || "선택한 사용자"}에게 전송함`,
            );
        }
    });

    shareBookmarkModal?.addEventListener("click", (event) => {
        if (
            event.target.closest("[data-share-close='true']") ||
            event.target.classList.contains("bookmark-share-sheet-backdrop")
        ) {
            closeShareModal();
            return;
        }
    });

    shareBookmarkCreateFolder?.addEventListener("click", () => {
        closeShareModal();
        modalOpenButton?.click();
    });

    shareBookmarkFolderButton?.addEventListener("click", () => {
        if (activeShareBookmarkButton) {
            setBookmarkButtonState(activeShareBookmarkButton, true);
        }
        closeShareModal();
    });

    shareDropdown?.addEventListener("click", (event) => {
        const actionButton = event.target.closest("[data-share-action]");
        if (!actionButton || !activeShareButton) {
            return;
        }
        const action = actionButton.dataset.shareAction;
        if (action === "copy") {
            copyShareLink(activeShareButton);
            return;
        }
        if (action === "chat") {
            openShareChatModal();
            return;
        }
        if (action === "bookmark") {
            openShareBookmarkModal(activeShareButton);
        }
    });

    bookmarkBlockModal?.addEventListener("click", (event) => {
        if (
            event.target === bookmarkBlockModal ||
            event.target === bookmarkBlockCancelButton
        ) {
            closeBookmarkNotificationModal();
        }
    });

    bookmarkBlockConfirmButton?.addEventListener("click", () => {
        const handle = activeMorePostMeta?.handle || "@user";
        closeBookmarkNotificationModal();
        showToast(`${handle} 님을 차단했습니다`);
    });

    bookmarkReportModal?.addEventListener("click", (event) => {
        if (
            event.target === bookmarkReportModal ||
            event.target.closest("#bookmarkReportCloseButton")
        ) {
            closeBookmarkNotificationModal();
            return;
        }
        const reportItem = event.target.closest("[data-report-reason]");
        if (!reportItem) {
            return;
        }
        const reason = reportItem.dataset.reportReason || "신고";
        closeBookmarkNotificationModal();
        showToast(reason);
    });

    mediaPreviewClose?.addEventListener("click", closeMediaPreview);
    mediaPreviewOverlay?.addEventListener("click", (event) => {
        if (event.target === mediaPreviewOverlay) {
            closeMediaPreview();
        }
    });

    document.addEventListener("click", (event) => {
        const target = event.target;
        const mediaTarget = target.closest("[data-media-preview='true']");
        if (mediaTarget && mediaPreviewOverlay && mediaPreviewImage) {
            mediaPreviewImage.src = mediaTarget.getAttribute("src") || "";
            mediaPreviewImage.alt =
                mediaTarget.getAttribute("alt") || "게시물 이미지 미리보기";
            mediaPreviewOverlay.hidden = false;
            updateBodyScrollLock();
            return;
        }

        const postTextToggle = target.closest(".bookmark-post-text-toggle");
        if (postTextToggle) {
            const postText = postTextToggle.closest("[data-expandable-text='true']");
            const postTextContent = postText?.querySelector(
                ".bookmark-post-text-content",
            );
            if (postText && postTextContent) {
                postTextContent.textContent = postText.dataset.fullText || "";
                postTextToggle.hidden = true;
            }
            return;
        }

        const moreButton = target.closest("[data-post-more]");
        if (moreButton) {
            const menu =
                moreButton.parentElement?.querySelector(".bookmark-post-more-menu");
            const willOpen = Boolean(menu?.hidden);
            closeShareDropdown();
            resetPostMoreMenus();
            if (menu && willOpen) {
                const meta = getBookmarkMoreMeta(moreButton);
                syncBookmarkMoreMenu(menu, meta.handle);
                menu.hidden = false;
                moreButton.setAttribute("aria-expanded", "true");
            }
            return;
        }

        const moreMenuItem = target.closest("[data-more-action]");
        if (moreMenuItem) {
            const action = moreMenuItem.getAttribute("data-more-action");
            if (action) {
                handleBookmarkMoreAction(action, moreMenuItem);
            }
            return;
        }

        const actionButton = target.closest(".bookmark-post-action[data-action]");
        if (actionButton) {
            const action = actionButton.dataset.action;
            const countNode = actionButton.querySelector("span");
            if (action !== "share") {
                closeShareDropdown();
            }

            if (action === "reply") {
                openBookmarkReplyModal(actionButton);
                return;
            }

            if (action === "like") {
                const isActive = !actionButton.classList.contains("active");
                const path = actionButton.querySelector("path");
                const baseCount = Number.parseInt(
                    actionButton.dataset.baseCount || "0",
                    10,
                );
                const nextCount = isActive ? baseCount + 1 : baseCount;
                actionButton.classList.toggle("active", isActive);
                actionButton.setAttribute("aria-label", `마음 ${nextCount}`);
                if (countNode) {
                    countNode.textContent = String(nextCount);
                }
                if (path) {
                    path.setAttribute(
                        "d",
                        isActive
                            ? path.dataset.pathActive || path.getAttribute("d")
                            : path.dataset.pathInactive || path.getAttribute("d"),
                    );
                }
                return;
            }

            if (action === "bookmark") {
                if (actionButton.classList.contains("active")) {
                    removeBookmarkedPost(
                        actionButton.closest(".bookmark-post")?.dataset.postId || "",
                    );
                } else {
                    setBookmarkButtonState(actionButton, true);
                }
                return;
            }

            if (action === "share") {
                if (
                    activeShareButton === actionButton &&
                    activeShareDropdown
                ) {
                    closeShareDropdown();
                    return;
                }
                openShareDropdown(actionButton);
                return;
            }
        }

        if (!target.closest("#shareDropdown .dropdown-menu")) {
            closeShareDropdown();
        }

        if (
            !target.closest("#detailFolderMenu") &&
            !target.closest("#detailMoreButton")
        ) {
            closeDetailFolderMenu();
        }

        if (!target.closest(".bookmark-post-more-wrap")) {
            resetPostMoreMenus();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }
        if (replyModalOverlay?.hidden === false) {
            closeBookmarkReplyModal();
            return;
        }
        if (activeShareModal) {
            closeShareModal();
            updateBodyScrollLock();
            return;
        }
        if (bookmarkModal?.classList.contains("is-open")) {
            bookmarkModal.classList.remove("is-open");
            bookmarkModal.setAttribute("aria-hidden", "true");
            updateBodyScrollLock();
            return;
        }
        if (bookmarkEditModal?.classList.contains("is-open")) {
            bookmarkEditModal.classList.remove("is-open");
            bookmarkEditModal.setAttribute("aria-hidden", "true");
            updateBodyScrollLock();
            return;
        }
        if (bookmarkDeleteModal?.classList.contains("is-open")) {
            closeDeleteModal();
            return;
        }
        if (isBookmarkNotificationModalOpen()) {
            closeBookmarkNotificationModal();
            return;
        }
        if (mediaPreviewOverlay?.hidden === false) {
            closeMediaPreview();
            return;
        }
        if (detailFolderMenu && !detailFolderMenu.hidden) {
            closeDetailFolderMenu();
            return;
        }
        if (activeShareDropdown) {
            closeShareDropdown();
            return;
        }
        const openedMenu = document.querySelector(".bookmark-post-more-menu:not([hidden])");
        if (openedMenu) {
            closePostMenus();
        }
    });

    window.addEventListener("resize", () => {
        if (detailFolderMenu && !detailFolderMenu.hidden) {
            positionDetailFolderMenu();
        }
        closeShareDropdown();
        resetPostMoreMenus();
    });

    window.addEventListener(
        "scroll",
        () => {
            if (detailFolderMenu && !detailFolderMenu.hidden) {
                positionDetailFolderMenu();
            }
            closeShareDropdown();
            resetPostMoreMenus();
        },
        true,
    );

    // ===== 답글 모달 =====
    function buildReplyAvatarDataUri(label) {
        const safe = escapeHtml((label || "?").slice(0, 1));
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="#536471"></rect><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#fff">${safe}</text></svg>`;
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    }

    function hasEmojiButtonLibrary() {
        return typeof window.EmojiButton === "function";
    }

    function ensureReplyEmojiLibraryPicker() {
        if (!replyEmojiButton || !replyEditor || !hasEmojiButtonLibrary()) return null;
        if (replyEmojiLibraryPicker) return replyEmojiLibraryPicker;

        replyEmojiLibraryPicker = new window.EmojiButton({
            position: "bottom-start",
            rootElement: replyModal ?? undefined,
            zIndex: 1400,
        });

        replyEmojiLibraryPicker.on("emoji", (selection) => {
            const emoji = typeof selection === "string" ? selection : selection?.emoji;
            if (!emoji) return;
            insertReplyEmoji(emoji);
            closeEmojiPicker();
        });

        replyEmojiLibraryPicker.on("hidden", () => {
            replyEmojiButton?.setAttribute("aria-expanded", "false");
        });

        return replyEmojiLibraryPicker;
    }

    function closeEmojiPicker() {
        if (!replyEmojiLibraryPicker) {
            replyEmojiButton?.setAttribute("aria-expanded", "false");
            return;
        }
        if (replyEmojiLibraryPicker.pickerVisible) {
            replyEmojiLibraryPicker.hidePicker();
        }
        replyEmojiButton?.setAttribute("aria-expanded", "false");
    }

    function toggleEmojiPicker() {
        const picker = ensureReplyEmojiLibraryPicker();
        if (!picker || !replyEmojiButton) return;
        if (picker.pickerVisible) {
            picker.hidePicker();
            replyEmojiButton.setAttribute("aria-expanded", "false");
            return;
        }
        replyEmojiButton.setAttribute("aria-expanded", "true");
        picker.showPicker(replyEmojiButton);
    }

    function insertReplyEmoji(emoji) {
        if (!replyEditor) return;
        replyEditor.focus();
        replyEditor.append(document.createTextNode(emoji));
        placeCaretAtEnd(replyEditor);
        syncReplySubmitState();
        syncReplyFormatButtons();
    }

    // ── submit 상태 동기화 ──
    function syncReplySubmitState() {
        if (!replyEditor) return;
        const text = replyEditor.textContent.replace(/\u00a0/g, " ");
        const len = Math.min(text.length, replyMaxLength);
        const remaining = replyMaxLength - len;
        const canSubmit = text.trim().length > 0 || attachedReplyFiles.length > 0;
        const progress = `${Math.min(text.length / replyMaxLength, 1) * 360}deg`;
        if (replySubmitButton) replySubmitButton.disabled = !canSubmit;
        if (replyGauge) {
            replyGauge.style.setProperty("--gauge-progress", progress);
            replyGauge.setAttribute("aria-valuenow", String(len));
        }
        if (replyGaugeText) replyGaugeText.textContent = String(remaining);
    }

    // ── 서식 버튼 ──
    function isReplyEditorSelectionActive() {
        if (!replyEditor) return false;
        const selection = window.getSelection();
        return Boolean(
            selection &&
            selection.rangeCount > 0 &&
            replyEditor.contains(selection.getRangeAt(0).commonAncestorContainer),
        );
    }

    function focusReplyEditorToEnd() {
        if (!replyEditor) return;
        replyEditor.focus();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(replyEditor);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    function syncReplyFormatButtons() {
        replyFormatButtons.forEach((btn) => {
            const fmt = btn.getAttribute("data-format");
            const isActive =
                isReplyEditorSelectionActive() &&
                document.queryCommandState?.(fmt || "") === true;
            btn.classList.toggle("tweet-modal__tool-btn--active", isActive);
        });
    }

    function applyReplyFormat(fmt) {
        if (!fmt || !replyEditor) return;
        if (!isReplyEditorSelectionActive()) focusReplyEditorToEnd();
        document.execCommand(fmt, false);
        syncReplyFormatButtons();
    }

    // ── 미디어 첨부 ──
    function isReplyImageSet() {
        return attachedReplyFiles.length > 0 && attachedReplyFiles.every((f) => f.type.startsWith("image/"));
    }

    function isReplyVideoSet() {
        return attachedReplyFiles.length === 1 && attachedReplyFiles[0].type.startsWith("video/");
    }

    function getReplyMediaImageAlt(i) {
        return replyMediaEdits[i]?.alt ?? "";
    }

    function clearAttachedReplyFileUrls() {
        attachedReplyFileUrls.forEach((u) => URL.revokeObjectURL(u));
        attachedReplyFileUrls = [];
    }

    function createReplyAttachmentUrls() {
        clearAttachedReplyFileUrls();
        attachedReplyFileUrls = attachedReplyFiles.map((f) => URL.createObjectURL(f));
    }

    function syncReplyMediaEditsToAttachments() {
        if (!isReplyImageSet()) {
            replyMediaEdits = [];
            pendingReplyMediaEdits = [];
            activeReplyMediaIndex = 0;
            syncMediaAltTrigger();
            return;
        }
        replyMediaEdits = attachedReplyFiles.map((_, i) => replyMediaEdits[i] ? {alt: replyMediaEdits[i].alt ?? ""} : {alt: ""});
        if (pendingReplyMediaEdits.length !== replyMediaEdits.length) pendingReplyMediaEdits = replyMediaEdits.map((e) => ({alt: e.alt}));
        activeReplyMediaIndex = Math.min(activeReplyMediaIndex, Math.max(replyMediaEdits.length - 1, 0));
        syncMediaAltTrigger();
    }

    function syncMediaAltTrigger() {
        const can = isReplyImageSet();
        const label = replyMediaEdits.some((e) => e.alt.trim()) ? "설명 수정" : "설명 추가";
        if (replyMediaAltTrigger) {
            replyMediaAltTrigger.hidden = !can;
            replyMediaAltTrigger.disabled = !can;
            replyMediaAltTrigger.setAttribute("aria-label", label);
        }
        if (replyMediaAltLabel) replyMediaAltLabel.textContent = label;
    }

    function getReplyImageCell(index, url, cls) {
        const alt = getReplyMediaImageAlt(index);
        return `<div class="media-cell ${cls}"><div class="media-cell-inner"><div class="media-img-container" aria-label="미디어" role="group"><div class="media-bg" style="background-image: url('${url}');"></div><img alt="${escapeHtml(alt)}" draggable="false" src="${url}" class="media-img"></div><div class="media-btn-row"><button type="button" class="media-btn" data-attachment-edit-index="${index}"><span>수정</span></button></div><button type="button" class="media-btn-delete" aria-label="미디어 삭제하기" data-attachment-remove-index="${index}"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div>`;
    }

    function renderReplyImageGrid() {
        const n = attachedReplyFiles.length, urls = attachedReplyFileUrls;
        if (!replyAttachmentMedia || n === 0) return;
        if (n === 1) {
            replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer">${getReplyImageCell(0, urls[0], "media-cell--single")}</div>`;
            return;
        }
        if (n === 2) {
            replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio"></div><div class="media-absolute-layer"><div class="media-row"><div class="media-col">${getReplyImageCell(0, urls[0], "media-cell--left")}</div><div class="media-col">${getReplyImageCell(1, urls[1], "media-cell--right")}</div></div></div>`;
            return;
        }
        if (n === 3) {
            replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio"></div><div class="media-absolute-layer"><div class="media-row"><div class="media-col">${getReplyImageCell(0, urls[0], "media-cell--left-tall")}</div><div class="media-col">${getReplyImageCell(1, urls[1], "media-cell--right-top")}${getReplyImageCell(2, urls[2], "media-cell--right-bottom")}</div></div></div>`;
            return;
        }
        replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio"></div><div class="media-absolute-layer"><div class="media-row"><div class="media-col">${getReplyImageCell(0, urls[0], "media-cell--top-left")}${getReplyImageCell(2, urls[2], "media-cell--bottom-left")}</div><div class="media-col">${getReplyImageCell(1, urls[1], "media-cell--top-right")}${getReplyImageCell(3, urls[3], "media-cell--bottom-right")}</div></div></div>`;
    }

    function renderReplyVideoAttachment() {
        if (!replyAttachmentMedia || attachedReplyFiles.length === 0) return;
        const [file] = attachedReplyFiles, [fileUrl] = attachedReplyFileUrls;
        replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer"><div class="media-cell media-cell--single"><div class="media-cell-inner"><div class="media-img-container" aria-label="미디어" role="group"><video class="tweet-modal__attachment-video" controls preload="metadata"><source src="${fileUrl}" type="${file.type}"></video></div><button type="button" class="media-btn-delete" aria-label="미디어 삭제하기" data-attachment-remove-index="0"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div></div>`;
    }

    function renderReplyAttachment() {
        if (!replyAttachmentPreview || !replyAttachmentMedia) return;
        if (attachedReplyFiles.length === 0) {
            replyAttachmentMedia.innerHTML = "";
            replyAttachmentPreview.hidden = true;
            syncReplyMediaEditsToAttachments();
            return;
        }
        replyAttachmentPreview.hidden = false;
        createReplyAttachmentUrls();
        if (isReplyImageSet()) {
            syncReplyMediaEditsToAttachments();
            syncUserTagTrigger();
            renderReplyImageGrid();
            return;
        }
        if (isReplyVideoSet()) {
            syncReplyMediaEditsToAttachments();
            renderReplyVideoAttachment();
            return;
        }
        syncReplyMediaEditsToAttachments();
        replyAttachmentMedia.innerHTML = "";
        const fp = document.createElement("div"), fi = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
            fg = document.createElementNS("http://www.w3.org/2000/svg", "g"),
            fpath = document.createElementNS("http://www.w3.org/2000/svg", "path"), fn = document.createElement("span");
        fp.className = "tweet-modal__attachment-file";
        fi.setAttribute("viewBox", "0 0 24 24");
        fi.setAttribute("width", "22");
        fi.setAttribute("height", "22");
        fi.setAttribute("aria-hidden", "true");
        fpath.setAttribute("d", "M14 2H7.75C5.68 2 4 3.68 4 5.75v12.5C4 20.32 5.68 22 7.75 22h8.5C18.32 22 20 20.32 20 18.25V8l-6-6zm0 2.12L17.88 8H14V4.12zm2.25 15.88h-8.5c-.97 0-1.75-.78-1.75-1.75V5.75C6 4.78 6.78 4 7.75 4H12v5.25c0 .41.34.75.75.75H18v8.25c0 .97-.78 1.75-1.75 1.75z");
        fn.className = "tweet-modal__attachment-file-name";
        fn.textContent = attachedReplyFiles[0]?.name ?? "";
        fg.appendChild(fpath);
        fi.appendChild(fg);
        fp.appendChild(fi);
        fp.appendChild(fn);
        replyAttachmentMedia.appendChild(fp);
    }

    function removeReplyAttachment(index) {
        attachedReplyFiles = attachedReplyFiles.filter((_, i) => i !== index);
        pendingAttachmentEditIndex = null;
        renderReplyAttachment();
        syncReplySubmitState();
    }

    // ── 태그 서브뷰 ──
    function cloneTaggedUsers(users) {
        return users.map((u) => ({...u}));
    }

    function getTaggedUserSummary(users) {
        return users.length === 0 ? "사용자 태그하기" : users.map((u) => u.name).join(", ");
    }

    function syncUserTagTrigger() {
        const can = isReplyImageSet();
        if (replyUserTagTrigger) {
            replyUserTagTrigger.hidden = !can;
            replyUserTagTrigger.disabled = !can;
        }
        if (replyUserTagLabel) replyUserTagLabel.textContent = getTaggedUserSummary(selectedTaggedUsers);
    }

    function renderTagChipList() {
        if (!replyTagChipList) return;
        replyTagChipList.innerHTML = pendingTaggedUsers.map((u) => `<button type="button" class="tweet-modal__tag-chip" data-tag-remove-id="${escapeHtml(u.id)}"><span class="tweet-modal__tag-chip-avatar">${u.avatar ? `<img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.name)}" />` : ""}</span><span class="tweet-modal__tag-chip-name">${escapeHtml(u.name)}</span></button>`).join("");
    }

    function openTagPanel() {
        if (!composeView || !replyTagView || !isReplyImageSet()) return;
        closeEmojiPicker();
        pendingTaggedUsers = cloneTaggedUsers(selectedTaggedUsers);
        composeView.hidden = true;
        replyTagView.hidden = false;
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        renderTagChipList();
        if (replyTagResults) replyTagResults.innerHTML = "";
        window.requestAnimationFrame(() => replyTagSearchInput?.focus());
    }

    function closeTagPanel({restoreFocus = true} = {}) {
        if (!composeView || !replyTagView || replyTagView.hidden) return;
        replyTagView.hidden = true;
        composeView.hidden = false;
        pendingTaggedUsers = cloneTaggedUsers(selectedTaggedUsers);
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        renderTagChipList();
        if (replyTagResults) replyTagResults.innerHTML = "";
        if (restoreFocus) window.requestAnimationFrame(() => replyEditor?.focus());
    }

    function applyPendingTaggedUsers() {
        selectedTaggedUsers = cloneTaggedUsers(pendingTaggedUsers);
        syncUserTagTrigger();
    }

    function resetTaggedUsers() {
        selectedTaggedUsers = [];
        pendingTaggedUsers = [];
        if (replyTagResults) replyTagResults.innerHTML = "";
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        renderTagChipList();
        syncUserTagTrigger();
    }

    // ── 위치 서브뷰 ──
    function syncLocationUI() {
        const has = Boolean(selectedLocation);
        if (replyFooterMeta) replyFooterMeta.hidden = !has;
        if (replyLocationName) replyLocationName.textContent = selectedLocation ?? "";
        if (replyLocationDisplayButton) {
            replyLocationDisplayButton.hidden = !has;
        }
        if (replyLocationDeleteButton) replyLocationDeleteButton.hidden = !has;
        if (replyLocationCompleteButton) replyLocationCompleteButton.disabled = !pendingLocation;
    }

    function renderLocationList() {
        if (!replyLocationList) return;
        const term = replyLocationSearchInput?.value.trim() ?? "";
        if (cachedLocationNames.length === 0) {
            cachedLocationNames = Array.from(replyLocationList.querySelectorAll(".tweet-modal__location-item-label")).map((i) => i.textContent.trim()).filter(Boolean);
        }
        const locs = term ? cachedLocationNames.filter((l) => l.includes(term)) : cachedLocationNames;
        if (locs.length === 0) {
            replyLocationList.innerHTML = '<p class="tweet-modal__location-empty">일치하는 위치를 찾지 못했습니다.</p>';
            return;
        }
        replyLocationList.innerHTML = locs.map((loc) => {
            const sel = pendingLocation === loc;
            return `<button type="button" class="tweet-modal__location-item" role="menuitem"><span class="tweet-modal__location-item-label">${loc}</span><span class="tweet-modal__location-item-check">${sel ? '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>' : ""}</span></button>`;
        }).join("");
    }

    function openLocationPanel() {
        if (!composeView || !replyLocationView) return;
        closeEmojiPicker();
        pendingLocation = selectedLocation;
        composeView.hidden = true;
        replyLocationView.hidden = false;
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        renderLocationList();
        syncLocationUI();
        window.requestAnimationFrame(() => replyLocationSearchInput?.focus());
    }

    function closeLocationPanel({restoreFocus = true} = {}) {
        if (!composeView || !replyLocationView || replyLocationView.hidden) return;
        replyLocationView.hidden = true;
        composeView.hidden = false;
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        pendingLocation = selectedLocation;
        renderLocationList();
        syncLocationUI();
        if (restoreFocus) window.requestAnimationFrame(() => replyEditor?.focus());
    }

    function resetLocationState() {
        selectedLocation = null;
        pendingLocation = null;
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        renderLocationList();
        syncLocationUI();
    }

    // ── 미디어 ALT 서브뷰 ──
    function renderMediaEditor() {
        if (!replyMediaView || pendingReplyMediaEdits.length === 0) return;
        const edit = pendingReplyMediaEdits[activeReplyMediaIndex] ?? {alt: ""};
        const url = attachedReplyFileUrls[activeReplyMediaIndex] ?? "";
        const alt = edit.alt ?? "";
        if (replyMediaTitle) replyMediaTitle.textContent = "이미지 설명 수정";
        if (replyMediaPrevButton) replyMediaPrevButton.disabled = activeReplyMediaIndex === 0;
        if (replyMediaNextButton) replyMediaNextButton.disabled = activeReplyMediaIndex >= pendingReplyMediaEdits.length - 1;
        replyMediaPreviewImages.forEach((img) => {
            img.src = url;
            img.alt = alt;
        });
        if (replyMediaAltInput) replyMediaAltInput.value = alt;
        if (replyMediaAltCount) replyMediaAltCount.textContent = `${alt.length} / ${maxReplyMediaAltLength.toLocaleString()}`;
    }

    function openMediaEditor() {
        if (!composeView || !replyMediaView || !isReplyImageSet()) return;
        closeEmojiPicker();
        pendingReplyMediaEdits = replyMediaEdits.map((e) => ({alt: e.alt}));
        activeReplyMediaIndex = 0;
        composeView.hidden = true;
        replyMediaView.hidden = false;
        renderMediaEditor();
        window.requestAnimationFrame(() => replyMediaAltInput?.focus());
    }

    function closeMediaEditor({restoreFocus = true, discardChanges = true} = {}) {
        if (!composeView || !replyMediaView || replyMediaView.hidden) return;
        if (discardChanges) pendingReplyMediaEdits = replyMediaEdits.map((e) => ({alt: e.alt}));
        replyMediaView.hidden = true;
        composeView.hidden = false;
        if (restoreFocus) window.requestAnimationFrame(() => replyEditor?.focus());
    }

    function saveReplyMediaEdits() {
        replyMediaEdits = pendingReplyMediaEdits.map((e) => ({alt: e.alt}));
        renderReplyAttachment();
        syncMediaAltTrigger();
        closeMediaEditor({discardChanges: false});
    }

    // ── 임시저장 서브뷰 ──
    function openDraftPanel() {
        if (!composeView || !replyDraftView) return;
        closeEmojiPicker();
        composeView.hidden = true;
        replyDraftView.hidden = false;
    }

    function closeDraftPanel({restoreFocus = true} = {}) {
        if (!composeView || !replyDraftView || replyDraftView.hidden) return;
        replyDraftView.hidden = true;
        composeView.hidden = false;
        if (restoreFocus) window.requestAnimationFrame(() => replyEditor?.focus());
    }

    // ── 판매글 서브뷰 ──
    function openProductView() {
        if (!composeView || !replyProductView) return;
        closeEmojiPicker();
        composeView.hidden = true;
        replyProductView.hidden = false;
    }

    function closeProductView({restoreFocus = true} = {}) {
        if (!composeView || !replyProductView || replyProductView.hidden) return;
        replyProductView.hidden = true;
        composeView.hidden = false;
        if (restoreFocus) window.requestAnimationFrame(() => replyEditor?.focus());
    }

    function renderSelectedProduct() {
        q("[data-selected-product]")?.remove();
        if (!selectedProduct || !replyEditor) return;
        const card = document.createElement("div");
        card.setAttribute("data-selected-product", "");
        card.className = "tweet-modal__selected-product";
        card.innerHTML = `<div class="selected-product__card"><img class="selected-product__image" src="${escapeHtml(selectedProduct.image)}" alt="${escapeHtml(selectedProduct.name)}"><div class="selected-product__info"><strong class="selected-product__name">${escapeHtml(selectedProduct.name)}</strong><span class="selected-product__price">${escapeHtml(selectedProduct.price)}</span></div><button type="button" class="selected-product__remove" aria-label="판매글 제거"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div>`;
        card.querySelector(".selected-product__remove")?.addEventListener("click", () => {
            selectedProduct = null;
            card.remove();
        });
        replyEditor.parentElement?.appendChild(card);
    }

    // ── 모달 populate / open / close ──
    function populateReplyModal(button) {
        const post = button.closest(".bookmark-post");
        if (!post) return;
        const avatarEl = post.querySelector(".bookmark-post-avatar");
        const avatarImg = avatarEl?.querySelector("img");
        if (replySourceAvatar) {
            replySourceAvatar.src = avatarImg ? avatarImg.getAttribute("src") || "" : buildReplyAvatarDataUri(avatarEl?.textContent?.trim() || "?");
            replySourceAvatar.alt = avatarImg ? avatarImg.getAttribute("alt") || "" : "";
        }
        if (replySourceName) replySourceName.textContent = post.querySelector(".bookmark-post-name")?.textContent?.trim() || "";
        if (replySourceHandle) replySourceHandle.textContent = post.querySelector(".bookmark-post-handle")?.textContent?.trim() || "";
        if (replySourceTime) replySourceTime.textContent = post.querySelector(".bookmark-post-time")?.textContent?.trim() || "";
        if (replySourceText) {
            const textEl = post.querySelector(".bookmark-post-text-content") || post.querySelector(".bookmark-post-text");
            replySourceText.textContent = textEl?.textContent?.replace(/\s+/g, " ").trim() || "";
        }
        if (replyContextButton) {
            const handle = post.querySelector(".bookmark-post-handle")?.textContent?.trim() || "";
            replyContextButton.textContent = handle ? `${handle} 님에게 답글 달기` : "답글 달기";
        }
    }

    function resetReplyModalState() {
        if (replyEditor) replyEditor.textContent = "";
        clearAttachedReplyFileUrls();
        attachedReplyFiles = [];
        pendingAttachmentEditIndex = null;
        selectedProduct = null;
        q("[data-selected-product]")?.remove();
        productSelectList?.querySelectorAll(".draft-panel__item--selected").forEach((el) => {
            el.classList.remove("draft-panel__item--selected");
            el.setAttribute("aria-pressed", "false");
            el.querySelector(".draft-panel__checkbox")?.classList.remove("draft-panel__checkbox--checked");
        });
        if (productSelectComplete) productSelectComplete.disabled = true;
        resetTaggedUsers();
        resetLocationState();
        syncReplyFormatButtons();
        syncReplySubmitState();
        if (replyAttachmentPreview) replyAttachmentPreview.hidden = true;
        if (replyAttachmentMedia) replyAttachmentMedia.innerHTML = "";
        if (replyFileInput) replyFileInput.value = "";
        closeEmojiPicker();
        // 모든 서브뷰 숨기기
        if (replyDraftView) replyDraftView.hidden = true;
        if (replyLocationView) replyLocationView.hidden = true;
        if (replyTagView) replyTagView.hidden = true;
        if (replyMediaView) replyMediaView.hidden = true;
        if (replyProductView) replyProductView.hidden = true;
        if (composeView) composeView.hidden = false;
    }

    function openBookmarkReplyModal(button) {
        if (!replyModalOverlay) return;
        activeReplyTrigger = button;
        replyModalOverlay.hidden = false;
        updateBodyScrollLock();
        populateReplyModal(button);
        resetReplyModalState();
        window.requestAnimationFrame(() => replyEditor?.focus());
    }

    function closeBookmarkReplyModal() {
        if (!replyModalOverlay || replyModalOverlay.hidden) return;
        const hasDraft = replyEditor?.textContent?.replace(/\u00a0/g, " ").trim().length > 0;
        if ((hasDraft || attachedReplyFiles.length > 0) && !window.confirm("게시물을 삭제하시겠어요?")) return;
        replyModalOverlay.hidden = true;
        clearAttachedReplyFileUrls();
        attachedReplyFiles = [];
        closeEmojiPicker();
        updateBodyScrollLock();
        activeReplyTrigger?.focus();
        activeReplyTrigger = null;
    }

    // ── 이벤트 바인딩 ──
    replyCloseButton?.addEventListener("click", closeBookmarkReplyModal);
    replyModalOverlay?.addEventListener("click", (e) => {
        if (e.target === replyModalOverlay) closeBookmarkReplyModal();
    });

    replyEditor?.addEventListener("input", () => {
        syncReplySubmitState();
        syncReplyFormatButtons();
    });
    replyEditor?.addEventListener("keyup", syncReplyFormatButtons);
    replyEditor?.addEventListener("mouseup", syncReplyFormatButtons);
    replyEditor?.addEventListener("focus", syncReplyFormatButtons);

    replyFormatButtons.forEach((btn) => {
        btn.addEventListener("mousedown", (event) => event.preventDefault());
        btn.addEventListener("click", () => applyReplyFormat(btn.getAttribute("data-format")));
    });

    replyMediaUploadButton?.addEventListener("click", () => replyFileInput?.click());
    replyFileInput?.addEventListener("change", (e) => {
        const next = Array.from(e.target.files ?? []);
        if (!next.length) {
            pendingAttachmentEditIndex = null;
            syncReplySubmitState();
            return;
        }
        const vid = next.find((f) => f.type.startsWith("video/"));
        const imgs = next.filter((f) => f.type.startsWith("image/"));
        if (pendingAttachmentEditIndex !== null) {
            const rep = next[0];
            if (rep.type.startsWith("video/")) {
                attachedReplyFiles = [rep];
            } else {
                const ed = isReplyVideoSet() ? [] : [...attachedReplyFiles];
                if (ed.length === 0) attachedReplyFiles = [rep]; else {
                    ed[pendingAttachmentEditIndex] = rep;
                    attachedReplyFiles = ed.slice(0, maxReplyImages);
                }
            }
            pendingAttachmentEditIndex = null;
        } else if (vid) {
            attachedReplyFiles = [vid];
        } else if (imgs.length > 0) {
            attachedReplyFiles = [...(isReplyImageSet() ? attachedReplyFiles : []), ...imgs].slice(0, maxReplyImages);
        } else {
            attachedReplyFiles = [next[0]];
        }
        if (replyFileInput) replyFileInput.value = "";
        renderReplyAttachment();
        syncReplySubmitState();
    });

    replyAttachmentMedia?.addEventListener("click", (e) => {
        const removeBtn = e.target.closest("[data-attachment-remove-index]");
        if (removeBtn) {
            removeReplyAttachment(Number(removeBtn.dataset.attachmentRemoveIndex));
            return;
        }
        const editBtn = e.target.closest("[data-attachment-edit-index]");
        if (editBtn) {
            pendingAttachmentEditIndex = Number(editBtn.dataset.attachmentEditIndex);
            replyFileInput?.click();
        }
    });

    replyEmojiButton?.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    replyEmojiButton?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleEmojiPicker();
    });

    replyGeoButton?.addEventListener("click", () => {
        if (replyLocationView && !replyLocationView.hidden) closeLocationPanel();
        else openLocationPanel();
    });
    replyLocationDisplayButton?.addEventListener("click", openLocationPanel);
    replyLocationCloseButton?.addEventListener("click", () => closeLocationPanel());
    replyLocationDeleteButton?.addEventListener("click", () => {
        selectedLocation = null;
        pendingLocation = null;
        syncLocationUI();
        closeLocationPanel();
    });
    replyLocationCompleteButton?.addEventListener("click", () => {
        selectedLocation = pendingLocation;
        syncLocationUI();
        closeLocationPanel();
    });
    replyLocationSearchInput?.addEventListener("input", renderLocationList);
    replyLocationList?.addEventListener("click", (e) => {
        const item = e.target.closest(".tweet-modal__location-item");
        if (!item) return;
        const label = item.querySelector(".tweet-modal__location-item-label")?.textContent.trim() ?? "";
        pendingLocation = pendingLocation === label ? null : label;
        if (replyLocationCompleteButton) replyLocationCompleteButton.disabled = !pendingLocation;
        renderLocationList();
    });

    replyUserTagTrigger?.addEventListener("click", () => {
        if (replyTagView && !replyTagView.hidden) closeTagPanel();
        else openTagPanel();
    });
    replyTagCloseButton?.addEventListener("click", () => closeTagPanel());
    replyTagCompleteButton?.addEventListener("click", () => {
        applyPendingTaggedUsers();
        closeTagPanel();
    });
    replyTagSearchInput?.addEventListener("input", () => {
        const query = replyTagSearchInput.value.trim().toLowerCase();
        if (!query) {
            if (replyTagResults) replyTagResults.innerHTML = "";
            return;
        }
        const users = Array.from(document.querySelectorAll(".bookmark-post")).map((card, i) => {
            const name = card.querySelector(".bookmark-post-name")?.textContent?.trim() || "";
            const handle = card.querySelector(".bookmark-post-handle")?.textContent?.trim() || "";
            const avatar = card.querySelector(".bookmark-post-avatar img")?.getAttribute("src") || "";
            return name && handle ? {id: `${handle}-${i}`, name, handle, avatar} : null;
        }).filter(Boolean).filter((u) => `${u.name} ${u.handle}`.toLowerCase().includes(query)).slice(0, 6);
        if (!replyTagResults) return;
        replyTagResults.innerHTML = users.map((u) => {
            const sel = pendingTaggedUsers.some((t) => t.id === u.id);
            return `<div class="tweet-modal__tag-option"><button type="button" class="tweet-modal__tag-user" data-tag-user-id="${escapeHtml(u.id)}" ${sel ? "disabled" : ""}><span class="tweet-modal__tag-avatar">${u.avatar ? `<img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.name)}" />` : ""}</span><span class="tweet-modal__tag-user-body"><span class="tweet-modal__tag-user-name">${escapeHtml(u.name)}</span><span class="tweet-modal__tag-user-handle">${sel ? u.handle + " 이미 태그됨" : u.handle}</span></span></button></div>`;
        }).join("") || '<p class="tweet-modal__tag-empty">일치하는 사용자를 찾지 못했습니다.</p>';
    });
    replyTagResults?.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-tag-user-id]");
        if (!btn || btn.disabled) return;
        const id = btn.dataset.tagUserId;
        const name = btn.querySelector(".tweet-modal__tag-user-name")?.textContent.trim() || "";
        const handle = btn.querySelector(".tweet-modal__tag-user-handle")?.textContent.trim() || "";
        const avatar = btn.querySelector("img")?.getAttribute("src") || "";
        if (!pendingTaggedUsers.some((u) => u.id === id)) {
            pendingTaggedUsers.push({id, name, handle, avatar});
        }
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        if (replyTagResults) replyTagResults.innerHTML = "";
        renderTagChipList();
    });
    replyTagChipList?.addEventListener("click", (e) => {
        const chip = e.target.closest("[data-tag-remove-id]");
        if (!chip) return;
        const id = chip.dataset.tagRemoveId;
        pendingTaggedUsers = pendingTaggedUsers.filter((u) => u.id !== id);
        renderTagChipList();
    });

    replyMediaAltTrigger?.addEventListener("click", () => {
        if (replyMediaView && !replyMediaView.hidden) closeMediaEditor();
        else openMediaEditor();
    });
    replyMediaBackButton?.addEventListener("click", () => closeMediaEditor());
    replyMediaSaveButton?.addEventListener("click", saveReplyMediaEdits);
    replyMediaPrevButton?.addEventListener("click", () => {
        if (activeReplyMediaIndex > 0) {
            activeReplyMediaIndex--;
            renderMediaEditor();
        }
    });
    replyMediaNextButton?.addEventListener("click", () => {
        if (activeReplyMediaIndex < pendingReplyMediaEdits.length - 1) {
            activeReplyMediaIndex++;
            renderMediaEditor();
        }
    });
    replyMediaAltInput?.addEventListener("input", () => {
        if (pendingReplyMediaEdits[activeReplyMediaIndex]) pendingReplyMediaEdits[activeReplyMediaIndex].alt = replyMediaAltInput.value.slice(0, maxReplyMediaAltLength);
        if (replyMediaAltCount) replyMediaAltCount.textContent = `${replyMediaAltInput.value.length} / ${maxReplyMediaAltLength.toLocaleString()}`;
    });

    replyDraftButton?.addEventListener("click", () => {
        if (replyDraftView && !replyDraftView.hidden) closeDraftPanel();
        else openDraftPanel();
    });
    replyDraftView?.addEventListener("click", (e) => {
        if (e.target.closest(".draft-panel__back")) {
            closeDraftPanel();
            return;
        }
        const item = e.target.closest(".draft-panel__item");
        if (item) {
            closeDraftPanel();
        }
    });

    replyProductButton?.addEventListener("click", () => {
        if (replyProductView && !replyProductView.hidden) closeProductView();
        else openProductView();
    });
    productSelectClose?.addEventListener("click", () => closeProductView());
    productSelectList?.addEventListener("click", (e) => {
        const item = e.target.closest(".draft-panel__item");
        if (!item) return;
        const wasSelected = item.classList.contains("draft-panel__item--selected");
        productSelectList.querySelectorAll(".draft-panel__item--selected").forEach((el) => {
            el.classList.remove("draft-panel__item--selected");
            el.setAttribute("aria-pressed", "false");
            el.querySelector(".draft-panel__checkbox")?.classList.remove("draft-panel__checkbox--checked");
        });
        if (!wasSelected) {
            item.classList.add("draft-panel__item--selected");
            item.setAttribute("aria-pressed", "true");
            item.querySelector(".draft-panel__checkbox")?.classList.add("draft-panel__checkbox--checked");
        }
        if (productSelectComplete) productSelectComplete.disabled = !productSelectList.querySelector(".draft-panel__item--selected");
    });
    productSelectComplete?.addEventListener("click", () => {
        const checkedItem = productSelectList?.querySelector(".draft-panel__item--selected");
        if (checkedItem) {
            selectedProduct = {
                id: checkedItem.dataset.productId ?? "",
                name: checkedItem.dataset.productName ?? "",
                price: checkedItem.dataset.productPrice ?? "",
                image: checkedItem.dataset.productImage ?? "",
            };
            renderSelectedProduct();
        }
        closeProductView();
    });

    replySubmitButton?.addEventListener("click", () => {
        const text = replyEditor?.textContent?.replace(/\u00a0/g, " ").trim() || "";
        if (!text && attachedReplyFiles.length === 0) return;
        // 댓글 수 증가
        if (activeReplyTrigger) {
            const countSpan = activeReplyTrigger.querySelector(".tweet-action-count");
            if (countSpan) {
                const count = parseInt(countSpan.textContent || "0", 10);
                countSpan.textContent = String(count + 1);
                const ariaLabel = activeReplyTrigger.getAttribute("aria-label") || "";
                activeReplyTrigger.setAttribute("aria-label", ariaLabel.replace(/^\d+/, String(count + 1)));
            }
        }
        closeBookmarkReplyModal();
        showToast("답글이 게시되었습니다");
    });

    // ── 페이지 초기화: 폴더 목록 로드 ──
    loadFolders();

})();
