# live2d-web
## 简介
- 一个自用的web端的看板娘项目，魔改自 [stevenjoezhang/live2d-widget](https://github.com/stevenjoezhang/live2d-widget)

## 魔改部分
- 引用了 [guansss/pixi-live2d-display](https://github.com/guansss/pixi-live2d-display) 的项目，以便支持其他版本的模型，基于[PixiJSv6.5.6](https://github.com/pixijs/pixijs/releases/tag/v6.5.6)

- 修改了`model_list.json`的格式，可自行调整模型大小和位置，播放对应的音频，显示对应的对话信息，可调整闲时动画的间隔

- 移除了对 [live2d_api](https://github.com/fghrsh/live2d_api) 的依赖，触发点击事件的同时，对话框中显示model.json中与之对应的motion的text信息

- 移除了飞机大战和照相功能，加入了手机震动和看板随机按钮

## 声明
- 因为是本人自用的项目，因此并不会帮解决使用过程中出现的任何问题，请理性使用

## 使用
### 本地加载
- 将本项目克隆到本地，然后在页面中引入
```js
<script src="./live2d-web/live2d-web.js"></script>
<script>
    if (screen.width >= 768) {
        let localConfig = {
            live2d_path: './live2d-web/',
            model_path: './live2d-web/model/'
        };
        initLive2d(localConfig);//在合适的时机初始化
    }
</script>
```

### 通过CDN加载
```js
<script src="https://cdn.jsdelivr.net/gh/GardenHamster/live2d-web/live2d-web.js"></script>
<script>
    if (screen.width >= 768) {
        let cdnConfig = {
            live2d_path: 'https://cdn.jsdelivr.net/gh/GardenHamster/live2d-web/',
            model_path: 'https://cdn.jsdelivr.net/gh/GardenHamster/live2d-web/model/'
        };
        initLive2d(cdnConfig);//在合适的时机初始化
    }
</script>
```

## 添加模型
- 将模型文件夹复制到model目录下

- 根据自己的需要修改模型的`model.json`文件

- 将模型注册到根目录下的 [model_list.json](https://github.com/GardenHamster/live2d-web/blob/main/model_list.json)

### model.json
- 触摸动画对应的key为`tap_*****`，区分大小写
- 例如：触摸`head`对应的key为'tap_head'
- 例如：触摸`face`对应的key为'tap_face'
- 以此类推......

- 待机动画对应的key为`idle`，区分大小写

- 出场动画对应的key为`born`，区分大小写

- 震机动画对应的key为`shake`，区分大小写

- "motions"中的"timing"是我额外添加的参数，用于在循环播放`idle`的同时间可以间隔播放`timing`中的内容

- 详细可以参考 [theresa/model.json](https://github.com/GardenHamster/live2d-web/blob/main/model/Houkai-Gakuen2/theresa/model.json)

### model_list.json
- `models[0][0]`是启动页面后第一个加载的模型，可以根据自己的需要调整模型的位置
```jsonc
{
    "model_json": "Houkai-Gakuen2/theresa/model.json",//相对于model_path中的model.json路径
    "model_scale": 0.3, //模型缩放比例,可不填,默认:1
    "center_x": 0.5,    //模型的x坐标=(canvy.width*center_x),可不填,默认:0.5
    "center_y": 0.65,   //模型的y坐标=(canvy.height*center_y),可不填,默认:0.5
    "anchor_x": 0.5,    //相当于模型的中心点,center_x基于它进行偏移,可不填,默认:0.5
    "anchor_y": 0.5,    //相当于模型的中心点,center_y基于它进行偏移,可不填,默认:0.5
    "born_tip": "德丽莎世界第一可爱",//模型加载完毕后,对话框中显示的信息,比model.json中text的优先级高
    "timingInterval": 60000,//如果该值>0，则会按照这个间隔播放名为'timing'的motions，单位：毫秒
    "showWaifuTips": false //对话框中是否显示waifu-tips.json中的信息,可不填,默认为true
}
```

### 修改样式
- 图标大小和看板娘位置等需要自行修改根目录下的`waifu.css`

### 分享一些我找到的模型仓库
- https://github.com/Eikanya/Live2d-model
- https://github.com/imuncle/live2d

## 效果
- 可以在 [Github Page](https://gardenhamster.github.io/live2d-web) 左下角看到效果 

![image](https://user-images.githubusercontent.com/89188316/210346873-631a598b-0cb8-4b95-a47b-2691781c7b3b.png)
![image](https://user-images.githubusercontent.com/89188316/210347110-ef1ba4c0-87db-4aaf-a140-0b2bc79ef500.png)

