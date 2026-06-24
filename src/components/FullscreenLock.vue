<template>
  <!-- Fullscreen trigger button (shown when not in fullscreen) -->
  <div v-if="!isFullscreen" class="fullscreen-trigger" @click="enterFullscreen">
    <span class="trigger-icon">⛶</span>
    <span class="trigger-text">全屏模式</span>
  </div>

  <!-- Password overlay (shown when trying to exit fullscreen) -->
  <transition name="lock-fade">
    <div v-if="showPasswordOverlay" class="lock-overlay">
      <div class="lock-card">
        <div class="lock-icon-big">🔒</div>
        <h2>全屏锁定中</h2>
        <p class="lock-desc">请输入家长密码退出全屏模式</p>
        <div class="lock-input-group">
          <input
            ref="pwdInput"
            type="password"
            v-model="passwordInput"
            placeholder="请输入密码"
            @keyup.enter="submitPassword"
            class="lock-input"
          />
        </div>
        <p v-if="passwordError" class="lock-error">{{ passwordError }}</p>
        <div class="lock-actions">
          <button class="btn btn-primary" @click="submitPassword">确认解锁</button>
          <button class="btn btn-outline" @click="cancelExit">取消</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// ===== 可配置项 =====
const LOCK_PASSWORD = '888888'

// ===== 响应式状态 =====
const isFullscreen = ref(false)
const showPasswordOverlay = ref(false)
const passwordInput = ref('')
const passwordError = ref('')
const pendingExit = ref(false)
// 允许退出全屏的标志（完成作业/拍照时设为 true，避免触发密码弹窗）
const allowExit = ref(false)

// ===== 暴露给外部的方法 =====
// 设置是否允许无密码退出全屏
function setAllowExit(value: boolean) {
  allowExit.value = value
}

// 挂载到 window 上供其他组件调用
;(window as any).__fullscreenLock = { setAllowExit }

// ===== 模板引用 =====
const pwdInput = ref<HTMLInputElement | null>(null)

// ===== 全屏操作 =====
function enterFullscreen() {
  const el = document.documentElement
  if (el.requestFullscreen) {
    el.requestFullscreen()
  } else if ((el as any).webkitRequestFullscreen) {
    ;(el as any).webkitRequestFullscreen()
  } else if ((el as any).msRequestFullscreen) {
    ;(el as any).msRequestFullscreen()
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if ((document as any).webkitExitFullscreen) {
    ;(document as any).webkitExitFullscreen()
  } else if ((document as any).msExitFullscreen) {
    ;(document as any).msExitFullscreen()
  }
}

function checkFullscreen(): boolean {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).msFullscreenElement
  )
}

// ===== 全屏变化监听 =====
function onFullscreenChange() {
  const fullscreen = checkFullscreen()
  isFullscreen.value = fullscreen

  if (!fullscreen && !pendingExit.value && !allowExit.value) {
    // 用户尝试退出全屏，立即重新进入并弹出密码遮罩
    enterFullscreen()
    showPasswordOverlay.value = true
    passwordInput.value = ''
    passwordError.value = ''

    nextTick(() => {
      if (pwdInput.value) {
        pwdInput.value.focus()
      }
    })
  }

  // 如果是密码验证通过后的正常退出，重置状态
  if (!fullscreen && pendingExit.value) {
    pendingExit.value = false
    showPasswordOverlay.value = false
    passwordInput.value = ''
    passwordError.value = ''
  }

  // 如果是允许退出的场景（完成作业/拍照），重置标志
  if (!fullscreen && allowExit.value) {
    allowExit.value = false
  }
}

// ===== 密码验证 =====
function submitPassword() {
  if (!passwordInput.value) {
    passwordError.value = '请输入密码'
    return
  }

  if (passwordInput.value === LOCK_PASSWORD) {
    passwordError.value = ''
    showPasswordOverlay.value = false
    pendingExit.value = true
    exitFullscreen()
  } else {
    passwordError.value = '密码错误，请重试'
    passwordInput.value = ''
    nextTick(() => {
      if (pwdInput.value) {
        pwdInput.value.focus()
      }
    })
  }
}

// ===== 取消退出 =====
function cancelExit() {
  showPasswordOverlay.value = false
  passwordInput.value = ''
  passwordError.value = ''

  // 确保仍在全屏状态
  if (!checkFullscreen()) {
    enterFullscreen()
  }
}

// ===== 生命周期 =====
onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('webkitfullscreenchange', onFullscreenChange)
  document.addEventListener('msfullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
  document.removeEventListener('msfullscreenchange', onFullscreenChange)
})
</script>

<style scoped>
/* ===== 全屏触发按钮 ===== */
.fullscreen-trigger {
  position: fixed;
  bottom: 88px;
  left: 16px;
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.fullscreen-trigger:hover {
  transform: scale(1.06);
  box-shadow: 0 12px 40px rgba(124, 179, 66, 0.3);
}

.fullscreen-trigger:active {
  transform: scale(0.95);
}

.trigger-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.trigger-text {
  line-height: 1;
}

/* ===== 锁定遮罩层 ===== */
.lock-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(46, 58, 31, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 24px;
}

/* ===== 锁定卡片 ===== */
.lock-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 36px 32px 28px;
  width: 100%;
  max-width: 380px;
  text-align: center;
  animation: lockCardIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes lockCardIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.lock-icon-big {
  font-size: 3rem;
  line-height: 1;
  margin-bottom: 12px;
  animation: lockBounce 2s ease-in-out infinite;
}

@keyframes lockBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.lock-card h2 {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 8px;
}

.lock-desc {
  font-size: 0.85rem;
  color: var(--muted);
  margin-bottom: 24px;
  line-height: 1.5;
}

/* ===== 输入框 ===== */
.lock-input-group {
  margin-bottom: 12px;
}

.lock-input {
  width: 100%;
  padding: 14px 18px;
  font-size: 1rem;
  font-family: inherit;
  color: var(--ink);
  background: var(--bg);
  border: 2px solid var(--rule);
  border-radius: var(--radius-md);
  outline: none;
  transition: all 0.25s ease;
  -webkit-appearance: none;
}

.lock-input::placeholder {
  color: var(--muted-light);
}

.lock-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px var(--primary-soft);
  background: var(--bg-card);
}

/* ===== 错误提示 ===== */
.lock-error {
  font-size: 0.8rem;
  color: #EF5350;
  font-weight: 600;
  margin-bottom: 16px;
  animation: errorShake 0.4s ease;
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

/* ===== 操作按钮 ===== */
.lock-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  flex: 1;
  padding: 12px 16px;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: inherit;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  -webkit-tap-highlight-color: transparent;
  border: none;
}

.btn:active {
  transform: scale(0.95);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  box-shadow: 0 4px 12px rgba(124, 179, 66, 0.3);
}

.btn-primary:hover {
  box-shadow: 0 6px 20px rgba(124, 179, 66, 0.4);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: scale(0.95) translateY(0);
}

.btn-outline {
  background: transparent;
  color: var(--ink-secondary);
  border: 2px solid var(--rule);
}

.btn-outline:hover {
  border-color: var(--primary-light);
  color: var(--primary-dark);
  background: var(--primary-soft);
}

/* ===== 过渡动画 ===== */
.lock-fade-enter-active {
  animation: lockFadeIn 0.35s ease-out;
}

.lock-fade-leave-active {
  animation: lockFadeOut 0.25s ease-in;
}

@keyframes lockFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes lockFadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
