const service = (() => {
    const writeProduct = async (formData) => {
        const response = await fetch("/api/mypage/products", {
            method: "POST",
            body: formData
        });

        const text = await response.text();

        if (!response.ok) {
            throw new Error(text || "Fetch error");
        }

        return text ? JSON.parse(text) : {};
    };

    // 내 상품 목록은 기존 프로젝트의 다른 목록 조회와 같은 방식으로
    // page 파라미터를 받고, 필요하면 callback에 결과를 넘겨준다.
    const getMyProducts = async (page, callback) => {
        const response = await fetch(`/api/mypage/products?page=${page}`);
        const data = await response.json();

        if (callback) return callback(data);
        return data;
    };
    // 내 게시글 목록은 기존 프로젝트의 다른 목록 조회와 같은 방식으로
    // page 파라미터를 받고, 필요하면 callback에 결과를 넘겨준다.
    const getMyPosts = async (page, callback) => {
        const response = await fetch(`/api/mypage/posts?page=${page}`);
        const data = await response.json();

        if (callback) return callback(data);
        return data;
    };

    // 상품 삭제
    const deleteProduct = async (productId) => {
        // 현재 프로젝트의 다른 저장/수정 요청과 같은 방식으로
        // FormData에 필요한 최소 값만 담아서 전송한다.
        const formData = new FormData();
        formData.append("productId", productId);

        const response = await fetch("/api/mypage/products/delete", {
            method: "POST",
            body: formData
        });

        const text = await response.text();

        // 서버가 실패 응답을 주면 event.js의 catch 블록에서 동일한 방식으로 처리한다.
        if (!response.ok) {
            throw new Error(text || "Fetch error");
        }

        return text ? JSON.parse(text) : {};
    };

    // 프로필 수정은 텍스트와 이미지 파일을 한 번에 보내야 하므로
    // 기존 상품 등록과 같은 방식으로 FormData를 그대로 전송한다.
    const updateProfile = async (formData) => {
        const response = await fetch("/api/member/profile/update", {
            method: "POST",
            body: formData
        });

        const text = await response.text();

        if (!response.ok) {
            throw new Error(text || "Fetch error");
        }

        return text ? JSON.parse(text) : {};
    };

    return {
        writeProduct: writeProduct,
        getMyProducts: getMyProducts,
        getMyPosts: getMyPosts,
        deleteProduct: deleteProduct,
        updateProfile: updateProfile
    };
})();
