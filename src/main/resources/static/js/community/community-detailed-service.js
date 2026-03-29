const CommunityDetailService = (() => {

    // ─── 커뮤니티 게시글 ───
    const createPost = async (communityId, formData) => {
        const response = await fetch(`/api/communities/${communityId}/posts`, {
            method: "POST",
            body: formData   // multipart (제목, 내용, 파일)
        });
        if (!response.ok) throw new Error("게시글 작성 실패");
        return await response.json();
    };

    const getPosts = async (communityId, page) => {
        const response = await fetch(`/api/communities/${communityId}/posts/${page}`);
        if (!response.ok) throw new Error("게시글 목록 조회 실패");
        return await response.json();
    };

    // ─── 검색 (explore 패턴 동일) ───
    const searchPosts = async (communityId, page, keyword, type = "latest") => {
        const params = new URLSearchParams({ keyword, type });
        const response = await fetch(`/api/communities/${communityId}/search/${page}?${params}`);
        if (!response.ok) throw new Error("검색 실패");
        return await response.json();
    };

    // ─── 미디어 탭 ───
    const getMedia = async (communityId, page) => {
        const response = await fetch(`/api/communities/${communityId}/media/${page}`);
        if (!response.ok) throw new Error("미디어 조회 실패");
        return await response.json();
    };

    return { createPost, getPosts, searchPosts, getMedia };
})();
