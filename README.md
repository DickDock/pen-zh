# Pen 桌面版中文本地化

[Pen](https://pen.dev) 桌面版（Electron，`dev.pencil.desktop`）的非官方中文化工具链。
通过解包 `app.asar`、替换 UI 字符串、重打包并重签名实现汉化。

## 流程

```bash
npm install

# 1. 解包（从已安装的 /Applications/Pen.app 提取）
#    app.asar -> extracted/
npx asar extract /Applications/Pen.app/Contents/Resources/app.asar extracted

# 2. 从 editor bundle 提取候选 UI 字符串 -> work/candidates.jsonl
node tools/extract.js

# 3. 翻译：在 work/zh-batch-*.tsv 中维护「id<TAB>中文」对照表

# 4. 应用主进程硬编码补丁（菜单、对话框等）
node tools/patch-main.js

# 5. 将 TSV 翻译回写进 editor bundle
node tools/apply.js

# 6. 重打包 asar（保持与原包相同的 unpack 规则）-> build/app.asar
node tools/pack.js

# 7. 替换并重签名（见下）
cp build/app.asar /Applications/Pen.app/Contents/Resources/app.asar
rm -rf /Applications/Pen.app/Contents/Resources/app.asar.unpacked
cp -R build/app.asar.unpacked /Applications/Pen.app/Contents/Resources/
```

## Windows 版流程

Windows 版（`Pen-win-x64.exe`）同样适用，翻译数据完全复用（两个平台的 UI
字符串一致，实测 875 条全部命中），且**不需要重签名**：

```powershell
# 1. 解开 NSIS 安装包（需要 7-Zip），再解里面的 app-64.7z 得到 app 目录
7z x Pen-win-x64.exe -owin-dl
7z x win-dl/'$PLUGINSDIR'/app-64.7z -owin-dl/app

# 2. 提取 Windows 版 asar
npx asar extract win-dl/app/resources/app.asar win-extracted

# 3. 应用翻译（按「英文原文->中文」映射，与平台无关）+ 主进程补丁
node tools/apply-map.js win-extracted/out/editor/assets/index.js
node tools/patch-main.js win-extracted

# 4. 重打包（Windows 的 unpack 规则不同）
node tools/pack-win.js

# 5. 替换到安装目录（通常在 %LOCALAPPDATA%\Programs\Pen\resources\），无需签名
```

注：Windows 版 Electron fuses 中 `EnableEmbeddedAsarIntegrityValidation`
为 Disabled，替换 asar 不会被完整性校验拦截。

## 重签名（关键）

修改 bundle 内任何文件都会破坏原签名。macOS 26 起 dyld 要求同一进程内所有
非平台二进制 Team ID 一致，**只签外层不够**——嵌套的 framework 和 Helper 必须
一起重签，否则启动即崩溃（`different Team IDs`）：

```bash
xattr -cr /Applications/Pen.app
for fw in "Electron Framework" "Mantle" "ReactiveObjC" "Squirrel"; do
  codesign --force --sign - "/Applications/Pen.app/Contents/Frameworks/${fw}.framework"
done
for helper in "Pen Helper" "Pen Helper (GPU)" "Pen Helper (Plugin)" "Pen Helper (Renderer)"; do
  codesign --force --sign - "/Applications/Pen.app/Contents/Frameworks/${helper}.app"
done
codesign --force --sign - --entitlements backup/entitlements.plist /Applications/Pen.app
codesign --verify --deep --strict --verbose=2 /Applications/Pen.app
```

## 目录说明

| 路径 | 用途 |
|---|---|
| `tools/extract.js` | 从 minified bundle 提取候选 UI 字符串 |
| `tools/patch-main.js` | 主进程硬编码文本补丁（菜单等），`node tools/patch-main.js [根目录]` |
| `tools/apply.js` | 将 TSV 翻译回写进 bundle（按 candidates id 关联，macOS 流程） |
| `tools/apply-map.js` | 按「英文原文→中文」映射回写，平台无关（Windows/其他平台用） |
| `tools/pack.js` | 重打包 macOS 版 asar，保持原 unpack 规则 |
| `tools/pack-win.js` | 重打包 Windows 版 asar（win32-x64 unpack 规则） |
| `work/candidates.jsonl` | 提取出的候选字符串（id、原文、key、出现次数） |
| `work/zh-batch-*.tsv` | 翻译对照表：`id<TAB>中文` |
| `backup/entitlements.plist` | 重签名用的 entitlements |
| `backup/app.asar.orig` | 原始 asar 备份（未入库） |

## 注意

- Pen 官方更新会覆盖已安装的应用，补丁需重新应用（macOS 与 Windows 同）。
- 仅限个人本地使用，请勿分发修改后的应用。
