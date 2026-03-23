
    const show = id => document.getElementById(id).style.display = 'flex';
    const hide = id => document.getElementById(id).style.display = 'none';
    const MODALS = [
        'modal-create', 'overlay-phone', 'overlay-email',
        'modal-code', 'modal-password', 'modal-business',
        'modal-profile', 'modal-username', 'modal-notification',
        'modal-language', 'modal-category', 'modal-submit'
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

    // 알림 → 회원가입 확인
    document.querySelectorAll('#modal-notification .notification-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const submitModal = document.getElementById('modal-submit');
            if (submitModal) {
                submitModal.dataset.pushEnabled = String(btn.classList.contains('notification-btn-primary'));
            }

            hide('modal-notification');
            show('modal-submit');
        });
    });

    // 언어 → 카테고리
    document.querySelector('#modal-language .next-button').addEventListener('click', () => { hide('modal-language'); show('modal-category'); });

    // 카테고리 → 완료
    document.querySelector('#modal-category .js-next-button').addEventListener('click', () => { hide('modal-category'); });

//     input 받아올 데이터 선언

    const joinBtn = document.querySelector('.join-submit-button');
    const notificationBtn = document.querySelector('.notification-yes');

    let pushEnabled = false;

    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            pushEnabled = true;
        });
    }

    joinBtn.addEventListener('click', async () => {
        console.log("joinBtn");
        const memberName = document.querySelector('.name-input');
        const memberEmail = document.querySelector('input[name="email"]');
        const memberPhone = document.querySelector('input[name="phone"]');
        const birthDate = document.querySelector('.birth-date-input');
        const memberPassword = document.querySelector('.password-input');
        const memberHandle = document.querySelector('.handle-input');
        const businessNumber = document.querySelector('.business-number-input');
        const companyName = document.querySelector('.company-name-input');
        const ceoName = document.querySelector('.ceo-name-input');
        const postNumber = document.querySelector('.post-input');
        const address = document.getElementById('addr-main');
        const addressDetail = document.getElementById('addr-detail');
        const businessType = document.getElementById('business-type');
        const profile = document.querySelector('.avatar-upload');



        const file = profile?.files?.[0];
        const maxSize = 10 * 1024 * 1024;

        if (file && file.size > maxSize) {
            alert('파일이 너무 큽니다. (최대 10MB)');
            return;
        }

        const memberRegion = `${postNumber.value} ${address.value} ${addressDetail.value}`.trim();

        console.log('memberName', memberName.value)
        console.log('emailValue', memberEmail?.value)
        console.log('phoneValue', memberPhone?.value)
        console.log('birthDate.value', birthDate.value)
        console.log('memberPassword.value', memberPassword.value)
        console.log('memberHandle.value', memberHandle.value)
        console.log('memberRegion', memberRegion)
        console.log('pushEnabled', pushEnabled)
        console.log('businessNumber.value', businessNumber.value)
        console.log('companyName.value', companyName.value)
        console.log('ceoName.value', ceoName.value)
        console.log('file', file)
        console.log('businessType.value', businessType.value)

        const subMemberEmail = memberEmail?.value?.trim() ? memberEmail.value.trim() : null;
        const subMemberPhone = memberPhone?.value?.trim() ? memberPhone.value.trim() : null;

        const formData = new FormData();
        formData.append('memberName', memberName.value);
        formData.append('memberEmail', subMemberEmail);
        formData.append('memberPhone', subMemberPhone);
        formData.append('birthDate', birthDate.value);
        formData.append('memberPassword', memberPassword.value);
        formData.append('memberHandle', memberHandle.value);
        formData.append('memberRegion', memberRegion);
        formData.append('pushEnabled', pushEnabled);
        formData.append('businessNumber', businessNumber.value);
        formData.append('companyName', companyName.value);
        formData.append('ceoName', ceoName.value);
        formData.append('businessType', businessType.value);

        if (file) {
            formData.append('file', file);
        }

        await joinService.memberRegister(formData);

        location.href = "/member/join";
    })


