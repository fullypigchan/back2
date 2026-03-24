window.onload = () => {
    // 1. 탭 요소
    const tabProducts = document.getElementById("tabProducts");
    const tabTrending = document.getElementById("tabTrending");
    const tabNews = document.getElementById("tabNews");

    // 2. 섹션 요소
    const productsSection = document.getElementById("productsSection");
    const trendingSection = document.getElementById("trendingSection");
    const newsSection = document.getElementById("newsSection");

    // 3. 무한 스크롤 상태 관리
    const scrollState = {
        page: 1,
        isLoading: false,
        hasMore: true,
    };

    // 4. 추가 로드 시 카드 append (첫 로드는 showPostList로 교체)
    function appendPostList(productsPagingDTO) {
        const posts = productsPagingDTO.posts;
        if (!posts || posts.length === 0) return;

        posts.forEach(post => {
            const firstImage = post.postFiles?.[0] ?? "/images/main/global-gates-logo.png";
            const hashtags = (post.hashtags ?? [])
                .map(tag => `<span class="Category-Tag">#${tag.hashtag ?? tag}</span>`)
                .join("");

            const card = document.createElement("div");
            card.className = "Post-Card";
            card.dataset.postId = post.id;
            card.innerHTML = `
                <div class="Post-Body">
                    <div class="Post-Header">
                        <div class="Post-Avatar-Wrapper">
                            <div class="Post-Avatar">판</div>
                        </div>
                        <div class="Post-Identity">
                            <strong class="Post-Name">판매자명</strong>
                            <div>
                                <span class="Post-Handle">@seller</span>
                                <span class="Post-Time">${post.createdDatetime}</span>
                            </div>
                        </div>
                    </div>
                    <strong class="Post-Title">${post.postTitle ?? ""}</strong>
                    <span class="Post-Category">상품번호: ${post.id ?? ""}</span>
                    <div class="Post-Product-Info">
                        <div class="Post-Product-Image">
                            <img class="Post-Media-Img" src="${firstImage}" alt="${post.postTitle ?? "상품 이미지"}">
                        </div>
                        <div class="Post-Product-Detail">
                            <div class="Detail-Category-Tags">${hashtags}</div>
                            <span name="stock" class="Detail-Value">수량: ${post.productStock ?? 0}</span>
                            <span name="price" class="Detail-Value">가격: ${Number(post.productPrice ?? 0).toLocaleString()}원</span>
                        </div>
                    </div>
                    <p class="Post-Text">${post.postContent ?? ""}</p>
                    <div class="Post-Metrics">
                        <div class="Post-Action-Bar">
                            <button class="Post-Action-Btn Like" aria-label="좋아요">
                                <svg viewBox="0 0 24 24" aria-hidden="true" class="Post-Action-Icon">
                                    <g><path
                                        d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
                                        data-path-inactive="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
                                        data-path-active="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z">
                                    </path></g>
                                </svg>
                                <span class="Post-Action-Count">0</span>
                            </button>
                            <button class="Post-Action-Btn" aria-label="조회수">
                                <svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true">
                                    <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/>
                                </svg>
                                <span class="Post-Action-Count">0</span>
                            </button>
                            <div class="Post-Action-Right">
                                <button class="Post-Action-Btn Bookmark" aria-label="북마크">
                                    <svg viewBox="0 0 24 24" aria-hidden="true" class="Post-Action-Icon">
                                        <g><path
                                            d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"
                                            data-path-inactive="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"
                                            data-path-active="M4 4.5C4 3.12 5.119 2 20 4.5v18.44l-8-5.71-8 5.71V4.5z">
                                        </path></g>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            productsSection.appendChild(card);
        });
    }

    // 5. 추천 상품 로드 함수
    async function loadProducts(isFirst = false) {
        if (scrollState.isLoading || !scrollState.hasMore) return;

        scrollState.isLoading = true;

        try {
            const criteria = await exploreService.getRecommends(scrollState.page, (data) => {
                if (isFirst) {
                    exploreLayout.showPostList(data);   // 첫 로드: 섹션 초기화 후 렌더
                } else {
                    appendPostList(data);               // 추가 로드: 카드만 append
                }
            });

            scrollState.hasMore = criteria.hasMore;
            scrollState.page++;

        } catch (e) {
            console.error("상품 로드 실패:", e);
        } finally {
            scrollState.isLoading = false;
        }
    }

    // 6. 무한 스크롤 Observer 등록
    function setupInfiniteScroll() {
        const sentinel = document.createElement("div");
        sentinel.id = "scrollSentinel";
        productsSection.appendChild(sentinel);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadProducts(false);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(sentinel);
    }

    // 7. 탭 전환 함수
    if (tabProducts && tabTrending && tabNews && productsSection && trendingSection && newsSection) {

        function showProductsTab() {
            tabProducts.classList.add("isActive");
            tabProducts.setAttribute("aria-current", "page");
            tabTrending.classList.remove("isActive");
            tabTrending.removeAttribute("aria-current");
            tabNews.classList.remove("isActive");
            tabNews.removeAttribute("aria-current");
            productsSection.hidden = false;
            trendingSection.hidden = true;
            newsSection.hidden = true;
        }

        function showTrendingTab() {
            tabTrending.classList.add("isActive");
            tabTrending.setAttribute("aria-current", "page");
            tabProducts.classList.remove("isActive");
            tabProducts.removeAttribute("aria-current");
            tabNews.classList.remove("isActive");
            tabNews.removeAttribute("aria-current");
            productsSection.hidden = true;
            trendingSection.hidden = false;
            newsSection.hidden = true;
        }

        function showNewsTab() {
            tabNews.classList.add("isActive");
            tabNews.setAttribute("aria-current", "page");
            tabProducts.classList.remove("isActive");
            tabProducts.removeAttribute("aria-current");
            tabTrending.classList.remove("isActive");
            tabTrending.removeAttribute("aria-current");
            productsSection.hidden = true;
            trendingSection.hidden = true;
            newsSection.hidden = false;
        }

        // 8. 탭 이벤트 바인딩
        tabProducts.addEventListener("click", async () => {
            scrollState.page = 1;
            scrollState.hasMore = true;
            scrollState.isLoading = false;
            await loadProducts(true);
            showProductsTab();
        });

        tabTrending.addEventListener("click", async () => {
            await exploreService.getTrends((data) => {
                exploreLayout.showTrends(data);
            });
            showTrendingTab();
        });

        tabNews.addEventListener("click", async () => {
            await exploreService.getNews((data) => {
                exploreLayout.showNewsList(data);
            });
            showNewsTab();
        });
    }

    // 9. 페이지 최초 진입 시 추천 상품 로드 + 무한 스크롤 등록
    loadProducts(true);
    setupInfiniteScroll();

    // 10. Trending 서브탭
    const trendingSubtabs = document.querySelectorAll("#trendingSubtabs .trending-subtab");
    if (trendingSubtabs.length > 0) {
        trendingSubtabs.forEach((tab) => {
            tab.addEventListener("click", (e) => {
                e.preventDefault();
                trendingSubtabs.forEach((t) => {
                    t.classList.remove("isActive");
                });
                tab.classList.add("isActive");
            });
        });
    }

    // 11. 트렌딩 더보기 메뉴
    const trendReportMenu = document.getElementById("trendReportMenu");

    if (trendReportMenu) {
        let activeBtn = null;

        document.querySelectorAll(".trending-more-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();

                if (activeBtn === btn && !trendReportMenu.hidden) {
                    trendReportMenu.hidden = true;
                    activeBtn = null;
                    return;
                }

                activeBtn = btn;
                const rect = btn.getBoundingClientRect();

                trendReportMenu.style.top = rect.bottom + "px";
                trendReportMenu.style.left = (rect.right - 284) + "px";
                trendReportMenu.hidden = false;

                const menuH = trendReportMenu.offsetHeight;
                if (rect.bottom + menuH > window.innerHeight) {
                    trendReportMenu.style.top = (rect.top - menuH) + "px";
                }
            });
        });

        trendReportMenu.querySelectorAll(".more-menu").forEach((item) => {
            item.addEventListener("click", (e) => {
                if (activeBtn) {
                    const trendingItem = activeBtn.closest(".trending-item");
                    if (trendingItem) {
                        const dismissed = document.createElement("article");
                        dismissed.className = "trend-dismissed";
                        dismissed.setAttribute("role", "article");
                        dismissed.innerHTML =
                            '<div class="trend-dismissed__wrapper">' +
                            '<div class="trend-dismissed__spacer"></div>' +
                            '<div class="trend-dismissed__body">' +
                            '<div class="trend-dismissed__box">' +
                            '<div class="trend-dismissed__text">' +
                            '<span>감사합니다. 이 트렌드를 업데이트하려면 페이지를 새로고침해 주세요.</span>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '</div>';
                        trendingItem.replaceWith(dismissed);
                    }
                }
                trendReportMenu.hidden = true;
                activeBtn = null;
            });
        });

        document.addEventListener("click", (e) => {
            if (!trendReportMenu.hidden && !trendReportMenu.contains(e.target)) {
                trendReportMenu.hidden = true;
                activeBtn = null;
            }
        });

        window.addEventListener("scroll", (e) => {
            if (!trendReportMenu.hidden) {
                trendReportMenu.hidden = true;
                activeBtn = null;
            }
        }, {passive: true});
    }

    // 12. Post-Card 인터랙션 (Like / Bookmark / 이미지 프리뷰)
    (function () {
        function showToast(message, extraClass) {
            const toast = document.createElement("div");
            toast.className = "toast";
            if (extraClass) {
                toast.classList.add(extraClass);
            }
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(function () {
                toast.remove();
            }, 2500);
        }

        function handleLike(btn) {
            const isLiked = btn.classList.contains("liked");
            btn.classList.toggle("liked", !isLiked);
            const path = btn.querySelector("svg path");
            if (path) {
                path.setAttribute("d", isLiked ? path.getAttribute("data-path-inactive") : path.getAttribute("data-path-active"));
            }
            const countEl = btn.querySelector(".Post-Action-Count");
            if (countEl) {
                const cur = parseInt(countEl.textContent.replace(/[^0-9]/g, ""), 10) || 0;
                countEl.textContent = isLiked ? cur - 1 : cur + 1;
            }
            showToast(isLiked ? "좋아요를 취소했습니다." : "좋아요를 눌렀습니다.", "toast--like");
        }

        function handleBookmark(btn) {
            const isBookmarked = btn.classList.contains("bookmarked");
            btn.classList.toggle("bookmarked", !isBookmarked);
            const path = btn.querySelector("svg path");
            if (path) {
                path.setAttribute("d", isBookmarked ? path.getAttribute("data-path-inactive") : path.getAttribute("data-path-active"));
            }
            showToast(isBookmarked ? "북마크가 해제되었습니다." : "북마크에 저장되었습니다.");
        }

        const previewOverlay = document.getElementById("postMediaPreviewOverlay");
        const previewImg = document.getElementById("postMediaPreviewImage");
        const previewClose = document.getElementById("postMediaPreviewClose");

        function openPreview(src, alt) {
            if (!previewOverlay || !src) return;
            previewImg.src = src;
            previewImg.alt = alt || "";
            previewOverlay.classList.remove("off");
            document.body.style.overflow = "hidden";
        }

        function closePreview() {
            if (!previewOverlay) return;
            previewOverlay.classList.add("off");
            previewImg.src = "";
            document.body.style.overflow = "";
        }

        if (previewClose) previewClose.addEventListener("click", () => closePreview());
        if (previewOverlay) {
            previewOverlay.addEventListener("click", (e) => {
                if (e.target === previewOverlay) closePreview();
            });
        }
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && previewOverlay && !previewOverlay.classList.contains("off")) {
                closePreview();
            }
        });

        if (productsSection) {
            productsSection.addEventListener("click", (e) => {
                const likeBtn = e.target.closest(".Post-Action-Btn.Like");
                const bookmarkBtn = e.target.closest(".Post-Action-Btn.Bookmark");
                const mediaImg = e.target.closest(".Post-Media-Img");

                if (likeBtn) { handleLike(likeBtn); return; }
                if (bookmarkBtn) { handleBookmark(bookmarkBtn); return; }
                if (mediaImg) { openPreview(mediaImg.src, mediaImg.alt); return; }
            });
        }
    })();

    // 13. 검색창 포커스 드롭다운 + 최근검색 + 연관검색어 + 검색 이동
    const searchForm     = document.getElementById("searchForm");
    const searchInput    = document.getElementById("searchInput");
    const searchClearBtn = document.getElementById("searchClearBtn");
    const searchPanel    = document.getElementById("searchPanel");
    const searchPanelEmpty  = document.getElementById("searchPanelEmpty");
    const searchRecentSec   = document.getElementById("searchRecentSection");
    const searchResultsEl   = document.getElementById("searchResults");
    const searchResultTopic = document.getElementById("searchResultTopic");
    const searchResultLabel = document.getElementById("searchResultLabel");
    const searchResultList  = document.getElementById("searchResultList");

    let suggestionTimer = null;

    if (searchForm && searchInput && searchPanel) {

        // ── 최근검색 항목 개수 확인 ───────────────────────────
        function hasRecentItems() {
            return searchRecentSec &&
                searchRecentSec.querySelectorAll(".searchResultItem--recent").length > 0;
        }

        // ── 패널 케이스별 표시 ────────────────────────────────
        function showEmpty() {
            if (searchPanelEmpty) searchPanelEmpty.hidden = false;
            if (searchRecentSec)  searchRecentSec.hidden  = true;
            if (searchResultsEl)  searchResultsEl.hidden  = true;
        }

        function showRecent() {
            if (searchPanelEmpty) searchPanelEmpty.hidden = true;
            if (searchRecentSec)  searchRecentSec.hidden  = false;
            if (searchResultsEl)  searchResultsEl.hidden  = true;
        }

        function showResults(val) {
            if (searchResultLabel) searchResultLabel.textContent = `"${val}" 검색`;
            if (searchPanelEmpty)  searchPanelEmpty.hidden = true;
            if (searchRecentSec)   searchRecentSec.hidden  = true;
            if (searchResultsEl)   searchResultsEl.hidden  = false;
        }

        // ── 검색 결과 페이지로 이동 ───────────────────────────
        function goToSearch(keyword) {
            if (!keyword.trim()) return;
            searchForm.classList.remove("isFocused");
            searchPanel.hidden = true;
            location.href = `/explore/search?keyword=${encodeURIComponent(keyword.trim())}`;
        }

        // ── 최근 검색어를 서버에서 받아 렌더링 ───────────────
        function loadRecentKeywords() {
            exploreService.getRecentKeywords((keywords) => {
                exploreLayout.showRecentKeywords(
                    keywords,
                    // 클릭 시 검색 이동
                    (keyword) => goToSearch(keyword),
                    // 삭제 시 서버 요청
                    (id) => exploreService.deleteKeyword(id)
                );
                // 렌더 후 패널 상태 업데이트
                updatePanel();
            });
        }

        // ── 연관 검색어를 서버에서 받아 렌더링 ───────────────
        function loadSuggestions(keyword) {
            exploreService.getSuggestions(keyword, (suggestions) => {
                exploreLayout.showSuggestions(suggestions, (suggestion) => {
                    goToSearch(suggestion);
                });
            });
        }

        // ── clear 버튼 표시 동기화 ────────────────────────────
        function updateSearchClearButton() {
            if (searchClearBtn) {
                searchClearBtn.hidden = searchInput.value.length === 0;
            }
        }

        // ── 패널 상태 통합 업데이트 ───────────────────────────
        function updatePanel() {
            const val = searchInput.value.trim();
            updateSearchClearButton();
            if (val.length > 0) {
                showResults(val);
                clearTimeout(suggestionTimer);
                suggestionTimer = setTimeout(() => {
                    loadSuggestions(val);
                }, 300);
            } else if (hasRecentItems()) {
                showRecent();
            } else {
                showEmpty();
            }
        }

        // ── 이벤트 바인딩 ─────────────────────────────────────
        searchPanel.addEventListener("mousedown", (e) => {
            e.preventDefault();
        });

        searchInput.addEventListener("focus", () => {
            searchForm.classList.add("isFocused");
            searchPanel.hidden = false;
            loadRecentKeywords();
            updatePanel();
        });

        searchInput.addEventListener("input", () => {
            updatePanel();
        });

        if (searchClearBtn) {
            searchClearBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                searchInput.value = "";
                updatePanel();
                searchInput.focus();
            });
        }

        searchInput.addEventListener("blur", () => {
            if (!document.hasFocus()) return;
            searchForm.classList.remove("isFocused");
            searchPanel.hidden = true;
        });

        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                goToSearch(searchInput.value);
            }
            if (e.key === "Escape") {
                searchForm.classList.remove("isFocused");
                searchPanel.hidden = true;
                searchInput.blur();
            }
        });

        if (searchResultTopic) {
            searchResultTopic.addEventListener("click", () => {
                goToSearch(searchInput.value);
            });
        }

        // 모두 지우기
        if (searchRecentSec) {
            const clearAllBtn = searchRecentSec.querySelector(".searchRecentClearAll");
            if (clearAllBtn) {
                clearAllBtn.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    await exploreService.deleteAllKeywords();
                    searchRecentSec
                        .querySelectorAll(".searchResultItem--recent")
                        .forEach(el => el.remove());
                    const header = searchRecentSec.querySelector(".searchRecentHeader");
                    if (header) header.hidden = true;
                    showEmpty();
                });
            }
        }

        updateSearchClearButton();
    }
};