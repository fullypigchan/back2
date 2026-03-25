document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-username");
    const wraps = modal?.querySelectorAll(".name-placeholder-wrap, .phone-number-placeholder") || [];
    const userIdInput = modal?.querySelector(".handle-input");

    wraps.forEach((wrap) => {
        const input = wrap.querySelector("input");
        const label = wrap.querySelector(".name-placeholder, .phone-placeholder");
        const labelText = wrap.querySelector(".name-text, .phone-text");

        if (!input || !label || !labelText) {
            return;
        }

        if (input.value.trim() !== "") {
            shrink(labelText);
        }

        input.addEventListener("focus", () => {
            label.style.borderColor = "rgb(29, 155, 240)";
            label.style.borderWidth = "2px";
            shrink(labelText);
        });

        input.addEventListener("input", () => {
            shrink(labelText);
            updateNextButtonState(modal, userIdInput);
        });

        input.addEventListener("blur", () => {
            label.style.borderColor = "rgb(207, 217, 222)";
            label.style.borderWidth = "1px";

            if (input.value.trim() === "" && !input.readOnly) {
                expand(labelText);
            }

            updateNextButtonState(modal, userIdInput);
        });
    });

    updateNextButtonState(modal, userIdInput);
});

function shrink(labelText) {
    labelText.style.fontSize = "12px";
    labelText.style.paddingTop = "8px";
    labelText.style.color = "rgb(29, 155, 240)";
}

function expand(labelText) {
    labelText.style.fontSize = "17px";
    labelText.style.paddingTop = "16px";
    labelText.style.color = "rgb(83, 100, 113)";
}

function updateNextButtonState(modal, input) {
    const nextButton = modal?.querySelector(".next-button");
    const nextText = modal?.querySelector(".next-button-wrap-in-text-next");

    if (!input || !nextButton || !nextText) {
        return;
    }

    const hasUserId = input.value.trim() !== "";
    nextText.textContent = "다음";
    nextButton.disabled = !hasUserId;
    nextButton.style.backgroundColor = "rgb(15, 20, 25)";
    nextButton.style.opacity = hasUserId ? "1" : "0.5";
    nextButton.style.cursor = hasUserId ? "pointer" : "default";
}

function bindJoinModalClose() {
    const closeButtons = document.querySelectorAll(".join-modal-header-close-button, .join-modal-close");
    if (!closeButtons.length) return;

    closeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const modal = document.querySelector(".join-modal");
            const root = modal?.closest(".join-modal-line1") || document.querySelector(".join-modal-line1");
            const overlay = document.querySelector(".join-modal-overlay") || document.querySelector(".join-modal-all");

            if (modal) modal.style.display = "none";
            if (root) root.style.display = "none";
            if (overlay) overlay.style.display = "none";
        });
    });
}

document.addEventListener("DOMContentLoaded", bindJoinModalClose);
