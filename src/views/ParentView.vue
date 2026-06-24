<template>
  <div class="page-container">
    <h1 class="page-title">📊 家长看板</h1>
    <p class="page-subtitle">AI行为分析报告</p>

    <!-- 概览数据 -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-icon">⏱️</span>
        <span class="stat-val">{{ store.totalFocusMinutes }}</span>
        <span class="stat-lbl">总专注(分)</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">📝</span>
        <span class="stat-val">{{ store.taskHistory.length }}</span>
        <span class="stat-lbl">完成任务</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🔥</span>
        <span class="stat-val">{{ store.streak }}</span>
        <span class="stat-lbl">连续天数</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🎮</span>
        <span class="stat-val">{{ store.tabletSessions.length }}</span>
        <span class="stat-lbl">娱乐次数</span>
      </div>
    </div>

    <!-- 专注趋势 -->
    <div class="card">
      <h3 class="card-title">📈 专注趋势（近7天）</h3>
      <div class="trend-chart">
        <div v-for="day in focusTrend" :key="day.date" class="trend-bar-wrapper">
          <div class="trend-bar" :style="{ height: getBarHeight(day.minutes) + 'px' }">
            <span class="trend-val" v-if="day.minutes > 0">{{ day.minutes }}</span>
          </div>
          <span class="trend-date">{{ day.date }}</span>
        </div>
      </div>
    </div>

    <!-- 科目分析 -->
    <div class="card">
      <h3 class="card-title">📊 科目用时分析</h3>
      <div v-if="subjectStats.length === 0" class="empty-state">
        <p>暂无数据</p>
      </div>
      <div v-else class="subject-list">
        <div v-for="stat in subjectStats" :key="stat.subject" class="subject-item">
          <div class="subject-info">
            <span class="subject-icon">{{ getSubjectEmoji(stat.subject) }}</span>
            <span class="subject-name">{{ stat.subject }}</span>
          </div>
          <div class="subject-data">
            <div class="subject-bar-bg">
              <div class="subject-bar-fill" :style="{ width: stat.percent + '%' }"></div>
            </div>
            <span class="subject-avg">平均{{ stat.avg }}分</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 拖延趋势 -->
    <div class="card">
      <h3 class="card-title">⚠️ 拖延分析</h3>
      <div class="delay-stats">
        <div class="delay-item">
          <span class="delay-label">按时完成率</span>
          <span class="delay-val ontime">{{ ontimeRate }}%</span>
        </div>
        <div class="delay-item">
          <span class="delay-label">提前完成率</span>
          <span class="delay-val early">{{ earlyRate }}%</span>
        </div>
        <div class="delay-item">
          <span class="delay-label">超时率</span>
          <span class="delay-val overtime">{{ overtimeRate }}%</span>
        </div>
      </div>
    </div>

    <!-- 平板使用记录 -->
    <div class="card">
      <h3 class="card-title">🎮 平板使用记录</h3>
      <div v-if="store.tabletSessions.length === 0" class="empty-state">
        <p>暂无记录</p>
      </div>
      <div v-else class="tablet-list">
        <div v-for="session in store.tabletSessions.slice(0, 10)" :key="session.id" class="tablet-item">
          <div class="tablet-info">
            <span class="tablet-date">{{ formatDate(session.date) }}</span>
            <span class="tablet-detail">额度{{ session.baseMinutes }}分 / 实际{{ session.actualMinutes }}分</span>
          </div>
          <span class="badge" :class="session.earlyQuit ? 'badge-success' : session.overtime ? 'badge-danger' : 'badge-warning'">
            {{ session.earlyQuit ? '提前退出' : session.overtime ? '超时' : '正常' }}
          </span>
        </div>
      </div>
    </div>

    <!-- AI建议 -->
    <div class="card suggestion-card">
      <h3 class="card-title">🤖 AI亲子沟通建议</h3>
      <div v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item">
        <span class="suggestion-icon">💡</span>
        <p>{{ suggestion }}</p>
      </div>
    </div>

    <!-- 家长设置 -->
    <div class="card settings-card">
      <h3 class="card-title">⚙️ 娱乐时间设置</h3>
      <p class="settings-desc">设置孩子每天的起始娱乐额度和封顶上限</p>

      <div class="setting-row">
        <div class="setting-label">
          <span class="setting-icon">📋</span>
          <div>
            <span class="setting-name">起始娱乐时间</span>
            <span class="setting-hint">每天的基础娱乐额度（5~120分钟）</span>
          </div>
        </div>
        <div class="setting-control">
          <button class="num-btn" @click="adjustBase(-5)" :disabled="tempBase <= 5">−</button>
          <span class="num-val">{{ tempBase }}</span>
          <button class="num-btn" @click="adjustBase(5)" :disabled="tempBase >= 120">+</button>
        </div>
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span class="setting-icon">🚫</span>
          <div>
            <span class="setting-name">封顶娱乐时间</span>
            <span class="setting-hint">对赌奖励累加的上限（不低于起始值，最大180分钟）</span>
          </div>
        </div>
        <div class="setting-control">
          <button class="num-btn" @click="adjustMax(-5)" :disabled="tempMax <= tempBase">−</button>
          <span class="num-val">{{ tempMax }}</span>
          <button class="num-btn" @click="adjustMax(5)" :disabled="tempMax >= 180">+</button>
        </div>
      </div>

      <!-- 额度可视化 -->
      <div class="allowance-visual">
        <div class="visual-bar">
          <div class="visual-base" :style="{ width: basePercent + '%' }">
            <span>基础 {{ tempBase }}'</span>
          </div>
          <div class="visual-bonus" :style="{ width: bonusPercent + '%' }" v-if="tempMax > tempBase">
            <span>奖励区 {{ tempMax - tempBase }}'</span>
          </div>
        </div>
        <p class="visual-hint">
          孩子从 <strong>{{ tempBase }}分钟</strong> 起步，通过自律对赌最高可增长到 <strong>{{ tempMax }}分钟</strong>
        </p>
      </div>

      <!-- 封顶规则说明 -->
      <div class="cap-rule">
        <div class="cap-rule-item">
          <span class="cap-icon">📈</span>
          <span>未达封顶：对赌里程碑奖励正常增加额度</span>
        </div>
        <div class="cap-rule-item">
          <span class="cap-icon">🔒</span>
          <span>已达封顶：对赌成功仅维持当前额度，不再增加</span>
        </div>
        <div class="cap-rule-item">
          <span class="cap-icon">🔄</span>
          <span>超时使用：额度重置回起始值，连续天数清零</span>
        </div>
      </div>

      <button class="btn btn-primary btn-block" @click="saveSettings" :disabled="!settingsChanged">
        💾 保存设置
      </button>
      <p v-if="saveSuccess" class="save-success">✅ 已保存！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

const focusTrend = computed(() => store.getFocusTrend())
const suggestions = computed(() => store.getAISuggestions())

// 家长设置：临时变量
const tempBase = ref(store.parentBaseAllowance)
const tempMax = ref(store.parentMaxAllowance)
const saveSuccess = ref(false)

const settingsChanged = computed(() =>
  tempBase.value !== store.parentBaseAllowance || tempMax.value !== store.parentMaxAllowance
)

function adjustBase(delta: number) {
  const next = Math.max(5, Math.min(120, tempBase.value + delta))
  tempBase.value = next
  if (tempMax.value < next) tempMax.value = next
}

function adjustMax(delta: number) {
  tempMax.value = Math.max(tempBase.value, Math.min(180, tempMax.value + delta))
}

function saveSettings() {
  store.updateParentAllowance(tempBase.value, tempMax.value)
  saveSuccess.value = true
  setTimeout(() => saveSuccess.value = false, 2000)
}

// 额度可视化比例
const basePercent = computed(() => (tempBase.value / 180) * 100)
const bonusPercent = computed(() => ((tempMax.value - tempBase.value) / 180) * 100)

const maxMinutes = computed(() => {
  return Math.max(1, ...focusTrend.value.map(d => d.minutes))
})

function getBarHeight(minutes: number): number {
  return Math.max(4, (minutes / maxMinutes.value) * 120)
}

const subjectStats = computed(() => {
  const map: Record<string, { total: number; count: number }> = {}
  store.taskHistory.forEach(t => {
    if (!map[t.subject]) map[t.subject] = { total: 0, count: 0 }
    map[t.subject].total += t.actualMinutes
    map[t.subject].count++
  })
  
  const maxAvg = Math.max(1, ...Object.values(map).map(s => s.total / s.count))
  
  return Object.entries(map).map(([subject, data]) => ({
    subject,
    avg: Math.round(data.total / data.count),
    count: data.count,
    percent: Math.round((data.total / data.count / maxAvg) * 100)
  })).sort((a, b) => b.count - a.count)
})

const totalTasks = computed(() => store.taskHistory.length)
const ontimeRate = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((store.taskHistory.filter(t => !t.earlyFinish && !t.overtime).length / totalTasks.value) * 100)
})
const earlyRate = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((store.taskHistory.filter(t => t.earlyFinish).length / totalTasks.value) * 100)
})
const overtimeRate = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((store.taskHistory.filter(t => t.overtime).length / totalTasks.value) * 100)
})

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getSubjectEmoji(subject: string): string {
  const map: Record<string, string> = {
    '数学': '🔢', '语文': '📖', '英语': '🔤',
    '物理': '⚡', '化学': '🧪', '生物': '🌱',
    '历史': '📜', '地理': '🌍', '阅读': '📚', '其他': '📝'
  }
  return map[subject] || '📝'
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.stat-card {
  background: var(--bg2);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}
.stat-icon { font-size: 1.5rem; display: block; margin-bottom: 4px; }
.stat-val { font-size: 1.5rem; font-weight: 900; display: block; color: var(--accent2); }
.stat-lbl { font-size: 0.75rem; color: var(--muted); }

.trend-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 150px;
  padding-top: 10px;
}
.trend-bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}
.trend-bar {
  width: 24px;
  background: linear-gradient(180deg, var(--accent2), #45B7AA);
  border-radius: 6px 6px 0 0;
  min-height: 4px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  transition: height 0.5s;
}
.trend-val {
  font-size: 0.6rem;
  font-weight: 700;
  color: white;
  padding-top: 2px;
}
.trend-date { font-size: 0.65rem; color: var(--muted); }

.subject-list { display: flex; flex-direction: column; gap: 10px; }
.subject-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.subject-info {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 70px;
}
.subject-icon { font-size: 1.2rem; }
.subject-name { font-weight: 600; font-size: 0.85rem; }
.subject-data { flex: 1; display: flex; align-items: center; gap: 8px; }
.subject-bar-bg {
  flex: 1;
  height: 8px;
  background: var(--rule);
  border-radius: 4px;
  overflow: hidden;
}
.subject-bar-fill {
  height: 100%;
  background: var(--accent2);
  border-radius: 4px;
  transition: width 0.5s;
}
.subject-avg { font-size: 0.75rem; color: var(--muted); min-width: 55px; text-align: right; }

.delay-stats { display: flex; gap: 12px; }
.delay-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  background: var(--bg);
  border-radius: 12px;
}
.delay-label { font-size: 0.75rem; color: var(--muted); display: block; margin-bottom: 4px; }
.delay-val { font-size: 1.3rem; font-weight: 800; display: block; }
.delay-val.ontime { color: var(--accent2); }
.delay-val.early { color: #45B7AA; }
.delay-val.overtime { color: var(--accent); }

.tablet-list { display: flex; flex-direction: column; gap: 8px; }
.tablet-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: var(--bg);
  border-radius: 10px;
}
.tablet-info { display: flex; flex-direction: column; gap: 2px; }
.tablet-date { font-weight: 600; font-size: 0.85rem; }
.tablet-detail { font-size: 0.75rem; color: var(--muted); }

.suggestion-card {
  background: linear-gradient(135deg, #F5F0FF, #EDE7FE);
  border: 1px solid rgba(167,139,250,0.2);
}
.suggestion-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(167,139,250,0.1);
}
.suggestion-item:last-child { border-bottom: none; }
.suggestion-icon { font-size: 1.2rem; flex-shrink: 0; }
.suggestion-item p { font-size: 0.9rem; color: var(--ink); line-height: 1.6; }

.empty-state { text-align: center; padding: 20px; color: var(--muted); }

/* 家长设置 */
.settings-card {
  background: linear-gradient(135deg, #F0F9FF, #E0F2FE);
  border: 1px solid rgba(59,130,246,0.15);
}
.settings-desc { font-size: 0.85rem; color: var(--muted); margin-bottom: 16px; }

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(59,130,246,0.08);
}
.setting-row:last-of-type { border-bottom: none; }

.setting-label {
  display: flex;
  align-items: center;
  gap: 10px;
}
.setting-icon { font-size: 1.3rem; }
.setting-name {
  display: block;
  font-weight: 700;
  font-size: 0.9rem;
}
.setting-hint {
  display: block;
  font-size: 0.72rem;
  color: var(--muted);
  margin-top: 2px;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 8px;
}
.num-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #3B82F6;
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.num-btn:active { transform: scale(0.9); }
.num-btn:disabled {
  background: #CBD5E1;
  cursor: not-allowed;
}
.num-val {
  font-size: 1.3rem;
  font-weight: 900;
  min-width: 40px;
  text-align: center;
  color: var(--ink);
}

/* 额度可视化条 */
.allowance-visual {
  margin: 16px 0;
  padding: 12px;
  background: rgba(255,255,255,0.6);
  border-radius: 12px;
}
.visual-bar {
  height: 32px;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  background: #E5E7EB;
}
.visual-base {
  background: linear-gradient(90deg, #3B82F6, #2563EB);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  transition: width 0.3s;
}
.visual-bonus {
  background: linear-gradient(90deg, #10B981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  transition: width 0.3s;
}
.visual-hint {
  font-size: 0.78rem;
  color: var(--muted);
  margin-top: 8px;
  text-align: center;
}

/* 封顶规则说明 */
.cap-rule {
  margin: 12px 0;
  padding: 12px;
  background: rgba(255,255,255,0.5);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cap-rule-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--ink);
}
.cap-icon { font-size: 1rem; flex-shrink: 0; }

.save-success {
  text-align: center;
  color: #10B981;
  font-weight: 700;
  font-size: 0.85rem;
  margin-top: 8px;
}
</style>
