import Model from "./model.js";
import { randomSelection } from "./utils.js";
import tools from "./tools.js";

function loadWidget(config) {
    const model = new Model(config);
    window.Live2dModel = model;
    localStorage.removeItem("waifu-display");
    sessionStorage.removeItem("waifu-text");

    (function registerTools() {
        tools["switch-model"].callback = () => model.loadNextModel();
        tools["switch-texture"].callback = () => model.loadNextTexture();
        if (!Array.isArray(config.tools)) {
            config.tools = Object.keys(tools);
        }
        fetch(config.live2dPath + "waifu-tips.json")
            .then(response => response.json())
            .then(function (result) {
                for (let tool of config.tools) {
                    if (tools[tool]) {
                        const { icon, callback } = tools[tool];
                        document.getElementById("waifu-tool").insertAdjacentHTML("beforeend", `<span id="waifu-tool-${tool}">${icon}</span>`);
                        document.getElementById(`waifu-tool-${tool}`).addEventListener("click", () => { callback(result) });
                    }
                }
            });
    })();

    (function initModel() {
        let modelId = Number(localStorage.getItem("modelId"));
        let modelTexturesId = Number(localStorage.getItem("modelTexturesId"));
        model.loadModel(modelId, modelTexturesId);
        fetch(config.live2dPath + "waifu-tips.json")
            .then(response => response.json())
            .then(result => registerEventListener(result));
    })();



    function welcomeMessage(time) {
        if (location.pathname === "/") { // 如果是主页
            for (let { hour, text } of time) {
                const now = new Date(),
                    after = hour.split("-")[0],
                    before = hour.split("-")[1] || after;
                if (after <= now.getHours() && now.getHours() <= before) {
                    return text;
                }
            }
        }
        const text = `欢迎阅读<span>「${document.title.split(" - ")[0]}」</span>`;
        let from;
        if (document.referrer !== "") {
            const referrer = new URL(document.referrer),
                domain = referrer.hostname.split(".")[1];
            const domains = {
                "baidu": "百度",
                "so": "360搜索",
                "google": "谷歌搜索"
            };
            if (location.hostname === referrer.hostname) return text;

            if (domain in domains) from = domains[domain];
            else from = referrer.hostname;
            return `Hello！来自 <span>${from}</span> 的朋友<br>${text}`;
        }
        return text;
    }

    function registerEventListener(result) {
        // 检测用户活动状态，并在空闲时显示消息
        let userAction = false;
        let userActionTimer;
        let messageArray = result.message.default;
        let model = window.Live2dModel;
        window.addEventListener("mousemove", () => userAction = true);
        window.addEventListener("keydown", () => userAction = true);
        setInterval(() => {
            if (userAction) {
                userAction = false;
                clearInterval(userActionTimer);
                userActionTimer = null;
            } else if (!userActionTimer) {
                userActionTimer = setInterval(() => {
                    model.showWaifuTips(messageArray, 5000, 9);
                }, 20000);
            }
        }, 1000);
        model.showWaifuTips(welcomeMessage(result.time), 5000, 11);
        window.addEventListener("mouseover", event => {
            for (let { selector, text } of result.mouseover) {
                if (!event.target.matches(selector)) continue;
                text = randomSelection(text);
                text = text.replace("{text}", event.target.innerText);
                model.showWaifuTips(text, 3000, 8);
                return;
            }
        });
        window.addEventListener("click", event => {
            for (let { selector, text } of result.click) {
                if (!event.target.matches(selector)) continue;
                text = randomSelection(text);
                text = text.replace("{text}", event.target.innerText);
                model.showWaifuTips(text, 3000, 8);
                return;
            }
        });
        result.seasons.forEach(({ date, text }) => {
            const now = new Date(),
                after = date.split("-")[0],
                before = date.split("-")[1] || after;
            if ((after.split("/")[0] <= now.getMonth() + 1 && now.getMonth() + 1 <= before.split("/")[0]) && (after.split("/")[1] <= now.getDate() && now.getDate() <= before.split("/")[1])) {
                text = randomSelection(text);
                text = text.replace("{year}", now.getFullYear());
                messageArray.push(text);
            }
        });

        const devtools = () => { };
        console.log("%c", devtools);
        devtools.toString = () => {
            model.showWaifuTips(randomSelection(result.message.console), 6000, 9);
        };
        window.addEventListener("copy", () => {
            model.showWaifuTips(randomSelection(result.message.copy), 6000, 9);
        });
        window.addEventListener("visibilitychange", () => {
            if (document.hidden) return;
            model.showWaifuTips(randomSelection(result.message.visibilitychange), 6000, 9);
        });
    }

}

function initWidget(config) {
    document.body.insertAdjacentHTML("beforeend", `<div id="waifu"><div id="waifu-tips"></div><canvas id="live2d"></canvas><div id="waifu-tool"></div></div>`);
    document.body.insertAdjacentHTML("beforeend", '<div id="waifu-toggle"><span>看板娘</span></div>');
    const toggle = document.getElementById("waifu-toggle");
    toggle.addEventListener("click", () => {
        toggle.classList.remove("waifu-toggle-active");
        if (toggle.getAttribute("first-time")) {
            loadWidget(config);
            toggle.removeAttribute("first-time");
        } else {
            localStorage.removeItem("waifu-display");
            document.getElementById("waifu-tips").style.display = "";
            document.getElementById("waifu-tool").style.display = "";
            setTimeout(() => {
                Live2dModel.showModel();
                document.getElementById("waifu").style.bottom = 0;
            }, 0);
        }
    });
    if (localStorage.getItem("waifu-display") && Date.now() - localStorage.getItem("waifu-display") <= 86400000) {
        toggle.setAttribute("first-time", true);
        setTimeout(() => {
            toggle.classList.add("waifu-toggle-active");
        }, 0);
    } else {
        loadWidget(config);
    }
}

export default initWidget;
