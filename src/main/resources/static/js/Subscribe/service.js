const subscribeService = (() => {

    // 구독 등록 (subscriptionId 반환)
    const subscribe = async (tier, billingCycle, expiresAt) => {
        const response = await fetch("/api/subscriptions/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tier, billingCycle, expiresAt }),
        });
        return await response.json();
    };

    // 결제 정보 저장
    const savePayment = async (subscriptionId, amount, bootpayData) => {
        await fetch("/api/payment/subscribe/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                subscriptionId: subscriptionId,
                amount: amount,
                paymentMethod: bootpayData.method_origin || bootpayData.method || "",
                receiptId: bootpayData.receipt_id || "",
                paidAt: bootpayData.purchased_at || null,
                paymentStatus: bootpayData.status === 5 ? "pending" : "completed",
            }),
        });
    };

    // 현재 구독 조회
    const getMy = async () => {
        const response = await fetch("/api/subscriptions/my");
        if (!response.ok) return null;
        return await response.json();
    };

    // 구독 플랜 변경
    const changePlan = async (id, tier, billingCycle, expiresAt) => {
        await fetch("/api/subscriptions/change", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, tier, billingCycle, expiresAt }),
        });
    };

    // 구독 해지
    const cancel = async (id) => {
        await fetch("/api/subscriptions/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
    };

    return { subscribe: subscribe, savePayment: savePayment, getMy: getMy, changePlan: changePlan, cancel: cancel };
})();
