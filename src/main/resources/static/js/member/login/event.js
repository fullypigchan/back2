
    const emailPhone = document.getElementById("loginIdentity")
    const loginId = document.getElementById("login-id")
    const password = document.getElementById("passwordInput")
    // const submitPassword = document.getElementById("memberPassword")
    const loginBtn = document.getElementById("loginBtn")

    emailPhone.addEventListener("input" ,(e) => {
        loginId.value = e.target.value
    })
    // password.addEventListener("input" ,(e) => {
    //     submitPassword.value = e.target.value
    // })

    loginBtn.addEventListener("click",async () => {
        const result = await loginService.login({
            loginId: loginId.value,
            memberPassword: password.value
        });
        if(result.accessToken){
            location.href = "/main/main";
        } else {
            alert(result.message);
        }
    })


    const kakaoLoginButtons = document.querySelectorAll(".kakao-login");
    kakaoLoginButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            location.href = "/oauth2/authorization/kakao"
        });
    })
    const naverLoginButtons = document.querySelectorAll(".naver-login");
    naverLoginButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            location.href = "/oauth2/authorization/naver"
        });
    })
    const facebookLoginButtons = document.querySelectorAll(".facebook-login");
    facebookLoginButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            location.href = "/oauth2/authorization/facebook"
        });
    })
    const googleLoginButtons = document.querySelectorAll(".google-login");
    googleLoginButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            location.href = "/oauth2/authorization/google"
        });
    })
