const LANGUAGES = [
    { code: "en", label: "영어 - English" },
    { code: "ko", label: "한국어" },
    { code: "gu", label: "구자라트어 - ગુજરાતી" },
    { code: "el", label: "그리스어 - Ελληνικά" },
    { code: "nl", label: "네덜란드어 - Nederlands" },
    { code: "ne", label: "네팔어 - नेपाली" },
    { code: "no", label: "노르웨이어 - norsk" },
    { code: "da", label: "덴마크어 - dansk" },
    { code: "de", label: "독일어 - Deutsch" },
    { code: "dv", label: "디베히어 - Divehi" },
    { code: "lo", label: "라오어 - ລາວ" },
    { code: "lv", label: "라트비아어 - latviešu" },
    { code: "ru", label: "러시아어 - русский" },
    { code: "ro", label: "루마니아어 - română" },
    { code: "lt", label: "리투아니아어 - lietuvių" },
    { code: "mr", label: "마라티어 - मराठी" },
    { code: "ml", label: "말라얄람어 - മലയാളം" },
    { code: "ms", label: "말레이어 - Melayu" },
    { code: "eu", label: "바스크어 - euskara" },
    { code: "my", label: "버마어 - မြန်မာ" },
    { code: "vi", label: "베트남어 - Tiếng Việt" },
    { code: "bn", label: "벵골어 - বাংলা" },
    { code: "bg", label: "불가리아어 - български" },
    { code: "sr", label: "세르비아어 - српски" },
    { code: "ckb", label: "소라니 쿠르드어 - کوردیی ناوەندی" },
    { code: "si", label: "스리랑카어 - සිංහල" },
    { code: "sv", label: "스웨덴어 - svenska" },
    { code: "es", label: "스페인어 - español" },
    { code: "sl", label: "슬로베니아어 - slovenščina" },
    { code: "sd", label: "신디어 - سنڌي" },
    { code: "ar", label: "아랍어 - العربية" },
    { code: "hy", label: "아르메니아어 - հայերեն" },
    { code: "is", label: "아이슬란드어 - íslenska" },
    { code: "ht", label: "아이티어 - Haitian Creole" },
    { code: "am", label: "암하라어 - አማርኛ" },
    { code: "et", label: "에스토니아어 - eesti" },
    { code: "eo", label: "에스페란토어 - esperanto" },
    { code: "or", label: "오리야어 - ଓଡ଼ିଆ" },
    { code: "ur", label: "우르두어 - اردو" },
    { code: "uk", label: "우크라이나어 - українська" },
    { code: "cy", label: "웨일스어 - Cymraeg" },
    { code: "ug", label: "위구르어 - ئۇيغۇرچە" },
    { code: "it", label: "이탈리아어 - italiano" },
    { code: "id", label: "인도네시아어 - Indonesia" },
    { code: "ja", label: "일본어 - 日本語" },
    { code: "ka", label: "조지아어 - ქართული" },
    { code: "zh", label: "중국어 - 中文" },
    { code: "cs", label: "체코어 - čeština" },
    { code: "ca", label: "카탈로니아어 - català" },
    { code: "kn", label: "칸나다어 - ಕನ್ನಡ" },
    { code: "km", label: "크메르어 - ខ្មែរ" },
    { code: "tl", label: "타갈로그어 - Tagalog" },
    { code: "ta", label: "타밀어 - தமிழ்" },
    { code: "th", label: "태국어 - ไทย" },
    { code: "tr", label: "터키어 - Türkçe" },
    { code: "te", label: "텔루구어 - తెలుగు" },
    { code: "bo", label: "티베트어 - བོད་སྐད་" },
    { code: "ps", label: "파슈토어 - پښتو" },
    { code: "pa", label: "펀잡어 - ਪੰਜਾਬੀ" },
    { code: "fa", label: "페르시아어 - فارسی" },
    { code: "pt", label: "포르투갈어 - português" },
    { code: "pl", label: "폴란드어 - polski" },
    { code: "fr", label: "프랑스어 - français" },
    { code: "fi", label: "핀란드어 - suomi" },
    { code: "hu", label: "헝가리어 - magyar" },
    { code: "he", label: "히브리어 - עברית" },
    { code: "hi", label: "힌디어 - हिन्दी" },
    { code: "etc", label: "기타" }
];

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-language");
    const list = modal?.querySelector(".language-list");
    const nextButton = modal?.querySelector(".next-button");
    if (!list || !nextButton) {
        return;
    }

    let isExpanded = false;
    const syncNextButton = () => {
        const hasLanguage = Boolean(window.selectedLanguage);
        nextButton.disabled = !hasLanguage;
        nextButton.style.opacity = hasLanguage ? "1" : "0.5";
        nextButton.style.cursor = hasLanguage ? "pointer" : "default";
    };

    const fragment = document.createDocumentFragment();

    LANGUAGES.forEach((option, index) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "language-item js-lang-item";
        item.dataset.index = String(index);
        item.dataset.language = option.code;
        item.setAttribute("aria-selected", "false");

        if (index >= 2) {
            item.classList.add("is-hidden");
        }

        const text = document.createElement("span");
        text.textContent = option.label;

        const box = document.createElement("span");
        box.className = "check-box";
        box.setAttribute("aria-hidden", "true");

        item.appendChild(text);
        item.appendChild(box);
        fragment.appendChild(item);
    });

    const moreButton = document.createElement("button");
    moreButton.type = "button";
    moreButton.className = "language-more js-language-more";
    moreButton.textContent = "더보기";

    fragment.appendChild(moreButton);
    list.appendChild(fragment);

    list.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const more = target.closest(".js-language-more");
        if (more instanceof HTMLButtonElement) {
            isExpanded = !isExpanded;
            list.querySelectorAll(".js-lang-item").forEach((langItem, idx) => {
                langItem.classList.toggle("is-hidden", !isExpanded && idx >= 2);
            });
            more.textContent = isExpanded ? "접기" : "더보기";
            return;
        }

        const item = target.closest(".js-lang-item");
        if (!(item instanceof HTMLButtonElement)) {
            return;
        }

        const willCheck = !item.classList.contains("is-checked");

        list.querySelectorAll(".js-lang-item").forEach((langItem) => {
            langItem.classList.remove("is-checked");
            langItem.setAttribute("aria-selected", "false");
        });

        if (willCheck) {
            item.classList.add("is-checked");
            item.setAttribute("aria-selected", "true");
            window.selectedLanguage = item.dataset.language;
        } else {
            window.selectedLanguage = null;
        }

        syncNextButton();
    });

    window.selectedLanguage = null;
    syncNextButton();
});
