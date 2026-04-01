const myPageService = (() => {
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

    // Likes 탭도 Posts 탭과 같은 PostWithPagingDTO 구조를 사용한다.
    // 따라서 프런트 서비스 계층에서는 엔드포인트만 다르고, 소비 방식은 동일하게 유지한다.
    const getMyLikedPosts = async (page, callback) => {
        const response = await fetch(`/api/mypage/likes?page=${page}`);
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

    // 마이페이지 팔로잉 요약 카드는 main과 같은 follow API를 재사용한다.
    // 언팔로우는 서버에서 followerId/followingId 조합으로 처리되므로,
    // 카드에서 읽은 두 식별자만 넘기면 별도 전용 API를 만들 필요가 없다.
    const unfollow = async (followerId, followingId) => {
        const response = await fetch(`/api/main/follows/${followerId}/${followingId}/delete`, {
            method: "POST"
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Fetch error");
        }
    };

    return {
        writeProduct: writeProduct,
        getMyProducts: getMyProducts,
        getMyPosts: getMyPosts,
        getMyLikedPosts: getMyLikedPosts,
        deleteProduct: deleteProduct,
        updateProfile: updateProfile,
        unfollow: unfollow
    };
})();
