<template>
  <div class="app">
    <!-- 背景图片 -->
    <div class="bg-image"></div>
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
      <div class="bg-dot bg-dot-1"></div>
      <div class="bg-dot bg-dot-2"></div>
      <div class="bg-dot bg-dot-3"></div>
      <div class="bg-dot bg-dot-4"></div>
    </div>
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <!-- 仅在已登录已领养后显示浮动怪兽和底部导航 -->
    <template v-if="showMainUI">
      <PetFloat ref="petRef" />
      <BottomNav />
    </template>
    <!-- 全屏锁定组件 -->
    <FullscreenLock />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { useRoute } from 'vue-router'
import PetFloat from './components/PetFloat.vue'
import BottomNav from './components/BottomNav.vue'
import FullscreenLock from './components/FullscreenLock.vue'

const route = useRoute()
const petRef = ref<InstanceType<typeof PetFloat>>()
provide('pet', petRef)

// 登录页和领养页不显示底部导航和浮动怪兽
const showMainUI = computed(() => {
  const publicPages = ['Login', 'Adopt']
  return !publicPages.includes(route.name as string)
})
</script>

<style>
/* ===== 设计系统 - FocusPet UI Kit ===== */
/* 灵感来自UI图：奶油色背景、草绿色主色、圆润可爱风格 */

:root {
  /* 主色调 - 草绿色系 */
  --primary: #7CB342;
  --primary-light: #AED581;
  --primary-dark: #558B2F;
  --primary-soft: rgba(124, 179, 66, 0.12);

  /* 辅助色 */
  --accent: #FF8A65;      /* 温暖橙红色 */
  --accent-light: #FFAB91;
  --accent-soft: rgba(255, 138, 101, 0.12);

  --warning: #FFB74D;     /* 温暖橙黄色 */
  --warning-light: #FFD54F;
  --warning-soft: rgba(255, 183, 77, 0.12);

  --success: #66BB6A;     /* 清新绿色 */
  --success-soft: rgba(102, 187, 106, 0.12);

  /* 背景色 - 奶油色系 */
  --bg: #FDF8F0;          /* 主背景 - 温暖奶油白 */
  --bg-warm: #FFF5E6;     /* 暖色背景 */
  --bg-green: #F1F8E9;    /* 淡绿背景 */
  --bg-orange: #FFF3E0;   /* 淡橙背景 */
  --bg-card: #FFFFFF;     /* 卡片背景 */

  /* 文字色 */
  --ink: #2E3A1F;         /* 主文字 - 深绿棕 */
  --ink-secondary: #5D6B4A; /* 次要文字 */
  --muted: #8B9A7A;       /* 辅助文字 */
  --muted-light: #B8C4A8; /* 更浅辅助 */

  /* 边框与分割线 */
  --rule: #E8E0D4;
  --rule-light: #F0EBE3;

  /* 阴影 */
  --shadow-sm: 0 2px 8px rgba(124, 179, 66, 0.08);
  --shadow-md: 0 4px 16px rgba(124, 179, 66, 0.12);
  --shadow-lg: 0 8px 32px rgba(124, 179, 66, 0.16);
  --shadow-card: 0 2px 12px rgba(46, 58, 31, 0.06);

  /* 圆角 */
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg);
  color: var(--ink);
  line-height: 1.6;
  -webkit-tap-highlight-color: transparent;
  overflow-x: hidden;
}

.app {
  min-height: 100vh;
  padding-bottom: 80px;
  position: relative;
}

/* 背景图片 */
.bg-image {
  position: fixed;
  inset: 0;
  background: url('/bg-app.jpg') center/cover no-repeat;
  z-index: -1;
  opacity: 0.6;
}

/* 背景装饰 */
.bg-decoration {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
}
.bg-circle-1 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, var(--primary-soft) 0%, transparent 70%);
  top: -80px; right: -60px;
}
.bg-circle-2 {
  width: 200px; height: 200px;
  background: radial-gradient(circle, var(--warning-soft) 0%, transparent 70%);
  bottom: 200px; left: -50px;
}
.bg-circle-3 {
  width: 150px; height: 150px;
  background: radial-gradient(circle, var(--accent-soft) 0%, transparent 70%);
  top: 40%; right: -30px;
}
.bg-dot {
  position: absolute;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--primary-light);
  opacity: 0.3;
}
.bg-dot-1 { top: 15%; left: 8%; }
.bg-dot-2 { top: 35%; right: 12%; width: 6px; height: 6px; }
.bg-dot-3 { bottom: 30%; left: 15%; width: 10px; height: 10px; background: var(--warning); }
.bg-dot-4 { top: 60%; right: 8%; width: 5px; height: 5px; background: var(--accent-light); }

/* 页面过渡动画 */
.page-enter-active { animation: pageIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.page-leave-active { animation: pageOut 0.2s ease; }
@keyframes pageIn {
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes pageOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-15px); }
}

/* ===== 通用组件样式 ===== */

.page-container {
  padding: 20px;
  max-width: 480px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 4px;
  color: var(--ink);
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--muted);
  margin-bottom: 20px;
}

/* 卡片 */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--rule-light);
  position: relative;
  overflow: hidden;
}
.card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-light), var(--primary));
  opacity: 0.6;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 14px;
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 按钮系统 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
}
.btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%);
  pointer-events: none;
}
.btn:active { transform: scale(0.95); }

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(124, 179, 66, 0.35);
}
.btn-primary:hover {
  box-shadow: 0 6px 24px rgba(124, 179, 66, 0.45);
  transform: translateY(-1px);
}

.btn-accent {
  background: linear-gradient(135deg, var(--accent) 0%, #FF7043 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(255, 138, 101, 0.35);
}

.btn-warning {
  background: linear-gradient(135deg, var(--warning) 0%, #FF9800 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(255, 183, 77, 0.35);
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--primary-light);
  color: var(--primary-dark);
}
.btn-outline:hover {
  background: var(--primary-soft);
}

.btn-ghost {
  background: var(--primary-soft);
  color: var(--primary-dark);
}

.btn-block { width: 100%; }

/* 标签 */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
}
.badge-success { background: var(--success-soft); color: var(--success); }
.badge-warning { background: var(--warning-soft); color: #E65100; }
.badge-danger { background: var(--accent-soft); color: var(--accent); }
.badge-primary { background: var(--primary-soft); color: var(--primary-dark); }

/* 统计数字 */
.stat-number {
  font-size: 2.2rem;
  font-weight: 900;
  color: var(--primary);
  line-height: 1.2;
}
.stat-label {
  font-size: 0.8rem;
  color: var(--muted);
  margin-top: 4px;
}

/* 输入框 */
.input-group { margin-bottom: 16px; }
.input-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--ink-secondary);
}
.input-group input,
.input-group select,
.input-group textarea {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid var(--rule);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: inherit;
  background: var(--bg);
  color: var(--ink);
  transition: all 0.2s;
  outline: none;
}
.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 4px var(--primary-soft);
}

/* 全屏沉浸模式 */
.immersive-mode {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: var(--bg);
  overflow-y: auto;
}

/* 浮动装饰元素 */
.float-decoration {
  position: absolute;
  pointer-events: none;
}
</style>
