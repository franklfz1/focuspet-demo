<template>
  <div class="page-container">
    <!-- 非沉浸模式：任务设置 -->
    <template v-if="!isFocusing">
      <h1 class="page-title">📝 开始专注</h1>
      <p class="page-subtitle">先预估时间，然后开始专注吧！</p>

      <!-- AI历史提醒 -->
      <div v-if="aiReminder" class="card ai-reminder">
        <div class="reminder-header">
          <span>🐾 AI提醒</span>
        </div>
        <p class="reminder-text">{{ aiReminder }}</p>
      </div>

      <!-- 任务输入 -->
      <div class="card">
        <div class="input-group">
          <label>学习类型</label>
          <select v-model="taskForm.subject">
            <option value="">请选择学习类型</option>
            <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="input-group">
          <label>学习内容</label>
          <input v-model="taskForm.name" placeholder="例如：数学练习册第3页" />
        </div>
        <div class="input-group">
          <label>预估完成时间（分钟）</label>
          <div class="time-selector">
            <button v-for="t in timeOptions" :key="t" class="time-btn" :class="{ active: taskForm.estimatedMinutes === t }" @click="taskForm.estimatedMinutes = t">
              {{ t }}分钟
            </button>
          </div>
        </div>
        <button class="btn btn-primary btn-block" :disabled="!canStart" @click="startFocus">
          🎯 开始专注
        </button>
      </div>

      <!-- 历史记录参考 -->
      <div v-if="subjectHistory.length > 0" class="card">
        <h3 class="card-title">📊 {{ taskForm.subject || '该科目' }}历史记录</h3>
        <div class="history-list">
          <div v-for="(record, index) in subjectHistory.slice(0, 5)" :key="record.id" class="history-item">
            <div class="history-info">
              <span class="history-name">{{ record.name }}</span>
              <span class="history-date">{{ formatDate(record.completedAt) }}</span>
            </div>
            <div class="history-times">
              <span class="history-est">预估{{ record.estimatedMinutes }}分</span>
              <span class="history-actual" :class="{ overtime: record.overtime, early: record.earlyFinish }">
                实际{{ record.actualMinutes }}分
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 沉浸模式：专注计时 -->
    <div v-else class="immersive-mode">
      <div class="focus-container">
        <!-- 顶部信息 -->
        <div class="focus-header">
          <div class="focus-task-info">
            <span class="focus-subject">{{ getSubjectEmoji(taskForm.subject) }} {{ taskForm.subject }}</span>
            <span class="focus-name">{{ taskForm.name }}</span>
          </div>
        </div>

        <!-- 计时器 -->
        <div class="timer-display">
          <div class="timer-ring" :style="{ '--progress': timerProgress }">
            <svg viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="#E5E7EB" stroke-width="8" />
              <circle cx="100" cy="100" r="90" fill="none" stroke="url(#timerGradient)" stroke-width="8"
                stroke-linecap="round" :stroke-dasharray="timerDashArray" transform="rotate(-90 100 100)" />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#4ECDC4" />
                  <stop offset="100%" stop-color="#45B7AA" />
                </linearGradient>
              </defs>
            </svg>
            <div class="timer-text">
              <div class="timer-minutes">{{ displayMinutes }}</div>
              <div class="timer-seconds">{{ displaySeconds }}</div>
            </div>
          </div>
        </div>

        <!-- 状态提示 -->
        <div class="focus-status">
          <span v-if="isRestSuggestion" class="status-rest">
            💧 建议休息 {{ Math.ceil(restCountdown / 60) }} 分钟
          </span>
          <span v-else-if="isOvertime" class="status-overtime">⚠️ 已超过预估时间</span>
          <span v-else class="status-normal">专注中，加油！💪</span>
        </div>

        <!-- 休息建议弹窗 -->
        <transition name="rest-fade">
          <div v-if="isRestSuggestion" class="rest-suggestion-card">
            <div class="rest-icon">☕</div>
            <h3>该休息一下啦！</h3>
            <p>已经专注15分钟了，建议休息3分钟再继续哦～</p>
            <div class="rest-actions">
              <button class="btn btn-primary" @click="takeRest">😊 好的，休息3分钟</button>
              <button class="btn btn-outline" @click="skipRest">继续专注</button>
            </div>
          </div>
        </transition>

        <!-- 控制按钮 -->
        <div class="focus-controls">
          <button v-if="!isPaused" class="btn btn-outline" @click="pauseFocus">⏸️ 暂停</button>
          <button v-else class="btn btn-outline" @click="resumeFocus">▶️ 继续</button>
          <button class="btn btn-accent" @click="finishFocus">✅ 完成学习</button>
        </div>

        <!-- Demo时间快进 -->
        <div class="demo-fast-forward">
          <div class="demo-tag">🧪 Demo快进</div>
          <div class="ff-buttons">
            <button class="ff-btn" @click="fastForward(1)">+1分</button>
            <button class="ff-btn" @click="fastForward(5)">+5分</button>
            <button class="ff-btn ff-btn-fill" @click="fastForward(taskForm.estimatedMinutes)">跳满</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const router = useRouter()

const subjects = ['家庭作业', '自学拓展']
const timeOptions = [10, 15, 20, 25, 30, 40, 45, 60, 90]

const taskForm = ref({
  subject: '',
  name: '',
  estimatedMinutes: 25
})

const isFocusing = ref(false)
const isPaused = ref(false)
const elapsedSeconds = ref(0)
const isRestSuggestion = ref(false)
const restCountdown = ref(180) // 3分钟休息倒计时
let focusInterval: number | null = null
let restInterval: number | null = null

// 休息提醒相关
const lastRestAt = ref(0) // 上次触发休息提醒时的 elapsedSeconds

// AI提醒
const subjectHistory = computed(() => {
  if (!taskForm.value.subject) return []
  return store.getSubjectHistory(taskForm.value.subject)
})

const aiReminder = computed(() => {
  if (!taskForm.value.subject || subjectHistory.value.length === 0) return null
  const avg = store.getSubjectAvgTime(taskForm.value.subject)
  const estimated = taskForm.value.estimatedMinutes
  if (avg > 0 && estimated < avg * 0.8) {
    return `上次${taskForm.value.subject}作业平均用了${avg}分钟哦，这次确定挑战${estimated}分钟吗？建议预估${Math.round(avg * 1.1)}分钟更合理。`
  }
  return null
})

const canStart = computed(() => {
  return taskForm.value.subject && taskForm.value.name && taskForm.value.estimatedMinutes > 0
})

// 计时器显示
const totalSeconds = computed(() => taskForm.value.estimatedMinutes * 60)
const remainingSeconds = computed(() => Math.max(0, totalSeconds.value - elapsedSeconds.value))
const displayMinutes = computed(() => String(Math.floor(remainingSeconds.value / 60)).padStart(2, '0'))
const displaySeconds = computed(() => String(remainingSeconds.value % 60).padStart(2, '0'))
const timerProgress = computed(() => {
  if (totalSeconds.value === 0) return 0
  return Math.min(1, elapsedSeconds.value / totalSeconds.value)
})
const timerDashArray = computed(() => {
  const circumference = 2 * Math.PI * 90
  return `${circumference * (1 - timerProgress.value)} ${circumference}`
})
const isOvertime = computed(() => elapsedSeconds.value > totalSeconds.value)

function startFocus() {
  isFocusing.value = true
  isPaused.value = false
  elapsedSeconds.value = 0
  isRestSuggestion.value = false
  restCountdown.value = 180
  lastRestAt.value = 0

  // 尝试全屏
  try {
    document.documentElement.requestFullscreen?.()
  } catch (e) { /* ignore */ }

  // 专注模式小怪兽不说话

  focusInterval = window.setInterval(() => {
    if (!isPaused.value) {
      elapsedSeconds.value++
      // 每15分钟检查一次休息提醒（基于 elapsedSeconds，Demo快进也生效）
      checkRestReminder()
    }
  }, 1000)
}

// 检查是否需要弹出休息提醒（每15分钟一次）
function checkRestReminder() {
  const fifteenMinSeconds = 15 * 60 // 15分钟 = 900秒
  const currentBlock = Math.floor(elapsedSeconds.value / fifteenMinSeconds)
  const lastBlock = Math.floor(lastRestAt.value / fifteenMinSeconds)
  if (currentBlock > lastBlock && elapsedSeconds.value >= fifteenMinSeconds) {
    // 到了新的15分钟区间，弹出休息提醒
    lastRestAt.value = elapsedSeconds.value
    isRestSuggestion.value = true
    restCountdown.value = 180

    // 开始3分钟休息倒计时
    if (restInterval) clearInterval(restInterval)
    restInterval = window.setInterval(() => {
      if (restCountdown.value > 0) {
        restCountdown.value--
      } else {
        // 3分钟到了，自动关闭休息提示
        isRestSuggestion.value = false
        if (restInterval) {
          clearInterval(restInterval)
          restInterval = null
        }
      }
    }, 1000)
  }
}

function pauseFocus() {
  isPaused.value = true
}

function resumeFocus() {
  isPaused.value = false
}

// 接受休息建议：暂停3分钟
function takeRest() {
  isRestSuggestion.value = false
  isPaused.value = true
  // 3分钟后自动恢复
  setTimeout(() => {
    isPaused.value = false
  }, 180000)
}

// 跳过休息建议
function skipRest() {
  isRestSuggestion.value = false
  if (restInterval) {
    clearInterval(restInterval)
    restInterval = null
  }
}

// Demo快进：直接跳过指定分钟数
function fastForward(minutes: number) {
  elapsedSeconds.value += minutes * 60
}

function finishFocus() {
  if (focusInterval) clearInterval(focusInterval)
  if (restInterval) clearInterval(restInterval)

  const actualMinutes = Math.round(elapsedSeconds.value / 60)
  const earlyFinish = actualMinutes < taskForm.value.estimatedMinutes
  const overtime = actualMinutes > taskForm.value.estimatedMinutes

  // 保存记录
  store.addTaskRecord({
    id: Date.now().toString(),
    name: taskForm.value.name,
    subject: taskForm.value.subject,
    estimatedMinutes: taskForm.value.estimatedMinutes,
    actualMinutes,
    completedAt: new Date().toISOString(),
    verified: false,
    earlyFinish,
    overtime
  })

  // 允许无密码退出全屏（避免触发密码弹窗）
  ;(window as any).__fullscreenLock?.setAllowExit(true)

  // 退出全屏
  try {
    document.exitFullscreen?.()
  } catch (e) { /* ignore */ }

  // 跳转到验证页面
  router.push('/verify')
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function getSubjectEmoji(subject: string): string {
  const map: Record<string, string> = {
    '数学': '🔢', '语文': '📖', '英语': '🔤',
    '物理': '⚡', '化学': '🧪', '生物': '🌱',
    '历史': '📜', '地理': '🌍', '政治': '📰',
    '阅读': '📚', '书法': '🖌️', '其他': '📝'
  }
  return map[subject] || '📝'
}

onUnmounted(() => {
  if (focusInterval) clearInterval(focusInterval)
  if (restInterval) clearInterval(restInterval)
  try { document.exitFullscreen?.() } catch (e) {}
})
</script>

<style scoped>
.ai-reminder {
  background: linear-gradient(135deg, #FFF8E1, #FFF3CD);
  border: 1px solid rgba(255,217,61,0.3);
}
.reminder-header {
  font-weight: 700;
  margin-bottom: 8px;
  font-size: 0.95rem;
}
.reminder-text {
  font-size: 0.9rem;
  color: var(--muted);
  line-height: 1.6;
}

.time-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.time-btn {
  padding: 8px 16px;
  border: 2px solid var(--rule);
  border-radius: 10px;
  background: var(--bg);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--ink);
}
.time-btn.active {
  border-color: var(--accent2);
  background: rgba(78,205,196,0.1);
  color: var(--accent2);
}

.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: var(--bg);
  border-radius: 10px;
}
.history-info { display: flex; flex-direction: column; gap: 2px; }
.history-name { font-weight: 600; font-size: 0.9rem; }
.history-date { font-size: 0.75rem; color: var(--muted); }
.history-times { display: flex; gap: 8px; font-size: 0.8rem; }
.history-est { color: var(--muted); }
.history-actual { font-weight: 700; }
.history-actual.overtime { color: var(--accent); }
.history-actual.early { color: var(--accent2); }

/* 沉浸模式 */
.focus-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
}

.focus-header {
  text-align: center;
  margin-bottom: 40px;
}
.focus-subject {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 4px;
}
.focus-name {
  font-size: 0.9rem;
  color: var(--muted);
}

.focus-pet-hint {
  margin-top: 12px;
  padding: 8px 20px;
  background: rgba(78,205,196,0.1);
  border-radius: 20px;
  font-size: 0.9rem;
  color: var(--accent2);
  font-weight: 600;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.timer-display {
  margin-bottom: 30px;
}

.timer-ring {
  width: 220px;
  height: 220px;
  position: relative;
}
.timer-ring svg {
  width: 100%;
  height: 100%;
}
.timer-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.timer-minutes {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--ink);
  line-height: 1;
}
.timer-seconds {
  font-size: 1.2rem;
  color: var(--muted);
  font-weight: 600;
}

.focus-status {
  margin-bottom: 40px;
}
.status-overtime {
  color: var(--accent);
  font-weight: 700;
  font-size: 1.1rem;
  animation: pulse 1s ease-in-out infinite;
}
.status-normal {
  color: var(--accent2);
  font-weight: 600;
}
.status-rest {
  color: #42A5F5;
  font-weight: 700;
  font-size: 1.1rem;
  animation: pulse 1s ease-in-out infinite;
}

/* 休息建议卡片 */
.rest-suggestion-card {
  background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
  border: 2px solid rgba(66, 165, 245, 0.3);
  border-radius: var(--radius-xl);
  padding: 28px 24px 20px;
  text-align: center;
  margin-bottom: 24px;
  max-width: 340px;
  width: 100%;
  animation: restPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes restPop {
  from { opacity: 0; transform: scale(0.85) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.rest-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.rest-suggestion-card h3 {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 6px;
}

.rest-suggestion-card p {
  font-size: 0.85rem;
  color: var(--ink-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
}

.rest-actions {
  display: flex;
  gap: 10px;
}

.rest-actions .btn {
  flex: 1;
  padding: 10px 12px;
  font-size: 0.85rem;
}

.rest-fade-enter-active { animation: restFadeIn 0.3s ease; }
.rest-fade-leave-active { animation: restFadeOut 0.2s ease; }
@keyframes restFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes restFadeOut { from { opacity: 1; } to { opacity: 0; } }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.focus-controls {
  display: flex;
  gap: 16px;
}
.focus-controls .btn {
  min-width: 120px;
}

/* Demo快进 */
.demo-fast-forward {
  margin-top: 24px;
  text-align: center;
}
.demo-tag {
  font-size: 0.7rem;
  color: var(--muted);
  margin-bottom: 8px;
  font-weight: 600;
}
.ff-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.ff-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: 2px solid rgba(167,139,250,0.3);
  background: rgba(167,139,250,0.08);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--accent4);
}
.ff-btn:active { transform: scale(0.93); }
.ff-btn-fill {
  border-color: var(--accent2);
  background: rgba(78,205,196,0.12);
  color: var(--accent2);
}
</style>
