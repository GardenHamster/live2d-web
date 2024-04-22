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

async function initLive2d(config) {
  if (!config.live2d_path.endsWith("/")) config.live2d_path += "/";
  if (!config.model_path.endsWith("/")) config.model_path += "/";
  await loadExternalResource(config.live2d_path + "waifu.css", "css");
  await loadExternalResource(config.live2d_path + "pixi.min.js", "js");
  await loadExternalResource(config.live2d_path + "live2d.min.js", "js");
  await loadExternalResource(config.live2d_path + "live2dcubismcore.min.js", "js");
  await loadExternalResource(config.live2d_path + "pixi-live2d-display.min.js", "js");

  window.PIXI = PIXI; // 将 PIXI 暴露到 window 上，这样插件就可以通过 window.PIXI.Ticker 来自动更新模型
  await loadExternalResource(config.live2d_path + "waifu-tips.js", "js");

  initWidget({
    modelPath: config.model_path,
    live2dPath: config.live2d_path,
    tools: ["hitokoto", "switch-model", "switch-texture", "random", "shake", "info", "quit"]
  });

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

};



