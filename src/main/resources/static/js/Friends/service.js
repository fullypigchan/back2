const friendsService = (() => {

    const getMyInfo = async () => {
        const response = await fetch('/api/auth/info');
        return await response.json();
    };

    const getFriendsList = async (page, memberId, callback) => {
        const response = await fetch(`/api/friends/list/${page}?memberId=${memberId}`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const follow = async (followerId, followingId) => {
        await fetch('/api/main/follows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ followerId: followerId, followingId: followingId })
        });
    };

    const unfollow = async (followerId, followingId) => {
        await fetch(`/api/main/follows/${followerId}/${followingId}/delete`, { method: 'POST' });
    };

    return { getMyInfo, getFriendsList, follow, unfollow };
})();
