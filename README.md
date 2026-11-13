# dsh-sidebar-dock

把 DeepSeek Harness 侧边栏里的面板列表（`插件`、`自动化任务`、各插件贡献的面板，以及 `更多`）折叠进 `新会话` 右侧的一个下拉菜单，让侧栏回归干净。

## 特性

- **紧凑收纳**：默认收起面板列表，只保留「新会话 + 菜单按钮」一行。
- **实时镜像**：菜单内容来自侧边栏所有激活面板的注册，新插件装好后自动出现在菜单里，并保留每个插件自己的图标。
- **按需固定**：每个菜单项右侧的眼睛按钮可以把对应面板固定回侧边栏，再点一次收起；也支持把 `更多` 固定回去。
- **持久记忆**：固定的选择保存在 `localStorage`（键 `dsh-sidebar-dock:pinned`），刷新或重启后保持不变。
- **功能不缺失**：`更多` 子菜单保留原有的「浏览更多插件」「创建你的插件」；「新会话」按钮保持原有快捷键与样式。
- **折叠兼容**：侧栏折叠成窄栏时自动切换为纯图标入口。

## 使用

点击「新会话」右侧的 `≡` 按钮打开面板菜单：

- 点击某项 → 打开对应面板；
- 点击某项右侧的眼睛 → 固定/收起该项到侧边栏；
- 进入「更多」→ 浏览更多插件 / 创建你的插件。

## 安装

```bash
cd profiles/web            # 或你的 profile 目录
dsh plugin install /path/to/dsh-sidebar-dock
```

或在插件市场中搜索 `dsh-sidebar-dock`。

## 开发

项目是单文件浏览器 Bundle（`client/index.js`），无构建步骤：

```bash
# 修改 client/index.js 后无需编译
dsh plugin install /path/to/dsh-sidebar-dock   # 或走 GUI 插件市场
```

开发时修改 `client/index.js` 会由 HMR 自动热更新，刷新页面即可生效。

## License

[MIT](LICENSE)