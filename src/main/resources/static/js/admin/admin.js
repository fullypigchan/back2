window.onload = () => {


    const portals = document.querySelectorAll(".each-menu");
    const pages = document.querySelectorAll(".page");

    const memberTbody = document.querySelector("#memberTbody");
    const newsTbody = document.querySelector("#newsTbody");
    const postTbody = document.querySelector("#postTbody");
    const reportMemberTbody = document.querySelector("#reportMemberTbody");
    const reportPostTbody = document.querySelector("#reportPostTbody");
    const modalMemberDetail = document.querySelector("#modalMemberDetail");
    const modalNewsDetail = document.querySelector("#modalNewsDetail");
    const modalPostEdit = document.querySelector("#modalPostEdit");
    const modalReportDetail = document.querySelector("#modalReportDetail");

    const newsWriteBtn = document.querySelector("#newsWriteBtn");
    const newsCancelBtn = document.querySelector("#newsCancelBtn");
    const newsSubmitBtn = document.querySelector("#newsSubmitBtn");
    const aiBtn = document.querySelector("#aiBtn");

    const filterMemberGrade = document.querySelector("#filterMemberGrade");
    const filterMemberStatus = document.querySelector("#filterMemberStatus");

    const filterPostType = document.querySelector("#filterPostType");
    const filterPostCategory = document.querySelector("#filterPostCategory");

    const filterNewsCategory = document.querySelector("#filterNewsCategory");
    const newsHideBtn = document.querySelector("#newsHideBtn");
    const newsShowBtn = document.querySelector("#newsShowBtn");
    const newsDeleteBtn = document.querySelector("#newsDeleteBtn");

    const filterReportMember = document.querySelector("#filterReportMember");
    const filterReportPost = document.querySelector("#filterReportPost");

    const reportMemberDoneBtn = document.querySelector("#reportMemberDoneBtn");
    const reportMemberRejectBtn = document.querySelector("#reportMemberRejectBtn");
    const reportMemberDeleteBtn = document.querySelector("#reportMemberDeleteBtn");

    const reportPostDoneBtn = document.querySelector("#reportPostDoneBtn");
    const reportPostRejectBtn = document.querySelector("#reportPostRejectBtn");
    const reportPostDeleteBtn = document.querySelector("#reportPostDeleteBtn");

    const memberTypeSelect = document.querySelector("#memberTypeSelect");

    let postOriginal = {};
    let newsOriginal = {};

    const previewTitle = document.querySelector("#previewTitle");
    const previewCategory = document.querySelector("#previewCategory");
    const previewContent = document.querySelector("#previewContent");
    const previewSource = document.querySelector("#previewSource");
    const previewDate = document.querySelector("#previewDate");

    const modalImageViewer = document.querySelector("#modalImageViewer");
    const modalVideoViewer = document.querySelector("#modalVideoViewer");
    const modalNewsAutoSettings = document.querySelector("#modalNewsAutoSettings");
    const newsSettingsBtn = document.querySelector("#newsSettingsBtn");
    const memberSearchInput = document.querySelector("#page-member-list .search-input");
    const memberSearchBtn = document.querySelector("#page-member-list .btn-primary");
    const postSearchInput = document.querySelector("#page-post-list .search-input");
    const postSearchBtn = document.querySelector("#page-post-list .btn-primary");
    const reportMemberSearchInput = document.querySelector("#page-report-member .search-input");
    const reportMemberSearchBtn = document.querySelector("#page-report-member .btn-primary");
    const reportPostSearchInput = document.querySelector("#page-report-post .search-input");
    const reportPostSearchBtn = document.querySelector("#page-report-post .btn-primary");
    const showHiddenOnly = document.querySelector("#showHiddenOnly");
    const showVisibleOnly = document.querySelector("#showVisibleOnly");

    const state = {
        members: [],
        posts: [],
        reportMembers: [],
        reportPosts: []
    };

    const memberRoleBadgeMap = {
        business: { className: "badge-normal", text: "business" },
        expert: { className: "badge-expert", text: "expert" },
        admin: { className: "badge-proplus", text: "admin" }
    };

    const memberStatusBadgeMap = {
        active: { className: "badge-active", text: "active" },
        inactive: { className: "badge-reject", text: "inactive" },
        banned: { className: "badge-reject", text: "banned" }
    };

    const postTypeBadgeMap = {
        product: { className: "badge-buy", text: "product" },
        general: { className: "badge-qna", text: "general" }
    };

    const reportStatusBadgeMap = {
        pending: { className: "badge-pending", text: "pending" },
        applied: { className: "badge-done", text: "done" },
        rejected: { className: "badge-reject", text: "rejected" }
    };

    const fetchJson = async (url) => {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        return response.json();
    };

    const buildQuery = (params) => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "" && value !== "all") {
                searchParams.append(key, value);
            }
        });

        const queryString = searchParams.toString();
        return queryString ? `?${queryString}` : "";
    };

    const escapeHtml = (value) => {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    const getBadgeMarkup = (value, map, fallbackClass = "badge-normal") => {
        const badgeInfo = map[value] || { className: fallbackClass, text: value || "-" };
        return `<span class="badge ${badgeInfo.className}">${escapeHtml(badgeInfo.text)}</span>`;
    };

    const renderEmptyRow = (tbody, colSpan, message) => {
        tbody.innerHTML = `
            <div class="div-tr empty-row">
                <div class="div-td" style="grid-column: span ${colSpan}; text-align: center;">${escapeHtml(message)}</div>
            </div>
        `;
    };

    const setOptions = (select, options) => {
        if (!select) return;
        select.innerHTML = options.map((option) => `<option value="${option.value}">${option.label}</option>`).join("");
    };

    const setAdminFilterOptions = () => {
        setOptions(filterMemberGrade, [
            { value: "all", label: "등급 전체" },
            { value: "business", label: "business" },
            { value: "expert", label: "expert" },
            { value: "admin", label: "admin" }
        ]);

        setOptions(filterMemberStatus, [
            { value: "all", label: "상태 전체" },
            { value: "active", label: "active" },
            { value: "inactive", label: "inactive" },
            { value: "banned", label: "banned" }
        ]);

        setOptions(filterPostType, [
            { value: "all", label: "글종류 전체" },
            { value: "product", label: "product" },
            { value: "general", label: "general" }
        ]);

        setOptions(filterReportMember, [
            { value: "all", label: "상태 전체" },
            { value: "pending", label: "pending" },
            { value: "applied", label: "done" },
            { value: "rejected", label: "rejected" }
        ]);

        setOptions(filterReportPost, [
            { value: "all", label: "상태 전체" },
            { value: "pending", label: "pending" },
            { value: "applied", label: "done" },
            { value: "rejected", label: "rejected" }
        ]);

        setOptions(document.querySelector("#statusSelect"), [
            { value: "active", label: "active" },
            { value: "inactive", label: "inactive" },
            { value: "banned", label: "banned" }
        ]);

        setOptions(document.querySelector("#peType"), [
            { value: "product", label: "product" },
            { value: "general", label: "general" }
        ]);
    };

    const renderMembers = (members) => {
        if (!members.length) {
            renderEmptyRow(memberTbody, 7, "회원 데이터가 없습니다.");
            return;
        }

        memberTbody.innerHTML = members.map((member, index) => `
            <div class="div-tr" data-member-id="${member.id}">
                <div class="div-td">${index + 1}</div>
                <div class="div-td">${escapeHtml(member.memberName)}</div>
                <div class="div-td td-email">${escapeHtml(member.memberEmail)}</div>
                <div class="div-td">${escapeHtml(member.companyName || "-")}</div>
                <div class="div-td">${getBadgeMarkup(member.memberRole, memberRoleBadgeMap)}</div>
                <div class="div-td">${getBadgeMarkup(member.memberStatus, memberStatusBadgeMap, "badge-reject")}</div>
                <div class="div-td">${escapeHtml(member.createdDatetime || "-")}</div>
            </div>
        `).join("");
    };

    const renderPosts = (posts) => {
        if (!posts.length) {
            renderEmptyRow(postTbody, 7, "게시물 데이터가 없습니다.");
            return;
        }

        postTbody.innerHTML = posts.map((post, index) => `
            <div class="div-tr" data-post-id="${post.id}">
                <div class="div-td"><input type="checkbox"/></div>
                <div class="div-td">${index + 1}</div>
                <div class="div-td">${escapeHtml(post.authorName)}</div>
                <div class="div-td"><div class="post-title">${escapeHtml(post.postTitle)}</div></div>
                <div class="div-td">${getBadgeMarkup(post.postType, postTypeBadgeMap, "badge-qna")}</div>
                <div class="div-td">${escapeHtml(post.categoryName || "-")}</div>
                <div class="div-td">${escapeHtml(post.createdDatetime || "-")}</div>
            </div>
        `).join("");
    };

    const renderReports = (tbody, reports, targetType) => {
        if (!reports.length) {
            renderEmptyRow(tbody, 7, "신고 데이터가 없습니다.");
            return;
        }

        tbody.innerHTML = reports.map((report, index) => {
            const targetCell = targetType === "post"
                ? `<div class="report-post-title">${escapeHtml(report.targetName)}</div>`
                : escapeHtml(report.targetName);

            return `
                <div class="div-tr" data-report-id="${report.id}" data-report-target-type="${targetType}">
                    <div class="div-td"><input type="checkbox"/></div>
                    <div class="div-td">${index + 1}</div>
                    <div class="div-td">${escapeHtml(report.reporterName)}</div>
                    <div class="div-td">${targetCell}</div>
                    <div class="div-td">${escapeHtml(report.reason)}</div>
                    <div class="div-td">${getBadgeMarkup(report.status, reportStatusBadgeMap, "badge-pending")}</div>
                    <div class="div-td">${escapeHtml(report.createdDatetime || "-")}</div>
                </div>
            `;
        }).join("");
    };

    const loadMembers = async () => {
        const query = buildQuery({
            keyword: memberSearchInput.value.trim(),
            memberRole: filterMemberGrade.value,
            memberStatus: filterMemberStatus.value
        });

        const response = await fetchJson(`/api/admin/members/1${query}`);
        state.members = response.members || [];
        renderMembers(state.members);
    };

    const loadPosts = async () => {
        let postStatus = "";
        if (showHiddenOnly.checked && !showVisibleOnly.checked) {
            postStatus = "inactive";
        } else if (showVisibleOnly.checked && !showHiddenOnly.checked) {
            postStatus = "active";
        }

        const query = buildQuery({
            keyword: postSearchInput.value.trim(),
            postType: filterPostType.value,
            categoryName: filterPostCategory.value,
            postStatus
        });

        const response = await fetchJson(`/api/admin/posts/1${query}`);
        state.posts = response.posts || [];
        renderPosts(state.posts);
        document.querySelector("#checkAll").checked = false;
    };

    const loadReportMembers = async () => {
        const query = buildQuery({
            keyword: reportMemberSearchInput.value.trim(),
            targetType: "member",
            reportStatus: filterReportMember.value
        });

        const response = await fetchJson(`/api/admin/reports/1${query}`);
        state.reportMembers = response.reports || [];
        renderReports(reportMemberTbody, state.reportMembers, "member");
        document.querySelector("#reportMemberCheckAll").checked = false;
    };

    const loadReportPosts = async () => {
        const query = buildQuery({
            keyword: reportPostSearchInput.value.trim(),
            targetType: "post",
            reportStatus: filterReportPost.value
        });

        const response = await fetchJson(`/api/admin/reports/1${query}`);
        state.reportPosts = response.reports || [];
        renderReports(reportPostTbody, state.reportPosts, "post");
        document.querySelector("#reportPostCheckAll").checked = false;
    };

    const runAdminSearch = (loader) => async () => {
        try {
            await loader();
        } catch (error) {
            console.error(error);
            alert("목록을 불러오지 못했습니다.");
        }
    };
    function getCheckedRows(tbody) {
        const trs = tbody.querySelectorAll(".div-tr");
        const result = [];
        for (let i = 0; i < trs.length; i++) {
            if (trs[i].querySelector("input[type='checkbox']").checked) {
                result.push(trs[i]);
            }
        }
        return result;
    }

    const badgeToStatus = (badge) => {
        switch (badge) {
            case "badge-pending":
                return "pending";
            case "badge-done":
                return "done";
            case "badge-reject":
                return "rejected";
        }
    };


    const postDummyAttach = [
        {
            type: "image",
            srcs: ["../../static/images/admin/file-ex.PNG", "../../static/images/admin/file-ex.PNG", "../../static/images/admin/file-ex.PNG"]
        },
        {type: "video", src: "../../static/video/Video-Project-2.mp4"},
        {
            type: "image",
            srcs: ["../../static/images/admin/file-ex.PNG", "../../static/images/admin/file-ex.PNG", "../../static/images/admin/file-ex.PNG", "../../static/images/admin/file-ex.PNG"]
        },
        {type: "none"},
        {type: "image", srcs: ["../../static/images/admin/file-ex.PNG"]},
        {type: "video", src: "../../static/video/Video-Project-2.mp4"},
        {type: "image", srcs: ["../../static/images/admin/file-ex.PNG", "../../static/images/admin/file-ex.PNG"]},
    ];

    const aiNews = {
        title: "[속보] 코스피 8% 급락, 무역 시장 변동성 확대",
        summary: "글로벌 시장 불확실성이 커지면서 수출입 관련 업종 전반에 변동성이 확대되고 있습니다. 원자재 가격과 환율 변동도 함께 나타나 기업들의 대응이 필요한 상황입니다.",
        source: "JoongAng News"
    };


    portals.forEach((portal, i) => {
        portal.addEventListener("click", (e) => {

            pages.forEach((page) => {
                page.classList.remove("active");
            });

            portals.forEach((eachPortal) => {
                eachPortal.classList.remove("active");
            });

            e.target.classList.add("active");
            pages[i].classList.add("active");
        });
    });


    newsWriteBtn.addEventListener("click", (e) => {

        pages.forEach((page) => {
            page.classList.remove("active");
        });

        portals.forEach((eachPortal) => {
            eachPortal.classList.remove("active");
        });

        portals[3].classList.add("active");
        pages[3].classList.add("active");
    });


    newsCancelBtn.addEventListener("click", (e) => {

        pages.forEach((page) => {
            page.classList.remove("active");
        });

        portals.forEach((eachPortal) => {
            eachPortal.classList.remove("active");
        });

        portals[2].classList.add("active");
        pages[2].classList.add("active");
    });


    document.querySelector("#newsCheckAll").addEventListener("change", (e) => {
        newsTbody.querySelectorAll("input[type='checkbox']").forEach((cb) => {
            cb.checked = e.target.checked;
        });
    });

    newsHideBtn.addEventListener("click", (e) => {
        const checked = getCheckedRows(newsTbody);
        if (!checked.length) {
            alert("선택된 뉴스가 없습니다.");
            return;
        }
        if (!confirm(`선택한 ${checked.length}개의 뉴스를 숨기시겠습니까?`)) return;
        checked.forEach(tr => tr.classList.add("row-hidden"));
    });

    newsShowBtn.addEventListener("click", (e) => {
        const checked = getCheckedRows(newsTbody);
        if (!checked.length) {
            alert("선택된 뉴스가 없습니다.");
            return;
        }
        if (!confirm(`선택한 ${checked.length}개의 뉴스를 다시 표시하시겠습니까?`)) return;
        checked.forEach(tr => tr.classList.remove("row-hidden"));
    });

    newsDeleteBtn.addEventListener("click", (e) => {
        const checked = getCheckedRows(newsTbody);
        if (!checked.length) {
            alert("선택된 뉴스가 없습니다.");
            return;
        }
        if (!confirm(`선택한 ${checked.length}개의 뉴스를 삭제하시겠습니까?`)) return;
        checked.forEach(tr => tr.remove());
    });

    const applyNewsFilter = () => {
        const categoryVal = filterNewsCategory.value;
        newsTbody.querySelectorAll(".div-tr").forEach((tr) => {
            const tds = tr.querySelectorAll(".div-td");
            const category = tds[4].textContent.trim();
            if (categoryVal === "all" || category === categoryVal) {
                tr.classList.remove("off");
            } else {
                tr.classList.add("off");
            }
        });
    };
    filterNewsCategory.addEventListener("change", applyNewsFilter);

    newsTbody.addEventListener("click", (e) => {
        if (e.target.type === "checkbox") return;

        const tr = e.target.closest(".div-tr");
        if (!tr) return;
        const tds = tr.querySelectorAll(".div-td");

        document.querySelector("#newsDetailTitle").value = tds[3].textContent;
        document.querySelector("#newsDetailSource").value = tds[2].textContent;
        document.querySelector("#newsDetailCategory").value = tds[4].textContent;
        document.querySelector("#newsDetailContent").value = aiNews.summary;

        newsOriginal = {
            title: tds[3].textContent,
            source: tds[2].textContent,
            category: tds[4].textContent,
            content: aiNews.summary
        };

        document.querySelector("#modalNewsSave").disabled = true;
        modalNewsDetail.classList.remove("off");
    });

    document.querySelector("#modalNewsClose").addEventListener("click", (e) => {
        modalNewsDetail.classList.add("off");
    });

    document.querySelector("#modalNewsCancel").addEventListener("click", (e) => {
        modalNewsDetail.classList.add("off");
    });

    modalNewsDetail.addEventListener("click", (e) => {
        if (e.target === modalNewsDetail) {
            modalNewsDetail.classList.add("off");
        }
    });

    document.querySelector("#modalNewsSave").addEventListener("click", (e) => {
        let result = confirm("수정한 내용을 저장하시겠습니까?");

        if (result) {
            alert("저장되었습니다.");
            modalNewsDetail.classList.add("off");
        }
    });

    const checkNewsChanged = () => {
        const changed =
            document.querySelector("#newsDetailTitle").value !== newsOriginal.title ||
            document.querySelector("#newsDetailSource").value !== newsOriginal.source ||
            document.querySelector("#newsDetailCategory").value !== newsOriginal.category ||
            document.querySelector("#newsDetailContent").value !== newsOriginal.content;
        document.querySelector("#modalNewsSave").disabled = !changed;
    };
    document.querySelector("#newsDetailTitle").addEventListener("input", checkNewsChanged);
    document.querySelector("#newsDetailSource").addEventListener("input", checkNewsChanged);
    document.querySelector("#newsDetailCategory").addEventListener("change", checkNewsChanged);
    document.querySelector("#newsDetailContent").addEventListener("input", checkNewsChanged);


    memberTbody.addEventListener("click", (e) => {
        const tr = e.target.closest(".div-tr");
        if (!tr || tr.classList.contains("empty-row")) return;

        const memberId = Number(tr.dataset.memberId);
        const member = state.members.find((item) => item.id === memberId);
        if (!member) return;

        document.querySelector("#name").textContent = member.memberName || "-";
        document.querySelector("#age").textContent = "-";
        document.querySelector("#email").textContent = member.memberEmail || "-";
        document.querySelector("#phone").textContent = "-";
        document.querySelector("#company").textContent = member.companyName || "-";
        document.querySelector("#joinDate").textContent = member.createdDatetime || "-";
        document.querySelector("#statusSelect").value = member.memberStatus || "active";
        memberTypeSelect.textContent = member.memberRole || "-";

        modalMemberDetail.classList.remove("off");
    });

    document.querySelector("#modalMemberClose").addEventListener("click", (e) => {
        modalMemberDetail.classList.add("off");
    });

    document.querySelector("#modalMemberCancel").addEventListener("click", (e) => {
        modalMemberDetail.classList.add("off");
    });

    modalMemberDetail.addEventListener("click", (e) => {
        if (e.target === modalMemberDetail) {
            modalMemberDetail.classList.add("off");
        }
    });

    document.querySelector("#modalMemberSave").addEventListener("click", (e) => {
        let result = confirm("수정한 내용을 저장하시겠습니까?");

        if (result) {
            alert("저장되었습니다.");
            modalMemberDetail.classList.add("off");
        }
    });


    const applyMemberFilter = runAdminSearch(loadMembers);

    filterMemberGrade.addEventListener("change", applyMemberFilter);
    filterMemberStatus.addEventListener("change", applyMemberFilter);
    memberSearchBtn.addEventListener("click", applyMemberFilter);
    memberSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            applyMemberFilter();
        }
    });

    document.querySelector("#postHideBtn").addEventListener("click", (e) => {
        const checked = getCheckedRows(postTbody);
        if (!checked.length) {
            alert("선택된 게시물이 없습니다.");
            return;
        }
        if (!confirm(`선택한 ${checked.length}개의 게시물을 숨기시겠습니까?`)) return;
        checked.forEach(tr => tr.classList.add("row-hidden"));
    });

    document.querySelector("#postShowBtn").addEventListener("click", (e) => {
        const checked = getCheckedRows(postTbody);
        if (!checked.length) {
            alert("선택된 게시물이 없습니다.");
            return;
        }
        if (!confirm(`선택한 ${checked.length}개의 게시물을 다시 표시하시겠습니까?`)) return;
        checked.forEach(tr => tr.classList.remove("row-hidden"));
    });

    document.querySelector("#postDeleteBtn").addEventListener("click", (e) => {
        const checked = getCheckedRows(postTbody);
        if (!checked.length) {
            alert("선택된 게시물이 없습니다.");
            return;
        }
        if (!confirm(`선택한 ${checked.length}개의 게시물을 삭제하시겠습니까?`)) return;
        checked.forEach(tr => tr.remove());
    });

    const applyPostFilter = runAdminSearch(loadPosts);

    filterPostType.addEventListener("change", applyPostFilter);
    filterPostCategory.addEventListener("change", applyPostFilter);
    showHiddenOnly.addEventListener("change", (e) => {
        if (e.target.checked) {
            showVisibleOnly.checked = false;
        }
        applyPostFilter();
    });
    showVisibleOnly.addEventListener("change", (e) => {
        if (e.target.checked) {
            showHiddenOnly.checked = false;
        }
        applyPostFilter();
    });
    postSearchBtn.addEventListener("click", applyPostFilter);
    postSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            applyPostFilter();
        }
    });

    document.querySelector("#checkAll").addEventListener("change", (e) => {
        postTbody.querySelectorAll("input[type='checkbox']").forEach((cb) => {
            cb.checked = e.target.checked;
        });
    });

    postTbody.addEventListener("click", (e) => {
        if (e.target.type === "checkbox") return;

        const tr = e.target.closest(".div-tr");
        if (!tr || tr.classList.contains("empty-row")) return;

        const postId = Number(tr.dataset.postId);
        const post = state.posts.find((item) => item.id === postId);
        if (!post) return;

        document.querySelector("#peAuthor").textContent = post.authorName || "-";
        document.querySelector("#peTitle").textContent = post.postTitle || "-";
        document.querySelector("#peContent").textContent = post.postContent || "-";
        document.querySelector("#peType").value = post.postType || "general";
        document.querySelector("#peCategory").value = post.categoryName || "기타";
        document.querySelector("#peDate").textContent = post.createdDatetime || "-";

        postOriginal = {
            type: document.querySelector("#peType").value,
            category: document.querySelector("#peCategory").value
        };

        const rowIdx = state.posts.findIndex((item) => item.id === postId);
        const attach = postDummyAttach[(rowIdx < 0 ? 0 : rowIdx) % postDummyAttach.length];
        const postAttachImages = document.querySelector("#postAttachImages");
        const postAttachVideo = document.querySelector("#postAttachVideo");
        const postAttachNone = document.querySelector("#postAttachNone");

        postAttachImages.innerHTML = "";
        postAttachImages.classList.add("off");
        postAttachVideo.classList.add("off");
        postAttachNone.classList.add("off");

        if (attach.type === "image") {
            attach.srcs.forEach((src) => {
                const img = document.createElement("img");
                img.src = src;
                img.className = "report-attach-thumb";
                img.alt = "첨부 이미지";
                postAttachImages.appendChild(img);
            });
            postAttachImages.classList.remove("off");
        } else if (attach.type === "video") {
            document.querySelector("#videoViewerVideo").src = attach.src;
            postAttachVideo.classList.remove("off");
        } else {
            postAttachNone.classList.remove("off");
        }

        document.querySelector("#modalPostSave").disabled = true;
        modalPostEdit.classList.remove("off");
    });

    document.querySelector("#modalPostClose").addEventListener("click", (e) => {
        modalPostEdit.classList.add("off");
    });

    document.querySelector("#modalPostCancel").addEventListener("click", (e) => {
        modalPostEdit.classList.add("off");
    });

    modalPostEdit.addEventListener("click", (e) => {
        if (e.target === modalPostEdit) {
            modalPostEdit.classList.add("off");
        }
    });

    document.querySelector("#modalPostSave").addEventListener("click", (e) => {
        let result = confirm("수정한 내용을 저장하시겠습니까?");

        if (result) {
            alert("저장되었습니다.");
            modalPostEdit.classList.add("off");
        }
    });

    const checkPostChanged = () => {
        const changed =
            document.querySelector("#peType").value !== postOriginal.type ||
            document.querySelector("#peCategory").value !== postOriginal.category;
        document.querySelector("#modalPostSave").disabled = !changed;
    };
    document.querySelector("#peType").addEventListener("change", checkPostChanged);
    document.querySelector("#peCategory").addEventListener("change", checkPostChanged);


    aiBtn.addEventListener("click", (e) => {
        const url = document.querySelector("#newsUrl").value.trim();
        if (!url) {
            alert("뉴스 원문 URL을 입력해주세요.");
            return;
        }

        const aiBox = document.querySelector("#aiBox");

        document.querySelector("#newsTitle").value = aiNews.title;
        document.querySelector("#newsContent").value = aiNews.summary;
        document.querySelector("#newsSource").value = url;
        document.querySelector("#aiSummaryPreview").textContent = aiNews.summary;

        previewTitle.textContent = aiNews.title;
        previewContent.textContent = aiNews.summary;
        previewSource.textContent = aiNews.source;

        aiBox.classList.add("show");
        aiBtn.textContent = "AI 요약 적용 완료";
    });


    newsSubmitBtn.addEventListener("click", (e) => {
        const title = document.querySelector("#newsTitle").value.trim();
        const content = document.querySelector("#newsContent").value.trim();
        if (!title || !content) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        let result = confirm("뉴스를 등록하시겠습니까?");
        if (!result) return;

        // ═══ [n8n 연동용] 실제 DB 등록 fetch ═══
        // 백엔드 NewsAPIController POST /api/news 엔드포인트 활성화 후 주석 해제
        // const category = document.querySelector("#newsCategory").value;
        // const sourceUrl = document.querySelector("#newsSource").value.trim();
        //
        // fetch("/api/news", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({
        //         newsTitle: title,
        //         newsContent: content,
        //         newsSourceUrl: sourceUrl,
        //         newsCategory: category,
        //         newsType: "general"   // 속보일 경우 "emergency"
        //     })
        // }).then(res => {
        //     if (!res.ok) throw new Error("등록 실패");
        //     alert("뉴스가 등록되었습니다.");
        // }).catch(err => {
        //     alert("뉴스 등록에 실패했습니다: " + err.message);
        // });

        alert("뉴스가 등록되었습니다.");

        document.querySelector("#newsUrl").value = "";
        document.querySelector("#newsTitle").value = "";
        document.querySelector("#newsContent").value = "";
        document.querySelector("#newsSource").value = "";
        document.querySelector("#aiSummaryPreview").textContent = "";
        document.querySelector("#aiBox").classList.remove("show");
        aiBtn.textContent = "AI 요약 적용";

        pages.forEach((page) => {
            page.classList.remove("active");
        });
        portals.forEach((eachPortal) => {
            eachPortal.classList.remove("active");
        });
        portals[2].classList.add("active");
        pages[2].classList.add("active");
    });


    document.querySelector("#reportMemberCheckAll").addEventListener("change", (e) => {
        reportMemberTbody.querySelectorAll("input[type='checkbox']").forEach((cb) => {
            cb.checked = e.target.checked;
        });
    });

    reportMemberDoneBtn.addEventListener("click", (e) => {
        const checked = getCheckedRows(reportMemberTbody);
        if (!checked.length) {
            alert("선택된 항목이 없습니다.");
            return;
        }
        if (!confirm(`선택한 ${checked.length}개의 신고를 승인 처리하시겠습니까?`)) return;
        alert("승인 처리되었습니다.");
    });

    reportMemberRejectBtn.addEventListener("click", (e) => {
        const checked = getCheckedRows(reportMemberTbody);
        if (!checked.length) {
            alert("선택된 항목이 없습니다.");
            return;
        }
        if (!confirm(`선택한 ${checked.length}개의 신고를 반려 처리하시겠습니까?`)) return;
        alert("반려 처리되었습니다.");
    });

    reportMemberDeleteBtn.addEventListener("click", (e) => {
        const checked = getCheckedRows(reportMemberTbody);
        if (!checked.length) {
            alert("선택된 항목이 없습니다.");
            return;
        }
        if (!confirm(`선택한 ${checked.length}개의 신고를 삭제하시겠습니까?`)) return;
        checked.forEach(tr => tr.remove());
    });

    const applyReportMemberFilter = runAdminSearch(loadReportMembers);
    filterReportMember.addEventListener("change", applyReportMemberFilter);
    reportMemberSearchBtn.addEventListener("click", applyReportMemberFilter);
    reportMemberSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            applyReportMemberFilter();
        }
    });

    document.querySelector("#reportPostCheckAll").addEventListener("change", (e) => {
        reportPostTbody.querySelectorAll("input[type='checkbox']").forEach((cb) => {
            cb.checked = e.target.checked;
        });
    });

    reportPostDoneBtn.addEventListener("click", (e) => {
        const checked = getCheckedRows(reportPostTbody);
        if (!checked.length) {
            alert("선택된 항목이 없습니다.");
            return;
        }
        if (!confirm(`선택한 ${checked.length}개의 신고를 승인 처리하시겠습니까?`)) return;
        alert("승인 처리되었습니다.");
    });

    reportPostRejectBtn.addEventListener("click", (e) => {
        const checked = getCheckedRows(reportPostTbody);
        if (!checked.length) {
            alert("선택된 항목이 없습니다.");
            return;
        }
        if (!confirm(`선택한 ${checked.length}개의 신고를 반려 처리하시겠습니까?`)) return;
        alert("반려 처리되었습니다.");
    });

    reportPostDeleteBtn.addEventListener("click", (e) => {
        const checked = getCheckedRows(reportPostTbody);
        if (!checked.length) {
            alert("선택된 항목이 없습니다.");
            return;
        }
        if (!confirm(`선택한 ${checked.length}개의 신고를 삭제하시겠습니까?`)) return;
        checked.forEach(tr => tr.remove());
    });

    const applyReportPostFilter = runAdminSearch(loadReportPosts);
    filterReportPost.addEventListener("change", applyReportPostFilter);
    reportPostSearchBtn.addEventListener("click", applyReportPostFilter);
    reportPostSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            applyReportPostFilter();
        }
    });


    reportMemberTbody.addEventListener("click", (e) => {
        if (e.target.type === "checkbox") return;
        const tr = e.target.closest(".div-tr");
        if (!tr || tr.classList.contains("empty-row")) return;

        const reportId = Number(tr.dataset.reportId);
        const report = state.reportMembers.find((item) => item.id === reportId);
        if (!report) return;

        document.querySelector("#modalReportTitle").textContent = "회원 신고 상세";
        document.querySelector("#reportReporter").textContent = report.reporterName || "-";
        document.querySelector("#reportDate").textContent = report.createdDatetime || "-";
        document.querySelector("#reportTargetLabel").textContent = "피신고자";
        document.querySelector("#reportTarget").textContent = report.targetName || "-";
        document.querySelector("#reportReason").textContent = report.reason || "-";
        document.querySelector("#reportStatusBadge").innerHTML = getBadgeMarkup(report.status, reportStatusBadgeMap, "badge-pending");

        modalReportDetail.classList.remove("off");
    });

    reportPostTbody.addEventListener("click", (e) => {
        if (e.target.type === "checkbox") return;
        const tr = e.target.closest(".div-tr");
        if (!tr || tr.classList.contains("empty-row")) return;

        const reportId = Number(tr.dataset.reportId);
        const report = state.reportPosts.find((item) => item.id === reportId);
        if (!report) return;

        document.querySelector("#modalReportTitle").textContent = "글 신고 상세";
        document.querySelector("#reportReporter").textContent = report.reporterName || "-";
        document.querySelector("#reportDate").textContent = report.createdDatetime || "-";
        document.querySelector("#reportTargetLabel").textContent = "신고 게시물";
        document.querySelector("#reportTarget").textContent = report.targetName || "-";
        document.querySelector("#reportReason").textContent = report.reason || "-";
        document.querySelector("#reportStatusBadge").innerHTML = getBadgeMarkup(report.status, reportStatusBadgeMap, "badge-pending");

        modalReportDetail.classList.remove("off");
    });

    document.querySelector("#modalReportClose").addEventListener("click", (e) => {
        modalReportDetail.classList.add("off");
    });

    document.querySelector("#modalReportCancel").addEventListener("click", (e) => {
        modalReportDetail.classList.add("off");
    });

    modalReportDetail.addEventListener("click", (e) => {
        if (e.target === modalReportDetail) {
            modalReportDetail.classList.add("off");
        }
    });

    document.querySelector("#postAttachImages").addEventListener("click", (e) => {
        const thumb = e.target.closest(".report-attach-thumb");
        if (!thumb) return;
        document.querySelector("#imgViewerImg").src = thumb.src;
        modalImageViewer.classList.remove("off");
    });

    document.querySelector("#postVideoThumb").addEventListener("click", (e) => {
        modalVideoViewer.classList.remove("off");
    });

    document.querySelector("#videoViewerClose").addEventListener("click", (e) => {
        document.querySelector("#videoViewerVideo").pause();
        modalVideoViewer.classList.add("off");
    });

    modalVideoViewer.addEventListener("click", (e) => {
        if (e.target === modalVideoViewer) {
            document.querySelector("#videoViewerVideo").pause();
            modalVideoViewer.classList.add("off");
        }
    });

    document.querySelector("#reportImages").addEventListener("click", (e) => {
        const thumb = e.target.closest(".report-attach-thumb");
        if (!thumb) return;
        document.querySelector("#imgViewerImg").src = thumb.src;
        modalImageViewer.classList.remove("off");
    });

    document.querySelector("#imgViewerClose").addEventListener("click", (e) => {
        modalImageViewer.classList.add("off");
    });

    modalImageViewer.addEventListener("click", (e) => {
        if (e.target === modalImageViewer) {
            modalImageViewer.classList.add("off");
        }
    });


    newsSettingsBtn.addEventListener("click", (e) => {
        modalNewsAutoSettings.classList.remove("off");
    });

    document.querySelector("#modalNewsSettingsClose").addEventListener("click", (e) => {
        modalNewsAutoSettings.classList.add("off");
    });

    document.querySelector("#modalNewsSettingsCancel").addEventListener("click", (e) => {
        modalNewsAutoSettings.classList.add("off");
    });

    modalNewsAutoSettings.addEventListener("click", (e) => {
        if (e.target === modalNewsAutoSettings) {
            modalNewsAutoSettings.classList.add("off");
        }
    });

    document.querySelector("#modalNewsSettingsSave").addEventListener("click", (e) => {
        const isOn = document.querySelector("#autoRegToggle").checked;
        const ampm = document.querySelector("#autoRegAmPm").value;
        const hour = document.querySelector("#autoRegHour").value;
        const minute = document.querySelector("#autoRegMinute").value;
        const resultTime = `${ampm} ${hour}:${minute}`;
        const result = confirm("자동 뉴스 등록 설정을 저장하시겠습니까?");
        if (!result) return;
        alert(isOn ? `${resultTime} 자동 뉴스 등록이 활성화되었습니다.` : "자동 뉴스 등록이 비활성화되었습니다.");
        modalNewsAutoSettings.classList.add("off");
    });



    document.querySelector("#newsTitle").addEventListener("input", (e) => {
        previewTitle.textContent = e.target.value || "제목이 여기에 표시됩니다.";
    });

    document.querySelector("#newsCategory").addEventListener("change", (e) => {
        previewCategory.textContent = e.target.value;
    });

    document.querySelector("#newsContent").addEventListener("input", (e) => {
        previewContent.textContent = e.target.value || "내용이 여기에 표시됩니다.";
    });

    document.querySelector("#newsSource").addEventListener("input", (e) => {
        previewSource.textContent = e.target.value || "출처";
    });


    setAdminFilterOptions();
    runAdminSearch(loadMembers)();
    runAdminSearch(loadPosts)();
    runAdminSearch(loadReportMembers)();
    runAdminSearch(loadReportPosts)();

    google.charts.load('current', {packages: ['corechart']});

    let chartsDrawn = false;

    function getLast7Days() {
        const result = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            result.push(`${month}-${day}`);
        }
        return result;
    }

    function getLast30Days() {
        const result = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            result.push(`${month}-${day}`);
        }
        return result;
    }

    function get24Hours() {
        const result = [];
        for (let i = 0; i < 24; i++) result.push(i);
        return result;
    }

    function getLastMonths(n = 6) {
        const months = [];
        const now = new Date();

        for (let i = n - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');

            months.push(`${year}-${month}`);
        }

        return months;
    }

    const chartFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

    function drawMemberTrend() {
        let rows;
        if (trendPeriod === '7d') {
            const d = getLast7Days();
            rows = [[d[0], 4, 1], [d[1], 6, 3], [d[2], 5, 2], [d[3], 3, 0], [d[4], 7, 2], [d[5], 9, 1], [d[6], 8, 0]];
        } else if (trendPeriod === '30d') {
            const d = getLast30Days();
            const g = [3, 5, 4, 3, 6, 4, 2, 5, 3, 4, 5, 3, 4, 2, 5, 6, 3, 4, 5, 3, 6, 4, 3, 5, 4, 2, 3, 5, 7, 8];
            const t = [1, 2, 2, 1, 3, 2, 1, 2, 1, 2, 3, 1, 2, 1, 2, 3, 1, 2, 2, 1, 3, 2, 1, 2, 2, 1, 1, 2, 1, 0];
            rows = d.map((day, i) => [day, g[i], t[i]]);
        } else {
            const m = getLastMonths(6);
            rows = [[m[0], 98, 25], [m[1], 110, 37], [m[2], 88, 15], [m[3], 92, 19], [m[4], 115, 42], [m[5], 88, 78]];
        }
        const data = google.visualization.arrayToDataTable([["Period", "Joined", "Dropped"]].concat(rows));
        const options = {
            colors: ['#1d9bf0', '#cfd9de'],
            vAxis: {minValue: 0, format: '0', textStyle: {fontSize: 11, color: '#536471'}},
            hAxis: {textStyle: {fontSize: 11, color: '#536471'}},
            legend: {position: 'top', textStyle: {fontSize: 12, color: '#0f1419'}},
            bar: {groupWidth: '65%'},
            chartArea: {left: 55, right: 20, top: 40, bottom: 40},
            backgroundColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.ColumnChart(document.getElementById('chart-member-trend')).draw(data, options);
    }

    function drawMemberType() {
        const data = google.visualization.arrayToDataTable([
            ["Role", "Members"],
            ["business", 1420],
            ["pro", 480],
            ["admin", 180],
            ["expert", 80],
        ]);
        const options = {
            pieHole: 0.4,
            colors: ['#cfd9de', '#536471', '#0f1419', '#1d9bf0'],
            legend: {position: 'bottom', textStyle: {fontSize: 12, color: '#0f1419'}},
            chartArea: {top: 20, bottom: 50, left: 20, right: 20},
            backgroundColor: 'transparent',
            pieSliceBorderColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.PieChart(document.getElementById('chart-member-type')).draw(data, options);
    }

    function drawHourly() {
        const h = get24Hours();
        const c7d = [8, 5, 3, 2, 4, 10, 38, 105, 210, 360, 400, 375, 340, 395, 425, 450, 415, 470, 510, 480, 435, 375, 270, 110];
        const c30d = [12, 8, 5, 4, 6, 15, 45, 120, 230, 380, 420, 390, 350, 410, 440, 460, 430, 480, 520, 490, 440, 380, 280, 120];
        const c6m = [15, 10, 7, 5, 8, 18, 50, 130, 245, 385, 425, 395, 355, 415, 445, 465, 435, 485, 525, 495, 445, 385, 285, 125];
        const counts = hourlyPeriod === '7d' ? c7d : hourlyPeriod === '30d' ? c30d : c6m;
        const rows = [["Hour", "Visits"]].concat(h.map((hour, i) => [hour, counts[i]]));
        const data = google.visualization.arrayToDataTable(rows);
        const options = {
            colors: ['#1d9bf0'],
            hAxis: {
                title: "Hour", minValue: 0, maxValue: 23,
                ticks: [0, 3, 6, 9, 12, 15, 18, 21, 23],
                textStyle: {fontSize: 11, color: '#536471'},
                titleTextStyle: {fontSize: 12, color: '#536471', italic: false},
            },
            vAxis: {
                title: "Visits",
                textStyle: {fontSize: 11, color: '#536471'},
                titleTextStyle: {fontSize: 12, color: '#536471', italic: false},
            },
            legend: {position: 'none'},
            pointSize: 6,
            chartArea: {left: 65, right: 20, top: 20, bottom: 50},
            backgroundColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.ScatterChart(document.getElementById('chart-hourly')).draw(data, options);
    }

    function drawPostMonthly() {
        let rows;
        if (postMonthlyPeriod === '7d') {
            const d = getLast7Days();
            const v = [5, 8, 4, 12, 9, 7, 6];
            rows = d.map((day, i) => [day, v[i]]);
        } else if (postMonthlyPeriod === '30d') {
            const d = getLast30Days();
            const v = [4, 7, 5, 9, 6, 8, 4, 3, 11, 8, 7, 6, 9, 5, 8, 10, 7, 6, 4, 8, 9, 5, 7, 6, 8, 4, 9, 6, 5, 6];
            rows = d.map((day, i) => [day, v[i]]);
        } else {
            const m = getLastMonths(6);
            rows = [[m[0], 198], [m[1], 225], [m[2], 180], [m[3], 195], [m[4], 260], [m[5], 178]];
        }
        const data = google.visualization.arrayToDataTable([["Period", "Posts"]].concat(rows));
        const options = {
            colors: ['#0f1419'],
            legend: {position: 'none'},
            bar: {groupWidth: '65%'},
            vAxis: {minValue: 0, textStyle: {fontSize: 11, color: '#536471'}},
            hAxis: {textStyle: {fontSize: 11, color: '#536471'}},
            chartArea: {left: 55, right: 20, top: 20, bottom: 50},
            backgroundColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.ColumnChart(document.getElementById('chart-post-monthly')).draw(data, options);
    }

    function drawPostCategory() {
        let rows;
        if (postCategoryPeriod === '7d') {
            rows = [["Electronics", 12, "#0f1419"], ["Parts", 9, "#536471"], ["Materials", 6, "#536471"], ["Machines", 5, "#536471"], ["Chemicals", 3, "#536471"], ["Food", 3, "#536471"], ["Other", 13, "#cfd9de"]];
        } else if (postCategoryPeriod === '30d') {
            rows = [["Electronics", 52, "#0f1419"], ["Parts", 38, "#536471"], ["Materials", 25, "#536471"], ["Machines", 22, "#536471"], ["Chemicals", 16, "#536471"], ["Food", 12, "#536471"], ["Other", 36, "#cfd9de"]];
        } else {
            rows = [["Electronics", 320, "#0f1419"], ["Parts", 245, "#536471"], ["Materials", 158, "#536471"], ["Machines", 138, "#536471"], ["Chemicals", 100, "#536471"], ["Food", 76, "#536471"], ["Other", 149, "#cfd9de"]];
        }
        const data = google.visualization.arrayToDataTable([["Category", "Posts", {role: "style"}]].concat(rows));
        const options = {
            legend: {position: 'none'},
            bar: {groupWidth: '60%'},
            vAxis: {minValue: 0, textStyle: {fontSize: 11, color: '#536471'}},
            hAxis: {textStyle: {fontSize: 12, color: '#0f1419'}},
            chartArea: {left: 55, right: 20, top: 20, bottom: 50},
            backgroundColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.ColumnChart(document.getElementById('chart-post-category')).draw(data, options);
    }

    function drawReportMonthly() {
        let rows;
        if (reportMonthlyPeriod === '7d') {
            const d = getLast7Days();
            const v = [0, 1, 2, 0, 1, 1, 0];
            rows = d.map((day, i) => [day, v[i]]);
        } else if (reportMonthlyPeriod === '30d') {
            const d = getLast30Days();
            const v = [0, 1, 0, 2, 1, 0, 0, 1, 0, 2, 1, 0, 1, 0, 1, 2, 0, 1, 0, 0, 1, 2, 0, 1, 0, 0, 1, 0, 1, 0];
            rows = d.map((day, i) => [day, v[i]]);
        } else {
            const m = getLastMonths(6);
            rows = [[m[0], 9], [m[1], 18], [m[2], 14], [m[3], 10], [m[4], 20], [m[5], 13]];
        }
        const data = google.visualization.arrayToDataTable([["Period", "Reports"]].concat(rows));
        const options = {
            colors: ['#536471'],
            legend: {position: 'none'},
            bar: {groupWidth: '65%'},
            vAxis: {minValue: 0, textStyle: {fontSize: 11, color: '#536471'}},
            hAxis: {textStyle: {fontSize: 11, color: '#536471'}},
            chartArea: {left: 45, right: 20, top: 20, bottom: 50},
            backgroundColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.ColumnChart(document.getElementById('chart-report-monthly')).draw(data, options);
    }

    function drawReportStatus() {
        const data = google.visualization.arrayToDataTable([
            ["Status", "Count"],
            ["Pending", 15],
            ["Applied", 42],
            ["Rejected", 18],
        ]);
        const options = {
            pieHole: 0.4,
            colors: ['#cfd9de', '#0f1419', '#536471'],
            legend: {position: 'bottom', textStyle: {fontSize: 12, color: '#0f1419'}},
            chartArea: {top: 20, bottom: 50, left: 20, right: 20},
            backgroundColor: 'transparent',
            pieSliceBorderColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.PieChart(document.getElementById('chart-report-status')).draw(data, options);
    }

    function drawReportMemberType() {
        const data = google.visualization.arrayToDataTable([
            ["Type", "Count"],
            ["Abuse", 28],
            ["Fraud", 18],
            ["False Info", 15],
            ["Spam", 8],
            ["Other", 6],
        ]);
        const donutOptions = {
            pieHole: 0.4,
            colors: ['#0f1419', '#536471', '#cfd9de', '#1d9bf0', '#eff3f4'],
            legend: {position: 'bottom', textStyle: {fontSize: 12, color: '#0f1419'}},
            chartArea: {top: 20, bottom: 50, left: 20, right: 20},
            backgroundColor: 'transparent',
            pieSliceBorderColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.PieChart(document.getElementById('chart-report-member-type')).draw(data, donutOptions);
    }

    function drawReportPostType() {
        const data = google.visualization.arrayToDataTable([
            ["Type", "Count"],
            ["Fake Sale", 32],
            ["Spam", 20],
            ["Harassment", 12],
            ["Hate Speech", 8],
            ["Other", 6],
        ]);
        const donutOptions = {
            pieHole: 0.4,
            colors: ['#0f1419', '#536471', '#cfd9de', '#1d9bf0', '#eff3f4'],
            legend: {position: 'bottom', textStyle: {fontSize: 12, color: '#0f1419'}},
            chartArea: {top: 20, bottom: 50, left: 20, right: 20},
            backgroundColor: 'transparent',
            pieSliceBorderColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.PieChart(document.getElementById('chart-report-post-type')).draw(data, donutOptions);
    }

    const drawnPortals = new Set();

    let trendPeriod = '6m';
    let hourlyPeriod = '30d';
    let postMonthlyPeriod = '6m';
    let postCategoryPeriod = '6m';
    let reportMonthlyPeriod = '6m';

    portals[6].addEventListener("click", (e) => {
        if (drawnPortals.has(6)) return;
        drawnPortals.add(6);
        google.charts.setOnLoadCallback(() => {
            drawMemberTrend();
            drawMemberType();
            drawHourly();
        });
    });

    portals[7].addEventListener("click", (e) => {
        if (drawnPortals.has(7)) return;
        drawnPortals.add(7);
        google.charts.setOnLoadCallback(() => {
            drawPostMonthly();
            drawPostCategory();
        });
    });

    portals[8].addEventListener("click", (e) => {
        if (drawnPortals.has(8)) return;
        drawnPortals.add(8);
        google.charts.setOnLoadCallback(() => {
            drawReportMonthly();
            drawReportStatus();
            drawReportMemberType();
            drawReportPostType();
        });
    });

    function bindFilter(id, setFn, drawFn) {
        document.querySelectorAll(`#${id} .stats-filter-btn`).forEach(btn => {
            btn.addEventListener("click", (e) => {
                document.querySelectorAll(`#${id} .stats-filter-btn`).forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                setFn(btn.dataset.period);
                drawFn();
            });
        });
    }

    bindFilter("filterTrend", p => {
        trendPeriod = p;
    }, () => {
        if (drawnPortals.has(6)) drawMemberTrend();
    });
    bindFilter("filterHourly", p => {
        hourlyPeriod = p;
    }, () => {
        if (drawnPortals.has(6)) drawHourly();
    });
    bindFilter("filterPostMonthly", p => {
        postMonthlyPeriod = p;
    }, () => {
        if (drawnPortals.has(7)) drawPostMonthly();
    });
    bindFilter("filterPostCategory", p => {
        postCategoryPeriod = p;
    }, () => {
        if (drawnPortals.has(7)) drawPostCategory();
    });
    bindFilter("filterReportMonthly", p => {
        reportMonthlyPeriod = p;
    }, () => {
        if (drawnPortals.has(8)) drawReportMonthly();
    });

    let adminStatsDashboard = null;

    const chartPalette = ['#0f1419', '#536471', '#cfd9de', '#1d9bf0', '#eff3f4', '#8ecdf8', '#7a8b95'];

    const getSeriesRows = (map, period, useSecondary = false) =>
        (map?.[period] ?? []).map((point) => [
            point.label,
            useSecondary ? (point.secondaryValue ?? 0) : (point.value ?? 0),
        ]);

    const redrawLoadedCharts = () => {
        if (drawnPortals.has(6)) {
            drawMemberTrend();
            drawMemberType();
            drawHourly();
        }
        if (drawnPortals.has(7)) {
            drawPostMonthly();
            drawPostCategory();
        }
        if (drawnPortals.has(8)) {
            drawReportMonthly();
            drawReportStatus();
            drawReportMemberType();
            drawReportPostType();
        }
    };

    const loadAdminStatsDashboard = async () => {
        try {
            adminStatsDashboard = await fetchJson("/api/admin/stats/dashboard");
            redrawLoadedCharts();
        } catch (error) {
            console.error(error);
        }
    };

    function drawMemberTrend() {
        const joinedRows = getSeriesRows(adminStatsDashboard?.memberTrend, trendPeriod);
        const droppedRows = getSeriesRows(adminStatsDashboard?.memberTrend, trendPeriod, true);
        const rows = joinedRows.map((row, index) => [row[0], row[1], droppedRows[index]?.[1] ?? 0]);
        const data = google.visualization.arrayToDataTable([["Period", "Joined", "Dropped"]].concat(rows));
        const options = {
            colors: ['#1d9bf0', '#cfd9de'],
            vAxis: {minValue: 0, format: '0', textStyle: {fontSize: 11, color: '#536471'}},
            hAxis: {textStyle: {fontSize: 11, color: '#536471'}},
            legend: {position: 'top', textStyle: {fontSize: 12, color: '#0f1419'}},
            bar: {groupWidth: '65%'},
            chartArea: {left: 50, right: 24, top: 36, bottom: 42},
            backgroundColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.ColumnChart(document.getElementById('chart-member-trend')).draw(data, options);
    }

    function drawMemberType() {
        const rows = (adminStatsDashboard?.memberTypes ?? []).map((point) => [point.label, point.value ?? 0]);
        const data = google.visualization.arrayToDataTable([["Role", "Members"]].concat(rows));
        const options = {
            pieHole: 0.4,
            colors: ['#cfd9de', '#536471', '#0f1419', '#1d9bf0'],
            legend: {position: 'bottom', textStyle: {fontSize: 12, color: '#0f1419'}},
            chartArea: {top: 20, bottom: 50, left: 20, right: 20},
            backgroundColor: 'transparent',
            pieSliceBorderColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.PieChart(document.getElementById('chart-member-type')).draw(data, options);
    }

    function drawHourly() {
        const rows = [["Hour", "Visits"]].concat(getSeriesRows(adminStatsDashboard?.hourlyVisits, hourlyPeriod));
        const data = google.visualization.arrayToDataTable(rows);
        const options = {
            colors: ['#1d9bf0'],
            hAxis: {
                title: "Hour", minValue: 0, maxValue: 23,
                ticks: [0, 3, 6, 9, 12, 15, 18, 21, 23],
                textStyle: {fontSize: 11, color: '#536471'},
                titleTextStyle: {fontSize: 12, color: '#536471', italic: false},
            },
            vAxis: {
                title: "Visits",
                textStyle: {fontSize: 11, color: '#536471'},
                titleTextStyle: {fontSize: 12, color: '#536471', italic: false},
                minValue: 0,
            },
            legend: {position: 'none'},
            pointSize: 6,
            chartArea: {left: 55, right: 20, top: 20, bottom: 45},
            backgroundColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.ScatterChart(document.getElementById('chart-hourly')).draw(data, options);
    }

    function drawPostMonthly() {
        const rows = getSeriesRows(adminStatsDashboard?.postMonthly, postMonthlyPeriod);
        const data = google.visualization.arrayToDataTable([["Period", "Posts"]].concat(rows));
        const options = {
            colors: ['#0f1419'],
            legend: {position: 'none'},
            bar: {groupWidth: '65%'},
            vAxis: {minValue: 0, textStyle: {fontSize: 11, color: '#536471'}},
            hAxis: {textStyle: {fontSize: 11, color: '#536471'}},
            chartArea: {left: 50, right: 24, top: 20, bottom: 42},
            backgroundColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.ColumnChart(document.getElementById('chart-post-monthly')).draw(data, options);
    }

    function drawPostCategory() {
        const rows = (adminStatsDashboard?.postCategories?.[postCategoryPeriod] ?? []).map((point, index) => [
            point.label,
            point.value ?? 0,
            chartPalette[index % chartPalette.length],
        ]);
        const data = google.visualization.arrayToDataTable([["Category", "Posts", {role: "style"}]].concat(rows));
        const options = {
            legend: {position: 'none'},
            bar: {groupWidth: '60%'},
            vAxis: {minValue: 0, textStyle: {fontSize: 11, color: '#536471'}},
            hAxis: {textStyle: {fontSize: 12, color: '#0f1419'}},
            chartArea: {left: 55, right: 20, top: 20, bottom: 50},
            backgroundColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.ColumnChart(document.getElementById('chart-post-category')).draw(data, options);
    }

    function drawReportMonthly() {
        const rows = getSeriesRows(adminStatsDashboard?.reportMonthly, reportMonthlyPeriod);
        const data = google.visualization.arrayToDataTable([["Period", "Reports"]].concat(rows));
        const options = {
            colors: ['#536471'],
            legend: {position: 'none'},
            bar: {groupWidth: '65%'},
            vAxis: {minValue: 0, textStyle: {fontSize: 11, color: '#536471'}},
            hAxis: {textStyle: {fontSize: 11, color: '#536471'}},
            chartArea: {left: 50, right: 24, top: 20, bottom: 42},
            backgroundColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.ColumnChart(document.getElementById('chart-report-monthly')).draw(data, options);
    }

    function drawReportStatus() {
        const rows = (adminStatsDashboard?.reportStatuses ?? []).map((point) => [point.label, point.value ?? 0]);
        const data = google.visualization.arrayToDataTable([["Status", "Count"]].concat(rows));
        const options = {
            pieHole: 0.4,
            colors: ['#cfd9de', '#0f1419', '#536471'],
            legend: {position: 'bottom', textStyle: {fontSize: 12, color: '#0f1419'}},
            chartArea: {top: 20, bottom: 50, left: 20, right: 20},
            backgroundColor: 'transparent',
            pieSliceBorderColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.PieChart(document.getElementById('chart-report-status')).draw(data, options);
    }

    function drawReportMemberType() {
        const rows = (adminStatsDashboard?.reportMemberTypes ?? []).map((point) => [point.label, point.value ?? 0]);
        const data = google.visualization.arrayToDataTable([["Type", "Count"]].concat(rows));
        const options = {
            pieHole: 0.4,
            colors: ['#0f1419', '#536471', '#cfd9de', '#1d9bf0', '#eff3f4'],
            legend: {position: 'bottom', textStyle: {fontSize: 12, color: '#0f1419'}},
            chartArea: {top: 20, bottom: 50, left: 20, right: 20},
            backgroundColor: 'transparent',
            pieSliceBorderColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.PieChart(document.getElementById('chart-report-member-type')).draw(data, options);
    }

    function drawReportPostType() {
        const rows = (adminStatsDashboard?.reportPostTypes ?? []).map((point) => [point.label, point.value ?? 0]);
        const data = google.visualization.arrayToDataTable([["Type", "Count"]].concat(rows));
        const options = {
            pieHole: 0.4,
            colors: ['#0f1419', '#536471', '#cfd9de', '#1d9bf0', '#eff3f4'],
            legend: {position: 'bottom', textStyle: {fontSize: 12, color: '#0f1419'}},
            chartArea: {top: 20, bottom: 50, left: 20, right: 20},
            backgroundColor: 'transparent',
            pieSliceBorderColor: 'transparent',
            fontName: chartFont,
        };
        new google.visualization.PieChart(document.getElementById('chart-report-post-type')).draw(data, options);
    }

    loadAdminStatsDashboard();


};
