window.onload = () => {
    // 1. 요소 참조
    const subContent = document.querySelector(".sub-content");
    const toggleTrack = document.querySelector(".sub-toggle__track");
    const toggleOptions = document.querySelectorAll(".sub-toggle__option");
    const plansWrap = document.querySelector(".sub-plans");
    const planButtons = document.querySelectorAll(".sub-plan");
    const compareSections = document.querySelectorAll(".sub-compare");
    const popup = document.getElementById("learnMorePopup");
    const popupClose = document.querySelector(".sub-popup__close");
    const popupBackdrop = document.querySelector(".sub-popup__backdrop");
    const popupTitle = document.querySelector(".sub-popup__title");
    const popupDesc = document.querySelector(".sub-popup__desc");
    const footerPlanName = document.querySelector(".sub-footer__plan-name");
    const footerPrice = document.querySelector(".sub-footer__price");
    const footerPeriod = document.querySelector(".sub-footer__period");
    const footerBilling = document.querySelector(".sub-footer__billing");
    const payBtn = document.querySelector(".sub-footer__pay-btn");

    // 2. 상태
    let currentPeriod = "monthly";
    let currentPlan = "pro";

    // 3. 가격 데이터
    const priceData = {
        free: {
            monthly: "₩0",
            annual: "₩0",
            annualTotal: "₩0",
            billingMonthly: "",
            billingAnnual: "",
            displayName: "Free",
        },
        pro: {
            monthly: "₩30,000",
            annual: "₩25,000",
            annualTotal: "₩300,000",
            billingMonthly: "월간 결제",
            billingAnnual: "연간 결제",
            displayName: "Pro",
        },
        ultimate: {
            monthly: "₩50,000",
            annual: "₩40,000",
            annualTotal: "₩480,000",
            billingMonthly: "월간 결제",
            billingAnnual: "연간 결제",
            displayName: "Pro+",
        },
        expert: {
            monthly: "₩80,000",
            annual: "₩80,000",
            annualTotal: "₩80,000",
            billingMonthly: "월간 결제",
            billingAnnual: "월간 결제",
            displayName: "Expert",
        },
    };

    // 4. 팝업 데이터
    const learnMoreData = {
        analytics: {
            title: "고급 통계 분석",
            desc: "마이페이지에서 활동 성과와 네트워크 반응을 세부적으로 확인할 수 있습니다.",
        },
        "boosted-replies": {
            title: "답글 부스트",
            desc: "Pro 구독자의 답글이 대화에서 더 눈에 띄게 노출됩니다.",
        },
        xpro: {
            title: "플랫폼 운영 도구",
            desc: "여러 흐름을 한 화면에서 관리하며 운영 효율을 높일 수 있습니다.",
        },
        supergrok: {
            title: "화상 채팅 가능",
            desc: "실시간 화상 채팅 기능으로 거래처와 바로 소통할 수 있습니다.",
        },
        "handle-marketplace": {
            title: "거래처 등록 요청",
            desc: "원하는 거래처를 직접 내 거래처로 등록 요청할 수 있습니다.",
        },
        "highest-reply-boost": {
            title: "전문가에게 견적 요청",
            desc: "고객이 전문가에게 직접 연락하고 견적을 요청할 수 있도록 연결합니다.",
        },
        radar: {
            title: "거래처 활동 확인",
            desc: "내 고객의 관심사와 활동 흐름을 분석하는 데 도움을 줍니다.",
        },
        "write-articles": {
            title: "게시글 작성 확장",
            desc: "더 긴 형식의 게시글로 정보 공유와 홍보를 확장할 수 있습니다.",
        },
        "get-paid": {
            title: "거래처 커뮤니케이션 확대",
            desc: "거래처와의 커뮤니케이션 범위를 넓히고 네트워크를 강화할 수 있습니다.",
        },
        "xpro-compare": {
            title: "플랫폼 운영 도구",
            desc: "여러 흐름을 한 화면에서 관리하며 운영 효율을 높일 수 있습니다.",
        },
        "media-studio": {
            title: "실시간 커뮤니케이션",
            desc: "실시간 커뮤니케이션 기능으로 거래처 대응 속도를 높일 수 있습니다.",
        },
        "analytics-compare": {
            title: "통계 차트 확인",
            desc: "활동 및 거래 데이터를 차트로 확인하며 분석할 수 있습니다.",
        },
    };

    // 5. 결제 유틸리티
    function parsePrice(value) {
        return Number(String(value).replace(/[^\d]/g, "")) || 0;
    }

    function isPlanVisible(plan) {
        if (currentPeriod === "expert") {
            return plan === "free" || plan === "expert";
        }

        return plan !== "expert";
    }

    function getDefaultPlan() {
        return currentPeriod === "expert" ? "expert" : "pro";
    }

    function getDisplayPeriod(plan = currentPlan) {
        if (currentPeriod === "annual" && plan !== "expert") {
            return "annual";
        }

        return "monthly";
    }

    // 프론트 plan명 → DB tier 매핑
    const tierMap = { pro: "pro", ultimate: "pro_plus", expert: "expert" };

    function getPaymentPlan() {
        const plan = priceData[currentPlan];
        if (!plan) return null;

        const isAnnual = currentPeriod === "annual" && currentPlan !== "expert";
        const amountText = isAnnual ? (plan.annualTotal ?? plan.annual) : plan.monthly;

        return {
            ...plan,
            amountText,
            amountValue: parsePrice(amountText),
            orderName: `${plan.displayName} ${isAnnual ? "연간" : "월간"} 구독`,
            orderId: `SUBSCRIBE_${currentPlan.toUpperCase()}_${currentPeriod.toUpperCase()}_${Date.now()}`,
            tier: tierMap[currentPlan],
            billingCycle: isAnnual ? "annual" : "monthly",
        };
    }

    // 구독 등록 API (생성된 subscriptionId 반환)
    const saveSubscription = async (plan) => {
        const isAnnual = plan.billingCycle === "annual";
        const now = new Date();
        const expiresAt = new Date(now);
        if (isAnnual) {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        const response = await fetch("/api/subscriptions/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                memberId: memberId,
                tier: plan.tier,
                billingCycle: plan.billingCycle,
                expiresAt: expiresAt.toISOString().slice(0, 19).replace("T", " "),
            }),
        });
        return await response.json();
    };

    // 결제 정보 저장 API (subscriptionId 포함)
    const savePayment = async (plan, bootpayResponse, subscriptionId) => {
        await fetch("/api/subscriptions/payment/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                subscriptionId: subscriptionId,
                memberId: memberId,
                amount: plan.amountValue,
                paymentMethod: bootpayResponse.method_origin || bootpayResponse.method || "",
                receiptId: bootpayResponse.receipt_id || "",
                paidAt: bootpayResponse.purchased_at || null,
            }),
        });
    };

    // 결제 성공 후 처리
    const onPaymentSuccess = async (plan, bootpayResponse) => {
        const subscriptionId = await saveSubscription(plan);
        await savePayment(plan, bootpayResponse, subscriptionId);
        alert("구독이 완료되었습니다!");
        location.href = "/main/main";
    };

    const pay = async () => {
        const plan = getPaymentPlan();
        if (!plan || plan.amountValue <= 0) return;

        if (typeof Bootpay === "undefined") {
            const demoResult = {
                price: plan.amountValue,
                method: "데모",
                receipt_id: `DEMO_${plan.orderId}`,
                purchased_at: new Date().toISOString(),
            };
            await onPaymentSuccess(plan, demoResult);
            return;
        }

        try {
            const response = await Bootpay.requestPayment({
                application_id: "697868f4fc55d934885c2420",
                price: plan.amountValue,
                order_name: plan.orderName,
                order_id: plan.orderId,
                pg: "라이트페이",
                tax_free: 0,
                user: {
                    id: String(memberId),
                    username: "회원",
                    phone: "01000000000",
                    email: "user@globalgates.com",
                },
                items: [
                    {
                        id: currentPlan,
                        name: plan.orderName,
                        qty: 1,
                        price: plan.amountValue,
                    },
                ],
                extra: {
                    open_type: "iframe",
                    card_quota: "0,2,3",
                    escrow: false,
                },
            });

            switch (response.event) {
                case "issued": {
                    const issuedSubId = await saveSubscription(plan);
                    await savePayment(plan, response, issuedSubId);
                    alert("가상계좌가 발급되었습니다. 입금 완료 시 구독이 활성화됩니다.");
                    break;
                }
                case "done":
                    await onPaymentSuccess(plan, response);
                    break;
                case "confirm": {
                    const confirmedData = await Bootpay.confirm();
                    if (confirmedData.event === "done") {
                        await onPaymentSuccess(plan, confirmedData);
                    }
                    break;
                }
            }
        } catch (e) {
            console.log(e.message);
            switch (e.event) {
                case "cancel":
                    console.log(e.message);
                    break;
                case "error":
                    console.log(e.error_code);
                    break;
            }
        }
    };

    // 6. 토글 상태 반영
    function syncToggleState() {
        toggleOptions.forEach((opt) => {
            const isActive = opt.dataset.period === currentPeriod;
            opt.setAttribute("aria-checked", String(isActive));
            opt.classList.toggle("sub-toggle__option--active", isActive);
        });

        toggleTrack.dataset.period = currentPeriod;
    }

    // 7. 플랜 선택 상태 반영
    function renderPlanSelection() {
        planButtons.forEach((btn) => {
            const isSelected = btn.dataset.plan === currentPlan;
            const card = btn.querySelector(".sub-plan__card");
            const radio = btn.querySelector(".sub-plan__radio");
            const circle = radio.querySelector(".sub-plan__radio-circle");

            btn.classList.toggle("sub-plan--selected", isSelected);
            btn.setAttribute("aria-checked", String(isSelected));
            card.classList.toggle("sub-plan__card--active", isSelected);
            radio.classList.toggle("sub-plan__radio--checked", isSelected);
            circle.innerHTML = isSelected
                ? `<svg viewBox="0 0 24 24" aria-hidden="true" class="sub-plan__check-icon"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>`
                : "";
        });
    }

    function activatePlan(btn) {
        const plan = btn.dataset.plan;
        if (!isPlanVisible(plan) || plan === currentPlan) return;

        currentPlan = plan;
        renderPlanSelection();
        updateFooter();
    }

    function syncVisiblePlans() {
        if (subContent) {
            subContent.dataset.mode = currentPeriod === "expert" ? "expert" : "standard";
        }

        if (plansWrap) {
            plansWrap.dataset.mode = currentPeriod === "expert" ? "expert" : "standard";
        }

        compareSections.forEach((section) => {
            const compareMode = section.dataset.compareMode;
            section.hidden = compareMode === "expert"
                ? currentPeriod !== "expert"
                : currentPeriod === "expert";
        });

        planButtons.forEach((btn) => {
            const visible = isPlanVisible(btn.dataset.plan);
            btn.hidden = !visible;
            btn.tabIndex = visible ? 0 : -1;
        });

        if (!isPlanVisible(currentPlan)) {
            currentPlan = getDefaultPlan();
        }

        renderPlanSelection();
    }

    // 8. 가격 표시 업데이트
    function updatePrices() {
        document
            .querySelectorAll(".sub-plan__price[data-monthly]")
            .forEach((el) => {
                const plan = el.closest(".sub-plan")?.dataset.plan;
                const periodKey = getDisplayPeriod(plan);
                el.textContent = el.dataset[periodKey];
            });

        document
            .querySelectorAll(".sub-plan__billing-text[data-monthly]")
            .forEach((el) => {
                const plan = el.closest(".sub-plan")?.dataset.plan;
                const periodKey = getDisplayPeriod(plan);
                el.textContent = el.dataset[periodKey];
            });
    }

    // 9. footer 업데이트
    function updateFooter() {
        const plan = priceData[currentPlan];
        if (!plan) return;

        const isFree = currentPlan === "free";
        const isAnnual = currentPeriod === "annual" && currentPlan !== "expert";

        footerPlanName.textContent = plan.displayName;
        footerPrice.textContent = isAnnual ? (plan.annualTotal ?? plan.annual) : plan.monthly;
        footerPeriod.textContent = isFree ? "" : isAnnual ? "/ 연" : "/ 월";
        footerBilling.textContent = isAnnual ? plan.billingAnnual : plan.billingMonthly;
        payBtn.disabled = isFree;
    }

    // 10. 토글 이벤트
    toggleOptions.forEach((option) => {
        option.addEventListener("click", () => {
            const period = option.dataset.period;
            if (period === currentPeriod) return;

            currentPeriod = period;
            toggleTrack.dataset.period = period;
            syncToggleState();
            syncVisiblePlans();
            updatePrices();
            updateFooter();
        });
    });

    // 11. 카드 이벤트
    planButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            if (e.target.closest(".sub-feature__info")) return;
            activatePlan(btn);
        });

        btn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                activatePlan(btn);
            }
        });
    });

    // 12. 팝업 이벤트
    document.querySelectorAll(".sub-feature__info").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();

            const infoKey = btn.dataset.info;
            const data = learnMoreData[infoKey];
            if (!data) return;

            popupTitle.textContent = data.title;
            popupDesc.textContent = data.desc;
            popup.style.display = "";
        });
    });

    function closePopup() {
        popup.style.display = "none";
    }

    if (popupClose) popupClose.addEventListener("click", closePopup);
    if (popupBackdrop) popupBackdrop.addEventListener("click", closePopup);

    // 13. ESC 닫기
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && popup.style.display !== "none") {
            closePopup();
        }
    });

    // 14. 결제 버튼
    if (payBtn) {
        payBtn.addEventListener("click", async () => {
            if (payBtn.disabled) return;
            await pay();
        });
    }

    // 15. 초기화
    syncToggleState();
    syncVisiblePlans();
    updatePrices();
    updateFooter();
};
