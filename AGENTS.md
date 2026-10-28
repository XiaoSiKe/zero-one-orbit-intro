# 零一DSH2 工作规则

- 本目录只维护黑白机械环轨插件；先读 `dsh-startup-screen/RIXIN.md`。4186 三角几何版属于同级 `../零一DSH1/`。
- 根目录只保留 `README.md`、`AGENTS.md`、`package.json`、`打开DSH2预览.command`、`dsh-startup-screen/`、`dist/`、`materials/`。不增加临时报告、截图或重复启动器。
- `npm start` 或 `npm run preview` 启动 4178 的 `/preview/rixin.html`；`npm test` 运行现有测试。Node.js 20+，原生 JS／CSS／SVG，无运行时依赖。
- 编辑 `dsh-startup-screen/rixin-brand.css` 后执行 `npm run sync:styles`；运行时 Logo 走本工程资源路由。维护脚本在 `dsh-startup-screen/scripts/`。
- `npm run build:plugin` 只生成 `dist/dsh-startup-screen-rixin-1.1.2.tgz`，不代表安装或启用。
- `materials/brand/` 保留原始银灰 Logo；`materials/previews/` 只放当前截图与试听，旧资料按日期进入 `materials/archive/`。不改 Logo 比例与细节。
- `materials/archive/2026-10-26-initial-concept/` 是退役原型；历史规则和配置快照为 `.txt`，不作为现役入口。
- 本工程的独立 Git 仓库位于项目根目录，保留上游 Git 历史与用户已有修改；移动前核对消费者，不混用两版包和开关，不建立跨项目源码或资产链接。
- 机械版桌面接入仍暂停。整理目录不执行 DSH 安装、卸载、配置切换、停服或应用重启；继续接入须用户明确要求。
- README 只保留当前入口，机制写工程文档。迁移凭证在 `materials/archive/workspace-split-2026-10-28.json`；不修改平台生成记忆。
- 正式名称为「零一·环轨启序」，面向零一 AI 日新社社员；GitHub 发布不包含 `materials/archive/` 下的本地历史资料和配置快照。
