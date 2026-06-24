<template>
  <div class="page-container">
    <!-- 头部区域 -->
    <div class="home-header">
      <div class="greeting">
        <div class="greeting-badge">
          <img src="/icon-home.jpg" class="greeting-icon" alt="home" />
          <span>{{ greetingText }}</span>
        </div>
        <h1 class="page-title">
          <span class="title-highlight">{{ store.petName }}</span>
          <span class="title-waving">👋</span>
        </h1>
        <p class="page-subtitle">今天也要做自律小达人哦～</p>
      </div>
      <div class="coins-display" @click="$router.push('/rewards')">
        <div class="coin-glow"></div>
        <img src="/icon-coin.jpg" class="coin-icon" alt="coin" />
        <span class="coin-count">{{ store.coins }}</span>
      </div>
    </div>

    <!-- 小怪兽欢迎卡片 -->
    <div class="card pet-welcome-card">
      <div class="pet-welcome-content">
        <img :src="monsterGifs.happy" class="pet-welcome-gif" alt="小怪兽" />
        <div class="pet-welcome-text">
          <p class="pet-welcome-msg">"{{ welcomeMessage }}"</p>
          <div class="pet-status">
            <span class="status-dot"></span>
            <span>心情超棒</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 日期模拟器（Demo用） -->
    <div class="card date-sim-card">
      <div class="date-sim-header">
        <div class="card-title" style="margin-bottom:0">
          <img src="/icon-focus.jpg" class="title-icon" alt="focus" />
          <span>日期模拟器</span>
        </div>
        <span class="demo-badge">Demo</span>
      </div>
      <p class="date-sim-desc">调节日期来模拟不同天数的场景效果</p>
      <div class="date-sim-controls">
        <button class="date-btn" @click="changeDay(-1)">
          <span>⏪</span>
          <span>昨天</span>
        </button>
        <div class="date-display">
          <span class="date-day">{{ simDayOffset === 0 ? '今天' : (simDayOffset > 0 ? `+${simDayOffset}天` : `${simDayOffset}天`) }}</span>
          <span class="date-full">{{ simDateStr }}</span>
        </div>
        <button class="date-btn" @click="changeDay(1)">
          <span>明天</span>
          <span>⏩</span>
        </button>
      </div>
      <div class="date-shortcuts">
        <button v-for="d in [-3, -1, 0, 1, 3, 7]" :key="d" class="shortcut-btn" :class="{ active: simDayOffset === d }" @click="simDayOffset = d">
          {{ d === 0 ? '今天' : (d > 0 ? `+${d}天` : `${d}天`) }}
        </button>
      </div>
    </div>

    <!-- Demo快速调节面板 -->
    <div class="card demo-control-card">
      <div class="demo-control-header">
        <div class="card-title" style="margin-bottom:0">
          <img src="/icon-timer.jpg" class="title-icon" alt="timer" />
          <span>Demo快速调节</span>
        </div>
        <span class="demo-badge">Demo</span>
      </div>
      <p class="date-sim-desc">快速调节状态，体验全部功能流程</p>

      <!-- 连续对赌天数 -->
      <div class="demo-row">
        <span class="demo-label">
          <img src="/icon-fire.jpg" class="label-icon" alt="fire" />
          <span>对赌连续天数</span>
        </span>
        <div class="demo-adjust">
          <button class="adj-btn adj-btn-minus" @click="adjustBetWins(-1)">−</button>
          <span class="adj-value">{{ store.consecutiveBetWins }}天</span>
          <button class="adj-btn adj-btn-plus" @click="adjustBetWins(1)">+</button>
        </div>
        <div class="demo-milestones">
          <button v-for="m in [1,2,3,5,7,10,14,20]" :key="m" class="milestone-jump-btn"
            :class="{ active: store.consecutiveBetWins === m }"
            @click="jumpBetWins(m)">
            {{ m }}天
          </button>
        </div>
      </div>

      <!-- 明天额度 -->
      <div class="demo-row">
        <span class="demo-label">
          <img src="/icon-calendar.jpg" class="label-icon" alt="calendar" />
          <span>明天额度</span>
        </span>
        <div class="demo-adjust">
          <button class="adj-btn adj-btn-minus" @click="adjustAllowance(-5)">−5</button>
          <span class="adj-value">{{ store.tabletAllowance }}分</span>
          <button class="adj-btn adj-btn-plus" @click="adjustAllowance(5)">+5</button>
        </div>
      </div>

      <!-- 快速体验按钮 -->
      <div class="demo-quick-flow">
        <button class="btn btn-primary btn-block" @click="quickDemo('task')">
          <img src="/icon-write.jpg" class="btn-icon" alt="write" />
          <span>一键完成作业（解锁娱乐）</span>
        </button>
        <div class="flow-btns">
          <button class="btn btn-flow flow-early" @click="quickDemo('early')">
            <img src="/icon-shield.jpg" class="btn-icon" alt="shield" />
            <span>对赌提前结束</span>
          </button>
          <button class="btn btn-flow flow-normal" @click="quickDemo('normal')">
            <img src="/icon-timer.jpg" class="btn-icon" alt="timer" />
            <span>正常用完</span>
          </button>
          <button class="btn btn-flow flow-over" @click="quickDemo('over')">
            <img src="/icon-fire.jpg" class="btn-icon" alt="warning" />
            <span>超时使用</span>
          </button>
        </div>
      </div>

      <!-- 重置 -->
      <button class="btn btn-outline btn-block reset-btn" @click="resetAll">
        <img src="/icon-timer.jpg" class="btn-icon" alt="reset" />
        <span>重置全部数据</span>
      </button>
    </div>

    <!-- 今日状态卡片 -->
    <div class="status-section">
      <h3 class="section-title">
        <img src="/icon-parent.jpg" class="section-icon" alt="stats" />
        <span>今日状态</span>
      </h3>
      <div class="status-grid">
        <div class="status-card status-fire">
          <img src="/icon-fire.jpg" class="status-icon-bg" alt="streak" />
          <div class="stat-number">{{ store.streak }}</div>
          <div class="stat-label">连续天数</div>
        </div>
        <div class="status-card status-focus">
          <img src="/icon-timer.jpg" class="status-icon-bg" alt="focus" />
          <div class="stat-number">{{ todayMinutes }}</div>
          <div class="stat-label">今日专注(分)</div>
        </div>
        <div class="status-card status-game">
          <img src="/icon-entertainment.jpg" class="status-icon-bg" alt="game" />
          <div class="stat-number">{{ store.todayUsedMinutes }}</div>
          <div class="stat-label">娱乐已用(分)</div>
        </div>
        <div class="status-card status-calendar">
          <img src="/icon-calendar.jpg" class="status-icon-bg" alt="calendar" />
          <div class="stat-number">{{ store.tabletAllowance }}</div>
          <div class="stat-label">明天额度(分)</div>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="card action-card">
      <h3 class="card-title">
        <img src="/icon-focus.jpg" class="title-icon" alt="focus" />
        <span>快捷操作</span>
      </h3>
      <div class="quick-actions">
        <router-link to="/focus" class="action-btn action-focus">
          <div class="action-icon-bg">
            <img src="/icon-write.jpg" class="action-icon" alt="write" />
          </div>
          <span class="action-label">开始写作业</span>
          <span class="action-desc">专注模式</span>
        </router-link>
        <router-link to="/entertainment" class="action-btn action-play">
          <div class="action-icon-bg">
            <img src="/icon-entertainment.jpg" class="action-icon" alt="play" />
          </div>
          <span class="action-label">娱乐时间</span>
          <span class="action-desc">放松模式</span>
        </router-link>
      </div>
    </div>

    <!-- 今日任务记录 -->
    <div class="card">
      <h3 class="card-title">
        <img src="/icon-calendar.jpg" class="title-icon" alt="records" />
        <span>今日记录</span>
      </h3>
      <div v-if="todayTasks.length === 0" class="empty-state">
        <div class="empty-illustration">
          <img :src="monsterGifs.idle" class="empty-pet-gif" alt="小怪兽" />
        </div>
        <p class="empty-text">还没有今天的作业记录哦～</p>
        <router-link to="/focus" class="btn btn-primary btn-block" style="margin-top: 16px;">
          <img src="/icon-rewards.jpg" class="btn-icon" alt="start" />
          <span>开始第一个任务</span>
        </router-link>
      </div>
      <div v-else class="task-list">
        <div v-for="task in todayTasks" :key="task.id" class="task-item">
          <div class="task-info">
            <span class="task-subject">{{ getSubjectEmoji(task.subject) }} {{ task.subject }}</span>
            <span class="task-name">{{ task.name }}</span>
          </div>
          <div class="task-meta">
            <span class="badge" :class="task.earlyFinish ? 'badge-success' : task.overtime ? 'badge-danger' : 'badge-warning'">
              {{ task.earlyFinish ? '提前完成' : task.overtime ? '超时' : '按时完成' }}
            </span>
            <span class="task-time">{{ task.actualMinutes }}分钟</span>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 批改记录 -->
    <div class="card ai-correction-card">
      <h3 class="card-title">
        <img src="/icon-shield.jpg" class="title-icon" alt="ai" />
        <span>AI 作业批改</span>
        <span v-if="todayCorrections.length > 0" class="ai-count-badge">{{ todayCorrections.length }}</span>
      </h3>
      <div v-if="todayCorrections.length === 0" class="empty-state">
        <p class="empty-text">今天还没有批改记录，完成学习后拍照让 AI 检查吧！</p>
      </div>
      <div v-else class="correction-list">
        <div v-for="record in todayCorrections" :key="record.id" class="correction-item">
          <div class="correction-main">
            <div class="correction-score" :class="getScoreClass(record.score)">
              <span class="score-num">{{ record.score }}</span>
              <span class="score-label">分</span>
            </div>
            <div class="correction-info">
              <span class="correction-subject">{{ record.subject }}</span>
              <span class="correction-name">{{ record.taskName }}</span>
              <span class="correction-comment">{{ record.comment }}</span>
            </div>
          </div>
          <div class="correction-meta">
            <span v-if="record.errorCount > 0" class="correction-errors">
              {{ record.errorCount }} 处错题
            </span>
            <span v-else class="correction-perfect">全对！🎉</span>
            <span class="correction-time">{{ formatTime(record.completedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- AI小贴士 -->
    <div class="card tip-card">
      <div class="tip-header">
        <img :src="monsterGifs.thinking" class="tip-pet-gif" alt="小怪兽" />
        <div class="tip-title">
          <span class="tip-name">{{ store.petName }}的小贴士</span>
          <span class="tip-tag">每日一句</span>
        </div>
      </div>
      <p class="tip-text">{{ dailyTip }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

// 当前怪兽动图
const monsterGifs = computed(() => store.currentMonster.gifs)

// ===== 日期模拟 =====
const simDayOffset = ref(0)

const simDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + simDayOffset.value)
  return d
})

const simDateStr = computed(() => {
  const d = simDate.value
  const weekNames = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 周${weekNames[d.getDay()]}`
})

function changeDay(delta: number) {
  simDayOffset.value += delta
}

// ===== 使用模拟日期的计算 =====
const greetingText = computed(() => {
  const hour = simDate.value.getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const welcomeMessage = computed(() => {
  const messages = [
    '今天也要加油哦！我会一直陪着你的～',
    '准备好开始今天的挑战了吗？',
    '新的一天，新的进步！',
    '你是最棒的！我们一起努力吧！'
  ]
  return messages[simDate.value.getDate() % messages.length]
})

const todayTasks = computed(() => {
  const today = simDate.value.toDateString()
  return store.taskHistory.filter(t => new Date(t.completedAt).toDateString() === today)
})

// 今日 AI 批改记录
const todayCorrections = computed(() => {
  const today = simDate.value.toDateString()
  return store.aiCorrectionRecords.filter(r => new Date(r.completedAt).toDateString() === today)
})

// 评分等级样式
function getScoreClass(score: number): string {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-ok'
  return 'score-needs-work'
}

// 格式化时间
function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const todayMinutes = computed(() => {
  return todayTasks.value.reduce((sum, t) => sum + t.actualMinutes, 0)
})

const tips = [
  '写作业前先预估时间，可以帮你更好地管理时间哦！',
  '提前完成作业可以获得更多金币奖励！',
  '如果能主动提前结束娱乐时间，下次会给你更多时间哦～',
  '坚持每天完成作业，连续天数越多，奖励越丰厚！',
  '合理评估时间是很重要的能力，多参考历史记录吧！',
  '专注的时候把手机放远一点，效果会更好哦！'
]

const dailyTip = tips[simDate.value.getDay() % tips.length]

function getSubjectEmoji(subject: string): string {
  const map: Record<string, string> = {
    '数学': '🔢', '语文': '📖', '英语': '🔤',
    '物理': '⚡', '化学': '🧪', '生物': '🌱',
    '历史': '📜', '地理': '🌍', '政治': '📰',
    '阅读': '📚', '书法': '🖌️', '其他': '📝'
  }
  return map[subject] || '📝'
}

// ===== Demo快速调节 =====
function adjustBetWins(delta: number) {
  store.consecutiveBetWins = Math.max(0, store.consecutiveBetWins + delta)
  const bonus = store.getBetRewardMinutes(store.consecutiveBetWins)
  if (delta > 0 && bonus > 0) {
    store.tabletAllowance = Math.min(store.parentMaxAllowance, store.parentBaseAllowance + bonus)
  }
  store.saveState()
}

function jumpBetWins(days: number) {
  store.consecutiveBetWins = days
  let totalBonus = 0
  for (const m of store.betMilestones) {
    if (m.days <= days) totalBonus += m.reward
  }
  store.tabletAllowance = Math.min(store.parentMaxAllowance, store.parentBaseAllowance + totalBonus)
  store.saveState()
}

function adjustAllowance(delta: number) {
  store.tabletAllowance = Math.max(store.parentBaseAllowance, Math.min(store.parentMaxAllowance, store.tabletAllowance + delta))
  store.saveState()
}

function quickDemo(type: 'task' | 'early' | 'normal' | 'over') {
  if (type === 'task') {
    store.addTaskRecord({
      id: Date.now().toString(),
      name: '数学练习册第5页',
      subject: '数学',
      estimatedMinutes: 20,
      actualMinutes: 18,
      completedAt: new Date().toISOString(),
      verified: true,
      earlyFinish: true,
      overtime: false
    })
    return
  }

  if (!store.canEntertainment) {
    store.addTaskRecord({
      id: Date.now().toString(),
      name: '语文阅读',
      subject: '语文',
      estimatedMinutes: 15,
      actualMinutes: 15,
      completedAt: new Date().toISOString(),
      verified: true,
      earlyFinish: false,
      overtime: false
    })
  }

  const base = store.todayBaseAllowance
  if (type === 'early') {
    store.addTabletSession(Math.floor(base / 2), true)
  } else if (type === 'normal') {
    store.addTabletSession(base, false)
  } else if (type === 'over') {
    store.addTabletSession(base + 5, false)
  }
}

function resetAll() {
  if (!confirm('确定要重置全部数据吗？所有记录、金币、进度将清空！')) return
  const keys = Object.keys(localStorage).filter(k => k.startsWith('fp_'))
  keys.forEach(k => localStorage.removeItem(k))
  location.reload()
}
</script>

<style scoped>
/* ===== 头部区域 ===== */
.home-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-top: 8px;
}

.greeting-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, var(--warning-soft), rgba(255, 183, 77, 0.2));
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #E65100;
  margin-bottom: 8px;
  border: 1px solid rgba(255, 183, 77, 0.2);
}
.greeting-icon { width: 20px; height: 20px; border-radius: 4px; object-fit: cover; }

.title-highlight {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.title-waving {
  display: inline-block;
  animation: wave 2s ease-in-out infinite;
}
@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-10deg); }
}

/* 金币显示 */
.coins-display {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #FFF8E1, #FFF3CD);
  padding: 10px 18px;
  border-radius: 50px;
  cursor: pointer;
  position: relative;
  border: 2px solid rgba(255, 183, 77, 0.2);
  transition: all 0.3s;
}
.coins-display:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(255, 183, 77, 0.25);
}
.coin-glow {
  position: absolute;
  inset: -4px;
  border-radius: 50px;
  background: radial-gradient(circle, rgba(255, 183, 77, 0.2) 0%, transparent 70%);
  animation: coinGlow 2s ease-in-out infinite;
}
@keyframes coinGlow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.coin-icon { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; position: relative; z-index: 1; }
.coin-count { 
  font-weight: 900; 
  color: #E65100; 
  font-size: 1.15rem; 
  position: relative; 
  z-index: 1;
}

/* ===== 小怪兽欢迎卡片 ===== */
.pet-welcome-card {
  background: linear-gradient(135deg, var(--bg-green), #E8F5E9);
  border: 1px solid rgba(124, 179, 66, 0.15);
}
.pet-welcome-card::before {
  background: linear-gradient(90deg, var(--primary-light), var(--primary));
}

.pet-welcome-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pet-welcome-gif {
  width: 70px;
  height: 70px;
  object-fit: contain;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 4px 16px rgba(124, 179, 66, 0.25);
  animation: petWelcomeBounce 3s ease-in-out infinite;
  flex-shrink: 0;
  overflow: hidden;
  background-color: #F1F8E9;
}

@keyframes petWelcomeBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.pet-welcome-text {
  flex: 1;
}

.pet-welcome-msg {
  font-size: 0.95rem;
  color: var(--ink-secondary);
  line-height: 1.6;
  font-weight: 600;
  margin-bottom: 8px;
}

.pet-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--success);
  font-weight: 700;
  background: var(--success-soft);
  padding: 4px 12px;
  border-radius: 20px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

/* ===== 日期模拟器 ===== */
.date-sim-card {
  background: linear-gradient(135deg, #F3E5F5, #EDE7F6);
  border: 1px solid rgba(167, 139, 250, 0.15);
}
.date-sim-card::before {
  background: linear-gradient(90deg, #CE93D8, #AB47BC);
}

.date-sim-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.demo-badge {
  background: linear-gradient(135deg, var(--accent), #FF7043);
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(255, 138, 101, 0.3);
}

.date-sim-desc {
  font-size: 0.8rem;
  color: var(--muted);
  margin-bottom: 14px;
}

.date-sim-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.date-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 18px;
  border: 2px solid rgba(167, 139, 250, 0.2);
  border-radius: 14px;
  background: white;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  color: var(--ink);
}
.date-btn:hover {
  border-color: rgba(167, 139, 250, 0.4);
  transform: translateY(-1px);
}
.date-btn:active {
  transform: scale(0.95);
  background: rgba(167, 139, 250, 0.08);
}

.date-display {
  text-align: center;
  flex: 1;
}
.date-day {
  display: block;
  font-size: 1.3rem;
  font-weight: 900;
  color: #7B1FA2;
}
.date-full {
  display: block;
  font-size: 0.75rem;
  color: var(--muted);
  margin-top: 2px;
}

.date-shortcuts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.shortcut-btn {
  padding: 8px 14px;
  border: 1.5px solid rgba(167, 139, 250, 0.2);
  border-radius: 10px;
  background: white;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  color: var(--muted);
}
.shortcut-btn.active {
  background: linear-gradient(135deg, #CE93D8, #AB47BC);
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(171, 71, 188, 0.3);
}
.shortcut-btn:hover:not(.active) {
  border-color: rgba(167, 139, 250, 0.4);
}
.shortcut-btn:active { transform: scale(0.93); }

/* ===== Demo控制面板 ===== */
.demo-control-card {
  background: linear-gradient(135deg, #FFF8E1, #FFF3E0);
  border: 1px solid rgba(255, 183, 77, 0.15);
}
.demo-control-card::before {
  background: linear-gradient(90deg, #FFB74D, #FF9800);
}

.demo-control-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.demo-row {
  margin-bottom: 16px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 14px;
  border: 1px solid rgba(255, 183, 77, 0.1);
}

.demo-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
  font-size: 0.88rem;
  margin-bottom: 12px;
  color: var(--ink);
}
.label-icon { font-size: 1.1rem; }

.demo-adjust {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
}

.adj-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 2px solid rgba(124, 179, 66, 0.2);
  background: white;
  font-size: 1.3rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.25s;
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.adj-btn:hover {
  border-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 179, 66, 0.15);
}
.adj-btn:active { transform: scale(0.9); }
.adj-btn-minus { color: var(--accent); }
.adj-btn-plus { color: var(--primary); }

.adj-value {
  font-size: 1.4rem;
  font-weight: 900;
  color: #E65100;
  min-width: 70px;
  text-align: center;
}

.demo-milestones {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.milestone-jump-btn {
  padding: 6px 12px;
  border: 1.5px solid rgba(124, 179, 66, 0.2);
  border-radius: 10px;
  background: white;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  color: var(--muted);
}
.milestone-jump-btn.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(124, 179, 66, 0.3);
}
.milestone-jump-btn:hover:not(.active) {
  border-color: var(--primary-light);
}
.milestone-jump-btn:active { transform: scale(0.93); }

/* 快速体验按钮 */
.demo-quick-flow {
  margin-bottom: 14px;
}
.flow-btns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 12px;
}
.btn-flow {
  padding: 14px 8px;
  font-size: 0.8rem;
  border-radius: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.btn-flow:active { transform: scale(0.95); }
.flow-early {
  background: linear-gradient(135deg, var(--success), #43A047);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.3);
}
.flow-normal {
  background: linear-gradient(135deg, var(--warning), #FF9800);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 183, 77, 0.3);
}
.flow-over {
  background: linear-gradient(135deg, var(--accent), #FF7043);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 138, 101, 0.3);
}

.reset-btn {
  font-size: 0.85rem;
  color: var(--muted);
  border-color: var(--rule);
}

/* ===== 状态区域 ===== */
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  font-weight: 800;
  margin-bottom: 14px;
  color: var(--ink);
}
.section-icon { width: 24px; height: 24px; border-radius: 6px; object-fit: cover; }

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.status-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 18px 14px;
  text-align: center;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--rule-light);
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}
.status-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.status-icon-bg {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  margin-bottom: 8px;
  display: inline-block;
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.status-fire .stat-number { color: #FF7043; }
.status-focus .stat-number { color: var(--primary); }
.status-game .stat-number { color: #7B1FA2; }
.status-calendar .stat-number { color: #0288D1; }

/* ===== 快捷操作 ===== */
.action-card::before {
  background: linear-gradient(90deg, var(--warning-light), var(--warning));
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  border-radius: var(--radius-lg);
  text-decoration: none;
  font-weight: 800;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}
.action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%);
  pointer-events: none;
}
.action-btn:hover {
  transform: translateY(-3px) scale(1.02);
}
.action-btn:active { transform: scale(0.96); }

.action-focus {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  box-shadow: 0 6px 24px rgba(124, 179, 66, 0.35);
}
.action-play {
  background: linear-gradient(135deg, var(--warning) 0%, #FF9800 100%);
  color: white;
  box-shadow: 0 6px 24px rgba(255, 183, 77, 0.35);
}

.action-icon-bg {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.action-icon { width: 32px; height: 32px; border-radius: 8px; object-fit: cover; }

.action-label {
  font-size: 1rem;
  position: relative;
  z-index: 1;
}

.action-desc {
  font-size: 0.75rem;
  opacity: 0.85;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

/* ===== 任务列表 ===== */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: var(--bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--rule-light);
  transition: all 0.25s;
}
.task-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.task-subject {
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--ink);
}
.task-name {
  font-size: 0.82rem;
  color: var(--muted);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.task-time {
  font-size: 0.82rem;
  color: var(--muted);
  font-weight: 600;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 24px 16px;
}
.empty-illustration {
  margin-bottom: 16px;
}
.empty-pet {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 50%;
  opacity: 0.7;
  animation: emptyPetFloat 3s ease-in-out infinite;
}
@keyframes emptyPetFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.empty-text {
  color: var(--muted);
  font-size: 0.95rem;
  font-weight: 600;
}

/* ===== 小贴士卡片 ===== */
.tip-card {
  background: linear-gradient(135deg, #E8F5E9, #F1F8E9);
  border: 1px solid rgba(124, 179, 66, 0.12);
}
.tip-card::before {
  background: linear-gradient(90deg, var(--primary-light), var(--primary));
}

.tip-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.tip-pet-gif {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(124, 179, 66, 0.2);
  flex-shrink: 0;
  overflow: hidden;
  background-color: #E8F5E9;
}

.tip-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tip-name {
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--ink);
}

.tip-tag {
  font-size: 0.75rem;
  color: var(--primary);
  font-weight: 700;
  background: var(--primary-soft);
  padding: 2px 10px;
  border-radius: 10px;
  display: inline-block;
  width: fit-content;
}

.tip-text {
  font-size: 0.92rem;
  color: var(--ink-secondary);
  line-height: 1.7;
  padding-left: 4px;
}

/* 标题图标 */
.title-icon {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  object-fit: cover;
}

/* 按钮内图标 */
.btn-icon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  object-fit: cover;
}

/* 标签内图标 */
.label-icon {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  object-fit: cover;
}

/* ===== AI 批改记录 ===== */
.ai-correction-card {
  border: 1.5px solid rgba(124, 179, 66, 0.15);
}

.ai-count-badge {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 6px;
}

.correction-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.correction-item {
  background: var(--bg);
  border-radius: 14px;
  padding: 14px;
  border: 1px solid var(--rule-light);
}

.correction-main {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 8px;
}

.correction-score {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 800;
  color: white;
}

.score-num {
  font-size: 1.1rem;
  line-height: 1;
}

.score-label {
  font-size: 0.6rem;
  font-weight: 600;
}

.score-excellent { background: linear-gradient(135deg, #7CB342, #AED581); }
.score-good { background: linear-gradient(135deg, #42A5F5, #64B5F6); }
.score-ok { background: linear-gradient(135deg, #FFB74D, #FFCC80); }
.score-needs-work { background: linear-gradient(135deg, #FF7043, #FF8A65); }

.correction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.correction-subject {
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 600;
}

.correction-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ink);
}

.correction-comment {
  font-size: 0.78rem;
  color: var(--ink-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.correction-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px dashed var(--rule-light);
}

.correction-errors {
  font-size: 0.75rem;
  color: var(--accent);
  font-weight: 600;
}

.correction-perfect {
  font-size: 0.75rem;
  color: var(--primary-dark);
  font-weight: 700;
}

.correction-time {
  font-size: 0.7rem;
  color: var(--muted);
}
</style>
