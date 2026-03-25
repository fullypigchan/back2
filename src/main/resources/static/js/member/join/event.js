
// - SNS 신규가입인지 한 번만 판단
// - 소셜 기본 정보는 이 객체에 보관
// - hidden input 중복 저장 안 함
const params = new URLSearchParams(window.location.search);

window.oauthJoinData = {
    enabled: params.get("oauth") === "1",
    provider: params.get("provider") || "",
    providerId: params.get("providerId") || "",
    memberName: params.get("memberName") || "",
    memberEmail: params.get("memberEmail") || "",
    memberPhone: params.get("memberPhone") || "",
    profileUrl: params.get("profileUrl") || ""
};

const show = id => document.getElementById(id).style.display = 'flex';
const hide = id => document.getElementById(id).style.display = 'none';
const MODALS = [
    'modal-create', 'overlay-phone', 'overlay-email',
    'modal-code', 'modal-password', 'modal-oauth-birth', 'modal-business',
    'modal-profile', 'modal-username', 'modal-notification',
    'modal-language', 'modal-category', 'modal-submit'
];
const hideAll = () => MODALS.forEach(hide);

document.addEventListener("DOMContentLoaded", () => {
    // 신규 SNS 회원이면 join 진입 직후 생년월일 모달부터 연다.
    if (window.oauthJoinData.enabled && window.location.hash === "#modal-oauth-birth") {
        hideAll();
        show("modal-oauth-birth");
    }
// SNS 프로필 사진을 프로필 모달 기본 미리보기로 사용
    if (window.oauthJoinData.enabled && window.oauthJoinData.profileUrl) {
        const preview = document.querySelector(".avatar-preview");
        if (preview) {
            preview.src = window.oauthJoinData.profileUrl;
        }
    }
// SNS 프로필 사진을 프로필 모달 기본 미리보기로 사용
    if (window.oauthJoinData.enabled && window.oauthJoinData.profileUrl) {
        const preview = document.querySelector(".avatar-preview");
        if (preview) {
            preview.src = window.oauthJoinData.profileUrl;
        }
    }
});

// 메인 버튼
document.getElementById('btn-create').addEventListener('click', () => {
    hideAll();
    // SNS 신규가입이면 앞단계(계정생성/인증/비밀번호)를 건너뛰고 생년월일부터 시작
    if (window.oauthJoinData.enabled) {
        show('modal-oauth-birth');
        return;
    }
    show('modal-create');
});

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

// SNS 생년월일 → 사업자
const oauthBirthInput = document.querySelector('#modal-oauth-birth .oauth-birth-date-input');
const oauthBirthError = document.querySelector('#modal-oauth-birth .field-error-message');
if (oauthBirthInput) {
    oauthBirthInput.addEventListener('input', () => {
        oauthBirthInput.value = oauthBirthInput.value.replace(/\D/g, "").slice(0, 8);
        oauthBirthError?.classList.remove('show');
    });
}
document.querySelector('#modal-oauth-birth .next-button').addEventListener('click', () => {
    const birthDateValue = oauthBirthInput?.value.trim() || "";
    if (birthDateValue.length !== 8) {
        oauthBirthError?.classList.add('show');
        oauthBirthInput?.focus();
        return;
    }

    oauthBirthError?.classList.remove('show');
    hide('modal-oauth-birth');
    show('modal-business');
});

// 사업자 → 프로필
document.querySelector('#modal-business .next-button').addEventListener('click', () => { hide('modal-business'); show('modal-profile'); });

// 프로필 → 아이디
document.querySelector('#modal-profile .ghost-button').addEventListener('click', () => { hide('modal-profile'); show('modal-username'); });

// 아이디 → 언어
document.querySelector('#modal-username .next-button').addEventListener('click', () => { hide('modal-username'); show('modal-language'); });

// 언어 → 카테고리
document.querySelector('#modal-language .next-button').addEventListener('click', () => { hide('modal-language'); show('modal-category'); });

// 카테고리 → 알림
document.querySelector('#modal-category .js-next-button').addEventListener('click', () => { hide('modal-category'); show('modal-notification'); });

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



//     이메일, 휴대폰 번호 유효성 검사
const identityInput = document.getElementById("identity-input")
let check = false;
let emailcheck = false;
let phonecheck = false;
const okMessage = "사용가능한 이메일입니다."
const noMessage = "중복된 이메일입니다."
identityInput.addEventListener("blur", (e) => {
    if (identityInput.value.length === joinService.checkEmail()) {
        emailcheck = true;
        identityInput.style.borderColor = "green";
        identityInput.nextElementSibling.textContent = okMessage;
    }

})



//     회원 정보 입력 후 formData로 서버에 전송
const joinBtn = document.querySelector('.join-submit-button');
const notificationBtn = document.querySelector('.notification-yes');
let pushEnabled = false;
const getInputValue = (selector) => {
    const element = document.querySelector(selector);
    return element && "value" in element ? String(element.value).trim() : "";
};

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
    const oauthBirthDate = document.querySelector('.oauth-birth-date-input');
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
    const selectedLanguage = window.selectedLanguage;
    const selectedCategory = window.selectedCategory;

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
    const submemberHandle = "@" + memberHandle.value;

    const formData = new FormData();
    // SNS 신규 가입 분기
    if (window.oauthJoinData.enabled) {
        const oauthBirthDateValue = oauthBirthDate?.value?.trim() || "";
        if (oauthBirthDateValue.length !== 8) {
            alert('생년월일을 8자리로 입력하세요.');
            return;
        }

        formData.append('provider', window.oauthJoinData.provider);
        formData.append('providerId', window.oauthJoinData.providerId);
        formData.append('memberName', window.oauthJoinData.memberName);
        formData.append('memberEmail', window.oauthJoinData.memberEmail);
        formData.append('memberPhone', window.oauthJoinData.memberPhone);
        formData.append('profileURL', window.oauthJoinData.profileUrl);

        formData.append('birthDate', oauthBirthDateValue);
        formData.append('memberHandle', submemberHandle);
        formData.append('memberRegion', memberRegion);
        formData.append('memberLanguage', selectedLanguage);
        formData.append('categoryName', selectedCategory);
        formData.append('pushEnabled', String(pushEnabled));
        formData.append('businessNumber', getInputValue('.business-number-input'));
        formData.append('companyName', getInputValue('.company-name-input'));
        formData.append('ceoName', getInputValue('.ceo-name-input'));
        formData.append('businessType', getInputValue('#business-type'));

        if (file) {
            formData.append('file', file);
        }
        await joinService.oauthMemberRegister(formData);
        location.href = "/main/main";
        return;
    }
    // 일반 회원가입 분기
    formData.append('memberName', memberName.value);
    formData.append('birthDate', birthDate.value);
    formData.append('memberPassword', memberPassword.value);
    formData.append('memberHandle', submemberHandle);
    formData.append('memberRegion', memberRegion);
    formData.append('memberLanguage', selectedLanguage);
    formData.append('categoryName', selectedCategory);
    formData.append('pushEnabled', pushEnabled);
    formData.append('businessNumber', businessNumber.value);
    formData.append('companyName', companyName.value);
    formData.append('ceoName', ceoName.value);
    formData.append('businessType', businessType.value);

    if (subMemberEmail !== null) {
        formData.append('memberEmail', subMemberEmail);
    }
    if (subMemberPhone !== null) {
        formData.append('memberPhone', subMemberPhone);
    }

    if (file) {
        formData.append('file', file);
    }

    await joinService.memberRegister(formData);

    location.href = "/member/join";
})


