document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-create");
    const nextButton = modal?.querySelector(".next-button");

    const fields = [
        {
            input: modal?.querySelector(".name-input"),
            box: modal?.querySelector(".name-placeholder"),
            label: modal?.querySelector(".name-text"),
            errorHost: modal?.querySelector(".name-placeholder-wrap"),
            shrink: (label) => {
                if (!label) return;
                label.style.fontSize = "12px";
                label.style.paddingTop = "8px";
                label.style.color = "rgb(29, 155, 240)";
            },
            expand: (label) => {
                if (!label) return;
                label.style.fontSize = "17px";
                label.style.paddingTop = "16px";
                label.style.color = "rgb(83, 100, 113)";
            },
        },
        {
            input: modal?.querySelector(".phone-input"),
            box: modal?.querySelector(".phone-placeholder"),
            label: modal?.querySelector(".phone-text"),
            errorHost: modal?.querySelector(".phone-number-placeholder"),
            shrink: (label) => {
                if (!label) return;
                label.style.fontSize = "12px";
                label.style.paddingTop = "8px";
                label.style.color = "rgb(29, 155, 240)";
            },
            expand: (label) => {
                if (!label) return;
                label.style.fontSize = "17px";
                label.style.paddingTop = "16px";
                label.style.color = "rgb(83, 100, 113)";
            },
        },
        {
            input: modal?.querySelector(".birth-date-input"),
            box: modal?.querySelector(".birth-date-input"),
            label: modal?.querySelector(".birth-date-text-input"),
            errorHost: modal?.querySelector(".birth-date"),
            shrink: (_, input) => {
                if (!input) return;
                input.classList.add("birth-focus-placeholder");
            },
            expand: (_, input) => {
                if (!input) return;
                input.classList.remove("birth-focus-placeholder");
            },
        },
    ].filter((field) => field.input && field.box);

    const states = new WeakMap();

    const ensureErrorNode = (host) => {
        if (!host) return null;

        const existing = host.querySelectorAll(".field-error-message");
        if (existing.length > 1) {
            for (let i = 1; i < existing.length; i += 1) {
                existing[i].remove();
            }
        }

        let node = existing[0] || null;
        if (!node) {
            node = document.createElement("div");
            node.className = "field-error-message";
            node.textContent = "다시입력하시오";
            host.appendChild(node);
        }
        return node;
    };

    const setBlue = (box) => {
        if (!box) return;
        box.style.borderColor = "rgb(29, 155, 240)";
        box.style.borderWidth = "2px";
        box.style.boxShadow = "0 0 0 2px rgba(29, 155, 240, 0.18)";
    };

    const setRed = (box) => {
        if (!box) return;
        box.style.borderColor = "rgb(244, 33, 46)";
        box.style.borderWidth = "2px";
        box.style.boxShadow = "0 0 0 2px rgba(244, 33, 46, 0.18)";
    };

    const setNeutral = (box) => {
        if (!box) return;
        box.style.borderColor = "rgb(207, 217, 222)";
        box.style.borderWidth = "1px";
        box.style.boxShadow = "none";
    };

    const syncNextButton = () => {
        if (!nextButton) return;
        const canNext = fields.every((field) => {
            const value = field.input.value.trim();
            return field.input.classList.contains("birth-date-input") ? value.length === 8 : value.length > 0;
        });
        nextButton.style.opacity = canNext ? "1" : "0.5";
        nextButton.disabled = !canNext;
    };

    fields.forEach((field) => {
        const errorNode = ensureErrorNode(field.errorHost);
        states.set(field.input, {
            hadTyped: field.input.value.trim().length > 0,
            errorNode,
        });

        if (field.input.value.trim().length > 0) {
            field.shrink(field.label, field.input);
        } else {
            field.expand(field.label, field.input);
        }
        setNeutral(field.box);

        field.input.addEventListener("focus", () => {
            field.shrink(field.label, field.input);
            setBlue(field.box);
        });

        field.input.addEventListener("input", () => {
            const state = states.get(field.input);
            const value = field.input.value.trim();
            if (!state) return;

            if (value.length > 0) {
                state.hadTyped = true;
                field.shrink(field.label, field.input);
                setBlue(field.box);
                if (state.errorNode) state.errorNode.classList.remove("show");
            } else if (document.activeElement === field.input && state.hadTyped) {
                setRed(field.box);
                if (state.errorNode) state.errorNode.classList.add("show");
            } else {
                field.expand(field.label, field.input);
                setNeutral(field.box);
                if (state.errorNode) state.errorNode.classList.remove("show");
            }

            syncNextButton();
        });

        field.input.addEventListener("blur", () => {
            const state = states.get(field.input);
            const value = field.input.value.trim();
            if (!state) return;

            if (value.length === 0) {
                field.expand(field.label, field.input);
                setNeutral(field.box);
            } else {
                field.shrink(field.label, field.input);
                setNeutral(field.box);
            }

            if (state.errorNode) state.errorNode.classList.remove("show");
            syncNextButton();
        });
    });

    syncNextButton();

    const changeButton = modal?.querySelector(".change");
    const replaceEmailText = modal?.querySelector(".replace-email");
    const phoneLabelText = modal?.querySelector(".phone-text-in");
    const phoneInput = modal?.querySelector(".phone-input");

    if (changeButton && replaceEmailText && phoneLabelText && phoneInput) {
        let useEmail = false;

        const syncPhoneEmailMode = () => {
            if (useEmail) {
                phoneLabelText.textContent = "이메일";
                replaceEmailText.textContent = "휴대폰 사용하기";
                phoneInput.setAttribute("name", "email");
                phoneInput.setAttribute("autocomplete", "email");
                phoneInput.setAttribute("inputmode", "email");
            } else {
                phoneLabelText.textContent = "휴대폰 번호";
                replaceEmailText.textContent = "이메일 사용하기";
                phoneInput.setAttribute("name", "phone");
                phoneInput.setAttribute("autocomplete", "tel");
                phoneInput.setAttribute("inputmode", "tel");
            }
        };

        syncPhoneEmailMode();

        changeButton.addEventListener("click", () => {
            useEmail = !useEmail;
            phoneInput.value = "";
            syncPhoneEmailMode();
            syncNextButton();
        });
    }

    const closeButton = modal?.querySelector(".join-modal-header-close-button, .join-modal-close");
    const modalRoot = modal?.querySelector(".join-modal, .join-modal-overlay");
    if (closeButton && modalRoot) {
        closeButton.addEventListener("click", () => {
            modalRoot.style.display = "none";
        });
    }

    const birthInput = modal?.querySelector(".birth-date-input");
    const birthHost = modal?.querySelector(".birth-date");
    const birthState = birthInput ? states.get(birthInput) : null;
    if (birthInput) {
        birthInput.addEventListener("input", () => {
            birthInput.value = birthInput.value.replace(/\D/g, "").slice(0, 8);
            if (birthInput.value.trim().length === 8 && birthState?.errorNode) {
                birthState.errorNode.classList.remove("show");
                setBlue(birthInput);
            }
            syncNextButton();
        });
    }

    if (nextButton && birthInput) {
        nextButton.addEventListener(
            "click",
            (event) => {
                const birth = birthInput.value.trim();
                if (birth.length !== 8) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    setRed(birthInput);
                    if (birthState?.errorNode) {
                        birthState.errorNode.textContent = "8자 이상으로 입력하세요";
                        birthState.errorNode.classList.add("show");
                    } else if (birthHost) {
                        const errorNode = ensureErrorNode(birthHost);
                        errorNode.textContent = "8자 이상으로 입력하세요";
                        errorNode.classList.add("show");
                    }
                    birthInput.focus();
                }
            },
            true
        );
    }
});
