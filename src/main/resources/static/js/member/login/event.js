
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
        }
    })

