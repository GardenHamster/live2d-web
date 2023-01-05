# live2d-web
## 简介
- 一个自用的web端的看板娘项目，魔改自 [stevenjoezhang/live2d-widget](https://github.com/stevenjoezhang/live2d-widget)
- 引用了[guansss/pixi-live2d-display](https://github.com/guansss/pixi-live2d-display)的项目，以便支持其他版本的模型

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
        initLive2d(localConfig);
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
        initLive2d(cdnConfig);
    }
</script>
```

## 效果
- 可以在 [Github Page](https://gardenhamster.github.io/live2d-web) 左下角看到效果 

![image](https://user-images.githubusercontent.com/89188316/210346873-631a598b-0cb8-4b95-a47b-2691781c7b3b.png)
![image](https://user-images.githubusercontent.com/89188316/210347110-ef1ba4c0-87db-4aaf-a140-0b2bc79ef500.png)

