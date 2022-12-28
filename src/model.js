import showMessage from "./message.js";
import randomSelection from "./utils.js";

class Model {
    constructor(config) {
        let { modelPath,live2dPath  } = config;
        if (!modelPath.endsWith("/")) modelPath += "/";
        if (!live2dPath.endsWith("/")) live2dPath += "/";
        this.live2dPath = live2dPath;
        this.modelPath = modelPath;
    }

    async loadModelList() {
        const response = await fetch(`${this.live2dPath}model_list.json`);
        this.modelList = await response.json();
    }

    async loadModel(modelId, modelTexturesId) {
        localStorage.setItem("modelId", modelId);
        localStorage.setItem("modelTexturesId", modelTexturesId);
        if (!this.modelList) await this.loadModelList();
        const target = randomSelection(this.modelList.models[modelId][modelTexturesId]);
        showMessage(target.born, 4000, 10);
        this.loadlive2d(target);
    }

    async loadRandModel() {
        const modelId = localStorage.getItem("modelId");
        const modelTexturesId = localStorage.getItem("modelTexturesId");
        if (!this.modelList) await this.loadModelList();
        const target = randomSelection(this.modelList.models[modelId][modelTexturesId]);
        this.loadlive2d(target);
        showMessage(target.born, 4000, 10);
    }

    async loadOtherModel() {
        let modelId = localStorage.getItem("modelId");
        if (!this.modelList) await this.loadModelList();
        const index = (++modelId >= this.modelList.models.length) ? 0 : modelId;
        this.loadModel(index, 0);
    }

    async loadlive2d(target) {
        const app = new PIXI.Application({
            view: document.getElementById('live2d'),
            autoStart: true,
            transparent: true
        });
    
        const model = PIXI.live2d.Live2DModel.fromSync(this.modelPath+target.path);
        PIXI.live2d.config.cubism4.setOpacityFromMotion = true;
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
    }

}

export default Model;
