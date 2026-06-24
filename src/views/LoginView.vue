<template>
  <div class="login-page">
    <!-- 品牌区域 -->
    <div class="brand-area">
      <div class="brand-bg"></div>
      <div class="brand-content">
        <div class="brand-logo">🐾</div>
        <h1 class="brand-title">FocusPet</h1>
        <p class="brand-subtitle">自律小怪兽</p>
        <p class="brand-desc">让学习变得有趣，让自律成为习惯</p>
      </div>
    </div>

    <!-- 登录/注册卡片 -->
    <div class="login-card">
      <!-- Tab 切换 -->
      <div class="tab-bar">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'; errorMsg = ''"
        >
          登录
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'; errorMsg = ''"
        >
          注册
        </button>
        <div class="tab-indicator" :class="{ right: activeTab === 'register' }"></div>
      </div>

      <!-- 错误提示 -->
      <div class="error-msg" v-if="errorMsg">
        <span class="error-icon">⚠️</span>
        <span>{{ errorMsg }}</span>
      </div>

      <!-- 登录表单 -->
      <form v-if="activeTab === 'login'" class="form" @submit.prevent="handleLogin">
        <div class="input-group">
          <label>用户名</label>
          <input
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>
        <div class="input-group">
          <label>密码</label>
          <input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>
        <button type="submit" class="btn btn-primary btn-block submit-btn" :disabled="!loginForm.username.trim() || !loginForm.password">
          <span>🔐</span>
          <span>登录</span>
        </button>
      </form>

      <!-- 注册表单 -->
      <form v-else class="form" @submit.prevent="handleRegister">
        <div class="input-group">
          <label>用户名</label>
          <input
            v-model="registerForm.username"
            type="text"
            placeholder="请输入用户名（2-12位）"
            maxlength="12"
            autocomplete="username"
          />
        </div>
        <div class="input-group">
          <label>密码</label>
          <input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（至少6位）"
            autocomplete="new-password"
          />
        </div>
        <div class="input-group">
          <label>确认密码</label>
          <input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            autocomplete="new-password"
          />
        </div>
        <button
          type="submit"
          class="btn btn-primary btn-block submit-btn"
          :disabled="!registerForm.username.trim() || !registerForm.password || !registerForm.confirmPassword"
        >
          <span>✨</span>
          <span>注册</span>
        </button>
      </form>

      <!-- 演示账号提示 -->
      <div class="demo-hint">
        <span class="demo-hint-icon">💡</span>
        <span>演示账号: <strong>demo</strong> / <strong>123456</strong></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Tab 状态
const activeTab = ref<'login' | 'register'>('login')

// 错误信息
const errorMsg = ref('')

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 用户数据接口
interface User {
  username: string
  password: string
}

// 获取用户列表
function getUsers(): User[] {
  const data = localStorage.getItem('fp_users')
  return data ? JSON.parse(data) : []
}

// 保存用户列表
function saveUsers(users: User[]) {
  localStorage.setItem('fp_users', JSON.stringify(users))
}

// 初始化演示账号
onMounted(() => {
  const users = getUsers()
  const hasDemo = users.some(u => u.username === 'demo')
  if (!hasDemo) {
    users.push({ username: 'demo', password: '123456' })
    saveUsers(users)
  }

  // 如果已经登录，直接跳转
  const currentUser = localStorage.getItem('fp_currentUser')
  if (currentUser) {
    router.replace('/home')
  }
})

// 登录处理
function handleLogin() {
  errorMsg.value = ''

  if (!loginForm.username.trim()) {
    errorMsg.value = '请输入用户名'
    return
  }
  if (!loginForm.password) {
    errorMsg.value = '请输入密码'
    return
  }

  const users = getUsers()
  const user = users.find(u => u.username === loginForm.username.trim())

  if (!user) {
    errorMsg.value = '用户不存在，请先注册'
    return
  }

  if (user.password !== loginForm.password) {
    errorMsg.value = '密码错误，请重新输入'
    return
  }

  // 登录成功
  localStorage.setItem('fp_currentUser', user.username)
  router.push('/home')
}

// 注册处理
function handleRegister() {
  errorMsg.value = ''

  const username = registerForm.username.trim()
  const password = registerForm.password
  const confirmPassword = registerForm.confirmPassword

  if (!username) {
    errorMsg.value = '请输入用户名'
    return
  }
  if (username.length < 2) {
    errorMsg.value = '用户名至少需要2个字符'
    return
  }
  if (!password) {
    errorMsg.value = '请输入密码'
    return
  }
  if (password.length < 6) {
    errorMsg.value = '密码至少需要6位'
    return
  }
  if (password !== confirmPassword) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }

  const users = getUsers()
  const exists = users.some(u => u.username === username)

  if (exists) {
    errorMsg.value = '该用户名已被注册，请换一个'
    return
  }

  // 注册成功
  users.push({ username, password })
  saveUsers(users)

  // 自动登录
  localStorage.setItem('fp_currentUser', username)
  router.push('/home')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* 品牌区域 */
.brand-area {
  position: relative;
  text-align: center;
  margin-bottom: 32px;
  z-index: 1;
}

.brand-bg {
  position: absolute;
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, var(--primary-soft) 0%, transparent 70%);
  border-radius: 50%;
  animation: brandGlow 3s ease-in-out infinite;
}

@keyframes brandGlow {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
}

.brand-content {
  position: relative;
}

.brand-logo {
  font-size: 3.5rem;
  margin-bottom: 8px;
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.brand-title {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.brand-subtitle {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink-secondary);
  margin-bottom: 8px;
}

.brand-desc {
  font-size: 0.85rem;
  color: var(--muted);
}

/* 登录卡片 */
.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 28px 24px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--rule-light);
  position: relative;
  z-index: 1;
}

/* Tab 切换 */
.tab-bar {
  display: flex;
  position: relative;
  background: var(--bg);
  border-radius: var(--radius-md);
  padding: 4px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.25s;
  position: relative;
  z-index: 1;
  border-radius: var(--radius-sm);
}

.tab-btn.active {
  color: white;
}

.tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: var(--radius-sm);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(124, 179, 66, 0.3);
}

.tab-indicator.right {
  transform: translateX(100%);
}

/* 错误提示 */
.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #FFF0F0;
  border: 1px solid #FFCDD2;
  border-radius: var(--radius-sm);
  margin-bottom: 20px;
  font-size: 0.85rem;
  color: #D32F2F;
  font-weight: 600;
  animation: errorShake 0.4s ease;
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

.error-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

/* 表单 */
.form {
  margin-bottom: 16px;
}

.form .input-group {
  margin-bottom: 18px;
}

.form .input-group label {
  display: block;
  font-size: 0.88rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--ink-secondary);
}

.form .input-group input {
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

.form .input-group input:focus {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 4px var(--primary-soft);
}

.form .input-group input::placeholder {
  color: var(--muted-light);
}

/* 提交按钮 */
.submit-btn {
  margin-top: 4px;
  font-size: 1.05rem;
  padding: 16px;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 演示提示 */
.demo-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, var(--bg-warm), var(--bg-orange));
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  color: var(--ink-secondary);
  font-weight: 600;
  border: 1px solid rgba(255, 183, 77, 0.2);
}

.demo-hint-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.demo-hint strong {
  color: var(--ink);
}
</style>
