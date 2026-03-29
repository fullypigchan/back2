const CommunityDetailLayout = {

    escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    },

    // handle에서 @ 중복 방지
    formatHandle(handle) {
        const h = this.escapeHtml(handle);
        return h.startsWith("@") ? h : `@${h}`;
    },

    // ─── 상세 헤더 (배너 + 커뮤니티 정보, 원본 구조) ───
    renderHeader(community, myRole) {
        const name = this.escapeHtml(community.communityName);
        const desc = this.escapeHtml(community.description ?? "");
        const category = this.escapeHtml(community.categoryName ?? "");
        const isAdmin = myRole === "creator";
        const isJoined = community.isJoined ?? community.joined ?? false;

        const joinBtnHtml = (isJoined || isAdmin)
            ? `<button class="join-btn joined" data-action="leave"><span>나가기</span></button>`
            : `<button class="join-btn" data-action="join"><span>참여하기</span></button>`;

        return `
        <div class="community-banner">
            ${community.coverFilePath
                ? `<img src="${community.coverFilePath}" alt="${name}" id="bannerImg">`
                : ''}
            ${isAdmin ? `
            <label class="banner-camera-btn" aria-label="배너 이미지 변경">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M9.697 3H14.303l1.414 1.414h3.283A2 2 0 0 1 21 6.414v11.172A2 2 0 0 1 19 19.586H5a2 2 0 0 1-2-2V6.414a2 2 0 0 1 2-2h3.283L9.697 3ZM12 17.5a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"></path></svg>
                <input type="file" id="bannerFileInput" accept="image/*" hidden>
            </label>` : ''}
        </div>
        <div class="community-info">
            <h1 class="community-name">${name}</h1>
            ${category ? `<div class="community-category"><button class="category-tag">${category}</button></div>` : ''}
            <p class="community-desc">${desc}</p>
            <div class="community-actions">
                <span class="member-count"><strong>${community.memberCount}</strong> 멤버 · <strong>${community.postCount}</strong> 게시글</span>
                <div class="action-buttons">${joinBtnHtml}</div>
            </div>
        </div>`;
    },

    // ─── 게시글 카드 (메인 postCard 구조 동일) ───
    renderPostCard(post) {
        const nickname = this.escapeHtml(post.memberNickname);
        const handle = this.formatHandle(post.memberHandle);
        const title = this.escapeHtml(post.postTitle);
        const content = this.escapeHtml(post.postContent);

        let mediaHtml = "";
        if (post.postFiles && post.postFiles.length > 0) {
            const isVideo = (path) => /\.(mp4|mov|webm|avi)(\?|$)/i.test(path);
            const count = post.postFiles.length;

            if (count === 1 && isVideo(post.postFiles[0].filePath)) {
                mediaHtml = `<div class="postMedia"><video class="postMediaVideo" controls><source src="${post.postFiles[0].filePath}"></video></div>`;
            } else {
                const gridClass = count >= 4 ? "postMediaGrid--4"
                    : count === 3 ? "postMediaGrid--3"
                    : count === 2 ? "postMediaGrid--2" : "";
                const items = post.postFiles.map(pf =>
                    `<img class="postMediaImage Post-Media-Img" src="${pf.filePath}">`
                ).join("");
                mediaHtml = `<div class="postMedia"><div class="postMediaGrid ${gridClass}">${items}</div></div>`;
            }
        }

        return `
        <article class="postCard communityPostCard" data-post-id="${post.id}" data-member-id="${post.memberId}">
            <div class="communityPostMeta">
                <span class="communityPostMeta__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M7.471 21H.472l.029-1.027c.184-6.618 3.736-8.977 7-8.977.963 0 1.95.212 2.87.672-.761.992-1.339 2.159-1.693 3.46-.349 1.284-.449 2.637-.283 3.872H7.471zm-3.59-2h1.79c.281-3.072 1.985-5.606 4.476-6.726A5.7 5.7 0 0 0 7.5 12.004c-2.246 0-4.86 1.607-5.06 6.996h.441zM7.5 12.002c-2.59 0-4.669-2.108-4.669-4.699C2.831 4.681 4.91 2.58 7.5 2.58c2.59 0 4.668 2.1 4.668 4.723 0 2.591-2.078 4.699-4.668 4.699zm0-7.39a2.67 2.67 0 0 0-2.669 2.691c0 1.481 1.192 2.699 2.669 2.699 1.477 0 2.668-1.218 2.668-2.699A2.67 2.67 0 0 0 7.5 4.612zM21.412 21H13.56l.03-1.027c.184-6.618 3.736-8.977 7-8.977s6.816 2.358 7 8.977L27.62 21h-6.208zm-5.443-2h7.893c-.2-5.389-2.815-6.996-5.06-6.996-2.246 0-4.86 1.607-5.06 6.996h2.227zm2.803-7.998c-2.59 0-4.669-2.108-4.669-4.699 0-2.622 2.078-4.723 4.669-4.723 2.59 0 4.668 2.1 4.668 4.723 0 2.591-2.078 4.699-4.668 4.699zm0-7.39a2.67 2.67 0 0 0-2.669 2.691c0 1.481 1.192 2.699 2.669 2.699 1.477 0 2.668-1.218 2.668-2.699a2.67 2.67 0 0 0-2.668-2.691z"></path></svg>
                </span>
            </div>
            <div class="postAvatar">
                ${post.memberProfileFileName
                    ? `<img class="postAvatarImage" src="${post.memberProfileFileName}" alt="">`
                    : nickname.charAt(0)}
            </div>
            <div class="postBody">
                <header class="postHeader">
                    <div class="postIdentity">
                        <strong class="postName">${nickname}</strong>
                        <span class="postHandle">${handle}</span>
                        <span class="postTime">${post.createdDatetime}</span>
                    </div>
                    <button class="postMoreButton" type="button" aria-label="게시물 더 보기">
                        <svg viewBox="0 0 24 24" aria-hidden="true" class="postMoreIcon"><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg>
                    </button>
                </header>
                ${title ? `<p class="postTitle">${title}</p>` : ''}
                <p class="postText">${content}</p>
                ${mediaHtml}
                <footer class="postMetrics">
                    <div class="tweet-action-bar">
                        <button class="tweet-action-btn" data-testid="reply" data-action="reply" data-post-id="${post.id}">
                            <svg class="tweet-action-icon" viewBox="0 0 24 24"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                            <span class="tweet-action-count">${post.replyCount ?? 0}</span>
                        </button>
                        <button class="tweet-action-btn tweet-action-btn--like ${post.isLiked ? 'active' : ''}" data-post-id="${post.id}">
                            <svg class="tweet-action-icon" viewBox="0 0 24 24"><g><path d="${post.isLiked
                                ? 'M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z'
                                : 'M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z'}"></path></g></svg>
                            <span class="tweet-action-count">${post.likeCount ?? 0}</span>
                        </button>
                        <button class="tweet-action-btn tweet-action-btn--views">
                            <svg class="tweet-action-icon" viewBox="0 0 24 24"><g><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></g></svg>
                            <span class="tweet-action-count">${post.bookmarkCount ?? 0}</span>
                        </button>
                        <div class="tweet-action-right">
                            <button class="tweet-action-btn tweet-action-btn--bookmark ${post.isBookmarked ? 'active' : ''}" data-post-id="${post.id}">
                                <svg class="tweet-action-icon" viewBox="0 0 24 24"><g><path d="${post.isBookmarked
                                    ? 'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z'
                                    : 'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z'}"></path></g></svg>
                            </button>
                            <button class="tweet-action-btn tweet-action-btn--share">
                                <svg class="tweet-action-icon" viewBox="0 0 24 24"><g><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></g></svg>
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </article>`;
    },

    // ─── 미디어 그리드 (미디어 탭용) ───
    renderMediaItem(file) {
        return `
        <div class="communityMediaCell" data-file-id="${file.id}" data-post-id="${file.postId}">
            <img class="communityMediaCell__img Post-Media-Img" src="${file.filePath}" alt="${this.escapeHtml(file.originalName)}">
        </div>`;
    },

    // ─── 소개 탭 (커뮤니티 정보 + 관리자/멤버 목록 with Connect 버튼) ───
    renderAbout(community, members, loginMemberId) {
        const desc = this.escapeHtml(community.description ?? "");
        const creatorId = community.creatorId;
        const admins = (members || []).filter(m => m.memberId == creatorId);
        const regularMembers = (members || []).filter(m => m.memberId != creatorId);

        const renderMemberRow = (member) => {
            const nick = this.escapeHtml(member.memberNickname);
            const handle = this.formatHandle(member.memberHandle);
            return `
            <article class="about-member-row" data-member-id="${member.memberId}">
                <div class="about-member-avatar">
                    ${member.memberProfileFilePath
                        ? `<img src="${member.memberProfileFilePath}" alt="">`
                        : `<span class="about-member-avatar__initial">${nick.charAt(0)}</span>`}
                </div>
                <div class="about-member-info">
                    <strong class="about-member-name">${nick}</strong>
                    <span class="about-member-handle">${handle}</span>
                </div>
                ${member.memberId != loginMemberId ? `<button class="connect-btn default" data-member-id="${member.memberId}">Connect</button>` : ''}
            </article>`;
        };

        return `
        <div class="about-section about-section--info">
            <h2>커뮤니티 정보</h2>
            <p>${desc}</p>
            <div class="about-info-row">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#536471"><path d="M7.501 19.917L7.471 21H.472l.029-1.027c.184-6.618 3.736-8.977 7-8.977.963 0 1.95.212 2.87.572-.444.478-.851 1.03-1.212 1.67-.507-.185-1.067-.302-1.658-.302-2.767 0-4.57 1.786-4.989 6.981h4.989zm8.498 0L15.97 21H23v-1.028c-.186-6.618-3.737-8.977-7.001-8.977-.962 0-1.949.212-2.869.572.443.478.851 1.03 1.212 1.671.506-.186 1.067-.303 1.657-.303 2.768 0 4.571 1.786 4.99 6.982h-4.99zM12 11c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4zm0-2c-1.105 0-2-.896-2-2s.896-2 2-2 2 .896 2 2-.895 2-2 2z"/></svg>
                <span>멤버만 게시물을 작성할 수 있습니다.</span>
            </div>
            <div class="about-info-row">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#536471"><path d="M12 10c-3.976 0-8 1.43-8 4.5v2h16v-2c0-3.07-4.024-4.5-8-4.5zm0-2c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3z"/></svg>
                <div>
                    <strong>모든 커뮤니티는 전체 공개됩니다.</strong>
                    <p style="margin:2px 0 0;color:#536471;font-size:14px;">누구나 이 커뮤니티에 가입할 수 있습니다.</p>
                </div>
            </div>
        </div>
        ${admins.length > 0 ? `
        <div class="about-section about-section--members">
            <h2 class="about-role-title">관리자</h2>
            ${admins.map(renderMemberRow).join("")}
        </div>` : ''}
        ${regularMembers.length > 0 ? `
        <div class="about-section about-section--members">
            <h2 class="about-role-title">멤버</h2>
            ${regularMembers.map(renderMemberRow).join("")}
        </div>` : ''}`;
    },

    // ─── 멤버 아이템 (Members 탭 무한스크롤용) ───
    renderMemberItem(member, myRole) {
        const nick = this.escapeHtml(member.memberNickname);
        const handle = this.formatHandle(member.memberHandle);
        const role = member.memberRole || "member";
        const roleLabel = role === "admin" ? "관리자" : role === "moderator" ? "중재자" : "";
        const canManage = myRole === "admin" && role !== "admin";
        return `
        <div class="member-item" data-member-id="${member.memberId}">
            <div class="member-info">
                <span class="member-nickname">${nick}</span>
                <span class="member-handle">${handle}</span>
                ${roleLabel ? `<span class="member-role-badge">${roleLabel}</span>` : ''}
            </div>
            ${canManage ? `<button class="member-manage-btn" data-action="manage-member" data-target-id="${member.memberId}">관리</button>` : ''}
        </div>`;
    },

    // ─── 커뮤니티 삭제 버튼 (관리자 전용) ───
    renderDeleteButton() {
        return `
        <div class="about-section about-section--danger">
            <button class="community-delete-btn" data-action="delete-community">커뮤니티 삭제</button>
        </div>`;
    },

    // ─── 빈 상태 ───
    renderEmptyState(message) {
        return `<div class="communityEmpty"><p>${this.escapeHtml(message)}</p></div>`;
    },
};
