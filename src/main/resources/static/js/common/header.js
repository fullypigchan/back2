// 좌측 글로벌 사이드바 공용 동작.
// 모든 페이지(layout, layout-left-one, main)에서 안전하게 동작하도록 null-guard로 작성한다.
// - 현재 URL 에 맞는 nav-item 에 .active 부여 (x.com 의 selected 탭 효과와 동일한 톤)
// - 더 보기 팝오버(커뮤니티/광고/설정) 토글 — 모든 페이지에서 동일하게 동작
// - 계정 카드 팝업 토글 — 팝업이 없는 페이지에서는 자동으로 비활성

(function () {
    function setActiveNavItem() {
        const path = window.location.pathname;
        const navItems = document.querySelectorAll('.nav-list .nav-item[href]');
        if (!navItems.length) return;

        let best = null;
        let bestLen = -1;

        navItems.forEach((item) => {
            const href = item.getAttribute('href');
            if (!href) return;
            // 홈(/main/main) 은 /main 하위 전체를 자기 영역으로 본다 (예: /main/post/detail/...)
            const prefix = (href === '/main/main') ? '/main' : href;
            const matches = (path === prefix) || path.startsWith(prefix + '/');
            if (matches && prefix.length > bestLen) {
                best = item;
                bestLen = prefix.length;
            }
        });

        navItems.forEach((item) => item.classList.remove('active'));
        if (best) best.classList.add('active');
    }

    function bindNavMore() {
        const navMore = document.getElementById('navMore');
        const navMoreLayer = document.getElementById('navMoreLayer');
        if (!navMore || !navMoreLayer) return;

        const popover = document.getElementById('navMorePopover');
        const overlay = navMoreLayer.querySelector('.nav-more-overlay');

        navMore.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !navMoreLayer.classList.contains('off');
            if (isOpen) {
                navMoreLayer.classList.add('off');
                return;
            }
            const rect = navMore.getBoundingClientRect();
            if (popover) {
                popover.style.visibility = 'hidden';
                navMoreLayer.classList.remove('off');
                popover.style.left = rect.left + 'px';
                popover.style.top = (rect.top - popover.offsetHeight - 8) + 'px';
                popover.style.visibility = '';
            } else {
                navMoreLayer.classList.remove('off');
            }
        });

        if (overlay) {
            overlay.addEventListener('click', () => {
                navMoreLayer.classList.add('off');
            });
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#navMoreLayer') && !e.target.closest('#navMore')) {
                navMoreLayer.classList.add('off');
            }
        });
    }

    function bindAccountMenu() {
        const accountCard = document.getElementById('accountCard');
        const accountMenuPopup = document.getElementById('accountMenuPopup');
        if (!accountCard || !accountMenuPopup) return;

        accountCard.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !accountMenuPopup.classList.contains('off');
            if (isOpen) accountMenuPopup.classList.add('off');
            else accountMenuPopup.classList.remove('off');
        });

        const logoutBtn = document.getElementById('accountLogoutButton');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
                    if (!res.ok) throw new Error('logout failed');
                } catch (_) {}
                accountMenuPopup.classList.add('off');
                location.href = '/member/join';
            });
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#accountMenuPopup') && !e.target.closest('#accountCard')) {
                accountMenuPopup.classList.add('off');
            }
        });
    }

    function loadNotificationBadge() {
        const badges = document.querySelectorAll('.nav-badge--noti');
        if (!badges.length) return;
        const memberId = badges[0].dataset.memberId;
        if (!memberId) return;

        fetch(`/api/notifications/${memberId}/unread-count`, { credentials: 'same-origin' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (!data) return;
                const count = Number(data.count) || 0;
                badges.forEach(b => {
                    if (count > 0) {
                        b.textContent = count > 99 ? '99+' : String(count);
                        b.style.display = '';
                    } else {
                        b.style.display = 'none';
                    }
                });
            })
            .catch(() => {});
    }

    function init() {
        setActiveNavItem();
        bindNavMore();
        bindAccountMenu();
        loadNotificationBadge();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
