const expertLayout = (() => {

    const friendsList = document.getElementById("friendsList");

    const createExpertCard = (expert) => {
        const avatarInitial = (expert.memberNickname || expert.memberHandle || "?").charAt(0);
        const avatarHtml = expert.memberProfileFileName
            ? `<div class="user-avatar user-avatar--image"><img class="user-avatar-img" src="${expert.memberProfileFileName}"></div>`
            : `<div class="user-avatar">${avatarInitial}</div>`;

        const handle = expert.memberHandle ? `@${expert.memberHandle}` : "";
        const nickname = expert.memberNickname || expert.memberHandle || "";
        const bio = expert.memberBio || "";
        const followerIntro = expert.followerIntro
            ? `<div class="user-followed-by">${expert.followerIntro}</div>`
            : "";

        return `
            <div class="user-card" data-expert-id="${expert.id}">
                ${avatarHtml}
                <div class="user-info">
                    <div class="user-top">
                        <div class="user-name-group">
                            <div class="user-name">${nickname}</div>
                            <div class="user-handle">${handle}</div>
                            ${followerIntro}
                        </div>
                        <button class="connect-btn default" data-member-id="${expert.id}">Connect</button>
                    </div>
                    <div class="user-bio">${bio}</div>
                </div>
            </div>`;
    };

    const showList = (experts, page) => {
        const html = experts.map(createExpertCard).join("");
        if (page === 1) {
            friendsList.innerHTML = html;
        } else {
            friendsList.innerHTML += html;
        }
    };

    return { showList };
})();
