<template>
  <div class="page-container">
    <h1 class="page-title">🏆 奖励中心</h1>
    <p class="page-subtitle">你的努力都有回报！</p>

    <!-- 金币展示 -->
    <div class="card coins-card">
      <div class="coins-display">
        <span class="coins-icon">💰</span>
        <div class="coins-info">
          <span class="coins-count">{{ store.coins }}</span>
          <span class="coins-label">累计金币</span>
        </div>
      </div>
      <div class="coins-stats">
        <div class="coins-stat">
          <span class="stat-val">{{ store.totalFocusMinutes }}</span>
          <span class="stat-lbl">总专注(分)</span>
        </div>
        <div class="coins-stat">
          <span class="stat-val">{{ store.taskHistory.length }}</span>
          <span class="stat-lbl">完成任务</span>
        </div>
        <div class="coins-stat">
          <span class="stat-val">{{ store.streak }}</span>
          <span class="stat-lbl">连续天数</span>
        </div>
      </div>
    </div>

    <!-- 小怪兽等级 -->
    <div class="card pet-card">
      <div class="pet-info">
        <div class="pet-avatar">
          <img :src="store.currentMonster.gifs.happy" class="pet-avatar-img" :alt="store.petName" />
        </div>
        <div class="pet-details">
          <h3>{{ store.petName }}</h3>
          <p>等级 Lv.{{ store.petLevel }}</p>
          <div class="exp-bar">
            <div class="exp-fill" :style="{ width: expPercent + '%' }"></div>
          </div>
          <p class="exp-text">距离下一级还需 {{ nextLevelExp - currentExp }} 经验</p>
        </div>
      </div>
    </div>

    <!-- 成就列表 -->
    <div class="card">
      <h3 class="card-title">🎖️ 成就徽章</h3>
      <div class="achievement-grid">
        <div v-for="ach in store.achievements" :key="ach.id" class="achievement-item" :class="{ unlocked: ach.unlocked }">
          <span class="ach-icon">{{ ach.icon }}</span>
          <span class="ach-name">{{ ach.name }}</span>
          <span class="ach-desc">{{ ach.description }}</span>
          <span v-if="ach.unlocked" class="ach-date">{{ formatDate(ach.unlockedAt!) }}</span>
          <span v-else class="ach-locked">🔒 未解锁</span>
        </div>
      </div>
    </div>

    <!-- 任务历史 -->
    <div class="card">
      <h3 class="card-title">📋 任务历史</h3>
      <div v-if="store.taskHistory.length === 0" class="empty-state">
        <p>还没有任务记录，快去写作业吧！</p>
      </div>
      <div v-else class="history-list">
        <div v-for="task in store.taskHistory.slice(0, 20)" :key="task.id" class="history-item">
          <div class="history-left">
            <span class="history-subject">{{ getSubjectEmoji(task.subject) }} {{ task.subject }}</span>
            <span class="history-name">{{ task.name }}</span>
          </div>
          <div class="history-right">
            <span class="badge" :class="task.earlyFinish ? 'badge-success' : task.overtime ? 'badge-danger' : 'badge-warning'">
              {{ task.earlyFinish ? '提前' : task.overtime ? '超时' : '按时' }}
            </span>
            <span class="history-time">{{ task.actualMinutes }}分</span>
            <span class="history-date">{{ formatDate(task.completedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 重置按钮 -->
    <button class="btn btn-outline btn-block" style="margin-top: 8px;" @click="resetData">
      🔄 重置演示数据
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

const levelExp = [0, 50, 150, 300, 500]

const currentExp = computed(() => {
  return store.coins + store.totalFocusMinutes * 2
})

const nextLevelExp = computed(() => {
  const next = levelExp[store.petLevel] || 999
  return next
})

const expPercent = computed(() => {
  const current = levelExp[store.petLevel - 1] || 0
  const next = levelExp[store.petLevel] || 999
  return Math.min(100, ((currentExp.value - current) / (next - current)) * 100)
})

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return ''
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

function resetData() {
  if (!confirm('确定要重置所有演示数据吗？')) return
  localStorage.clear()
  window.location.reload()
}
</script>

<style scoped>
.coins-card {
  background: linear-gradient(135deg, #FFF8E1, #FFF3CD);
  border: 1px solid rgba(255,217,61,0.3);
}
.coins-display {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.coins-icon { font-size: 3rem; }
.coins-count { font-size: 2rem; font-weight: 900; color: #D4A017; display: block; }
.coins-label { font-size: 0.8rem; color: var(--muted); }
.coins-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid rgba(255,217,61,0.2);
}
.coins-stat { text-align: center; }
.stat-val { font-size: 1.3rem; font-weight: 800; display: block; color: var(--ink); }
.stat-lbl { font-size: 0.75rem; color: var(--muted); }

.pet-card {
  background: linear-gradient(135deg, #E8FAF8, #F0FFFE);
}
.pet-info {
  display: flex;
  align-items: center;
  gap: 16px;
}
.pet-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--primary-light), var(--primary));
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(124, 179, 66, 0.25);
}

.pet-avatar-img {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.pet-details { flex: 1; }
.pet-details h3 { font-size: 1.1rem; margin-bottom: 2px; }
.pet-details p { font-size: 0.8rem; color: var(--muted); margin-bottom: 6px; }

.exp-bar {
  height: 6px;
  background: var(--rule);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}
.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent2), #45B7AA);
  border-radius: 3px;
  transition: width 0.5s;
}
.exp-text { font-size: 0.7rem; color: var(--muted); }

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.achievement-item {
  padding: 14px;
  background: var(--bg);
  border-radius: 12px;
  text-align: center;
  opacity: 0.5;
  transition: all 0.3s;
}
.achievement-item.unlocked { opacity: 1; background: linear-gradient(135deg, #FFF8E1, #FFF3CD); }
.ach-icon { font-size: 2rem; display: block; margin-bottom: 4px; }
.ach-name { font-weight: 700; font-size: 0.85rem; display: block; }
.ach-desc { font-size: 0.7rem; color: var(--muted); display: block; margin: 2px 0; }
.ach-date { font-size: 0.65rem; color: var(--accent2); }
.ach-locked { font-size: 0.7rem; color: var(--muted); }

.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: var(--bg);
  border-radius: 10px;
}
.history-left { display: flex; flex-direction: column; gap: 2px; }
.history-subject { font-weight: 600; font-size: 0.85rem; }
.history-name { font-size: 0.75rem; color: var(--muted); }
.history-right { display: flex; align-items: center; gap: 6px; }
.history-time { font-size: 0.8rem; font-weight: 600; }
.history-date { font-size: 0.7rem; color: var(--muted); }

.empty-state { text-align: center; padding: 20px; color: var(--muted); }
</style>
