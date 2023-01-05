import fa_comment from "@fortawesome/fontawesome-free/svgs/solid/comment.svg";
import fa_paper_plane from "@fortawesome/fontawesome-free/svgs/solid/paper-plane.svg";
import fa_user_circle from "@fortawesome/fontawesome-free/svgs/solid/circle-user.svg";
import fa_street_view from "@fortawesome/fontawesome-free/svgs/solid/street-view.svg";
import fa_camera_retro from "@fortawesome/fontawesome-free/svgs/solid/camera-retro.svg";
import fa_info_circle from "@fortawesome/fontawesome-free/svgs/solid/circle-info.svg";
import fa_xmark from "@fortawesome/fontawesome-free/svgs/solid/xmark.svg";
import showMessage from "./message.js";
import { randomSelection } from "./utils.js";

function showHitokoto() {
    // 增加 hitokoto.cn 的 API
    fetch("https://v1.hitokoto.cn")
        .then(response => response.json())
        .then(result => {
            const text = `这句一言来自 <span>「${result.from}」</span>，是 <span>${result.creator}</span> 在 hitokoto.cn 投稿的。`;
            showMessage(result.hitokoto, 6000, 9);
            setTimeout(() => {
                showMessage(text, 4000, 9);
            }, 6000);
        });
}

const tools = {
    "hitokoto": {
        icon: fa_comment,
        callback: showHitokoto
    },
    "asteroids": {
        icon: fa_paper_plane,
        callback: () => {
            if (window.Asteroids) {
                if (!window.ASTEROIDSPLAYERS) window.ASTEROIDSPLAYERS = [];
                window.ASTEROIDSPLAYERS.push(new Asteroids());
            } else {
                const script = document.createElement("script");
                script.src = "https://fastly.jsdelivr.net/gh/stevenjoezhang/asteroids/asteroids.js";
                document.head.appendChild(script);
            }
        }
    },
    "switch-model": {
        icon: fa_user_circle,
        callback: () => { }
    },
    "switch-texture": {
        icon: fa_street_view,
        callback: () => { }
    },
    "photo": {
        icon: fa_camera_retro,
        callback: (json) => {
            if (json && json.message && json.message.photo) {
                const message = randomSelection(json.message.photo);
                showMessage(message, 6000, 9);
            }
            Live2D.captureName = "photo.png";
            Live2D.captureFrame = true;
        }
    },
    "info": {
        icon: fa_info_circle,
        callback: (json) => {
            open("https://github.com/GardenHamster/live2d-web");
        }
    },
    "quit": {
        icon: fa_xmark,
        callback: (json) => {
            if (json && json.message && json.message.quit) {
                const message = randomSelection(json.message.quit);
                showMessage(message, 2000, 11);
            }
            localStorage.setItem("waifu-display", Date.now());
            document.getElementById("waifu").style.bottom = "-1000px";
            setTimeout(() => {
                Live2dModel.hideModel();
                document.getElementById("waifu-tips").style.display = "none";
                document.getElementById("waifu-tool").style.display = "none";
                document.getElementById("waifu-toggle").classList.add("waifu-toggle-active");
            }, 3000);
        }
    }
};

export default tools;
