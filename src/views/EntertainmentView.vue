<template>
  <div class="page-container">
    <h1 class="page-title">🎮 娱乐时间</h1>
    <p class="page-subtitle">完成作业后的放松时刻！</p>

    <!-- 未解锁状态 -->
    <div v-if="!store.canEntertainment" class="card locked-card">
      <div class="locked-content">
        <span class="locked-icon">🔒</span>
        <h3>娱乐时间尚未解锁</h3>
        <p>请先完成今天的作业，通过验证后才能进入娱乐模式哦～</p>
        <router-link to="/focus" class="btn btn-primary btn-block" style="margin-top:16px">
          📝 去写作业
        </router-link>
      </div>
    </div>

    <!-- 已解锁 -->
    <template v-else>
      <!-- 娱乐额度 -->
      <div class="card allowance-card">
        <div class="allowance-info">
          <div>
            <span class="allowance-label">今日娱乐额度</span>
            <span class="allowance-detail">基础 {{ store.todayBaseAllowance }}分 / 已用 {{ store.todayUsedMinutes }}分</span>
          </div>
          <span class="allowance-time">{{ store.todayRemainingMinutes }}分</span>
        </div>
        <div class="allowance-bar">
          <div class="allowance-fill" :style="{ width: allowancePercent + '%' }"></div>
        </div>
        <p class="allowance-hint" v-if="store.todayUsedMinutes > 0">
          今日已使用过{{ store.todayUsedMinutes }}分钟，剩余{{ store.todayRemainingMinutes }}分钟可继续使用
        </p>
        <p class="allowance-hint" v-else>
          额度充足，好好享受吧！可多次进出，时间累计
        </p>
      </div>

      <!-- 未开始状态 -->
      <template v-if="!isPlaying">
        <!-- 安全白名单内容 -->
        <div class="card">
          <h3 class="card-title">📚 安全内容白名单</h3>
          <div class="content-grid">
            <div v-for="item in whitelistContent" :key="item.id" class="content-card" @click="openContent">
              <span class="content-icon">{{ item.icon }}</span>
              <span class="content-name">{{ item.name }}</span>
              <span class="content-tag">{{ item.tag }}</span>
            </div>
          </div>
          <router-link to="/entertainment/content" class="btn btn-warning btn-block" style="margin-top: 14px;">
            🎮 浏览娱乐内容（小游戏/视频）
          </router-link>
        </div>

        <!-- 对赌提示 -->
        <div class="card bet-card">
          <h3 class="card-title">🎰 欲望对赌挑战</h3>

          <!-- 封顶状态 -->
          <div v-if="store.isAllowanceCapped" class="cap-banner">
            🔒 已达封顶额度（{{ store.parentMaxAllowance }}分钟）！继续对赌可维持额度，超时则重置。
          </div>

          <p class="bet-desc" v-if="store.isAllowanceCapped">
            🏆 额度已封顶！继续提前结束可<strong>维持</strong>当前额度不失守
          </p>
          <p class="bet-desc" v-else-if="nextReward > 0">
            🎉 今天是里程碑！主动提前结束，明天额度<strong>+{{ nextReward }}分钟</strong>！
          </p>
          <p class="bet-desc" v-else>
            坚持对赌，再 <strong>{{ daysToNextMilestone }} 天</strong>（第{{ nextMilestoneDay }}天）解锁<strong>+{{ nextMilestoneReward }}分钟</strong>奖励！
          </p>
          <div class="bet-streak">
            <span>🔥 已连续对赌成功 {{ store.consecutiveBetWins }} 天</span>
            <!-- 里程碑进度条 -->
            <div class="milestone-track">
              <div v-for="m in visibleMilestones" :key="m.days"
                class="milestone-pill"
                :class="{ reached: store.consecutiveBetWins >= m.days, next: m.days === nextMilestoneDay }">
                <span class="pill-day">{{ m.days }}天</span>
                <span class="pill-reward">+{{ m.reward }}分</span>
              </div>
            </div>
          </div>
          <p class="bet-warning">⚠️ 如果超时使用，连续天数清零，额度重置为{{ store.parentBaseAllowance }}分钟</p>

          <!-- 额度进度条（当前/封顶） -->
          <div class="cap-progress">
            <div class="cap-progress-bar">
              <div class="cap-progress-fill" :style="{ width: capProgressPercent + '%' }"></div>
            </div>
            <div class="cap-progress-label">
              <span>{{ store.tabletAllowance }}分钟</span>
              <span>封顶 {{ store.parentMaxAllowance }}分钟</span>
            </div>
          </div>

          <div class="bet-next">
            <span>明天基础额度：</span>
            <strong :class="nextDayClass">{{ store.tabletAllowance }}分钟</strong>
            <span v-if="store.tabletAllowance > store.parentBaseAllowance" class="bet-bonus">（含奖励）</span>
          </div>
        </div>

        <button class="btn btn-primary btn-block" @click="startEntertainment" :disabled="store.todayRemainingMinutes <= 0">
          🎮 开始娱乐（剩余 {{ store.todayRemainingMinutes }} 分钟）
        </button>
      </template>

      <!-- 娱乐进行中 -->
      <template v-else>
        <div class="playing-container">
          <div class="playing-timer">
            <div class="playing-ring" :style="{ '--progress': playingProgress }">
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#E5E7EB" stroke-width="8" />
                <circle cx="100" cy="100" r="90" fill="none" stroke="url(#playGradient)" stroke-width="8"
                  stroke-linecap="round" :stroke-dasharray="playingDashArray" transform="rotate(-90 100 100)" />
                <defs>
                  <linearGradient id="playGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#FFD93D" />
                    <stop offset="100%" stop-color="#FF6B6B" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="playing-text">
                <div class="playing-minutes">{{ displayPlayMinutes }}</div>
                <div class="playing-seconds">{{ displayPlaySeconds }}</div>
              </div>
            </div>
          </div>

          <div class="playing-status">
            <span v-if="isOvertime" class="status-overtime">⚠️ 已超出今日额度！</span>
            <span v-else>享受娱乐时光～ 🎉</span>
          </div>

          <!-- 对赌按钮 -->
          <div class="bet-actions">
            <button class="btn btn-primary" @click="showEarlyQuitConfirm" v-if="!isOvertime && elapsedSeconds > 60">
              🛡️ 提前结束（{{ earlyQuitLabel }}）
            </button>
            <button class="btn btn-accent" @click="showForceEndConfirm">
              ⏹️ 结束娱乐
            </button>
          </div>

          <!-- Demo时间快进 -->
          <div class="demo-fast-forward">
            <div class="demo-tag">🧪 Demo快进</div>
            <div class="ff-buttons">
              <button class="ff-btn" @click="fastForward(1)">+1分</button>
              <button class="ff-btn" @click="fastForward(5)">+5分</button>
              <button class="ff-btn ff-btn-fill" @click="fastForward(store.todayRemainingMinutes)">跳满</button>
              <button class="ff-btn ff-btn-over" @click="fastForward(store.todayRemainingMinutes + 5)">超时</button>
            </div>
          </div>

          <p v-if="!isOvertime && elapsedSeconds > 60" class="bet-motivation">
            {{ earlyQuitMotivation }}
          </p>
        </div>
      </template>
    </template>

    <!-- 自定义确认弹窗 -->
    <transition name="confirm-fade">
      <div v-if="confirmDialog.show" class="confirm-overlay" @click.self="confirmDialog.show = false">
        <div class="confirm-card">
          <div class="confirm-icon">{{ confirmDialog.icon }}</div>
          <h3 class="confirm-title">{{ confirmDialog.title }}</h3>
          <p class="confirm-msg">{{ confirmDialog.message }}</p>
          <div class="confirm-actions">
            <button class="btn btn-outline" @click="confirmDialog.show = false">取消</button>
            <button class="btn btn-primary" @click="confirmDialog.onConfirm">确认</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const pet = inject<any>('pet')

const whitelistContent = [
  { id: 1, icon: '🔬', name: '科学探索', tag: '科普' },
  { id: 2, icon: '💻', name: '编程乐园', tag: '编程' },
  { id: 3, icon: '📖', name: '英语绘本', tag: '阅读' },
  { id: 4, icon: '🎨', name: '创意画板', tag: '创意' },
  { id: 5, icon: '🧩', name: '益智游戏', tag: '游戏' },
  { id: 6, icon: '🌍', name: '世界百科', tag: '科普' },
]

// 使用 store 共享的娱乐计时状态（与 EntertainmentContent 页面共用）
const isPlaying = computed(() => store.entertainmentPlaying)
const elapsedSeconds = computed(() => store.entertainmentElapsedSeconds)

// 自定义确认弹窗状态
const confirmDialog = ref({
  show: false,
  icon: '',
  title: '',
  message: '',
  onConfirm: () => {}
})

function showConfirm(icon: string, title: string, message: string, onConfirm: () => void) {
  confirmDialog.value = { show: true, icon, title, message, onConfirm }
}

// 当天剩余秒数
const totalSeconds = computed(() => store.todayRemainingMinutes * 60)
const remainingSeconds = computed(() => Math.max(0, totalSeconds.value - elapsedSeconds.value))
const displayPlayMinutes = computed(() => String(Math.floor(remainingSeconds.value / 60)).padStart(2, '0'))
const displayPlaySeconds = computed(() => String(remainingSeconds.value % 60).padStart(2, '0'))
const playingProgress = computed(() => {
  if (totalSeconds.value === 0) return 0
  return Math.min(1, elapsedSeconds.value / totalSeconds.value)
})
const playingDashArray = computed(() => {
  const circumference = 2 * Math.PI * 90
  return `${circumference * (1 - playingProgress.value)} ${circumference}`
})
const isOvertime = computed(() => elapsedSeconds.value > totalSeconds.value)
const allowancePercent = computed(() => {
  if (store.todayBaseAllowance === 0) return 0
  return Math.max(0, (store.todayRemainingMinutes / store.todayBaseAllowance) * 100)
})
const nextDayClass = computed(() => store.tabletAllowance > 30 ? 'bonus' : store.tabletAllowance < 30 ? 'penalty' : '')

// 下一次对赌成功可获得的奖励（只在里程碑天才 > 0）
const nextReward = computed(() => store.getBetRewardMinutes(store.consecutiveBetWins + 1))

// 下一个里程碑天数
const nextMilestoneDay = computed(() => store.getNextMilestoneDays(store.consecutiveBetWins))

// 下一个里程碑的奖励
const nextMilestoneReward = computed(() => store.getNextMilestoneReward(store.consecutiveBetWins))

// 距离下一个里程碑还差几天
const daysToNextMilestone = computed(() => nextMilestoneDay.value - store.consecutiveBetWins)

// 可见的里程碑列表（当前进度前后各展示几个）
const visibleMilestones = computed(() => {
  const all = store.betMilestones
  const cur = store.consecutiveBetWins
  // 显示已达到的 + 后面4个里程碑
  const reached = all.filter(m => m.days <= cur)
  const upcoming = all.filter(m => m.days > cur).slice(0, 4)
  return [...reached.slice(-2), ...upcoming]
})

// 提前结束按钮标签
const earlyQuitLabel = computed(() => {
  const nextWins = store.consecutiveBetWins + 1
  if (store.isAllowanceCapped) return `🔒 维持额度`
  const bonus = store.getBetRewardMinutes(nextWins)
  if (bonus > 0) return `🎉 里程碑！+${bonus}分钟`
  const daysLeft = store.getNextMilestoneDays(nextWins) - nextWins
  return `积累中（再${daysLeft}天）`
})

// 提前结束的激励文案
const earlyQuitMotivation = computed(() => {
  const nextWins = store.consecutiveBetWins + 1
  const bonus = store.getBetRewardMinutes(nextWins)
  if (store.isAllowanceCapped) return `🔒 额度已封顶！提前结束可维持当前最高额度，守住就是胜利！`
  if (bonus > 0) return `🎁 今天是里程碑！提前结束，明天额度 +${bonus}分钟！`
  const daysLeft = store.getNextMilestoneDays(nextWins) - nextWins
  return `坚持下去，再${daysLeft}天达成里程碑，解锁 +${store.getNextMilestoneReward(nextWins)}分钟！🔥`
})

// 封顶进度百分比
const capProgressPercent = computed(() => {
  if (store.parentMaxAllowance === 0) return 0
  return Math.min(100, (store.tabletAllowance / store.parentMaxAllowance) * 100)
})

function startEntertainment() {
  store.startEntertainmentTimer()
}

// 跳转到娱乐内容页（点击白名单内容时也自动开始计时）
function openContent() {
  if (!isPlaying.value && store.todayRemainingMinutes > 0) {
    store.startEntertainmentTimer()
  }
}

// Demo快进：直接跳过指定分钟数
function fastForward(minutes: number) {
  store.entertainmentElapsedSeconds += minutes * 60
}

function showEarlyQuitConfirm() {
  const nextWins = store.consecutiveBetWins + 1
  const bonus = store.getBetRewardMinutes(nextWins)
  const msg = bonus > 0
    ? `明天额度 +${bonus}分钟！`
    : `坚持积累中，明天继续加油！`
  showConfirm(
    '🛡️',
    '提前结束娱乐',
    msg,
    () => doEarlyQuit()
  )
}

function doEarlyQuit() {
  confirmDialog.value.show = false
  const usedMinutes = Math.round(elapsedSeconds.value / 60)
  store.addTabletSession(usedMinutes, true)
  store.stopEntertainmentTimer()

  pet?.value?.say('tabletEarly')
}

function showForceEndConfirm() {
  const usedMinutes = Math.round(elapsedSeconds.value / 60)
  const overtime = usedMinutes >= store.todayRemainingMinutes
  showConfirm(
    '⏹️',
    '结束娱乐',
    overtime ? '已超出今日额度，确定结束吗？' : '确定要结束本次娱乐吗？',
    () => doForceEnd()
  )
}

function doForceEnd() {
  confirmDialog.value.show = false
  const usedMinutes = Math.round(elapsedSeconds.value / 60)
  const overtime = usedMinutes >= store.todayRemainingMinutes
  store.addTabletSession(usedMinutes, false)
  store.stopEntertainmentTimer()

  if (overtime) {
    pet?.value?.say('tabletOvertime', 'thinking')
  } else {
    pet?.value?.say('focus')
  }
}
</script>

<style scoped>
/* 未解锁 */
.locked-card {
  background: linear-gradient(135deg, #F5F0FF, #EDE7FE);
  border: 2px dashed rgba(167,139,250,0.3);
}
.locked-content {
  text-align: center;
  padding: 20px 0;
}
.locked-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
.locked-content h3 { font-size: 1.2rem; margin-bottom: 8px; }
.locked-content p { color: var(--muted); font-size: 0.9rem; }

/* 额度卡片 */
.allowance-card {
  background: linear-gradient(135deg, #FFF8E1, #FFF3CD);
  border: 1px solid rgba(255,217,61,0.3);
}
.allowance-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.allowance-label { font-weight: 700; color: var(--ink); display: block; }
.allowance-detail { font-size: 0.75rem; color: var(--muted); }
.allowance-time {
  font-size: 1.8rem;
  font-weight: 900;
  color: #D4A017;
}
.allowance-bar {
  height: 8px;
  background: rgba(255,217,61,0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}
.allowance-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD93D, #FFC107);
  border-radius: 4px;
  transition: width 0.5s;
}
.allowance-hint { font-size: 0.8rem; color: var(--muted); }

/* 白名单 */
.content-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.content-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 8px;
  background: var(--bg);
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}
.content-card:active { transform: scale(0.95); }
.content-icon { font-size: 2rem; }
.content-name { font-size: 0.8rem; font-weight: 600; }
.content-tag { font-size: 0.65rem; color: var(--muted); }

/* 对赌 */
.bet-card {
  background: linear-gradient(135deg, #F5F0FF, #EDE7FE);
  border: 1px solid rgba(167,139,250,0.2);
}
.bet-desc { font-size: 0.9rem; margin-bottom: 8px; }
.bet-streak {
  margin: 12px 0;
  padding: 12px;
  background: rgba(255,255,255,0.6);
  border-radius: 12px;
}
.bet-streak > span {
  display: block;
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 8px;
  color: var(--accent);
}
/* 里程碑进度条 */
.milestone-track {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
}
.milestone-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  min-width: 56px;
  transition: all 0.3s;
  opacity: 0.5;
}
.milestone-pill.reached {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  border-color: transparent;
  opacity: 1;
}
.milestone-pill.next {
  border: 2px dashed #F59E0B;
  background: #FEF3C7;
  color: #92400E;
  opacity: 1;
  animation: glow 2s ease-in-out infinite;
}
@keyframes glow {
  0%, 100% { box-shadow: 0 0 0 rgba(245, 158, 11, 0); }
  50% { box-shadow: 0 0 12px rgba(245, 158, 11, 0.4); }
}
.pill-day { font-size: 0.7rem; font-weight: 700; }
.pill-reward { font-size: 0.65rem; opacity: 0.85; }
.bet-warning { font-size: 0.8rem; color: var(--accent); margin-bottom: 12px; }
.bet-next {
  padding-top: 12px;
  border-top: 1px solid rgba(167,139,250,0.15);
  font-size: 0.9rem;
}
.bet-next strong { font-size: 1.2rem; }
.bet-next strong.bonus { color: var(--accent2); }
.bet-next strong.penalty { color: var(--accent); }
.bet-bonus { font-size: 0.75rem; color: var(--accent2); }

/* 封顶横幅 */
.cap-banner {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  border: 1px solid #F59E0B;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #92400E;
  margin-bottom: 10px;
}

/* 封顶进度条 */
.cap-progress {
  margin: 10px 0;
}
.cap-progress-bar {
  height: 10px;
  background: #E5E7EB;
  border-radius: 5px;
  overflow: hidden;
}
.cap-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3B82F6, #F59E0B);
  border-radius: 5px;
  transition: width 0.5s;
}
.cap-progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--muted);
  margin-top: 4px;
}

/* 娱乐中 */
.playing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
}
.playing-timer { margin-bottom: 30px; }
.playing-ring {
  width: 200px;
  height: 200px;
  position: relative;
}
.playing-ring svg { width: 100%; height: 100%; }
.playing-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.playing-minutes {
  font-size: 3rem;
  font-weight: 900;
  color: var(--ink);
  line-height: 1;
}
.playing-seconds {
  font-size: 1.1rem;
  color: var(--muted);
  font-weight: 600;
}

.playing-status {
  margin-bottom: 30px;
  font-weight: 600;
  color: var(--accent2);
}
.status-overtime {
  color: var(--accent);
  font-weight: 700;
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.bet-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.bet-motivation {
  font-size: 0.85rem;
  color: var(--accent2);
  font-weight: 600;
}

/* Demo快进 */
.demo-fast-forward {
  margin-top: 20px;
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
.ff-btn-over {
  border-color: var(--accent);
  background: rgba(255,107,107,0.12);
  color: var(--accent);
}

/* ===== 自定义确认弹窗 ===== */
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 32px 28px 24px;
  max-width: 340px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-lg);
  animation: confirmPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes confirmPop {
  from { opacity: 0; transform: scale(0.85) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.confirm-icon {
  font-size: 2.8rem;
  margin-bottom: 12px;
}

.confirm-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 8px;
}

.confirm-msg {
  font-size: 0.9rem;
  color: var(--ink-secondary);
  line-height: 1.5;
  margin-bottom: 24px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.confirm-actions .btn {
  flex: 1;
  padding: 12px 16px;
  font-size: 0.9rem;
}

.confirm-fade-enter-active { animation: confirmFadeIn 0.25s ease; }
.confirm-fade-leave-active { animation: confirmFadeOut 0.15s ease; }
@keyframes confirmFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes confirmFadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
