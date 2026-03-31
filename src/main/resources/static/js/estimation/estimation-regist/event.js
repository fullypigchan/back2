window.addEventListener("load", () => {
    const createPostButton = document.getElementById("createPostButton");
    const composerForm = document.getElementById("postComposerForm");
    const submitButton = document.getElementById("postSubmitButton");
    const productSelectButton = document.getElementById("productSelectButton");
    const productSelectModal = document.getElementById("productSelectModal");
    const productSelectBackdrop = document.getElementById("productSelectBackdrop");
    const productSelectClose = document.getElementById("productSelectClose");
    const productSelectConfirm = document.getElementById("productSelectConfirm");
    const productSelectList = document.getElementById("productSelectList");
    const productItems = Array.from(
        document.querySelectorAll("#productSelectList .productSelectModal__item"),
    );
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
    const shareChatCloseButtons = Array.from(
        document.querySelectorAll("[data-estimation-share-close]"),
    );
    const shareUserButtons = Array.from(
        document.querySelectorAll("#estimationShareChatUserList .share-sheet__user"),
    );
    const titleInput = document.querySelector('input[name="postName"]');
    const summaryInput = document.querySelector('input[name="postPrice"]');
    const contentInput = document.querySelector('textarea[name="postContent"]');
    const tagInput = document.getElementById("devTags");
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

    const safeText = (value, fallback = "") => (value || fallback).trim();

    const parseTags = (value) =>
        value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
            .map((tag) => tag.replace(/^#/, ""))
            .filter((tag, index, array) => array.indexOf(tag) === index)
            .map((tag) => ({ tagName: tag }));

    const syncHiddenTags = () => {
        if (!tagInput || !tagsHiddenInput) {
            return;
        }

        const normalized = parseTags(tagInput.value)
            .map((tag) => `#${tag.tagName}`)
            .join(", ");
        tagsHiddenInput.value = normalized;
    };

    const syncLocationHiddenInput = () => {
        if (locationHiddenInput) {
            locationHiddenInput.value = selectedLocation;
        }
    };

    const syncSubmitState = () => {
        if (!submitButton) {
            return;
        }

        const hasRequiredValues = requiredFields.every((field) => field.value.trim());
        submitButton.disabled = !hasRequiredValues || !selectedProductId;
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
        if (shareChatSheet) {
            shareChatSheet.hidden = false;
        }
    };

    const closeShareChatSheet = () => {
        if (shareChatSheet) {
            shareChatSheet.hidden = true;
        }
    };

    const syncShareUsers = () => {
        const keyword = shareChatSearch?.value.trim().toLowerCase() || "";

        shareUserButtons.forEach((button) => {
            const name = (button.dataset.shareUserName || "").toLowerCase();
            const email = (button.dataset.shareUserEmail || "").toLowerCase();
            button.hidden = Boolean(keyword) && !name.includes(keyword) && !email.includes(keyword);
        });
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

    const openComposerModal = () => {
        const composerModalOverlay = document.getElementById("composerModalOverlay");
        const composerSection = document.getElementById("composerSection");
        if (composerModalOverlay) {
            composerModalOverlay.hidden = false;
        }
        if (composerSection) {
            composerSection.hidden = false;
        }
        document.body.classList.add("modal-open");
    };

    const closeComposerModal = () => {
        const composerModalOverlay = document.getElementById("composerModalOverlay");
        const composerSection = document.getElementById("composerSection");
        if (composerModalOverlay) {
            composerModalOverlay.hidden = true;
        }
        if (composerSection) {
            composerSection.hidden = true;
        }
        document.body.classList.remove("modal-open");
    };

    const loadGoogleMaps = () => {
        if (window.google?.maps) {
            return Promise.resolve(window.google.maps);
        }

        if (mapsLoaderPromise) {
            return mapsLoaderPromise;
        }

        const apiKey = document.body.dataset.googleMapsApiKey?.trim();
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
            tags: parseTags(tagInput?.value || ""),
        };
    };

    const resetForm = () => {
        composerForm?.reset();
        selectedProductId = "";
        selectedReceiverEmail = "";
        selectedLocation = "";
        pendingLocation = "";
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
            window.location.href = "/estimation/list";
        } catch (error) {
            console.error(error);
            alert("견적 요청 저장 중 오류가 발생했습니다.");
            syncSubmitState();
        }
    };

    if (!createPostButton) {
        return;
    }

    requiredFields.forEach((field) => {
        field.addEventListener("input", syncSubmitState);
    });

    tagInput?.addEventListener("input", () => {
        syncHiddenTags();
        syncSubmitState();
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

    composerForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        await submitEstimation();
    });

    createPostButton.addEventListener("click", openComposerModal);
    document.getElementById("composerModalClose")?.addEventListener("click", closeComposerModal);
    document.getElementById("composerModalOverlay")?.addEventListener("click", closeComposerModal);

    syncHiddenTags();
    syncSubmitState();
    syncProductSelection();
    renderSelectedProduct();
    syncShareUsers();
    syncLocationUI();

    window.setTimeout(openComposerModal, 0);
    window.setTimeout(() => {
        createPostButton.click();
    }, 0);
});
