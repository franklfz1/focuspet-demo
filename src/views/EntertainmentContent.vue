<template>
  <div class="page-container entertainment-content-page">
    <!-- 娱乐计时器浮窗（可点击） -->
    <div class="timer-float" v-if="store.entertainmentPlaying" @click="showEndConfirm">
      <div class="timer-ring-mini">
        <svg viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="17" fill="none" stroke="#E5E7EB" stroke-width="3" />
          <circle cx="20" cy="20" r="17" fill="none" stroke="url(#timerGrad)" stroke-width="3"
            stroke-linecap="round" :stroke-dasharray="timerDashArray" transform="rotate(-90 20 20)" />
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#FFD93D" />
              <stop offset="100%" stop-color="#FF6B6B" />
            </linearGradient>
          </defs>
        </svg>
        <span class="timer-text-mini">{{ timerDisplay }}</span>
      </div>
      <span class="timer-label">点击结束</span>
    </div>

    <!-- 结束娱乐确认弹窗 -->
    <transition name="end-fade">
      <div v-if="endDialog.show" class="end-overlay" @click.self="endDialog.show = false">
        <div class="end-card">
          <div class="end-icon">⏹️</div>
          <h3>结束娱乐</h3>
          <p>{{ endDialog.message }}</p>
          <div class="end-actions">
            <button class="btn btn-outline" @click="endDialog.show = false">取消</button>
            <button class="btn btn-accent" @click="confirmEnd">确认结束</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 页面头部 -->
    <div class="content-header">
      <button class="back-btn" @click="goBack" v-if="selectedContent">
        <span class="back-arrow">←</span>
        <span>返回</span>
      </button>
      <h1 class="content-title" v-if="!selectedContent">🎮 娱乐内容</h1>
      <h1 class="content-title" v-else>{{ selectedContent.title }}</h1>
    </div>

    <!-- 内容列表视图 -->
    <div v-if="!selectedContent" class="content-list-view">
      <!-- 分类标签 -->
      <div class="category-tabs">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="category-tab"
          :class="{ active: activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-name">{{ cat.name }}</span>
        </button>
      </div>

      <!-- 内容网格 -->
      <div class="content-grid">
        <div
          v-for="item in filteredContent"
          :key="item.id"
          class="content-card"
          @click="selectContent(item)"
        >
          <div class="content-card-icon" :style="{ background: getCategoryColor(item.category) }">
            {{ item.icon }}
          </div>
          <div class="content-card-info">
            <div class="content-card-name">{{ item.title }}</div>
            <div class="content-card-tag" :style="{ color: getCategoryColor(item.category), background: getCategoryBgColor(item.category) }">
              {{ item.category }}
            </div>
            <div class="content-card-desc">{{ item.description }}</div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredContent.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p class="empty-text">该分类暂无内容</p>
      </div>
    </div>

    <!-- 内容播放视图 -->
    <div v-else class="content-player-view">
      <!-- 控制栏 -->
      <div class="player-controls">
        <button class="back-btn" @click="goBack">
          <span class="back-arrow">←</span>
          <span>返回列表</span>
        </button>
        <div class="player-info">
          <span class="player-icon">{{ selectedContent.icon }}</span>
          <span class="player-name">{{ selectedContent.title }}</span>
        </div>
      </div>

      <!-- 嵌入区域 -->
      <div class="player-frame">
        <div class="player-placeholder" v-if="isPlaceholder">
          <div class="placeholder-icon">{{ selectedContent.icon }}</div>
          <h3 class="placeholder-title">{{ selectedContent.title }}</h3>
          <p class="placeholder-desc">{{ selectedContent.description }}</p>
          <div class="placeholder-note">
            <span class="note-icon">🔧</span>
            <span>演示模式：接入真实内容提供商后，此处将显示实际内容</span>
          </div>
          <div class="placeholder-provider" v-if="selectedContent.provider">
            <span>内容来源：{{ selectedContent.provider }}</span>
          </div>
        </div>
        <iframe
          v-else
          :src="selectedContent.url"
          class="player-iframe"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'

const router = useRouter()
const store = useAppStore()

// ===== 进入页面时自动开始娱乐计时 =====
onMounted(() => {
  if (!store.entertainmentPlaying && store.todayRemainingMinutes > 0) {
    store.startEntertainmentTimer()
  }
})

// ===== 娱乐计时器显示 =====
const totalSeconds = computed(() => store.todayRemainingMinutes * 60)
const remainingSeconds = computed(() => Math.max(0, totalSeconds.value - store.entertainmentElapsedSeconds))
const timerDisplay = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60)
  const secs = remainingSeconds.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})
const timerProgress = computed(() => {
  if (totalSeconds.value === 0) return 0
  return Math.min(1, store.entertainmentElapsedSeconds / totalSeconds.value)
})
const timerDashArray = computed(() => {
  const circumference = 2 * Math.PI * 17
  return `${circumference * (1 - timerProgress.value)} ${circumference}`
})

// ===== 结束娱乐确认弹窗 =====
const endDialog = ref({
  show: false,
  message: '',
  earlyQuit: false
})

function showEndConfirm() {
  const usedMinutes = Math.round(store.entertainmentElapsedSeconds / 60)
  const overtime = usedMinutes >= store.todayRemainingMinutes
  const canEarly = usedMinutes > 1 && !overtime
  endDialog.value = {
    show: true,
    message: canEarly
      ? `已使用${usedMinutes}分钟，提前结束可获得对赌奖励哦！`
      : `已使用${usedMinutes}分钟，确定结束本次娱乐吗？`,
    earlyQuit: canEarly
  }
}

function confirmEnd() {
  endDialog.value.show = false
  const usedMinutes = Math.round(store.entertainmentElapsedSeconds / 60)
  store.addTabletSession(usedMinutes, endDialog.value.earlyQuit)
  store.stopEntertainmentTimer()
  router.push('/entertainment')
}

// ===== 内容数据类型 =====
interface ContentItem {
  id: string
  title: string
  icon: string
  category: string
  description: string
  // URL field - for demo use placeholder, for production replace with real content provider URL
  url: string
  provider?: string  // content provider name for future integration
}

interface Category {
  id: string
  name: string
  icon: string
}

// ===== 分类定义 =====
const categories: Category[] = [
  { id: '小游戏', name: '小游戏', icon: '🎮' },
  { id: '视频', name: '视频', icon: '📺' },
  { id: '科普', name: '科普', icon: '🔬' },
  { id: '编程', name: '编程', icon: '💻' },
]

// ===== Mock 内容数据 =====
// 当接入真实内容提供商 API 时，只需替换此数组即可
const contentItems: ContentItem[] = [
  // 小游戏
  {
    id: 'game-1',
    title: '记忆翻牌',
    icon: '🃏',
    category: '小游戏',
    description: '锻炼记忆力的小游戏',
    url: 'about:blank',
    provider: '待接入'
  },
  {
    id: 'game-2',
    title: '数学速算',
    icon: '🧮',
    category: '小游戏',
    description: '趣味数学挑战赛',
    url: 'about:blank',
    provider: '待接入'
  },
  {
    id: 'game-3',
    title: '成语接龙',
    icon: '📝',
    category: '小游戏',
    description: '中华成语趣味闯关',
    url: 'about:blank',
    provider: '待接入'
  },
  // 视频
  {
    id: 'video-1',
    title: '趣味科学实验',
    icon: '🧪',
    category: '视频',
    description: '在家也能做的科学小实验',
    url: 'about:blank',
    provider: '待接入'
  },
  {
    id: 'video-2',
    title: '历史故事汇',
    icon: '📜',
    category: '视频',
    description: '用动画讲述历史故事',
    url: 'about:blank',
    provider: '待接入'
  },
  {
    id: 'video-3',
    title: '自然探秘',
    icon: '🌿',
    category: '视频',
    description: '探索大自然的奇妙世界',
    url: 'about:blank',
    provider: '待接入'
  },
  // 科普
  {
    id: 'science-1',
    title: '宇宙探秘',
    icon: '🚀',
    category: '科普',
    description: '带你遨游星辰大海',
    url: 'about:blank',
    provider: '待接入'
  },
  {
    id: 'science-2',
    title: '动物百科',
    icon: '🦁',
    category: '科普',
    description: '认识奇妙的动物世界',
    url: 'about:blank',
    provider: '待接入'
  },
  // 编程
  {
    id: 'code-1',
    title: 'Scratch 编程',
    icon: '🧩',
    category: '编程',
    description: '拖拽式趣味编程入门',
    url: 'about:blank',
    provider: '待接入'
  },
  {
    id: 'code-2',
    title: 'Python 小课堂',
    icon: '🐍',
    category: '编程',
    description: '零基础学 Python 编程',
    url: 'about:blank',
    provider: '待接入'
  },
]

// ===== 状态 =====
const activeCategory = ref('小游戏')
const selectedContent = ref<ContentItem | null>(null)

// ===== 计算属性 =====
const filteredContent = computed(() => {
  return contentItems.filter(item => item.category === activeCategory.value)
})

const isPlaceholder = computed(() => {
  return selectedContent.value?.url === 'about:blank' || !selectedContent.value?.url
})

// ===== 方法 =====
function selectContent(item: ContentItem) {
  selectedContent.value = item
}

function goBack() {
  selectedContent.value = null
}

// ===== 分类颜色辅助 =====
const categoryColorMap: Record<string, string> = {
  '小游戏': '#FF7043',
  '视频': '#42A5F5',
  '科普': '#7CB342',
  '编程': '#AB47BC',
}

function getCategoryColor(category: string): string {
  return categoryColorMap[category] || 'var(--primary)'
}

function getCategoryBgColor(category: string): string {
  const color = getCategoryColor(category)
  return `${color}18`
}
</script>

<style scoped>
.entertainment-content-page {
  padding-top: 8px;
}

/* ===== 娱乐计时器浮窗 ===== */
.timer-float {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px 8px 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: var(--radius-full);
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.2);
  border: 1.5px solid rgba(255, 107, 107, 0.2);
  animation: timerSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes timerSlideIn {
  from { opacity: 0; transform: translateY(-20px) scale(0.8); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.timer-ring-mini {
  width: 40px;
  height: 40px;
  position: relative;
  flex-shrink: 0;
}

.timer-ring-mini svg {
  width: 100%;
  height: 100%;
}

.timer-text-mini {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 800;
  color: var(--ink);
}

.timer-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--accent);
  white-space: nowrap;
}

/* ===== 结束娱乐确认弹窗 ===== */
.end-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.end-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 32px 28px 24px;
  max-width: 340px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-lg);
  animation: endPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes endPop {
  from { opacity: 0; transform: scale(0.85) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.end-icon {
  font-size: 2.8rem;
  margin-bottom: 12px;
}

.end-card h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 8px;
}

.end-card p {
  font-size: 0.9rem;
  color: var(--ink-secondary);
  line-height: 1.5;
  margin-bottom: 24px;
}

.end-actions {
  display: flex;
  gap: 12px;
}

.end-actions .btn {
  flex: 1;
  padding: 12px 16px;
  font-size: 0.9rem;
}

.end-fade-enter-active { animation: endFadeIn 0.25s ease; }
.end-fade-leave-active { animation: endFadeOut 0.15s ease; }
@keyframes endFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes endFadeOut { from { opacity: 1; } to { opacity: 0; } }

/* ===== 页面头部 ===== */
.content-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.content-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--ink);
}

/* ===== 返回按钮 ===== */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 2px solid var(--rule);
  border-radius: var(--radius-full);
  background: var(--bg-card);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ink-secondary);
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
}

.back-btn:hover {
  border-color: var(--primary-light);
  background: var(--primary-soft);
  color: var(--primary-dark);
}

.back-btn:active {
  transform: scale(0.95);
}

.back-arrow {
  font-size: 1.1rem;
  font-weight: 900;
}

/* ===== 分类标签 ===== */
.category-tabs {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 20px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 2px solid var(--rule);
  border-radius: var(--radius-full);
  background: var(--bg-card);
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
  font-family: inherit;
}

.category-tab:hover {
  border-color: var(--primary-light);
  color: var(--primary-dark);
  transform: translateY(-1px);
}

.category-tab:active {
  transform: scale(0.95);
}

.category-tab.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(124, 179, 66, 0.35);
}

.cat-icon {
  font-size: 1.1rem;
}

/* ===== 内容网格 ===== */
.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

/* ===== 内容卡片 ===== */
.content-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 18px 14px;
  border: 1.5px solid var(--rule-light);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: var(--shadow-card);
  text-align: center;
}

.content-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}

.content-card:active {
  transform: scale(0.97);
}

.content-card-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto 12px;
  transition: transform 0.3s;
}

.content-card:hover .content-card-icon {
  transform: scale(1.1);
}

.content-card-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.content-card-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--ink);
}

.content-card-tag {
  display: inline-block;
  align-self: center;
  padding: 3px 12px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 700;
}

.content-card-desc {
  font-size: 0.75rem;
  color: var(--muted);
  line-height: 1.4;
}

/* ===== 空状态 ===== */
.empty-state {
  text-align: center;
  padding: 48px 20px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  opacity: 0.6;
}

.empty-text {
  font-size: 0.95rem;
  color: var(--muted);
  font-weight: 600;
}

/* ===== 播放器视图 ===== */
.content-player-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.player-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.player-name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 播放器框架 ===== */
.player-frame {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg-card);
  border: 2px solid var(--rule-light);
  box-shadow: var(--shadow-md);
}

.player-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* ===== 占位符 ===== */
.player-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: linear-gradient(135deg, var(--bg-warm), var(--bg));
  text-align: center;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  animation: placeholderFloat 3s ease-in-out infinite;
}

@keyframes placeholderFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.placeholder-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 8px;
}

.placeholder-desc {
  font-size: 0.9rem;
  color: var(--muted);
  margin-bottom: 20px;
  line-height: 1.5;
}

.placeholder-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: var(--radius-sm);
  border: 1px dashed var(--rule);
  font-size: 0.8rem;
  color: var(--ink-secondary);
  font-weight: 600;
  max-width: 320px;
}

.note-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.placeholder-provider {
  margin-top: 12px;
  font-size: 0.75rem;
  color: var(--muted-light);
  font-weight: 600;
}
</style>
