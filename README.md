# 零一·环轨启序

**零一 AI 日新社专为社员制作的 DSH（DeepSeek Harness）开场动效。**

从银灰 Logo 亮起，到访问确认、双环归位与机械锁定，再以社员欢迎幕收束。近纯黑底板、黑白环轨与本地机械音效，让每次进入 DSH 都有属于日新社的开场仪式。

> 从零到一，让技术进步成为每个人的机会！

## 开场截图

以下为当前机械环轨版的实际浏览器截图。

![零一·环轨启序：零一 AI 日新社品牌开场](materials/previews/rixin-opening.png)

![零一·环轨启序：社员访问确认](materials/previews/rixin-authorization.png)

![零一·环轨启序：机械环轨核验](materials/previews/rixin-verification.png)

## 本地预览

需要 **Node.js 20 或更新版本**，无运行时依赖，无需执行 `npm install`。

```sh
git clone https://github.com/XiaoSiKe/zero-one-orbit-intro.git
cd zero-one-orbit-intro
npm start
```

打开 **[本地预览](http://127.0.0.1:4178/preview/rixin.html)**。macOS 也可以双击仓库根目录的 `打开DSH2预览.command`。

动效自动开场；前两步点击「授予访问权限」「确认身份」，或按 Enter / 空格继续。可通过右上角 SKIP 或 Esc 跳过，结束后点击「重新播放」。声音在首次点击或按键后解锁。画面里的授权和身份确认仅用于动效交互。

## 下载

在 **[GitHub Releases](https://github.com/XiaoSiKe/zero-one-orbit-intro/releases)** 下载社员预览版：

- `dsh-startup-screen-rixin-1.1.2.tgz`：DSH 插件包，包内版本为 `1.1.2-rixin.3`。
- `Source code (zip)` / `Source code (tar.gz)`：完整源码、截图与本地预览入口。
- `SHA256SUMS.txt`：插件包校验值。

当前发布已验证独立浏览器预览、自动化回归和插件打包。**新版 DSH Desktop 实机验收尚未完成，桌面接入仍暂停**；安装说明与适配状态见 [工程文档](dsh-startup-screen/RIXIN.md)。

## 维护入口

```sh
npm test                # 自动化回归检查
npm run sync:styles     # 编辑品牌 CSS 后同步运行时样式
npm run build:plugin    # 生成 dist/ 下的插件包
```

源码与工程说明在 [dsh-startup-screen/](dsh-startup-screen/RIXIN.md)，品牌样式真源为 `dsh-startup-screen/rixin-brand.css`，截图与试听在 [materials/previews/](materials/previews/README.md)。构建只生成插件包，不会安装、启用或重启 DSH。

## 来源与许可

基于 [沈宏宏的 dsh-startup-screen](https://github.com/6shenhonghong9/dsh-startup-screen) 1.1.2 二次开发，保留上游 Git 历史与 [MIT 许可](dsh-startup-screen/LICENSE)。零一 AI 日新社完成社员品牌与机械环轨动效定制。

第三方人声与音效沿用上游素材，权利说明见 [上游原始说明](dsh-startup-screen/UPSTREAM.md#免责声明) 与 [音频字段文档](dsh-startup-screen/AUDIO-FIELDS.md)。代码许可不覆盖第三方素材及社团品牌标识。
