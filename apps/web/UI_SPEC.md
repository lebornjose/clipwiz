# ClipWiz UI 设计规范

> 版本：v1.0 · 适用范围：`apps/web`
>
> 所有新增组件和页面必须遵守本规范。禁止在业务代码中硬编码颜色、字体、间距等设计值，统一使用 CSS 变量或 antd ThemeConfig 中定义的 Token。

---

## 目录

1. [设计原则](#1-设计原则)
2. [文件结构](#2-文件结构)
3. [色彩系统](#3-色彩系统)
4. [字体系统](#4-字体系统)
5. [间距系统](#5-间距系统)
6. [圆角与阴影](#6-圆角与阴影)
7. [层叠与动效](#7-层叠与动效)
8. [布局规范](#8-布局规范)
9. [组件规范（Ant Design）](#9-组件规范ant-design)
10. [图标规范](#10-图标规范)
11. [状态规范](#11-状态规范)
12. [Less 样式规范](#12-less-样式规范)
13. [开发规范检查清单](#13-开发规范检查清单)

---

## 1. 设计原则

| 原则 | 说明 |
|------|------|
| **暗色优先** | 全部界面采用深色主题，无亮色模式切换 |
| **低饱和度** | 背景使用接近黑色的深灰，避免纯黑 `#000000`，减少视觉疲劳 |
| **品牌紫调** | 唯一强调色为靛蓝紫（`#4f46e5`），文字级 primary 使用浅紫（`#c3c0ff`） |
| **最小化装饰** | 无多余阴影、渐变、描边；只在必要交互处使用视觉反馈 |
| **密度适中** | 编辑器场景信息密集，控件尺寸取 sm（24px）至默认（32px），不使用 lg |

---

## 2. 文件结构

```
src/
├── styles/
│   └── theme.css        ← CSS 变量 / Token 定义（唯一来源）
├── theme/
│   └── index.ts         ← antd ThemeConfig（映射 CSS 变量到 antd token）
├── index.css            ← 仅 @import theme.css，不写业务样式
└── components/
    └── <Module>/
        ├── index.tsx
        └── index.less   ← 业务组件样式，引用 CSS 变量
```

> **核心规则**：`theme.css` 是所有设计值的唯一来源（Single Source of Truth）。

---

## 3. 色彩系统

### 3.1 色板

整体采用 **Material You** 命名体系，分为主色、表面色、文字色、状态色四层。

#### 主色（Brand Purple）

| Token | 值 | 用途 |
|-------|----|------|
| `--color-primary` | `#c3c0ff` | 文字/图标级 primary；Tab 高亮文字、链接 |
| `--color-primary-container` | `#4f46e5` | 按钮、进度条、选中背景等强调填充色 |
| `--color-primary-hover` | `#6366f1` | primary-container 的 hover 状态 |
| `--color-primary-active` | `#4338ca` | primary-container 的 pressed 状态 |
| `--color-primary-subtle` | `rgba(79,70,229,0.15)` | 选中行/高亮区域背景 |
| `--color-on-primary` | `#ffffff` | 在 primary-container 上的文字 |

#### 表面色（Surface）

| Token | 值 | 用途 |
|-------|----|------|
| `--color-surface` | `#131314` | 全局页面背景（最底层） |
| `--color-surface-container` | `#1b1b1c` | 面板、卡片、侧边栏背景 |
| `--color-surface-container-high` | `#2a2a2b` | 悬浮层、Dropdown、Tooltip 背景 |
| `--color-surface-container-low` | `#161617` | 嵌入式区域、时间轴轨道底色 |
| `--color-surface-overlay` | `rgba(0,0,0,0.60)` | Modal 遮罩 |

#### 文字色（On Surface）

| Token | 值 | 用途 |
|-------|----|------|
| `--color-on-surface` | `#e5e2e3` | 主要文字（标题、正文） |
| `--color-on-surface-variant` | `#a1a1a1` | 次要文字（标签、描述、Tab 默认态） |
| `--color-on-surface-muted` | `#6b6b6b` | 禁用态文字、占位符 |
| `--color-on-surface-inverse` | `#131314` | 亮色背景上的反色文字（极少使用） |

#### 边框色

| Token | 值 | 用途 |
|-------|----|------|
| `--color-border` | `#2a2a2b` | 常规边框、分割线 |
| `--color-border-subtle` | `rgba(255,255,255,0.06)` | 极弱分割，表格行边框等 |
| `--color-border-focus` | `#4f46e5` | 输入框聚焦轮廓 |

#### 状态色

| Token | 值 | 背景 Token | 用途 |
|-------|----|-----------|------|
| `--color-danger` | `#f87171` | `--color-danger-bg: rgba(248,113,113,0.12)` | 错误、删除 |
| `--color-warning` | `#fbbf24` | `--color-warning-bg: rgba(251,191,36,0.12)` | 警告 |
| `--color-success` | `#34d399` | `--color-success-bg: rgba(52,211,153,0.12)` | 成功 |
| `--color-info` | `#60a5fa` | `--color-info-bg: rgba(96,165,250,0.12)` | 信息提示 |

### 3.2 颜色使用规则

```
✅ 正确
color: var(--color-on-surface);
background: var(--color-surface-container);
border-color: var(--color-border);

❌ 错误
color: #e5e2e3;          /* 硬编码颜色 */
background: #1890ff;     /* antd 默认蓝，已被替换 */
color: white;            /* 语义不明 */
```

---

## 4. 字体系统

### 4.1 字体族

| Token | 栈 | 场景 |
|-------|----|------|
| `--font-sans` | Inter → PingFang SC → Microsoft YaHei → sans-serif | 所有 UI 文字 |
| `--font-mono` | JetBrains Mono → SFMono-Regular → Courier New | 时间码、代码、文件名 |

> Inter 为首选字体，需确保 CDN 或本地加载；中文回退到系统字体。

### 4.2 字号

| Token | 值 | 对应场景 |
|-------|----|---------|
| `--font-size-xs` | 11px | 时间轴刻度标签、角标 |
| `--font-size-sm` | 12px | 工具提示、辅助说明 |
| `--font-size-base` | 13px | 时间轴轨道内文字 |
| `--font-size-md` | 14px | **默认正文**、按钮、表单 |
| `--font-size-lg` | 16px | 小标题、卡片标题 |
| `--font-size-xl` | 18px | 模块标题 |
| `--font-size-2xl` | 22px | 页面级标题（极少使用） |

### 4.3 字重

| Token | 值 | 用途 |
|-------|----|------|
| `--font-weight-normal` | 400 | 正文、说明 |
| `--font-weight-medium` | 500 | 标签、次级标题 |
| `--font-weight-semibold` | 600 | 标题、强调 |
| `--font-weight-bold` | 700 | 极少使用 |

### 4.4 时间码格式

时间码（`VideoControls`）使用 `--font-mono`，格式为 `MM:SS:FF`（分:秒:帧），精度 1 帧 = 0.04s（25fps）。

---

## 5. 间距系统

基础单位 **4px**，所有间距必须是 4 的倍数。

| Token | 值 | 语义别名 | 典型用途 |
|-------|----|---------|---------|
| `--spacing-1` | 4px | `--spacing-xs` | 图标与文字间距 |
| `--spacing-2` | 8px | `--spacing-sm` | 紧凑内边距、行内间距 |
| `--spacing-3` | 12px | `--spacing-md` | 表单行间距 |
| `--spacing-4` | 16px | `--spacing-lg` | 标准内边距、卡片 padding |
| `--spacing-5` | 20px | — | 区块间距 |
| `--spacing-6` | 24px | `--spacing-xl` | 页面级区块 gap |
| `--spacing-8` | 32px | `--spacing-2xl` | 大区块分隔 |

---

## 6. 圆角与阴影

### 6.1 圆角

| Token | 值 | 用途 |
|-------|----|------|
| `--radius-xs` | 2px | Tag、Badge |
| `--radius-sm` | 4px | 按钮、输入框 |
| `--radius-md` | 6px | **默认** 卡片、面板 |
| `--radius-lg` | 8px | Modal、Dropdown |
| `--radius-xl` | 12px | 大卡片 |
| `--radius-full` | 9999px | 圆形按钮、头像 |

### 6.2 阴影

深色背景下阴影仅用于 **层级区分**，不作装饰。

| Token | 值 | 用途 |
|-------|----|------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.40)` | 悬浮按钮 |
| `--shadow-sm` | `0 2px 6px rgba(0,0,0,0.50)` | Dropdown、Popover |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.60)` | Modal |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.70)` | 通知、全屏弹层 |

---

## 7. 层叠与动效

### 7.1 Z-index 层级

| Token | 值 | 用途 |
|-------|----|------|
| `--z-base` | 0 | 普通元素 |
| `--z-raised` | 10 | 时间轴游标、浮动元素 |
| `--z-dropdown` | 100 | Dropdown、Select 弹出层 |
| `--z-sticky` | 200 | 固定顶栏、吸附工具栏 |
| `--z-modal` | 300 | Modal、抽屉 |
| `--z-toast` | 400 | Message、Notification |
| `--z-tooltip` | 500 | Tooltip（最高层） |

### 7.2 过渡动效

| Token | 值 | 用途 |
|-------|----|------|
| `--transition-fast` | `80ms ease` | 颜色、透明度变化 |
| `--transition-normal` | `160ms ease` | 通用 hover 状态 |
| `--transition-slow` | `300ms ease` | 面板展开/收起 |
| `--transition-spring` | `240ms cubic-bezier(0.34,1.56,0.64,1)` | 弹性弹出动效 |

> 视频编辑器场景对性能敏感，**时间轴区域的所有元素禁止使用 CSS transition**（参考 `App.css` 中 `.dragging` 的 `transition: none` 处理）。

---

## 8. 布局规范

### 8.1 核心尺寸

| Token | 值 | 说明 |
|-------|----|------|
| `--layout-header-height` | 52px | 顶部导航栏高度 |
| `--layout-sidebar-width` | 240px | 左侧素材面板宽度 |
| `--layout-toolbar-width` | 48px | 左侧图标工具栏宽度 |
| `--timeline-track-height` | 32px | 时间轴普通轨道高度 |
| `--timeline-video-height` | 100px | 时间轴视频轨道高度（含缩略图） |

### 8.2 整体布局结构

```
┌─────────────────────────────────────────────────────┐  52px  Header
├────────┬────────────────────────────┬────────────────┤
│ 48px   │                            │   右侧属性面板  │
│ 工具栏  │     中央预览区（<canvas>）   │   （按需显示）  │  可变高
│        │                            │                │
├────────┴────────────────────────────┴────────────────┤
│                    拖动分隔条（8px）                   │
├───────────────────────────────────────────────────── ┤
│                    时间轴区域                          │  默认 300px
└─────────────────────────────────────────────────────┘
```

### 8.3 间距约定

- 页面内容区域的 `padding`：`var(--spacing-6)` (24px)
- 卡片/面板内部 `padding`：`var(--spacing-4)` (16px)
- 兄弟组件 `gap`：`var(--spacing-4)` (16px) 或 `var(--spacing-6)` (24px)
- 工具栏图标间距：`var(--spacing-2)` (8px)

---

## 9. 组件规范（Ant Design）

所有 antd 组件通过 `<ConfigProvider theme={clipWizTheme}>` 全局注入主题，原则上**不需要**在组件上重复传 `style` 覆盖颜色。

### 9.1 Button

| 场景 | type | size | 说明 |
|------|------|------|------|
| 主要操作（导出、确认） | `primary` | `small` / default | 填充 `--color-primary-container` |
| 次要操作（取消、重置） | `default` | `small` | 填充 `--color-surface-container-high` |
| 危险操作（删除） | `primary` + `danger` | `small` | 填充 `--color-danger` |
| 纯图标工具栏 | `text` | `small` | 无背景，hover 显示轻微背景 |

```tsx
// ✅ 正确
<Button type="primary" size="small">导出视频</Button>
<Button type="text" icon={<DeleteOutlined />} danger />

// ❌ 错误 — 不要用 style 覆盖主题色
<Button style={{ backgroundColor: '#4f46e5' }}>导出</Button>
```

### 9.2 Tabs（左侧面板）

- `type="line"`（下划线风格），禁止 `type="card"`
- `size="small"`
- 默认态：`--color-on-surface-variant`，选中态：`--color-primary`
- 底部指示线：`--color-primary-container`

### 9.3 Slider（进度条、音量）

- 滑轨颜色：`--color-surface-container-high`
- 已填充：`--color-primary-container`
- 滑块手柄：`--color-primary`
- 进度条精度设置为 `step={0.04}`（1 帧）

### 9.4 Input / Select

- 背景：`--color-surface-container`
- 聚焦边框：`--color-border-focus`
- 聚焦光晕：`rgba(79, 70, 229, 0.20)`
- 尺寸统一使用 `size="small"`（编辑器面板）

### 9.5 Modal

- 宽度根据内容，建议 `480px`（中等）或 `720px`（大型）
- 背景：`--color-surface-container`
- 禁止使用 `centered={false}`（保持居中显示）
- 关闭按钮保留，不要隐藏

### 9.6 Message / Notification

- 成功：配合 `--color-success`
- 错误：配合 `--color-danger`
- 持续时间：成功 2s，错误 4s，警告 3s

---

## 10. 图标规范

使用 `@ant-design/icons`，统一规则：

| 场景 | 尺寸 | 颜色 |
|------|------|------|
| 工具栏图标 | `16px` | `--color-on-surface-variant` |
| 工具栏图标 hover | `16px` | `--color-on-surface` |
| 轨道类型图标 | `14px` | `--color-on-surface-variant` |
| 操作按钮内图标 | 跟随按钮字号 | 继承 |
| 状态图标（成功/错误） | `14px` | 对应状态色 |

```tsx
// ✅ 图标尺寸通过 fontSize 控制，颜色通过 className/style 使用 CSS 变量
<ScissorOutlined style={{ fontSize: 16, color: 'var(--color-on-surface-variant)' }} />

// ❌ 不要使用魔法数字颜色
<ScissorOutlined style={{ color: '#a1a1a1' }} />
```

---

## 11. 状态规范

### 11.1 交互状态

每个可交互元素（按钮、列表项、轨道条等）必须定义以下状态：

| 状态 | 视觉变化 | 实现方式 |
|------|---------|---------|
| default | 基础样式 | — |
| hover | 背景亮度 +1 级 | `--color-surface-container-high` 或 `opacity: 0.8` |
| active/pressed | 背景亮度 -1 级 | `--color-primary-active` 或加深 |
| focus | 蓝色轮廓 `2px` | `--color-border-focus` + 光晕 |
| disabled | 文字 `--color-on-surface-muted`，不可点击 | `opacity: 0.4`，`cursor: not-allowed` |
| selected | 背景 `--color-primary-subtle` | 选中高亮 |
| loading | Spin 覆盖或按钮 `loading` prop | — |

### 11.2 空状态

- 文字：`--color-on-surface-muted`
- 图标：`--color-surface-container-high`
- 使用 antd `Empty` 组件，自定义 description

---

## 12. Less 样式规范

### 12.1 变量引用

```less
// ✅ 正确 — 使用 CSS 变量
.track-item {
  background: var(--color-surface-container);
  color:      var(--color-on-surface);
  border:     1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-surface-container-high);
  }

  &.active {
    background: var(--color-primary-subtle);
    border-color: var(--color-border-focus);
  }
}

// ❌ 错误 — 硬编码值
.track-item {
  background: #1b1b1c;
  color: #e5e2e3;
}
```

### 12.2 命名规则

- 遵循 **BEM**：`.block__element--modifier`
- 组件顶层类名与文件名一致，例如 `leftCon/index.less` → `.left-con`
- 布局类以 `-layout`、`-wrap`、`-container` 结尾
- 状态类以 `is-` 前缀：`is-active`、`is-disabled`、`is-selected`

### 12.3 媒体查询

编辑器不需要响应式，但禁止使用绝对像素硬编码布局，统一通过 JS 传入动态 `style` 或使用 CSS 变量中定义的布局尺寸 Token。

---

## 13. 开发规范检查清单

在提交 PR 前检查：

- [ ] 无硬编码颜色值（`#xxx`、`rgb()`、颜色名）
- [ ] 无硬编码字体名称（在 theme.css 变量之外）
- [ ] 无硬编码间距魔法数字（使用 `--spacing-*` 或 antd token 对应值）
- [ ] 新增 antd 组件已验证主题色正确（未出现蓝色 `#1890ff` 默认色）
- [ ] 时间轴区域元素无 CSS `transition`（拖拽性能）
- [ ] 可交互元素定义了 hover / focus / disabled 三态
- [ ] 图标颜色使用 CSS 变量而非硬编码
- [ ] Less 类名遵循 BEM，无全局污染选择器
- [ ] z-index 使用 `--z-*` Token，未出现随意数值（如 `z-index: 999`）
