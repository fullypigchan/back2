const advertisementService = (() => {
    const estimateImpressions = (amount) => {
        return Math.round((Number(String(amount || "").replace(/[^\d]/g, "")) / 1000) * 5);
    };

    const write = async (formState, attachments, bootpayResult, memberId) => {
        const data = bootpayResult.data ?? bootpayResult;

        const formData = new FormData();
        // AdvertisementDTO
        formData.append("advertiserId",       memberId);
        formData.append("title",              formState.adTitle);
        formData.append("headline",           formState.headline);
        formData.append("description",        formState.adBody);
        formData.append("landingUrl",         formState.landingUrl);
        formData.append("budget",             formState.budget);
        formData.append("impressionEstimate", estimateImpressions(formState.budget));

        // ArrayList<MultipartFile> → images
        attachments.forEach((attachment) => {
            if (attachment.file) {
                formData.append("images", attachment.file);
            }
        });

        // PaymentAdvertisementDTO
        formData.append("payment.amount",        data.price);
        formData.append("payment.paymentMethod", data.method);
        formData.append("payment.receiptId",     data.receipt_id);
        formData.append("payment.paidAt",        data.requested_at ?? "");
        formData.append("payment.paymentStatus", data.status === 5 ? "pending" : "completed");

        const response = await fetch("/api/ad/write", {
            method: "POST",
            body: formData,
            credentials: "include",
        });

        const text = await response.text();
        console.log("응답 status:", response.status);
        console.log("응답 text:", text);
        console.log("응답 headers:", response.headers.get("Content-Type"));

        if (!response.ok) throw new Error("결제 정보 저장 실패");

        return JSON.parse(text).id;
    };

    const savePayment = async (bootpayResult, memberId, adId) => {
        const data = bootpayResult.data ?? bootpayResult;

        const response = await fetch("/api/payment/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                adId:          adId,
                memberId:      memberId,
                amount:        data.price,
                paymentMethod: data.method,
                receiptId:     data.receipt_id,
                paidAt:        data.requested_at ?? null,
                paymentStatus: data.status === 5 ? "pending" : "completed"
            })
        });

        if (!response.ok) {
            throw new Error("결제 정보 저장 실패");
        }

        const message = await response.text();
        console.log(message);

        document.querySelector(".AdNavigationListButton").click();
    };

    const list = async (page, search, callback) => {
        if (typeof search === "function") {
            callback = search;
            search = null;
        }

        // ✅ URLSearchParams로 파라미터 조립
        const params = new URLSearchParams();
        if (search?.memberId) params.append("memberId", search.memberId);
        if (search?.keyword)  params.append("keyword",  search.keyword);
        if (search?.filter && search.filter !== "all") params.append("filter", search.filter);

        const url = `/api/ad/list/${page}?${params.toString()}`;

        const response = await fetch(url, { credentials: "include" });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const adWithPagingDTO = await response.json();

        if (callback) callback(adWithPagingDTO);

        // ✅ criteria 반환 (무한 스크롤 hasMore 확인용)
        return adWithPagingDTO.criteria;
    };

    const detail = async (id, callback) => {
        const response = await fetch(`/api/ad/detail?id=${id}`, {  // ✅ ?id= 로 수정
            credentials: "include",  // ✅ 추가
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const advertisementDTO = await response.json();

        if (callback) {
            callback(advertisementDTO);
        }
    };


    return { write: write, savePayment: savePayment, list: list, detail: detail };
})();
