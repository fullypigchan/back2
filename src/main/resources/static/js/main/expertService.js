const expertService = (() => {

    const getList = async (page, memberId, callback) => {
        let url = `/api/experts/list/${page}`;
        if (memberId) {
            url += `?memberId=${memberId}`;
        }
        const response = await fetch(url);
        const experts = await response.json();
        if (callback) return callback(experts);
        return experts;
    };

    return { getList };
})();
