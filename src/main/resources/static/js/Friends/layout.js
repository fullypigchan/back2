const friendsLayout = (() => {

    const createFriendCard = (friend) => {
        console.log("들어옴1 createFriendCard, memberProfileFileName:", friend.memberProfileFileName);
        const avatarHtml = friend.memberProfileFileName
            ? `<div class="user-avatar user-avatar--image"><img class="user-avatar-img" src="${friend.memberProfileFileName}" alt="" onerror="this.src='/images/profile/default_image.png'"></div>`
            : `<div class="user-avatar user-avatar--image"><img class="user-avatar-img" src="/images/profile/default_image.png" alt=""></div>`;

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

    return { showFriendsList: showFriendsList };
})();
