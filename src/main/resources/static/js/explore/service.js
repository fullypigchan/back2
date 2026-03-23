const exploreService = (() => {
    // 추천 상품 요청
    const getRecommends = async (page, callback) => {
        const response = await fetch(`/api/explore/products/${page}`);

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const productWithPagingDTO = await response.json();
        if (callback) callback(productWithPagingDTO);

        return productWithPagingDTO.criteria;
    }

    // 뉴스 요청
    const getNews = async (callback) => {
        const response = await fetch(`/api/explore/news`);

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const news = await response.json();
        if (callback) callback(news);
    }

    // 실시간 검색어 요청
    const getTrends = async (callback) => {
        const response = await fetch(`/api/explore/trends`);

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const trends = await response.json();
        if (callback) callback(trends);
    }

    // 게시물 검색 조회 Search : memberId, keyword, type('popular', 'latest')
    const searchPosts = async (page, {memberId, keyword, type}, callback) => {
        const params = new URLSearchParams()
        if(memberId) params.append('memberId', memberId);
        if(keyword) params.append('keyword', keyword);
        if(type) params.append('type', type);

        const response = await fetch(`/api/explore/search/${page}?${params.toString()}`);

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const postWithPagingDTO = await response.json();
        if (callback) callback(postWithPagingDTO);

        return postWithPagingDTO.criteria;
    }

    // 검색 값에 따른 회원 조회
    const searchUsers = async (page, keyword, callback) => {
        const response = await fetch(`/api/explore/search/user/${page}?keyword=${keyword}`);

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const users = await response.json();
        if (callback) callback(users);

        return users.criteria;
    }

    return {getRecommends: getRecommends, getNews: getNews, getTrends: getTrends, searchPosts: searchPosts};
})();
