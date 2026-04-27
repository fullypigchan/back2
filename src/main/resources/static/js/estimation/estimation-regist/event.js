// ============================================================================
// estimation-regist/event.js
// 견적요청 독립 페이지(/estimation/regist) 전용 모달 제어.
// 폼 내부 로직(유효성, 태그, 상품, 위치, 제출 등)은 estimation-form.js가 담당한다.
// 이 파일은 독립 페이지에서만 로드되며, 마이페이지에서는 로드하지 않는다.
// ============================================================================
window.addEventListener("load", () => {
    const createPostButton = document.getElementById("createPostButton");
    if (!createPostButton) {
        return;
    }

    // -- 독립 페이지 전용 모달 열기/닫기 (hidden 토글) ----------------------
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

    createPostButton.addEventListener("click", openComposerModal);
    document.getElementById("composerModalClose")?.addEventListener("click", closeComposerModal);
    document.getElementById("composerModalOverlay")?.addEventListener("click", closeComposerModal);

    // -- 독립 페이지 진입 시 모달을 즉시 연다. ------------------------------
    window.setTimeout(openComposerModal, 0);
    window.setTimeout(() => {
        createPostButton.click();
    }, 0);
});
