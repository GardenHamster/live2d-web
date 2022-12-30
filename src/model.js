import showMessage from "./message.js";
import { nextIndex, randomIndex } from "./utils.js";

class Model {
    constructor(config) {
        let { modelPath, live2dPath } = config;
        if (!modelPath.endsWith("/")) modelPath += "/";
        if (!live2dPath.endsWith("/")) live2dPath += "/";
        this.live2dPath = live2dPath;
        this.modelPath = modelPath;
        this.app = new PIXI.Application({
            view: document.getElementById('live2d'),
            autoStart: true,
            antialias: true,
            transparent: true
        });
    }

    async loadModelList() {
        const response = await fetch(`${this.live2dPath}model_list.json`);
        this.modelList = await response.json();
        this.loadedList = new Array();
    }

    async loadModel(modelId, modelTexturesId) {
        localStorage.setItem("modelId", modelId);
        localStorage.setItem("modelTexturesId", modelTexturesId);
        if (!this.modelList) await this.loadModelList();
        const target = this.modelList.models[modelId][modelTexturesId];
        if (target.born_tip != null) showMessage(target.born_tip, 4000, 10);
        this.loadlive2d(target, modelId, modelTexturesId);
    }

    async loadNextModel() {
        let modelId = localStorage.getItem("modelId");
        if (!this.modelList) await this.loadModelList();
        const index = (++modelId >= this.modelList.models.length) ? 0 : modelId;
        this.loadModel(index, 0);
    }

    async loadNextTexture() {
        const modelId = Number(localStorage.getItem("modelId"));
        const modelTexturesId = Number(localStorage.getItem("modelTexturesId"));
        if (!this.modelList) await this.loadModelList();
        const index = nextIndex(this.modelList.models[modelId].length, modelTexturesId);
        if (index == modelTexturesId) return;
        this.loadModel(modelId, index);
    }

    async loadRandTexture() {
        const modelId = Number(localStorage.getItem("modelId"));
        const modelTexturesId = Number(localStorage.getItem("modelTexturesId"));
        if (!this.modelList) await this.loadModelList();
        const index = randomIndex(this.modelList.models[modelId].length, modelTexturesId);
        if (index == modelTexturesId) return;
        this.loadModel(modelId, index);
    }

    async loadlive2d(target, modelId, modelTexturesId) {
        if (target.model_scale == null) target.model_scale = 1;
        if (target.center_x == null) target.center_x = 0.5;
        if (target.center_y == null) target.center_y = 0.5;
        if (target.anchor_x == null) target.anchor_x = 0.5;
        if (target.anchor_y == null) target.anchor_y = 0.5;

        PIXI.live2d.config.cubism4.setOpacityFromMotion = true;
        PIXI.live2d.SoundManager.volume = 0.9;

        if (this.loadedList[modelId] != null && this.loadedList[modelId][modelTexturesId] != null) {
            let model = this.loadedList[modelId][modelTexturesId];
            if (this.currentModel != null) this.currentModel.visible = false;
            model.visible = true;
            this.currentModel = model;
            model.motion('born');
        }
        else {
            let model = PIXI.live2d.Live2DModel.fromSync(this.modelPath + target.model_json);
            await this.addModelEvent(model, target);
            if (this.loadedList[modelId] == null) this.loadedList[modelId] = new Array();
            this.loadedList[modelId][modelTexturesId] = model;
        }
    }

    async addModelEvent(model, target) {
        model.once('load', () => {
            const liv2dDom = document.getElementById('live2d');
            model.rotation = Math.PI;
            model.skew.x = Math.PI;
            model.skew.y = Math.PI;
            model.scale.set(target.model_scale);
            model.anchor.set(target.anchor_x, target.anchor_y);
            model.x = liv2dDom.width * target.center_x;
            model.y = liv2dDom.height * target.center_y;
        });

        model.once('settingsJSONLoaded', (json) => {
            console.log('live2d mode settingsJSONLoaded');
        });

        model.once('ready', () => {
            console.log('live2d mode ready');
            if (this.currentModel != null) this.currentModel.visible = false;
            this.currentModel = model;
            this.app.stage.addChild(model);
            model.motion('born');
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
                model.motion('tap_leg');
            }
            if (hitAreas.includes("hand")) {
                model.motion('tap_hand');
            }
            if (hitAreas.includes("hm")) {
                model.motion('tap_hm');
            }
        });



    }



}

export default Model;
