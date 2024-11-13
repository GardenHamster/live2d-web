/*!
 * Live2D Widget
 * https://github.com/stevenjoezhang/live2d-widget
 */

(function (l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
    'use strict';

    let messageTimer;
    let currentModel;

    function randomSelection(obj) {
        return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj;
    }

    function randomIndex(length, current) {
        current = Number(current);
        if (length == 1) return 0;
        if (length == 2) return nextIndex(length, current);
        let index = Math.floor(Math.random() * length);
        return index == current ? randomIndex(length, current) : index;
    }

    function nextIndex(length, current) {
        current = Number(current);
        return current + 1 < length ? current + 1 : 0;
    }

    function showMessage(text, timeout, priority) {
        if (!text || (sessionStorage.getItem("waifu-text") && sessionStorage.getItem("waifu-text") > priority)) return;
        if (messageTimer) {
            clearTimeout(messageTimer);
            messageTimer = null;
        }
        text = randomSelection(text);
        sessionStorage.setItem("waifu-text", priority);
        const tips = document.getElementById("waifu-tips");
        tips.innerHTML = text;
        tips.classList.add("waifu-tips-active");
        messageTimer = setTimeout(() => {
            sessionStorage.removeItem("waifu-text");
            tips.classList.remove("waifu-tips-active");
        }, timeout);
    }

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
            if (modelId >= this.modelList.models.length) modelId = 0;
            if (modelTexturesId >= this.modelList.models[modelId].length) modelTexturesId = 0;
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

        async loadRandModel() {
            if (this.lock) return;
            const currentModelId = Number(localStorage.getItem("modelId"));
            if (!this.modelList) await this.loadModelList();
            const modelId = randomIndex(this.modelList.models.length, currentModelId);
            if (modelId == currentModelId) return;
            const modelTexturesId = Math.floor(Math.random() * this.modelList.models[modelId].length);
            this.loadModel(modelId, modelTexturesId);
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
                if (currentModel != null) currentModel.visible = false;
                currentModel = model;
                currentModel.visible = true;
                currentModel.target = target;
                currentModel.idleTime = 0;
                currentModel.motion('born', undefined, PIXI.live2d.MotionPriority.NORMAL);
            }
            else {
                if (currentModel != null) currentModel.visible = false;
                let model = await PIXI.live2d.Live2DModel.fromSync(this.modelPath + target.model_json);
                await this.addModelEvent(model, target);
                if (this.loadedList[modelId] == null) this.loadedList[modelId] = new Array();
                this.loadedList[modelId][modelTexturesId] = model;
            }
        }

        async showModel() {
            if (currentModel == null) return;
            currentModel.visible = true;
            currentModel.idleTime = 0;
        }

        async hideModel() {
            if (currentModel == null) return;
            currentModel.visible = false;
            currentModel.idleTime = 0;
        }

        async showWaifuTips(text, timeout, priority) {
            if (currentModel == null) return false;
            if (currentModel.target.showWaifuTips == false) return false;
            showMessage(text, timeout, priority);
        }

        async addModelEvent(model, target) {
            model.motionGroups = function () {
                let motionGroups = model.settings.motions;
                if (motionGroups == null) motionGroups = model.settings.Motions;
                if (motionGroups == null) motionGroups = model.settings.FileReferences?.Motions;
                if (motionGroups == null) motionGroups = model.settings.FileReferences?.motions;
                return motionGroups;
            };

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
                console.log(model);
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
                    let text = motion.text || motion.Text;
                    if (text != null) showMessage(text, 5000, 50);
                });

                model.internalModel.motionManager.state.shouldRequestIdleMotion = () => false;
                model.internalModel.motionManager.on('motionFinish', () => {
                    setTimeout(function () {
                        if (!model.visible) return;
                        model.motion('idle', undefined, PIXI.live2d.MotionPriority.IDLE);
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
                    model.motion('timing', undefined, PIXI.live2d.MotionPriority.NORMAL);
                    model.idleTime = 0;
                }, 1000);

                currentModel = model;
                currentModel.target = target;
                currentModel.idleTime = 0;
                this.app.stage.addChild(model);
                if (target.born_tip != null) showMessage(target.born_tip, 5000, 60);
                if (motionGroups != null && motionGroups['born'] != null) {
                    let born_expression = '';
                    if (!born_expression) born_expression = motionGroups['born'].expression;
                    if (!born_expression) born_expression = motionGroups['born'].Expression;
                    for (let index = 0; index < motionGroups['born'].length; index++) {
                        if (!born_expression) born_expression = motionGroups['born'][index].expression;
                        if (!born_expression) born_expression = motionGroups['born'][index].Expression;
                    }
                    if(born_expression){
                        model.expression(born_expression);
                    }
                }
                
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

    const fa_comment = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--! Font Awesome Free 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --><path d=\"M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4l0 0 0 0 0 0 0 0 .3-.3c.3-.3 .7-.7 1.3-1.4c1.1-1.2 2.8-3.1 4.9-5.7c4.1-5 9.6-12.4 15.2-21.6c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208z\"/></svg>";

    const fa_paper_plane = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--! Font Awesome Free 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --><path d=\"M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z\"/></svg>";

    const fa_user_circle = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--! Font Awesome Free 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --><path d=\"M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM512 256c0 141.4-114.6 256-256 256S0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM256 272c39.8 0 72-32.2 72-72s-32.2-72-72-72s-72 32.2-72 72s32.2 72 72 72z\"/></svg>";

    const fa_street_view = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--! Font Awesome Free 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --><path d=\"M320 64c0-35.3-28.7-64-64-64s-64 28.7-64 64s28.7 64 64 64s64-28.7 64-64zm-96 96c-35.3 0-64 28.7-64 64v48c0 17.7 14.3 32 32 32h1.8l11.1 99.5c1.8 16.2 15.5 28.5 31.8 28.5h38.7c16.3 0 30-12.3 31.8-28.5L318.2 304H320c17.7 0 32-14.3 32-32V224c0-35.3-28.7-64-64-64H224zM132.3 394.2c13-2.4 21.7-14.9 19.3-27.9s-14.9-21.7-27.9-19.3c-32.4 5.9-60.9 14.2-82 24.8c-10.5 5.3-20.3 11.7-27.8 19.6C6.4 399.5 0 410.5 0 424c0 21.4 15.5 36.1 29.1 45c14.7 9.6 34.3 17.3 56.4 23.4C130.2 504.7 190.4 512 256 512s125.8-7.3 170.4-19.6c22.1-6.1 41.8-13.8 56.4-23.4c13.7-8.9 29.1-23.6 29.1-45c0-13.5-6.4-24.5-14-32.6c-7.5-7.9-17.3-14.3-27.8-19.6c-21-10.6-49.5-18.9-82-24.8c-13-2.4-25.5 6.3-27.9 19.3s6.3 25.5 19.3 27.9c30.2 5.5 53.7 12.8 69 20.5c3.2 1.6 5.8 3.1 7.9 4.5c3.6 2.4 3.6 7.2 0 9.6c-8.8 5.7-23.1 11.8-43 17.3C374.3 457 318.5 464 256 464s-118.3-7-157.7-17.9c-19.9-5.5-34.2-11.6-43-17.3c-3.6-2.4-3.6-7.2 0-9.6c2.1-1.4 4.8-2.9 7.9-4.5c15.3-7.7 38.8-14.9 69-20.5z\"/></svg>";

    const fa_camera_retro = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--! Font Awesome Free 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --><path d=\"M220.6 121.2L271.1 96 448 96v96H333.2c-21.9-15.1-48.5-24-77.2-24s-55.2 8.9-77.2 24H64V128H192c9.9 0 19.7-2.3 28.6-6.8zM0 128V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H271.1c-9.9 0-19.7 2.3-28.6 6.8L192 64H160V48c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16l0 16C28.7 64 0 92.7 0 128zM344 304c0 48.6-39.4 88-88 88s-88-39.4-88-88s39.4-88 88-88s88 39.4 88 88z\"/></svg>";

    const fa_info_circle = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--! Font Awesome Free 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --><path d=\"M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-144c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z\"/></svg>";

    const fa_xmark = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 512\"><!--! Font Awesome Free 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --><path d=\"M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z\"/></svg>";

    const fa_shake = "<svg t=\"1713777743710\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"840\" width=\"32\" height=\"32\"><path d=\"M760.069547 0H264.069547C224.261547 0 192.048213 32.213333 192.048213 72.021333v880c0 39.765333 32.213333 71.978667 72.021334 71.978667h464c39.765333 0 103.978667-32.213333 103.978666-72.021333V72.021333C832.048213 32.213333 799.83488 0 760.069547 0z m-218.026667 960h-59.989333c-19.882667 0-34.005333-14.293333-34.005334-32s14.08-32 34.005334-32h59.989333c19.925333 0 34.005333 14.293333 34.005333 32s-14.08 32-34.005333 32z m218.026667-128.981333H264.069547v-704h496v704zM79.96288 26.112L36.144213 35.712a77.909333 77.909333 0 0 0-35.2 77.568l127.189334 831.829333L53.253547 91.989333c-2.133333-25.898667 8.533333-49.792 26.709333-65.877333zM130.053547 10.410667a78.336 78.336 0 0 0-41.898667 74.282666l54.016 839.68V68.053333c0-26.112 12.8-49.024 32.170667-63.402666L130.053547 10.410667z m858.026666 25.301333L944.261547 26.112c18.176 16 28.8 39.978667 26.453333 65.877333l-74.88 853.205334 127.232-831.786667a77.653333 77.653333 0 0 0-34.986667-77.696z m-52.053333 48.768a78.336 78.336 0 0 0-41.856-74.24L849.75488 4.437333c19.413333 14.506667 32.213333 37.418667 32.213333 63.530667v856.490667L936.069547 84.48z\" p-id=\"841\"></path></svg>";

    const fa_magic = "<svg t=\"1713779781144\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"1200\" width=\"64\" height=\"64\"><path d=\"M256 192L128 64H64v64l128 128z m64-192h64v128h-64z m256 320h128v64h-128z m64-192V64h-64l-128 128 64 64zM0 320h128v64H0z m320 256h64v128h-64z m-256 0v64h64l128-128-64-64z m946.016 306.016L373.888 245.888a48.16 48.16 0 0 0-67.872 0L245.888 306.016a48.16 48.16 0 0 0 0 67.872l636.128 636.128a48.16 48.16 0 0 0 67.872 0l60.128-60.128a48.16 48.16 0 0 0 0-67.872zM480 544l-192-192 64-64 192 192-64 64z\" p-id=\"1201\"></path></svg>";

    const fa_random = "<svg t=\"1713780427306\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"1380\" width=\"64\" height=\"64\"><path d=\"M511.994149 0c137.580142 0 266.675809 54.563948 362.053005 149.941144l29.841944 31.012217 32.694484 35.254454 74.89743 83.016194a49.517148 49.517148 0 1 1-74.092868 65.827819l-40.081828-44.689775-37.521856-41.2521-35.839591-38.472703-19.967772-20.62605a412.88671 412.88671 0 1 0 0 583.892755 49.517148 49.517148 0 0 1 70.070057 70.143199A511.994149 511.994149 0 1 1 511.994149 0z\" p-id=\"1381\"></path><path d=\"M974.471149 51.418841c25.087713 0 45.786905 18.578073 49.005154 42.788082L1023.988297 100.935989V332.064776a49.59029 49.59029 0 0 1-42.861224 49.078297l-6.655924 0.511994H743.122936a49.517148 49.517148 0 0 1-6.729066-98.668587l6.729066-0.438852h181.68478V100.935989c0-25.087713 18.651215-45.786905 42.861225-49.078296l6.729066-0.438852z\" p-id=\"1382\"></path></svg>";

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
        "switch-model": {
            icon: fa_user_circle,
            callback: () => { }
        },
        "switch-texture": {
            icon: fa_magic,
            callback: () => { }
        },
        "random": {
            icon: fa_random,
            callback: () => {
                if (!window.Live2dModel) return;
                window.Live2dModel.loadRandModel();
            }
        },
        "shake": {
            icon: fa_shake,
            callback: (json) => {
                if (currentModel != null) currentModel.motion("shake", undefined, PIXI.live2d.MotionPriority.FORCE);
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
                            document.getElementById(`waifu-tool-${tool}`).addEventListener("click", () => { callback(result); });
                        }
                    }
                });
        })();

        (function initModel() {
            let modelId = Number(localStorage.getItem("modelId"));
            let modelTexturesId = Number(localStorage.getItem("modelTexturesId"));
            let lastLoadAt = Number(localStorage.getItem("lastLoadAt"));
            let currentTime = new Date().getTime();
            if (lastLoadAt == null) lastLoadAt = 0;
            if (lastLoadAt < currentTime - 7 * 24 * 60 * 60 * 1000) {
                modelId = 0;
                modelTexturesId = 0;
                lastLoadAt = currentTime;
                localStorage.setItem("lastLoadAt", currentTime);
            }
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

    window.initWidget = initWidget;

})();
