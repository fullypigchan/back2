// ============================================================================
// estimation-form.js
// 견적요청 폼 내부 로직 (유효성, 태그, 카테고리, 상품선택, 위치/Maps, 제출)
// 모달 열기/닫기는 각 페이지(estimation-regist/event.js, mypage/event.js)에서 담당한다.
// ============================================================================
window.addEventListener("load", () => {
    const composerForm = document.getElementById("postComposerForm");
    const submitButton = document.getElementById("postSubmitButton");
    const productSelectButton = document.getElementById("productSelectButton");
    const productSelectModal = document.getElementById("productSelectModal");
    const productSelectBackdrop = document.getElementById("productSelectBackdrop");
    const productSelectClose = document.getElementById("productSelectClose");
    const productSelectConfirm = document.getElementById("productSelectConfirm");
    const productSelectList = document.getElementById("productSelectList");
    const productSelectEmpty = document.getElementById("productSelectEmpty");
    const selectedProductPreview = document.getElementById("selectedProductPreview");
    const selectedProductImage = document.getElementById("selectedProductImage");
    const selectedProductName = document.getElementById("selectedProductName");
    const selectedProductMeta = document.getElementById("selectedProductMeta");
    const selectedProductRemove = document.getElementById("selectedProductRemove");
    const userLinkButton = document.getElementById("composerUserLinkButton");
    const linkedProfile = document.getElementById("composerLinkedProfile");
    const linkedProfileAvatar = document.getElementById("composerLinkedProfileAvatar");
    const linkedProfileEmail = document.getElementById("composerLinkedProfileEmail");
    const shareChatSheet = document.getElementById("estimationShareChatSheet");
    const shareChatSearch = document.getElementById("estimationShareChatSearch");
    const shareChatUserList = document.getElementById("estimationShareChatUserList");
    const shareChatEmpty = document.getElementById("estimationShareChatEmpty");
    const shareChatCloseButtons = Array.from(
        document.querySelectorAll("[data-estimation-share-close]"),
    );
    const titleInput = document.querySelector('input[name="postName"]');
    const summaryInput = document.querySelector('input[name="postPrice"]');
    const contentInput = document.querySelector('textarea[name="postContent"]');
    const composerTagToggle = document.getElementById("composerTagToggle");
    const composerTagEditor = document.getElementById("composerTagEditor");
    const productTagInput = document.getElementById("productTag");
    const tagInput = document.getElementById("composerTagInput");
    const tagsHiddenInput = document.querySelector('input[name="tags"]');
    const locationHiddenInput = document.querySelector('input[name="location"]');
    const composeView = document.getElementById("composerComposeView");
    const locationDisplayButton = document.getElementById("composerLocation");
    const locationName = document.getElementById("composerLocationName");
    const locationView = document.getElementById("composerLocationView");
    const locationCloseButton = document.getElementById("composerLocationClose");
    const locationDeleteButton = document.getElementById("composerLocationDelete");
    const locationCompleteButton = document.getElementById("composerLocationComplete");
    const locationSearchInput = document.getElementById("composerLocationSearch");
    const locationSearchButton = document.getElementById("composerLocationSearchButton");
    const locationGuide = document.getElementById("composerLocationGuide");
    const locationMapElement = document.getElementById("composerLocationMap");
    const requiredFields = [titleInput, summaryInput, contentInput].filter(Boolean);

    let selectedProductId = "";
    let selectedReceiverEmail = "";
    let selectedLocation = "";
    let pendingLocation = "";
    let mapInstance = null;
    let mapMarker = null;
    let geocoder = null;
    let mapsLoaderPromise = null;
    let expertSearchAbortController = null;
    let productItems = [];
    let isTagEditorOpen = false;

    const safeText = (value, fallback = "") => (value || fallback).trim();
    const specialCharRegex = /[\{\}\[\]\?.,;:|\)*~`!^\-_+<>@\#$%&\\=\(\'\"]/;

    // -- 폼 HTML이 없으면 초기화를 중단한다. --------------------------------
    if (!composerForm) {
        return;
    }

    // ====================================================================
    //  태그
    // ====================================================================
    const syncHiddenTags = () => {
        if (!tagsHiddenInput || !tagInput) {
            return;
        }

        const normalized = Array.from(tagInput.querySelectorAll(".tagDiv"))
            .map((tagElement) => tagElement.textContent.replace(/^#/, "").trim())
            .filter(Boolean)
            .join(", ");
        tagsHiddenInput.value = normalized;
    };

    const getTagElements = () => {
        if (!tagInput) {
            return [];
        }

        return Array.from(tagInput.querySelectorAll(".tagDiv"));
    };

    const syncTagDock = () => {
        if (!tagInput) {
            return;
        }

        tagInput.hidden = getTagElements().length === 0;
        syncHiddenTags();
        if (composerTagToggle) {
            composerTagToggle.textContent = isTagEditorOpen ? "태그 닫기" : "태그 추가";
        }
    };

    const syncTagEditor = () => {
        if (!composerTagEditor) {
            return;
        }

        composerTagEditor.hidden = !isTagEditorOpen;
        if (isTagEditorOpen) {
            window.requestAnimationFrame(() => productTagInput?.focus());
        }
    };

    const addTag = (rawTag, { alertOnFail = false } = {}) => {
        if (!tagInput) {
            return false;
        }

        const tag = (rawTag || "").trim();
        if (!tag || tag === "전체") {
            return false;
        }

        if (getTagElements().length >= 5) {
            if (alertOnFail) {
                alert("태그는 최대 5개까지 추가할 수 있어요");
            }
            return false;
        }

        if (specialCharRegex.test(tag)) {
            if (alertOnFail) {
                alert("특수문자는 입력 못해요");
            }
            return false;
        }

        const existingTags = getTagElements().map((tagElement) => tagElement.textContent.trim());
        const normalizedTag = `#${tag}`;
        if (existingTags.includes(normalizedTag)) {
            if (alertOnFail) {
                alert("중복된 태그가 있어요");
            }
            return false;
        }

        const tagElement = document.createElement("span");
        tagElement.className = "tagDiv";
        tagElement.textContent = normalizedTag;
        tagInput.appendChild(tagElement);
        isTagEditorOpen = false;
        if (productTagInput) {
            productTagInput.value = "";
        }
        syncTagEditor();
        syncTagDock();
        return true;
    };

    // ====================================================================
    //  위치
    // ====================================================================
    const syncLocationHiddenInput = () => {
        if (locationHiddenInput) {
            locationHiddenInput.value = selectedLocation;
        }
    };

    const syncLocationUI = () => {
        const hasLocation = Boolean(selectedLocation);

        if (locationName) {
            locationName.textContent = hasLocation ? selectedLocation : "위치 추가";
        }

        if (locationDisplayButton) {
            locationDisplayButton.hidden = false;
            locationDisplayButton.setAttribute(
                "aria-label",
                hasLocation ? `위치 ${selectedLocation}` : "위치 태그하기",
            );
        }

        if (locationDeleteButton) {
            locationDeleteButton.hidden = !hasLocation;
        }

        if (locationCompleteButton) {
            locationCompleteButton.disabled = !pendingLocation;
        }

        syncLocationHiddenInput();
    };

    // ====================================================================
    //  상품 선택
    // ====================================================================
    const syncSubmitState = () => {
        if (!submitButton) {
            return;
        }

        const hasRequiredValues = requiredFields.every((field) => field.value.trim());
        submitButton.disabled = !hasRequiredValues || !selectedProductId;
    };

    const renderSelectedProduct = () => {
        if (!selectedProductPreview) {
            return;
        }

        const product = productItems.find((item) => item.dataset.productId === selectedProductId);
        if (!product || !selectedProductImage || !selectedProductName || !selectedProductMeta) {
            selectedProductPreview.hidden = true;
            syncSubmitState();
            return;
        }

        selectedProductPreview.hidden = false;
        selectedProductImage.src = product.dataset.productImage || "";
        selectedProductImage.alt = product.dataset.productName || "";
        selectedProductName.textContent = product.dataset.productName || "";
        selectedProductMeta.textContent = product.dataset.productMeta || "";
        syncSubmitState();
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

    const formatProductMeta = (product) => {
        const parts = [];

        if (typeof product.productPrice === "number") {
            parts.push(`₩${product.productPrice.toLocaleString()}`);
        }

        if (typeof product.productStock === "number") {
            parts.push(`${product.productStock}개`);
        }

        return parts.join(" · ");
    };

    const formatProductTags = (product) => {
        const hashtags = Array.isArray(product.hashtags) ? product.hashtags : [];
        if (!hashtags.length) {
            return "";
        }

        return hashtags
            .map((hashtag) => hashtag?.tagName?.trim())
            .filter(Boolean)
            .map((tagName) => `#${tagName}`)
            .join(" ");
    };

    const renderProductOptions = (products) => {
        if (!productSelectList) {
            return;
        }

        productSelectList.innerHTML = products.map((product) => {
            const productId = String(product.id ?? "");
            const productName = safeText(product.postTitle, "상품");
            const productMeta = formatProductMeta(product);
            const productTags = formatProductTags(product);
            const productImage = Array.isArray(product.postFiles) && product.postFiles.length
                ? product.postFiles[0]
                : "/images/main/global-gates-logo.png";

            return `
                <button
                    type="button"
                    class="productSelectModal__item"
                    data-product-id="${productId}"
                    data-product-name="${productName}"
                    data-product-meta="${productMeta}"
                    data-product-image="${productImage}"
                    aria-pressed="false"
                >
                    <span class="productSelectModal__checkbox" aria-hidden="true">
                        <svg viewBox="0 0 24 24"><g><path d="M9 20c-.264 0-.518-.104-.707-.293l-4.785-4.785 1.414-1.414L9 17.586 19.072 7.5l1.42 1.416L9.708 19.7c-.188.19-.442.3-.708.3z"></path></g></svg>
                    </span>
                    <img class="productSelectModal__thumb" src="${productImage}" alt="${productName}">
                    <span class="productSelectModal__item-body">
                        <strong class="productSelectModal__item-title">${productName}</strong>
                        <span class="productSelectModal__item-tags">${productTags}</span>
                        <span class="productSelectModal__item-meta">${productMeta}</span>
                    </span>
                </button>
            `;
        }).join("");

        productItems = Array.from(
            productSelectList.querySelectorAll(".productSelectModal__item"),
        );
        syncProductSelection();
    };

    const fetchProducts = async () => {
        if (!productSelectList) {
            return;
        }

        const response = await fetch("/api/estimations/products");
        if (!response.ok) {
            throw new Error(`상품 목록 조회 실패 (${response.status})`);
        }

        const products = await response.json();
        renderProductOptions(Array.isArray(products) ? products : []);
    };

    const openProductSelectModal = () => {
        if (!productSelectModal) {
            return;
        }

        productSelectModal.hidden = false;
        void (async () => {
            try {
                await fetchProducts();
            } catch (error) {
                console.error(error);
                if (productSelectList) {
                    productSelectList.innerHTML = "";
                }
                productItems = [];
                if (productSelectEmpty) {
                    productSelectEmpty.hidden = false;
                }
            }
            syncProductSelection();
        })();
    };

    const closeProductSelectModal = () => {
        if (!productSelectModal) {
            return;
        }

        productSelectModal.hidden = true;
    };

    // ====================================================================
    //  전문가 검색 (사용자 찾기 시트)
    // ====================================================================
    const openShareChatSheet = () => {
        if (shareChatSheet) {
            shareChatSheet.hidden = false;
        }
        if (shareChatSearch) {
            shareChatSearch.value = "";
        }
        void fetchExperts();
    };

    const closeShareChatSheet = () => {
        if (shareChatSheet) {
            shareChatSheet.hidden = true;
        }
    };

    const renderExperts = (experts) => {
        if (!shareChatUserList) {
            return;
        }

        shareChatUserList.innerHTML = experts.map((expert) => {
            const displayName = expert.memberNickname || expert.memberName || "전문가";
            const avatar = expert.memberProfileFileName || "/images/main/lown1.jpg";
            const handle = expert.memberHandle ? `@${expert.memberHandle}` : expert.memberEmail;

            return `
                <button
                    type="button"
                    class="share-sheet__user"
                    data-share-user-email="${expert.memberEmail || ""}"
                    data-share-user-name="${displayName}"
                    data-share-user-avatar="${avatar}"
                >
                    <span class="share-sheet__user-avatar">
                        <img src="${avatar}" alt="${displayName}" />
                    </span>
                    <span class="share-sheet__user-body">
                        <span class="share-sheet__user-name">${displayName}</span>
                        <span class="share-sheet__user-handle">${handle || ""}</span>
                    </span>
                </button>
            `;
        }).join("");

        if (shareChatEmpty) {
            shareChatEmpty.hidden = experts.length > 0;
        }
    };

    const fetchExperts = async () => {
        if (!shareChatUserList) {
            return;
        }

        if (expertSearchAbortController) {
            expertSearchAbortController.abort();
        }

        expertSearchAbortController = new AbortController();
        const keyword = shareChatSearch?.value.trim() || "";

        try {
            shareChatUserList.innerHTML = "";
            if (shareChatEmpty) {
                shareChatEmpty.hidden = true;
            }

            const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : "";
            const response = await fetch(`/api/estimations/experts${query}`, {
                signal: expertSearchAbortController.signal,
            });

            if (!response.ok) {
                throw new Error(`전문가 목록 조회 실패 (${response.status})`);
            }

            const experts = await response.json();
            renderExperts(Array.isArray(experts) ? experts : []);
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }

            console.error(error);
            shareChatUserList.innerHTML = "";
            if (shareChatEmpty) {
                shareChatEmpty.hidden = false;
                shareChatEmpty.textContent = "전문가 목록을 불러오지 못했습니다.";
            }
        }
    };

    const selectLinkedProfile = (button) => {
        if (!linkedProfile || !linkedProfileAvatar || !linkedProfileEmail) {
            return;
        }

        selectedReceiverEmail = button.dataset.shareUserEmail || "";
        linkedProfile.hidden = false;
        linkedProfile.setAttribute("aria-hidden", "false");
        linkedProfileAvatar.src = button.dataset.shareUserAvatar || "";
        linkedProfileAvatar.alt = button.dataset.shareUserName || "";
        linkedProfileEmail.textContent = selectedReceiverEmail || "unknown";
        closeShareChatSheet();
    };

    // ====================================================================
    //  Google Maps
    //  API key: body(독립 페이지) 또는 fragment wrapper(마이페이지) 양쪽에서 조회한다.
    // ====================================================================
    const loadGoogleMaps = () => {
        if (window.google?.maps) {
            return Promise.resolve(window.google.maps);
        }

        if (mapsLoaderPromise) {
            return mapsLoaderPromise;
        }

        const apiKey = (
            document.body.dataset.googleMapsApiKey
            || document.querySelector("[data-google-maps-api-key]")?.dataset.googleMapsApiKey
            || ""
        ).trim();
        if (!apiKey) {
            return Promise.reject(new Error("Google Maps API key is missing."));
        }

        mapsLoaderPromise = new Promise((resolve, reject) => {
            const callbackName = "__initEstimationLocationMap";
            window[callbackName] = () => {
                delete window[callbackName];
                resolve(window.google.maps);
            };

            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&callback=${callbackName}`;
            script.async = true;
            script.defer = true;
            script.onerror = () => {
                delete window[callbackName];
                reject(new Error("Failed to load Google Maps script."));
            };
            document.head.appendChild(script);
        });

        return mapsLoaderPromise;
    };

    const updatePendingLocation = (locationText) => {
        pendingLocation = safeText(locationText);

        if (locationGuide) {
            locationGuide.textContent = pendingLocation
                ? `선택된 위치: ${pendingLocation}`
                : "지도를 클릭하거나 주소를 검색해서 위치를 선택하세요.";
        }

        if (locationCompleteButton) {
            locationCompleteButton.disabled = !pendingLocation;
        }
    };

    const ensureMap = async () => {
        const maps = await loadGoogleMaps();

        if (!locationMapElement) {
            return;
        }

        if (!mapInstance) {
            mapInstance = new maps.Map(locationMapElement, {
                center: { lat: 37.5665, lng: 126.9780 },
                zoom: 14,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });

            geocoder = new maps.Geocoder();
            mapMarker = new maps.Marker({ map: mapInstance });

            mapInstance.addListener("click", (event) => {
                const latLng = event.latLng;
                if (!latLng) {
                    return;
                }

                mapMarker.setPosition(latLng);
                geocoder.geocode({ location: latLng }, (results, status) => {
                    if (status === "OK" && results?.length) {
                        updatePendingLocation(results[0].formatted_address);
                        return;
                    }

                    updatePendingLocation(`${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`);
                });
            });
        }

        window.setTimeout(() => {
            maps.event.trigger(mapInstance, "resize");
            mapInstance.setCenter(mapMarker?.getPosition() || { lat: 37.5665, lng: 126.9780 });
        }, 0);
    };

    const searchLocation = async () => {
        const keyword = safeText(locationSearchInput?.value);
        if (!keyword) {
            updatePendingLocation("");
            return;
        }

        await ensureMap();
        if (!geocoder || !mapMarker || !mapInstance) {
            return;
        }

        geocoder.geocode({ address: keyword }, (results, status) => {
            if (status !== "OK" || !results?.length) {
                updatePendingLocation("");
                if (locationGuide) {
                    locationGuide.textContent = "검색 결과를 찾지 못했습니다. 다른 주소로 시도해 주세요.";
                }
                return;
            }

            const result = results[0];
            mapInstance.setCenter(result.geometry.location);
            mapInstance.setZoom(15);
            mapMarker.setPosition(result.geometry.location);
            updatePendingLocation(result.formatted_address);
        });
    };

    const openLocationPanel = async () => {
        if (!composeView || !locationView) {
            return;
        }

        pendingLocation = selectedLocation;
        composeView.hidden = true;
        locationView.hidden = false;
        syncLocationUI();

        try {
            await ensureMap();
        } catch (error) {
            console.error(error);
            alert("Google Maps 설정이 없어 위치 기능을 바로 열 수 없습니다.");
            closeLocationPanel({ restoreFocus: false });
        }
    };

    const closeLocationPanel = ({ restoreFocus = true } = {}) => {
        if (!composeView || !locationView) {
            return;
        }

        locationView.hidden = true;
        composeView.hidden = false;
        pendingLocation = selectedLocation;
        if (locationSearchInput) {
            locationSearchInput.value = "";
        }
        syncLocationUI();

        if (restoreFocus) {
            window.requestAnimationFrame(() => {
                locationDisplayButton?.focus();
            });
        }
    };

    const applyLocation = () => {
        selectedLocation = pendingLocation;
        syncLocationUI();
        closeLocationPanel();
    };

    const clearLocation = () => {
        selectedLocation = "";
        pendingLocation = "";
        if (locationSearchInput) {
            locationSearchInput.value = "";
        }
        if (locationGuide) {
            locationGuide.textContent = "지도를 클릭하거나 주소를 검색해서 위치를 선택하세요.";
        }
        if (mapMarker) {
            mapMarker.setMap(null);
            mapMarker = new window.google.maps.Marker({ map: mapInstance });
        }
        if (mapInstance) {
            mapInstance.setCenter({ lat: 37.5665, lng: 126.9780 });
            mapInstance.setZoom(14);
        }
        syncLocationUI();
    };

    // ====================================================================
    //  폼 제출
    // ====================================================================
    const buildPayload = () => {
        const descriptionParts = [
            safeText(summaryInput?.value),
            safeText(contentInput?.value),
        ].filter(Boolean);

        return {
            requesterId: 1,
            receiverId: null,
            productId: selectedProductId ? Number(selectedProductId) : null,
            title: safeText(titleInput?.value),
            content: descriptionParts.join("\n"),
            location: selectedLocation || null,
            deadLine: null,
            status: "requesting",
            receiverEmail: selectedReceiverEmail || null,
            tags: getTagElements().map((tagElement) => ({
                tagName: tagElement.textContent.replace(/^#/, "").trim(),
            })),
        };
    };

    const resetForm = () => {
        composerForm?.reset();
        selectedProductId = "";
        selectedReceiverEmail = "";
        selectedLocation = "";
        pendingLocation = "";
        if (tagInput) {
            tagInput.innerHTML = "";
            tagInput.hidden = true;
        }
        isTagEditorOpen = false;
        if (productTagInput) {
            productTagInput.value = "";
        }
        if (tagsHiddenInput) {
            tagsHiddenInput.value = "";
        }
        if (locationHiddenInput) {
            locationHiddenInput.value = "";
        }
        if (linkedProfile) {
            linkedProfile.hidden = true;
            linkedProfile.setAttribute("aria-hidden", "true");
        }
        renderSelectedProduct();
        syncProductSelection();
        syncLocationUI();
        syncSubmitState();
    };

    const submitEstimation = async () => {
        const payload = buildPayload();

        if (!payload.title || !payload.content || !payload.productId) {
            alert("제목, 내용, 상품을 먼저 입력해 주세요.");
            return;
        }

        submitButton.disabled = true;

        try {
            const response = await fetch("/api/estimations/write", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`견적 요청 저장 실패 (${response.status})`);
            }

            alert("견적 요청이 등록되었습니다.");
            resetForm();

            // 제출 후 후처리는 폼이 어느 페이지에 떠 있었는지에 따라 다르다.
            //   - /mypage 에서 열린 견적요청 모달: 마이페이지에 그대로 머물러야 한다.
            //     리다이렉트 대신 모달 닫기 버튼을 프로그래밍적으로 눌러준다.
            //     (eventwo.js의 close 로직을 그대로 타므로 상태 정리도 함께 수행됨.
            //      resetForm 직후라 입력 내용이 없어 "삭제하시겠어요?" confirm도 뜨지 않는다.)
            //   - 그 외(예: /estimation/regist 독립 페이지): 기존 동작대로 견적 목록으로 이동.
            if (window.location.pathname.startsWith("/mypage")) {
                document.getElementById("composerModalClose")?.click();
            } else {
                window.location.href = "/estimation/list";
            }
        } catch (error) {
            console.error(error);
            alert("견적 요청 저장 중 오류가 발생했습니다.");
            syncSubmitState();
        }
    };

    // ====================================================================
    //  이벤트 바인딩 (폼 내부 전용 — 모달 열기/닫기는 여기에 포함하지 않는다)
    // ====================================================================
    requiredFields.forEach((field) => {
        field.addEventListener("input", syncSubmitState);
    });

    tagInput?.addEventListener("click", (event) => {
        const tagElement = event.target.closest(".tagDiv");
        if (!(tagElement instanceof HTMLElement)) {
            return;
        }

        tagElement.remove();
        syncTagDock();
    });

    composerTagToggle?.addEventListener("click", () => {
        isTagEditorOpen = !isTagEditorOpen;
        syncTagEditor();
        syncTagDock();
    });

    productTagInput?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();
        addTag(productTagInput.value, { alertOnFail: true });
    });

    locationDisplayButton?.addEventListener("click", () => {
        void openLocationPanel();
    });
    locationCloseButton?.addEventListener("click", () => closeLocationPanel());
    locationDeleteButton?.addEventListener("click", clearLocation);
    locationCompleteButton?.addEventListener("click", applyLocation);
    locationSearchButton?.addEventListener("click", () => {
        void searchLocation();
    });
    locationSearchInput?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            void searchLocation();
        }
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
        syncProductSelection();
    });

    userLinkButton?.addEventListener("click", openShareChatSheet);
    shareChatCloseButtons.forEach((button) => {
        button.addEventListener("click", closeShareChatSheet);
    });
    shareChatSearch?.addEventListener("input", () => {
        void fetchExperts();
    });
    shareChatSearch?.addEventListener("change", () => {
        void fetchExperts();
    });
    shareChatUserList?.addEventListener("click", (event) => {
        const button = event.target.closest(".share-sheet__user");
        if (!(button instanceof HTMLElement)) {
            return;
        }

        selectLinkedProfile(button);
    });

    productSelectList?.addEventListener("click", (event) => {
        const item = event.target.closest("[data-product-id]");
        if (!(item instanceof HTMLElement)) {
            return;
        }

        selectedProductId = item.dataset.productId || "";
        syncProductSelection();
    });

    composerForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        await submitEstimation();
    });

    // ====================================================================
    //  초기 상태 동기화
    // ====================================================================
    syncHiddenTags();
    syncTagEditor();
    syncTagDock();
    syncSubmitState();
    syncProductSelection();
    renderSelectedProduct();
    renderExperts([]);
    syncLocationUI();
});
