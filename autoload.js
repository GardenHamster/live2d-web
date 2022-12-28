// live2d_path 参数建议使用绝对路径
const live2d_path = "./";

// 封装异步加载资源的方法
function loadExternalResource(url, type) {
	return new Promise((resolve, reject) => {
		let tag;
		if (type === "css") {
			tag = document.createElement("link");
			tag.rel = "stylesheet";
			tag.href = url;
		}
		else if (type === "js") {
			tag = document.createElement("script");
			tag.src = url;
		}
		if (tag) {
			tag.onload = () => resolve(url);
			tag.onerror = () => reject(url);
			document.head.appendChild(tag);
		}
	});
}

(async function() {
    if (screen.width < 768) return;
    await document.body.insertAdjacentHTML("beforeend", '<div id="waifu"><div id="waifu-tips"></div><canvas id="live2d"></canvas><div id="waifu-tool"></div></div>');
    await loadExternalResource(live2d_path + "waifu.css", "css");
    await loadExternalResource(live2d_path + "pixi.min.js", "js");
    await loadExternalResource(live2d_path + "live2d.min.js", "js");
    await loadExternalResource(live2d_path + "live2dcubismcore.min.js", "js");
    await loadExternalResource(live2d_path + "pixi-live2d-display.min.js", "js");

    window.PIXI = PIXI; // 将 PIXI 暴露到 window 上，这样插件就可以通过 window.PIXI.Ticker 来自动更新模型
    await loadExternalResource(live2d_path + "waifu-tips.js", "js");

    initWidget({
        waifuPath: live2d_path + "waifu-tips.json",
        cdnPath: "https://cdn.jsdelivr.net/gh/fghrsh/live2d_api/",
        tools: ["hitokoto", "asteroids", "switch-model", "switch-texture", "photo", "info", "quit"]
    });

    /*
    const app = new PIXI.Application({
        view: document.getElementById('live2d'),
        autoStart: true,
        transparent: true
    });

    const model = PIXI.live2d.Live2DModel.fromSync(live2d_path + '/model/Houkai-Gakuen2/theresa/model.json');
    PIXI.live2d.config.cubism4.setOpacityFromMotion= true;
    PIXI.live2d.SoundManager.volume = 0.5;

    model.once('load', () => {
        model.rotation = Math.PI;
        model.skew.x = Math.PI;
        model.skew.y = Math.PI;

        const scale = 0.3;
        model.scale.set(scale,scale);
        model.anchor.set(0.5, 0.5);

        const liv2dDom=document.getElementById('live2d');
        model.x = liv2dDom.width /2;
        model.y = liv2dDom.height * 0.65;
    });
    
    model.once('settingsJSONLoaded', (json) => {
        console.log('live2d mode settingsJSONLoaded');
    });

    model.once('ready', () => {
        console.log('live2d mode ready');
        app.stage.addChild(model);
        setTimeout((() => {
            model.motion('born');
        }), 1000);

        setTimeout((() => {
            model.visible = false;
        }), 5000);
        
    });

    model.on('hit', (hitAreas) => {
        console.log('live2d mode hit');
        if (hitAreas.includes('head')) {
            model.motion('flick_head');
        }
        if (hitAreas.includes("face")) {
            model.motion('tap_face');
        }
        if (hitAreas.includes("breast")) {
            model.motion('tap_breast');
        }
        if (hitAreas.includes("belly")) {
            model.motion('tap_belly');
        }
        if (hitAreas.includes("leg")) {
            model.motion('tap_belly');
        }
    });
    */

})();

console.log(`
  く__,.ヘヽ.        /  ,ー､ 〉
           ＼ ', !-─‐-i  /  /´
           ／｀ｰ'       L/／｀ヽ､
         /   ／,   /|   ,   ,       ',
       ｲ   / /-‐/  ｉ  L_ ﾊ ヽ!   i
        ﾚ ﾍ 7ｲ｀ﾄ   ﾚ'ｧ-ﾄ､!ハ|   |
          !,/7 '0'     ´0iソ|    |
          |.从"    _     ,,,, / |./    |
          ﾚ'| i＞.､,,__  _,.イ /   .i   |
            ﾚ'| | / k_７_/ﾚ'ヽ,  ﾊ.  |
              | |/i 〈|/   i  ,.ﾍ |  i  |
             .|/ /  ｉ：    ﾍ!    ＼  |
              kヽ>､ﾊ    _,.ﾍ､    /､!
              !'〈//｀Ｔ´', ＼ ｀'7'ｰr'
              ﾚ'ヽL__|___i,___,ンﾚ|ノ
                  ﾄ-,/  |___./
                  'ｰ'    !_,.:
`);

