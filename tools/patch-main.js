// 主进程文件 UI 文本汉化补丁
const fs = require('fs');

const patches = {
  'extracted/out/menu.js': [
    ['"No Recent Files"', '"无最近文件"'],
    ['"Clear Recent Files"', '"清除最近文件"'],
    ['"Open Recent"', '"打开最近"'],
    ['"Settings…"', '"设置…"'],
    ['label: "File"', 'label: "文件"'],
    ['"New File"', '"新建文件"'],
    ['"Open…"', '"打开…"'],
    ['"Dashboard"', '"工作台"'],
    ['"Import Image/SVG/Figma..."', '"导入图像/SVG/Figma..."'],
    ['"Export Selection to..."', '"导出所选内容为..."'],
    ['"Export Snapshot..."', '"导出快照..."'],
    ['"Reset to First Run"', '"重置为首次运行"'],
    ['"Guide: How to Export Design to Code..."', '"指南：如何将设计导出为代码..."'],
    ['"Guide: How to Import from Figma..."', '"指南：如何从 Figma 导入..."'],
    ['"Install \'pen\' CLI..."', '"安装 \'pen\' CLI..."'],
    ['label: "Save"', 'label: "保存"'],
    ['"Save As…"', '"另存为…"'],
    ['label: "Edit"', 'label: "编辑"'],
    ['"Undo"', '"撤销"'],
    ['"Redo"', '"重做"'],
    ['label: "View"', 'label: "视图"'],
    ['"Show/Hide UI"', '"显示/隐藏界面"'],
    ['"Agent Chat Text Size"', '"Agent 聊天文字大小"'],
    ['{ label: "Small", value: "small" }', '{ label: "小", value: "small" }'],
    ['{ label: "Medium", value: "medium" }', '{ label: "中", value: "medium" }'],
    ['{ label: "Large", value: "large" }', '{ label: "大", value: "large" }'],
    ['"Toggle Developer Tools"', '"切换开发者工具"'],
    ['label: "Window"', 'label: "窗口"'],
    ['"Toggle Light/Dark Mode"', '"切换浅色/深色模式"'],
    ['"Organize Windows into Grid"', '"将窗口排列为网格"'],
    ['label: "Help"', 'label: "帮助"'],
    ['`${appDisplayName} Documentation`', '`${appDisplayName} 文档`'],
    ['"Prompt Gallery && Tips"', '"提示词画廊 && 小技巧"'],
    ['"pen.dev Website"', '"pen.dev 官网"'],
    ['"Cursor Extension"', '"Cursor 扩展"'],
    ['"VSCode Extension"', '"VSCode 扩展"'],
    ['"Join Our Discord"', '"加入我们的 Discord"'],
    ['"Restart && Install Update"', '"重启 && 安装更新"'],
    ['"Check for Updates…"', '"检查更新…"'],
    ['`About ${appDisplayName}`', '`关于 ${appDisplayName}`'],
    ['`Hide ${appDisplayName}`', '`隐藏 ${appDisplayName}`'],
    ['`Quit ${appDisplayName}`', '`退出 ${appDisplayName}`'],
    ['"No Updates Available"', '"没有可用更新"'],
    ['"There are currently no updates available."', '"当前没有可用更新。"'],
    ['"Import from Figma"', '"从 Figma 导入"'],
    ['"How to import from Figma"', '"如何从 Figma 导入"'],
    ['`1) Copy/Paste: Copy any layer or frame in Figma and paste it onto the canvas in ${appDisplayName}. Btw: Images are not included.\\n\\n2) Import .fig file: For a full import including images, export a .fig file from Figma (File > Save local copy) and drag and drop it onto ${appDisplayName}.\\n\\nNote: Some advanced graphics features might not yet be supported. Multi-page .fig files are not supported yet (can choose which page to import).`',
     '`1) 复制/粘贴：在 Figma 中复制任意图层或画框，粘贴到 ${appDisplayName} 画布上。注意：不包含图像。\\n\\n2) 导入 .fig 文件：要完整导入（包括图像），请从 Figma 导出 .fig 文件（File > Save local copy），然后拖放到 ${appDisplayName} 上。\\n\\n注意：部分高级图形特性可能暂不支持。暂不支持多页 .fig 文件（可选择要导入的页面）。`'],
    ['"Import Image, SVG or Figma"', '"导入图像、SVG 或 Figma 文件"'],
    ['"Images & Figma"', '"图像和 Figma 文件"'],
    ['"All Files"', '"所有文件"'],
  ],
  'extracted/out/app.js': [
    ['"Select Workspace Folder"', '"选择工作区文件夹"'],
    ['"Select Claude Executable"', '"选择 Claude 可执行文件"'],
    ['"Sign-in was not completed."', '"登录未完成。"'],
    ['"Select a skill"', '"选择一个 skill"'],
    ['`Do you want to remove the ${name} skill from pen.dev?`', '`确定要从 pen.dev 移除 ${name} skill 吗？`'],
    ['["Remove", "Cancel"]', '["移除", "取消"]'],
    ['"The folder and the SKILL.md won\'t be deleted."', '"文件夹和 SKILL.md 不会被删除。"'],
    ['"Open .pen file"', '"打开 .pen 文件"'],
    ['label: "New File"', 'label: "新建文件"'],
  ],
  'extracted/out/new-file-window.js': [
    ['title: "Blank"', 'title: "空白画布"'],
    ['"Start from an empty canvas"', '"从空白画布开始"'],
    ['"shadcn/ui component kit"', '"shadcn/ui 组件库"'],
    ['"Halo design system"', '"Halo 设计系统"'],
    ['"Lunaris design system"', '"Lunaris 设计系统"'],
    ['"Nitro design system"', '"Nitro 设计系统"'],
    ['`Delete "${name}"?`', '`删除"${name}"？`'],
    ['"This permanently deletes the file from your computer. This action can\'t be undone."', '"这将从你的电脑上永久删除该文件。此操作无法撤销。"'],
    ['title: "New File"', 'title: "新建文件"'],
  ],
  'extracted/out/desktop-resource-device.js': [
    ['"A snapshot upload is still in progress."', '"快照上传仍在进行中。"'],
    ['"Quitting now will leave an incomplete snapshot. The share link may not work until you publish again."', '"现在退出将留下不完整的快照。在重新发布之前，分享链接可能无法使用。"'],
    ['["Stay", "Quit Anyway"]', '["留下", "仍然退出"]'],
    ['"Choose folder to extract snapshot"', '"选择解压快照的文件夹"'],
    ['`Do you want to save the changes you made to ${displayName}?`', '`要保存对 ${displayName} 的更改吗？`'],
    ['["Save", "Don\'t Save", "Cancel"]', '["保存", "不保存", "取消"]'],
    ['"Your changes will be lost if you don\'t save them."', '"如果不保存，你的更改将丢失。"'],
    ['"Save .pen file as…"', '"另存 .pen 文件为…"'],
    ['"Save new .pen file"', '"保存新 .pen 文件"'],
  ],
};

let fail = 0;
for (const [file, pairs] of Object.entries(patches)) {
  let src = fs.readFileSync(file, 'utf8');
  for (const [from, to] of pairs) {
    const n = src.split(from).length - 1;
    if (n === 0) { console.error(`✗ 未匹配: ${file}: ${from.slice(0, 70)}`); fail++; continue; }
    src = src.split(from).join(to);
  }
  fs.writeFileSync(file, src);
}
console.error(fail === 0 ? '✓ 主进程补丁全部应用成功' : `有 ${fail} 条未匹配`);
