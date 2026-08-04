# Backend Harness Rules (`apps/server`)

本目录下的所有规则文件都适用于 `apps/server`。新增后端规则时直接在此目录新增 Markdown 文件即可。

## 数据库字段变更审批（强制）

凡是添加数据库字段的行为，都必须经过用户审批。涉及 Schema、Model、迁移、索引、约束或持久化结构的规则，必须在写代码前暂停并申请明确批准。
