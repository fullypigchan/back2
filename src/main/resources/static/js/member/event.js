window.onload = () => {
    const show = id => document.getElementById(id).style.display = 'flex';
    const hide = id => document.getElementById(id).style.display = 'none';
    const MODALS = [
        'modal-create', 'overlay-phone', 'overlay-email',
        'modal-code', 'modal-password', 'modal-business',
        'modal-profile', 'modal-username', 'modal-notification',
        'modal-language', 'modal-category'
    ];
    const hideAll = () => MODALS.forEach(hide);

    // 메인 버튼
    document.getElementById('btn-create').addEventListener('click', () => show('modal-create'));

    // 닫기 버튼 (X) - 확인 후 닫기
    document.querySelectorAll('.join-modal-header-close-button, .icon-button--close').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('정말 나가시겠습니까?')) hideAll();
        });
    });

    // 계정 생성 → 인증 overlay
    document.querySelector('#modal-create .next-button').addEventListener('click', () => {
        const label = document.querySelector('#modal-create .phone-text-in').textContent.trim();
        hide('modal-create');
        show(label === '이메일' ? 'overlay-email' : 'overlay-phone');
    });

    // overlay-phone
    document.querySelector('#overlay-phone .btn-confirm').addEventListener('click', () => { hide('overlay-phone'); show('modal-code'); });
    document.querySelector('#overlay-phone .btn-edit').addEventListener('click', () => { hide('overlay-phone'); show('modal-create'); });

    // overlay-email
    document.querySelector('#overlay-email .btn-confirm').addEventListener('click', () => { hide('overlay-email'); show('modal-code'); });
    document.querySelector('#overlay-email .btn-edit').addEventListener('click', () => { hide('overlay-email'); show('modal-create'); });

    // 코드 → 비밀번호
    document.querySelector('#modal-code .next-button').addEventListener('click', () => { hide('modal-code'); show('modal-password'); });

    // 비밀번호 → 사업자
    document.querySelector('#modal-password .next-button').addEventListener('click', () => { hide('modal-password'); show('modal-business'); });

    // 사업자 → 프로필
    document.querySelector('#modal-business .next-button').addEventListener('click', () => { hide('modal-business'); show('modal-profile'); });

    // 프로필 → 아이디
    document.querySelector('#modal-profile .ghost-button').addEventListener('click', () => { hide('modal-profile'); show('modal-username'); });

    // 아이디 → 알림
    document.querySelector('#modal-username .next-button').addEventListener('click', () => { hide('modal-username'); show('modal-notification'); });

    // 알림 → 언어
    document.querySelectorAll('#modal-notification .notification-btn').forEach(btn => {
        btn.addEventListener('click', () => { hide('modal-notification'); show('modal-language'); });
    });

    // 언어 → 카테고리
    document.querySelector('#modal-language .next-button').addEventListener('click', () => { hide('modal-language'); show('modal-category'); });

    // 카테고리 → 완료
    document.querySelector('#modal-category .js-next-button').addEventListener('click', () => { hide('modal-category'); });
};