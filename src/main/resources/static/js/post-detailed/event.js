window.onload = () => {

    const SVG = layout.SVG;
    const esc = layout.esc;

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

    // ── 1. 인라인 답글 작성기 (메인 setupSubViews 방식 그대로) ──
    const overlay = document.querySelector(".post-detail-inline-reply");
    const replyBox = document.querySelector(".post-detail-reply-box");
    const composeView = overlay?.querySelector(".post-detail-inline-reply-card");
    const locationView = replyBox?.querySelector(".tweet-modal__location-view");
    const allSubViews = [locationView];

    function showSubView(view) {
        if (composeView) composeView.classList.add("off");
        for (let i = 0; i < allSubViews.length; i++) { if (allSubViews[i]) { allSubViews[i].classList.add("off"); allSubViews[i].removeAttribute("hidden"); } }
        if (view) { view.classList.remove("off"); view.removeAttribute("hidden"); }
    }
    function backToCompose() {
        for (let i = 0; i < allSubViews.length; i++) { if (allSubViews[i]) { allSubViews[i].classList.add("off"); allSubViews[i].setAttribute("hidden", ""); } }
        if (composeView) composeView.classList.remove("off");
    }

    // 위치 (메인 그대로)
    const geoBtn = overlay?.querySelector(".tweet-modal__tool-btn--geo");
    const locationList = locationView ? locationView.querySelector("[data-location-list]") : null;
    const locationSearchInput = locationView ? locationView.querySelector("[data-location-search]") : null;
    const locationSearchBtn = locationView ? locationView.querySelector("[data-location-search-btn]") : null;
    const locationClose = locationView ? locationView.querySelector(".tweet-modal__location-close") : null;
    const locationDeleteBtn = locationView ? locationView.querySelector("[data-location-delete]") : null;
    const locationCompleteBtn = locationView ? locationView.querySelector("[data-location-complete]") : null;
    const locationDisplay = overlay?.querySelector(".tweet-modal__location-display");
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

    var ps = null;
    function searchPlaces() {
        var keyword = locationSearchInput.value;
        if (!keyword.replace(/^\s+|\s+$/g, '')) { alert('키워드를 입력해주세요!'); return false; }
        if (!ps) { ps = new kakao.maps.services.Places(); }
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
                if (addressRegex.test(lastPart)) { addressName = addressNames.slice(0, -1).join(" "); }
                addressNameSet.add(addressName);
            });
            let html = '';
            addressNameSet.forEach((addressName) => {
                html += '<button type="button" class="tweet-modal__location-item"><span class="tweet-modal__location-item-label">' + addressName + '</span><span class="tweet-modal__location-item-check"></span></button>';
            });
            locationList.innerHTML = html;
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            alert('검색 결과가 존재하지 않습니다.');
        } else if (status === kakao.maps.services.Status.ERROR) {
            alert('검색 결과 중 오류가 발생했습니다.');
        }
    }

    if (geoBtn && locationView) { geoBtn.addEventListener("click", (e) => { showSubView(locationView); if (locationSearchInput) { locationSearchInput.value = ''; } if (locationList) { locationList.innerHTML = ''; } updateLocationUI(); }); }
    if (locationSearchBtn) { locationSearchBtn.addEventListener("click", (e) => { searchPlaces(); }); }
    if (locationSearchInput) { locationSearchInput.addEventListener("keyup", (e) => { if (e.key === "Enter") searchPlaces(); }); }
    if (locationList) { locationList.addEventListener("click", (e) => { const item = e.target.closest(".tweet-modal__location-item"); if (!item) return; const allItems = locationList.querySelectorAll(".tweet-modal__location-item"); for (let i = 0; i < allItems.length; i++) { allItems[i].classList.remove("isSelected"); } item.classList.add("isSelected"); selectedLocation = item.querySelector(".tweet-modal__location-item-label").textContent; updateLocationUI(); backToCompose(); }); }
    if (locationDeleteBtn) { locationDeleteBtn.addEventListener("click", (e) => { selectedLocation = null; updateLocationUI(); if (locationList) { const allItems = locationList.querySelectorAll(".tweet-modal__location-item"); for (let i = 0; i < allItems.length; i++) { allItems[i].classList.remove("isSelected"); } } backToCompose(); }); }
    if (locationCompleteBtn) { locationCompleteBtn.addEventListener("click", (e) => { backToCompose(); }); }
    if (locationClose) { locationClose.addEventListener("click", (e) => { backToCompose(); }); }

    // 볼드/이탤릭 (메인 그대로)
    const boldBtn = overlay?.querySelector(".tweet-modal__tool-btn--bold");
    const italicBtn = overlay?.querySelector(".tweet-modal__tool-btn--italic");
    const editorEl = document.querySelector(".post-detail-inline-reply-editor");

    function syncFormatButtons() {
        if (boldBtn) { boldBtn.classList.toggle("active", document.queryCommandState("bold")); }
        if (italicBtn) { italicBtn.classList.toggle("active", document.queryCommandState("italic")); }
    }
    if (boldBtn && editorEl) { boldBtn.addEventListener("click", (e) => { editorEl.focus(); document.execCommand("bold"); syncFormatButtons(); }); }
    if (italicBtn && editorEl) { italicBtn.addEventListener("click", (e) => { editorEl.focus(); document.execCommand("italic"); syncFormatButtons(); }); }
    if (editorEl) { editorEl.addEventListener("keyup", (e) => { syncFormatButtons(); }); editorEl.addEventListener("mouseup", (e) => { syncFormatButtons(); }); }

    // 이모지 (메인 그대로)
    const emojiBtn = overlay?.querySelector(".tweet-modal__tool-btn--emoji");
    const editor = editorEl;
    let savedRange = null;

    if (editor) {
        editor.addEventListener("keyup", (e) => { const sel = window.getSelection(); if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) { savedRange = sel.getRangeAt(0).cloneRange(); } });
        editor.addEventListener("mouseup", (e) => { const sel = window.getSelection(); if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) { savedRange = sel.getRangeAt(0).cloneRange(); } });
        editor.addEventListener("input", (e) => { const sel = window.getSelection(); if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) { savedRange = sel.getRangeAt(0).cloneRange(); } });
    }

    function insertEmojiToEditor(emoji) {
        if (!editor) return;
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
        const picker = new EmojiButton({ position: "top-start", rootElement: overlay });
        picker.on("emoji", (emoji) => { insertEmojiToEditor(emoji); });
        emojiBtn.addEventListener("click", (e) => { picker.togglePicker(emojiBtn); });
    }

    // 파일 첨부 (메인 그대로, 1개 제한)
    const fileBtn = overlay?.querySelector(".tweet-modal__tool-file .tweet-modal__tool-btn");
    const imageInput = overlay?.querySelector(".tweet-modal__file-input");
    const attachmentPreview = overlay?.querySelector("[data-attachment-preview]");
    const attachmentMedia = overlay?.querySelector("[data-attachment-media]");
    let attachedFiles = [];
    let attachedUrls = [];

    if (fileBtn && imageInput) { fileBtn.addEventListener("click", (e) => { imageInput.click(); }); }

    function makeImageCell(index, url, cls) {
        return '<div class="media-cell ' + cls + '"><div class="media-cell-inner"><div class="media-img-container"><div class="media-bg" style="background-image:url(\'' + url + '\');"></div><img src="' + url + '" class="media-img" /></div><button type="button" class="media-btn-delete" data-remove-index="' + index + '"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div>';
    }

    function renderImageGrid() {
        if (!attachmentMedia || attachedUrls.length === 0) return;
        attachmentMedia.innerHTML = '<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer">' + makeImageCell(0, attachedUrls[0], "media-cell--single") + '</div>';
    }

    function renderVideoAttachment() {
        if (!attachmentMedia || attachedFiles.length === 0) return;
        var file = attachedFiles[0]; var url = attachedUrls[0];
        attachmentMedia.innerHTML = '<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer"><div class="media-cell media-cell--single"><div class="media-cell-inner"><div class="media-img-container"><video class="tweet-modal__attachment-video" controls><source src="' + url + '" type="' + file.type + '"></video></div><button type="button" class="media-btn-delete" data-remove-index="0"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div></div>';
    }

    function updateAttachmentView() {
        if (attachedFiles.length === 0) { attachmentPreview.setAttribute("hidden", ""); attachmentMedia.innerHTML = ""; return; }
        attachmentPreview.removeAttribute("hidden");
        if (attachedFiles[0].type.includes("video")) { renderVideoAttachment(); } else { renderImageGrid(); }
    }

    function readFile(file, callback) { const reader = new FileReader(); reader.readAsDataURL(file); reader.addEventListener("load", (e) => { callback(e.target.result); }); }

    if (imageInput && attachmentPreview && attachmentMedia) {
        imageInput.addEventListener("change", (e) => {
            const files = e.target.files;
            if (files.length === 0) return;
            const file = files[0];
            readFile(file, (path) => { attachedFiles = [file]; attachedUrls = [path]; imageInput.value = ""; updateAttachmentView(); });
        });
        attachmentMedia.addEventListener("click", (e) => {
            const removeBtn = e.target.closest("[data-remove-index]");
            if (removeBtn) { attachedFiles = []; attachedUrls = []; updateAttachmentView(); }
        });
    }

    // 글자수 카운터 + 제출 (메인 그대로)
    const inlineEditor = editorEl;
    const inlineSubmit = overlay?.querySelector(".tweet-modal__submit");
    const inlineGaugeText = overlay?.querySelector(".composerGaugeText");
    const inlineMaxLength = 500;

    if (inlineSubmit) inlineSubmit.disabled = true;

    inlineEditor?.addEventListener("input", () => {
        const length = inlineEditor.textContent.length;
        const remaining = inlineMaxLength - length;
        if (inlineGaugeText) {
            inlineGaugeText.textContent = remaining;
            if (remaining < 0) { inlineGaugeText.style.color = "rgb(244, 33, 46)"; }
            else if (remaining < 20) { inlineGaugeText.style.color = "rgb(255, 173, 31)"; }
            else { inlineGaugeText.style.color = ""; }
        }
        if (inlineSubmit) { inlineSubmit.disabled = (length === 0 || remaining < 0); }
    });

    inlineSubmit?.addEventListener("click", async (e) => {
        e.preventDefault();
        const text = inlineEditor?.textContent?.trim();
        if (!text) return;

        const formData = new FormData();
        formData.append("memberId", memberId);
        formData.append("postContent", text);
        if (selectedLocation) { formData.append("location", selectedLocation); }
        if (attachedFiles.length > 0) { attachedFiles.forEach(f => formData.append("files", f)); }

        await service.writeReply(postId, formData);

        inlineEditor.innerHTML = "";
        if (inlineSubmit) inlineSubmit.disabled = true;
        if (inlineGaugeText) { inlineGaugeText.textContent = inlineMaxLength; inlineGaugeText.style.color = ""; }
        attachedFiles = []; attachedUrls = [];
        if (attachmentPreview) { attachmentPreview.setAttribute("hidden", ""); }
        if (attachmentMedia) { attachmentMedia.innerHTML = ""; }
        if (imageInput) { imageInput.value = ""; }
        selectedLocation = null;
        updateLocationUI();
        if (boldBtn) { boldBtn.classList.remove("active"); }
        if (italicBtn) { italicBtn.classList.remove("active"); }

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
                if (r.subReplies && r.subReplies.length > 0) {
                    let group = '<div class="post-detail-thread-group" aria-label="연결된 답글 스레드">';
                    group += layout.buildReplyCard(r, true);
                    group += r.subReplies.map(sub => layout.buildReplyCard(sub, true)).join("");
                    group += '</div>';
                    return group;
                }
                return layout.buildReplyCard(r, false);
            }).join("");
        } catch (e) {
            console.error("댓글 로딩 실패:", e);
            section.innerHTML = '<div style="padding:20px;color:#71767b;text-align:center;"><p>댓글을 불러오지 못했습니다.</p></div>';
        }
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
            '<button type="button" class="menu-item share-menu-item--bookmark"><span class="menu-item__icon"><svg viewBox="0 0 24 24"><path d="M18 3V0h2v3h3v2h-3v3h-2V5h-3V3zm-7.5 1a.5.5 0 00-.5.5V7h3.5A2.5 2.5 0 0116 9.5v3.48l3 2.1V11h2v7.92l-5-3.5v7.26l-6.5-3.54L3 22.68V9.5A2.5 2.5 0 015.5 7H8V4.5A2.5 2.5 0 0110.5 2H12v2zm-5 5a.5.5 0 00-.5.5v9.82l4.5-2.46 4.5 2.46V9.5a.5.5 0 00-.5-.5z"></path></svg></span><span class="menu-item__label">폴더에 북마크 추가하기</span></button>' +
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
            } else if (item.classList.contains("share-menu-item--bookmark")) {
                console.log("상세북마크 들어옴1, postId:", meta?.postId || postId);
                closeShareDrop();
                openShareBookmarkModal(meta?.postId || postId);
                return;
            }
            closeShareDrop();
        });

        if (layers) layers.appendChild(lc);
        else document.body.appendChild(lc);
        activeShareDrop = lc;
        activeShareBtn = btn;
    });

    // ── 5-2. 북마크 폴더 모달 ──
    const shareBookmarkModal = document.getElementById("shareBookmarkModal");
    const shareBookmarkFolderList = document.getElementById("shareBookmarkFolderList");
    const shareBookmarkCreateFolder = document.getElementById("shareBookmarkCreateFolder");
    let shareBookmarkTargetPostId = null;

    async function openShareBookmarkModal(targetPostId) {
        shareBookmarkTargetPostId = targetPostId;
        if (!shareBookmarkModal) return;
        shareBookmarkModal.hidden = false;
        console.log("상세북마크 들어옴2 모달열기, postId:", targetPostId);
        const result = await BookmarkService.getFolders(memberId);
        console.log("상세북마크 들어옴3 폴더목록:", result);
        if (!result.ok) return;
        const folders = result.data || [];
        let html = `<button type="button" class="bookmark-share-sheet-folder" data-share-folder-id="">
            <span class="bookmark-share-sheet-folder-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.75 3h10.5A2.25 2.25 0 0119.5 5.25v15.07a.75.75 0 01-1.2.6L12 16.2l-6.3 4.72a.75.75 0 01-1.2-.6V5.25A2.25 2.25 0 016.75 3z"/></svg></span>
            <span class="bookmark-share-sheet-folder-name">미분류</span>
        </button>`;
        folders.forEach((f) => {
            html += `<button type="button" class="bookmark-share-sheet-folder" data-share-folder-id="${f.id}">
                <span class="bookmark-share-sheet-folder-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.75 3h10.5A2.25 2.25 0 0119.5 5.25v15.07a.75.75 0 01-1.2.6L12 16.2l-6.3 4.72a.75.75 0 01-1.2-.6V5.25A2.25 2.25 0 016.75 3z"/></svg></span>
                <span class="bookmark-share-sheet-folder-name">${f.folderName}</span>
            </button>`;
        });
        shareBookmarkFolderList.innerHTML = html;
    }

    if (shareBookmarkFolderList) {
        shareBookmarkFolderList.addEventListener("click", async (e) => {
            const folderBtn = e.target.closest(".bookmark-share-sheet-folder");
            if (!folderBtn) return;
            const folderId = folderBtn.dataset.shareFolderId || null;
            console.log("상세북마크 들어옴4 선택:", memberId, shareBookmarkTargetPostId, folderId);
            const result = await BookmarkService.add(memberId, shareBookmarkTargetPostId, folderId);
            console.log("상세북마크 들어옴5 결과:", result);
            shareBookmarkModal.hidden = true;
            if (result.ok) {
                // 북마크 아이콘 active 처리
                const card = document.querySelector(`.postCard[data-post-id="${shareBookmarkTargetPostId}"]`);
                if (card) {
                    const btn = card.querySelector(".tweet-action-btn--bookmark");
                    if (btn) btn.classList.add("active");
                }
                showToast("북마크 폴더에 추가되었습니다.");
            } else if (result.status === 409) {
                showToast("이 폴더에 이미 북마크된 게시물입니다.");
            } else {
                showToast("북마크 추가에 실패했습니다.");
            }
        });
    }

    // 새 폴더 만들기 (커스텀 모달)
    const createFolderModal = document.getElementById("createFolderModal");
    const createFolderInput = document.getElementById("createFolderInput");
    const createFolderSubmit = document.getElementById("createFolderSubmit");
    const createFolderClose = document.getElementById("createFolderClose");
    const createFolderCount = document.getElementById("createFolderCount");

    if (shareBookmarkCreateFolder && createFolderModal) {
        shareBookmarkCreateFolder.addEventListener("click", () => {
            console.log("상세새폴더 들어옴1 모달열기");
            shareBookmarkModal.hidden = true;
            createFolderInput.value = "";
            createFolderSubmit.disabled = true;
            createFolderCount.textContent = "0 / 25";
            createFolderModal.classList.add("is-open");
            createFolderInput.focus();
        });

        createFolderInput.addEventListener("input", () => {
            const len = createFolderInput.value.length;
            createFolderCount.textContent = len + " / 25";
            createFolderSubmit.disabled = !createFolderInput.value.trim();
        });

        createFolderSubmit.addEventListener("click", async () => {
            const folderName = createFolderInput.value.trim();
            if (!folderName) return;
            console.log("상세새폴더 들어옴2:", folderName);
            createFolderSubmit.disabled = true;
            const result = await BookmarkService.createFolder(memberId, folderName);
            console.log("상세새폴더 들어옴3 결과:", result);
            createFolderModal.classList.remove("is-open");
            if (result.ok) {
                showToast(folderName + " 폴더를 만들었습니다.");
                await openShareBookmarkModal(shareBookmarkTargetPostId);
            }
        });

        createFolderClose.addEventListener("click", () => {
            createFolderModal.classList.remove("is-open");
        });
    }

    if (shareBookmarkModal) {
        shareBookmarkModal.addEventListener("click", (e) => {
            if (e.target.closest("[data-share-close]") || e.target.classList.contains("bookmark-share-sheet-backdrop")) {
                shareBookmarkModal.hidden = true;
            }
        });
    }

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
    if (postIsFollowed && postMemberHandle) {
        followState[postMemberHandle] = true;
    }

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
        const meta = { ...activeMoreMeta };
        closeMoreDrop();
        blockTitle.textContent = meta.handle + " 님을 차단할까요?";
        blockDesc.textContent = meta.handle + " 님은 나를 팔로우하거나 쪽지를 보낼 수 없으며, 이 계정과 관련된 알림도 내게 표시되지 않습니다.";
        blockDialog.hidden = false;
        blockDialog._meta = meta;
        document.body.classList.add("modal-open");
    });

    blockDialog?.addEventListener("click", async (e) => {
        if (e.target.closest("[data-post-detail-block-close='true']")) {
            closeDialog(blockDialog);
            return;
        }
        if (e.target.closest("[data-post-detail-block-confirm='true']") && blockDialog._meta) {
            const meta = blockDialog._meta;
            closeDialog(blockDialog);
            await service.block(memberId, meta.targetMemberId);
            if (Number(meta.targetMemberId) === postMemberId) {
                location.href = "/main/main";
            } else {
                showToast(meta.handle + " 님을 차단했습니다");
                await refreshReplies();
            }
        }
    });

    document.getElementById("postDetailMoreReport")?.addEventListener("click", () => {
        if (!activeMoreMeta || !reportDialog) return;
        const meta = { ...activeMoreMeta };
        closeMoreDrop();
        reportDialog.hidden = false;
        reportDialog._meta = meta;
        document.body.classList.add("modal-open");
    });

    reportDialog?.addEventListener("click", async (e) => {
        if (e.target.closest("[data-post-detail-report-close='true']")) {
            closeDialog(reportDialog);
            return;
        }
        const item = e.target.closest(".post-detail-notification-report__item");
        if (item && reportDialog._meta) {
            const meta = reportDialog._meta;
            const reason = item.dataset.reason || item.querySelector("span")?.textContent?.trim() || "";
            closeDialog(reportDialog);
            console.log("신고 접수 postId:", meta.postId);
            await service.report(memberId, meta.postId, "post", reason);
            showToast("신고가 접수되었습니다");
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
        const replyFormData = new FormData();
        replyFormData.append("memberId", memberId);
        replyFormData.append("postContent", text);
        await service.writeReply(replyTargetPostId, replyFormData);
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

    // ── 11. 프로필 이미지 없으면 SVG 아바타 동적 생성 ──
    document.querySelectorAll(".post-detail-avatar:not(.post-detail-avatar--image), .post-detail-inline-reply-avatar").forEach(el => {
        if (el.querySelector("img")) return;
        const initial = (el.textContent.trim() || "?").charAt(0);
        el.classList.add("post-detail-avatar--image");
        el.innerHTML = `<img src="${layout.buildAvatarDataUri(initial)}" alt="프로필"/>`;
    });

    // ── 12. 페이지 로드 시 댓글 비동기 로딩 ──
    refreshReplies();
};
