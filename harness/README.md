# ClipWiz Custom Harness

本目录是 ClipWiz 的代码修改前置规则。任何新增、修改或删除代码的任务，都必须先执行 `preflight.md` 中的检查，再开始编辑文件。

## 使用方式

1. 确认目标文件属于 `apps/web`、`apps/server` 或其他目录。
2. 读取对应规则目录中的全部规则文件：`frontend/` 或 `backend/`。
3. 按 `preflight.md` 完成修改前检查。
4. 如果涉及 `packages/videoPlayer`，必须先阅读 `video-player-sdk.md` 并获得用户明确确认。
5. 如果触发数据库字段变更审批，必须先暂停编码并获得用户明确批准。

这些规则与根目录 `.AGENTS.md` 同时生效。

## 扩展规则

规则按领域分目录管理，可自由添加文件。例如：

- `harness/frontend/component.md`
- `harness/frontend/testing.md`
- `harness/backend/database.md`
- `harness/backend/api.md`
- `harness/video-player-sdk.md`

新增规则文件后，它会自动成为对应领域的写码前置规则。文件名应使用清晰、稳定的主题名称。
