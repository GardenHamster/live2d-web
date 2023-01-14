import showMessage from "./message.js";
import { nextIndex, randomIndex, randomSelection } from "./utils.js";

class Model {
    constructor(config) {
        let { modelPath, live2dPath } = config;
        if (!modelPath.endsWith("/")) modelPath += "/";
        if (!live2dPath.endsWith("/")) live2dPath += "/";
        this.lock = false;
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
        this.loadlive2d(target, modelId, modelTexturesId);
    }

    async loadNextModel() {
        if (this.lock) return;
        let modelId = localStorage.getItem("modelId");
        if (!this.modelList) await this.loadModelList();
        const index = (++modelId >= this.modelList.models.length) ? 0 : modelId;
        this.loadModel(index, 0);
    }

    async loadNextTexture() {
        if (this.lock) return;
        const modelId = Number(localStorage.getItem("modelId"));
        const modelTexturesId = Number(localStorage.getItem("modelTexturesId"));
        if (!this.modelList) await this.loadModelList();
        const index = nextIndex(this.modelList.models[modelId].length, modelTexturesId);
        if (index == modelTexturesId) return;
        this.loadModel(modelId, index);
    }

    async loadRandTexture() {
        if (this.lock) return;
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

        this.lock = true;
        PIXI.live2d.config.cubism4.setOpacityFromMotion = true;
        PIXI.live2d.SoundManager.volume = 0.5;

        if (this.loadedList[modelId] != null && this.loadedList[modelId][modelTexturesId] != null) {
            setTimeout(() => { this.lock = false; }, 500);
            let model = this.loadedList[modelId][modelTexturesId];
            if (this.currentModel != null) this.currentModel.visible = false;
            this.currentModel = model;
            this.currentModel.visible = true;
            this.currentModel.target = target;
            this.currentModel.idleTime = 0;
            this.currentModel.motion('born', undefined, PIXI.live2d.MotionPriority.NORMAL);
        }
        else {
            if (this.currentModel != null) this.currentModel.visible = false;
            let model = await PIXI.live2d.Live2DModel.fromSync(this.modelPath + target.model_json);
            await this.addModelEvent(model, target);
            if (this.loadedList[modelId] == null) this.loadedList[modelId] = new Array();
            this.loadedList[modelId][modelTexturesId] = model;
        }
    }

    async showModel() {
        if (this.currentModel == null) return;
        this.currentModel.visible = true;
        this.currentModel.idleTime = 0;
    }

    async hideModel() {
        if (this.currentModel == null) return;
        this.currentModel.visible = false;
        this.currentModel.idleTime = 0;
    }

    async showWaifuTips(text, timeout, priority) {
        if (this.currentModel == null) return false;
        if (this.currentModel.target.showWaifuTips == false) return false;
        showMessage(text, timeout, priority);
    }

    async addModelEvent(model, target) {
        model.motionGroups = function () {
            let motionGroups = model.settings.motions;
            if (motionGroups == null) motionGroups = model.settings.Motions;
            if (motionGroups == null) motionGroups = model.settings.FileReferences?.Motions;
            if (motionGroups == null) motionGroups = model.settings.FileReferences?.motions;
            return motionGroups;
        }

        model.once('load', () => {
            console.log('live2d mode loaded');
            const liv2dDom = document.getElementById('live2d');
            model.rotation = Math.PI;
            model.skew.x = Math.PI;
            model.skew.y = Math.PI;
            model.scale.set(target.model_scale, target.model_scale);
            model.anchor.set(target.anchor_x, target.anchor_y);
            model.x = liv2dDom.width * target.center_x;
            model.y = liv2dDom.height * target.center_y;
        });

        model.once('settingsJSONLoaded', (json) => {
            console.log('live2d mode settings loaded');
            model.settings = json;
        });

        model.once('ready', () => {
            console.log('live2d mode ready');
            setTimeout(() => { this.lock = false; }, 1000);
            const motionGroups = model.motionGroups();

            model.internalModel.motionManager.on('motionStart', (group, index, audio) => {
                console.log(`live2d mode motion '${group}' start`);
                if (motionGroups == null) return;
                let motions = motionGroups[group];
                if (motions == null) return;
                if (motions.length < index + 1) return;
                let motion = motions[index];
                if (motion == null) return;
                if (motion.text != null) showMessage(motion.text, 5000, 50);
            });

            model.internalModel.motionManager.state.shouldRequestIdleMotion = () => false;
            model.internalModel.motionManager.on('motionFinish', () => {
                setTimeout(function () {
                    if (!model.visible) return;
                    model.motion('idle', undefined, PIXI.live2d.MotionPriority.IDLE)
                }, 0);
            });

            setInterval(function () {
                let timingInterval = target.timingInterval;
                if (!model.visible) return;
                if (timingInterval == null) return;
                if (timingInterval <= 0) return;
                if (model.idleTime == null) model.idleTime = 0;
                if (model.idleTime != null) model.idleTime += 1000;
                if (model.idleTime < timingInterval) return;
                model.motion('timing', undefined, PIXI.live2d.MotionPriority.NORMAL)
                model.idleTime = 0;
            }, 1000);

            this.currentModel = model;
            this.currentModel.target = target;
            this.currentModel.idleTime = 0;
            this.app.stage.addChild(model);
            if (target.born_tip != null) showMessage(target.born_tip, 5000, 60);
            if (motionGroups != null && motionGroups['born'] != null) {
                model.motion('born', undefined, PIXI.live2d.MotionPriority.NORMAL);
            }
            else {
                model.motion('idle', undefined, PIXI.live2d.MotionPriority.IDLE);
            }
        });

        model.on('hit', (hitAreas) => {
            console.log('live2d mode hit,hitAreas=' + hitAreas.join(','));
            if (model.settings == null) return;
            const hitArea = hitAreas.length > 0 ? hitAreas[0].trim().toLowerCase() : randomSelection(hitAreas).trim().toLowerCase();
            const motionGroups = model.motionGroups();
            if (motionGroups == null || motionGroups.length == 0) return;
            for (let motionName in motionGroups) {
                if (motionName.trim().toLowerCase() != ('tap_' + hitArea)) continue;
                model.motion(motionName, undefined, PIXI.live2d.MotionPriority.FORCE);
                model.idleTime = 0;
                break;
            }
        });



    }



}

export default Model;
