const friendsLayout = (() => {

    function buildAvatarDataUri(label) {
        const safe = String(label || "?").slice(0, 1).replace(/[&<>"']/g, "");
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="#cfe8fc"></rect><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#1d9bf0">' + safe + '</text></svg>';
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

    const createFriendCard = (friend) => {
        const avatarInitial = (friend.memberNickname || friend.memberHandle || "?").charAt(0);
        const avatarHtml = friend.memberProfileFileName
            ? `<div class="user-avatar user-avatar--image"><img class="user-avatar-img" src="${friend.memberProfileFileName}" alt=""></div>`
            : `<div class="user-avatar user-avatar--image"><img class="user-avatar-img" src="${buildAvatarDataUri(avatarInitial)}" alt=""></div>`;

        const handle = friend.memberHandle ? friend.memberHandle : "";
        const nickname = friend.memberNickname || friend.memberHandle || "";
        const bio = friend.memberBio || "";
        const followerIntro = friend.followerIntro
            ? `<div class="user-followed-by">${friend.followerIntro}</div>`
            : "";

        return `
            <div class="user-card" data-handle="${handle}" data-member-id="${friend.id}">
                ${avatarHtml}
                <div class="user-info">
                    <div class="user-top">
                        <div class="user-name-group">
                            <div class="user-name">${nickname}</div>
                            <div class="user-handle">${handle}</div>
                            ${followerIntro}
                        </div>
                        <button class="connect-btn default" data-member-id="${friend.id}">Connect</button>
                    </div>
                    <div class="user-bio">${bio}</div>
                </div>
            </div>`;
    };

    const showFriendsList = (friends, page) => {
        const friendsList = document.getElementById("friendsList");
        const html = friends.map(createFriendCard).join("");
        if (page === 1) {
            friendsList.innerHTML = html;
        } else {
            friendsList.innerHTML += html;
        }
    };

    return { showFriendsList, buildAvatarDataUri };
})();
