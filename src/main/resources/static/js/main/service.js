const service = (() => {

    const getList = async (page, memberId, callback) => {
        let url = `/api/posts/list/${page}`;
        if (memberId) {
            url += `?memberId=${memberId}`;
        }
        const response = await fetch(url);
        const posts = await response.json();
        if (callback) return callback(posts);
        return posts;
    };

    return { getList };
})();
