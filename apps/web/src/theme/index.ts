/**
 * ClipWiz — Ant Design 主题配置
 * ==============================
 * 将 theme.css 中的设计 Token 映射为 antd v5 的 ThemeConfig，
 * 保证 antd 组件（Button、Slider、Tabs 等）与全局设计规范一致。
 *
 * 使用方式：在 main.tsx 中
 *   import clipWizTheme from '@/theme'
 *   <ConfigProvider theme={clipWizTheme}>...</ConfigProvider>
 */

import { theme } from 'antd'
import type { ThemeConfig } from 'antd'

const clipWizTheme: ThemeConfig = {
  /**
   * 使用 antd 内置暗色算法作为基础，
   * 再通过 token / components 精细覆盖
   */
  algorithm: theme.darkAlgorithm,

  token: {
    /* ── 品牌色 ─────────────────────────────── */
    colorPrimary:          '#4f46e5', // --color-primary-container
    colorInfo:             '#4f46e5',
    colorLink:             '#c3c0ff', // --color-primary
    colorLinkHover:        '#e5e2ff',
    colorLinkActive:       '#4f46e5',

    /* ── 状态色 ──────────────────────────────── */
    colorError:            '#f87171',
    colorWarning:          '#fbbf24',
    colorSuccess:          '#34d399',

    /* ── 背景 ───────────────────────────────── */
    colorBgBase:           '#131314', // --color-surface
    colorBgContainer:      '#1b1b1c', // --color-surface-container
    colorBgElevated:       '#2a2a2b', // --color-surface-container-high
    colorBgLayout:         '#131314',
    colorBgSpotlight:      '#2a2a2b',
    colorBgMask:           'rgba(0, 0, 0, 0.60)',

    /* ── 文字 ───────────────────────────────── */
    colorText:             '#e5e2e3', // --color-on-surface
    colorTextSecondary:    '#a1a1a1', // --color-on-surface-variant
    colorTextTertiary:     '#6b6b6b', // --color-on-surface-muted
    colorTextQuaternary:   '#4a4a4a',
    colorTextDisabled:     '#4a4a4a',
    colorTextPlaceholder:  '#6b6b6b',

    /* ── 边框 / 分割线 ───────────────────────── */
    colorBorder:           '#2a2a2b', // --color-border
    colorBorderSecondary:  'rgba(255, 255, 255, 0.06)',
    colorSplit:            'rgba(255, 255, 255, 0.06)',
    colorFill:             'rgba(255, 255, 255, 0.06)',
    colorFillSecondary:    'rgba(255, 255, 255, 0.04)',
    colorFillTertiary:     'rgba(255, 255, 255, 0.02)',
    colorFillQuaternary:   'rgba(255, 255, 255, 0.01)',

    /* ── 字体 ───────────────────────────────── */
    fontFamily:
      '"Inter", ui-sans-serif, system-ui, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    fontFamilyCode:
      '"JetBrains Mono", ui-monospace, SFMono-Regular, "Courier New", monospace',
    fontSize:              14,
    fontSizeSM:            12,
    fontSizeLG:            16,
    fontSizeXL:            18,
    fontSizeHeading1:      24,
    fontSizeHeading2:      20,
    fontSizeHeading3:      18,
    fontSizeHeading4:      16,
    fontSizeHeading5:      14,

    /* ── 圆角 ───────────────────────────────── */
    borderRadius:          6,  // --radius-md
    borderRadiusSM:        4,  // --radius-sm
    borderRadiusLG:        8,  // --radius-lg
    borderRadiusXS:        2,  // --radius-xs

    /* ── 控件高度 ────────────────────────────── */
    controlHeight:         32,
    controlHeightSM:       24,
    controlHeightLG:       40,

    /* ── 线条 ───────────────────────────────── */
    lineWidth:             1,
    lineType:              'solid',

    /* ── 动效（保持轻量） ─────────────────────── */
    motionBase:            0,
    motionUnit:            0.08,
    motionDurationFast:    '0.08s',
    motionDurationMid:     '0.16s',
    motionDurationSlow:    '0.24s',

    /* ── 间距 ───────────────────────────────── */
    padding:               16,
    paddingSM:             12,
    paddingXS:             8,
    paddingXXS:            4,
    paddingLG:             24,
    margin:                16,
    marginSM:              12,
    marginXS:              8,
    marginLG:              24,
  },

  components: {
    /* ── Layout ─────────────────────────────── */
    Layout: {
      headerBg:      '#1b1b1c',
      headerHeight:  52,
      headerPadding: '0 16px',
      bodyBg:        '#131314',
      siderBg:       '#1b1b1c',
      footerBg:      '#131314',
      footerPadding: '12px 16px',
    },

    /* ── Button ─────────────────────────────── */
    Button: {
      // 显式覆盖，防止 darkAlgorithm 对主色做降饱和处理
      colorPrimary:            '#4f46e5',
      colorPrimaryHover:       '#6366f1',
      colorPrimaryActive:      '#4338ca',
      defaultBg:               '#2a2a2b',
      defaultBorderColor:      'rgba(255, 255, 255, 0.10)',
      defaultColor:            '#e5e2e3',
      defaultHoverBg:          '#333335',
      defaultHoverBorderColor: 'rgba(255, 255, 255, 0.20)',
      defaultHoverColor:       '#ffffff',
      defaultActiveBg:         '#1f1f20',
      primaryShadow:           'none',
      defaultShadow:           'none',
      dangerShadow:            'none',
      ghostBg:                 'transparent',
    },

    /* ── Input ──────────────────────────────── */
    Input: {
      colorBgContainer:    '#1b1b1c',
      activeBorderColor:   '#4f46e5',
      hoverBorderColor:    'rgba(79, 70, 229, 0.60)',
      activeShadow:        '0 0 0 2px rgba(79, 70, 229, 0.20)',
      addonBg:             '#2a2a2b',
    },

    /* ── Select ─────────────────────────────── */
    Select: {
      colorBgContainer:    '#1b1b1c',
      optionSelectedBg:    'rgba(79, 70, 229, 0.20)',
      optionSelectedColor: '#c3c0ff',
      optionActiveBg:      'rgba(255, 255, 255, 0.05)',
      selectorBg:          '#1b1b1c',
    },

    /* ── Tabs ───────────────────────────────── */
    Tabs: {
      inkBarColor:         '#4f46e5',
      itemColor:           '#a1a1a1',
      itemSelectedColor:   '#c3c0ff',
      itemHoverColor:      '#e5e2e3',
      cardBg:              '#1b1b1c',
      titleFontSize:       13,
    },

    /* ── Menu ───────────────────────────────── */
    Menu: {
      itemBg:              '#1b1b1c',
      itemSelectedBg:      'rgba(79, 70, 229, 0.20)',
      itemSelectedColor:   '#c3c0ff',
      itemHoverBg:         'rgba(255, 255, 255, 0.05)',
      itemHoverColor:      '#e5e2e3',
      subMenuItemBg:       '#131314',
      activeBarBorderWidth: 0,
    },

    /* ── Slider ─────────────────────────────── */
    Slider: {
      railBg:              '#2a2a2b',
      railHoverBg:         '#333335',
      trackBg:             '#4f46e5',
      trackHoverBg:        '#6366f1',
      handleColor:         '#c3c0ff',
      handleActiveColor:   '#ffffff',
      handleActiveOutlineColor: 'rgba(79, 70, 229, 0.30)',
      dotActiveBorderColor: '#4f46e5',
      dotBorderColor:      '#2a2a2b',
    },

    /* ── Modal ──────────────────────────────── */
    Modal: {
      contentBg:           '#1b1b1c',
      headerBg:            '#1b1b1c',
      footerBg:            '#1b1b1c',
      titleColor:          '#e5e2e3',
    },

    /* ── Tooltip ────────────────────────────── */
    Tooltip: {
      colorBgSpotlight:    '#2a2a2b',
      colorTextLightSolid: '#e5e2e3',
    },

    /* ── Dropdown ───────────────────────────── */
    Dropdown: {
      colorBgElevated:     '#2a2a2b',
      controlItemBgHover:  'rgba(255, 255, 255, 0.06)',
      controlItemBgActive: 'rgba(79, 70, 229, 0.20)',
    },

    /* ── Table ──────────────────────────────── */
    Table: {
      colorBgContainer:    '#1b1b1c',
      headerBg:            '#2a2a2b',
      rowHoverBg:          'rgba(255, 255, 255, 0.04)',
      fixedHeaderSortActiveBg: '#2a2a2b',
      headerSplitColor:    'rgba(255, 255, 255, 0.06)',
      borderColor:         '#2a2a2b',
    },

    /* ── Card ───────────────────────────────── */
    Card: {
      colorBgContainer:    '#1b1b1c',
      headerBg:            '#1b1b1c',
      actionsLiHoverColor: '#c3c0ff',
    },

    /* ── Progress ───────────────────────────── */
    Progress: {
      remainingColor:      '#2a2a2b',
      defaultColor:        '#4f46e5',
    },

    /* ── Message ────────────────────────────── */
    Message: {
      contentBg:           '#2a2a2b',
      colorText:           '#e5e2e3',
    },

    /* ── Notification ───────────────────────── */
    Notification: {
      colorBgElevated:     '#2a2a2b',
    },

    /* ── Popover ────────────────────────────── */
    Popover: {
      colorBgElevated:     '#2a2a2b',
      titleMinWidth:       160,
    },

    /* ── Upload ─────────────────────────────── */
    Upload: {
      colorFillAlter:      '#1b1b1c',
      colorBorder:         '#2a2a2b',
    },

    /* ── Tag ────────────────────────────────── */
    Tag: {
      defaultBg:           '#2a2a2b',
      defaultColor:        '#a1a1a1',
    },

    /* ── Badge ──────────────────────────────── */
    Badge: {
      colorBgContainer:    '#131314',
    },

    /* ── Divider ────────────────────────────── */
    Divider: {
      colorSplit:          'rgba(255, 255, 255, 0.06)',
    },

    /* ── Typography ─────────────────────────── */
    Typography: {
      colorText:           '#e5e2e3',
      colorTextSecondary:  '#a1a1a1',
      colorTextDisabled:   '#4a4a4a',
      titleMarginBottom:   '0.5em',
    },

    /* ── Form ───────────────────────────────── */
    Form: {
      labelColor:          '#a1a1a1',
      labelRequiredMarkColor: '#f87171',
    },
  },
}

export default clipWizTheme
