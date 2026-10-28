# 零一·环轨启序

**零一 AI 日新社专为社员制作的 DSH（DeepSeek Harness）开场动效。**

近纯黑底板、原始银灰 Logo、双环归位、导轨锁定与机械音效，依次推进访问确认、身份核验和社员欢迎幕。

完整截图、源码下载与项目入口见 [GitHub 项目首页](https://github.com/XiaoSiKe/zero-one-orbit-intro#readme)。

## 预览

Node.js 20+，无需安装依赖。在本目录或插件包解压后的 `package/` 中运行：

```sh
npm start
```

打开 [4178 本地预览](http://127.0.0.1:4178/preview/rixin.html)。前两步点击按钮或按 Enter / 空格继续；SKIP / Esc 跳过，结束后可重播。

## 检查与发布

```sh
npm test
```

完整源码仓库在项目根目录执行 `npm run sync:styles` 同步品牌样式，执行 `npm run build:plugin` 生成 `dist/dsh-startup-screen-rixin-1.1.2.tgz`。插件包内部版本为 `1.1.2-rixin.3`。

本版发布范围为独立预览与插件构建。新版 DSH Desktop 适配经过模拟宿主回归，实机验收尚未完成，桌面接入仍暂停。具体机制、适配状态与维护入口见 [RIXIN.md](RIXIN.md)。

## 来源与许可

基于 [6shenhonghong9/dsh-startup-screen](https://github.com/6shenhonghong9/dsh-startup-screen) 1.1.2（`060699e`）定制。保留 [MIT License © 沈宏宏](LICENSE)，社员品牌与机械环轨定制由零一 AI 日新社维护。

上游原始功能与第三方素材权利声明完整保留在 [UPSTREAM.md](UPSTREAM.md)。第三方人声、音效和社团品牌标识不属于代码 MIT 许可的授权范围。
