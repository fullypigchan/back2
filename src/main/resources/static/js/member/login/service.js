const loginService = (() => {
    const login = async ({loginId ,memberPassword}) => {
        const response = await fetch("/api/member/login",{
            method: "POST",
            body: JSON.stringify({loginId,memberPassword}),
            headers: {
                "Content-Type": "application/json"
            }
        });
        if(!response.ok){
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        return await response.json();
    }

    const info = async (callback) => {
        const response = await fetch(`/api/member/info`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const member = await response.json();

        if(callback) {
            callback(member);
        }

        return member;
    }



    return {
        login: login,
        info: info,
    }
})();
//