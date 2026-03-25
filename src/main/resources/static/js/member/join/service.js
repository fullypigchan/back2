const joinService = (() => {

        const memberRegister = async (formData) => {
            console.log(formData);
            const response = await fetch("/api/member/join", {
                method: "POST",
                body : formData
            })
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Fetch error");
            }

            return await response.text();

        }

        const checkEmail = async (memberEmail, callback) => {
            const response = await fetch(`/api/member/checkEmail?memberEmail=${memberEmail}`);
            const isAvaliable = await response.text() === "true";

            if (callback) callback(isAvaliable);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Fetch error");
            }
        }

        const checkPhone = async (memberPhone, callback) => {
            const response = await fetch(`/api/member/checkPhone?memberPhone=${memberPhone}`);
            const isAvaliable = await response.text() === "true";

            if (callback) callback(isAvaliable);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Fetch error");
            }
        }

        const oauthMemberRegister = async (formData) => {
            const response = await fetch("/api/auth/oauth/join", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "OAuth join failed");
            }

            return await response.json();
        };


    return {
            memberRegister: memberRegister,
            checkEmail : checkEmail,
            checkPhone : checkPhone,
            oauthMemberRegister : oauthMemberRegister
        }
    })();
