<template>
  <div class="page-container adopt-page">
    <!-- 页面标题 -->
    <div class="adopt-header">
      <h1 class="page-title">🐾 领养你的小怪兽</h1>
      <p class="page-subtitle">选择一个陪伴你学习的小伙伴吧！</p>
    </div>

    <!-- 怪兽选择网格 -->
    <div class="monster-grid">
      <div
        v-for="monster in monsters"
        :key="monster.id"
        class="monster-card"
        :class="{ selected: selectedMonster?.id === monster.id }"
        :style="selectedMonster?.id === monster.id ? { borderColor: monster.color, boxShadow: `0 4px 20px ${monster.color}40` } : {}"
        @click="selectedMonster = monster"
      >
        <div class="monster-check" v-if="selectedMonster?.id === monster.id" :style="{ background: monster.color }">
          ✓
        </div>
        <div class="monster-emoji" :style="{ background: `${monster.color}18` }">
          <img :src="monster.gifs.happy" class="monster-preview-img" :alt="monster.name" />
        </div>
        <div class="monster-name">{{ monster.name }}</div>
        <div class="monster-personality" :style="{ color: monster.color, background: `${monster.color}14` }">
          {{ monster.personality }}
        </div>
        <div class="monster-desc">{{ monster.desc }}</div>
      </div>
    </div>

    <!-- 命名区域 -->
    <div class="card naming-card" v-if="selectedMonster">
      <h3 class="card-title">
        <img :src="selectedMonster.gifs.happy" class="naming-monster-img" :alt="selectedMonster.name" />
        <span>给你的小怪兽起个名字</span>
      </h3>
      <div class="input-group">
        <input
          v-model="customName"
          type="text"
          :placeholder="`例如：${selectedMonster.name}`"
          maxlength="12"
          class="name-input"
        />
        <div class="name-counter">{{ customName.length }}/12</div>
      </div>
      <button
        class="btn btn-primary btn-block adopt-btn"
        :disabled="!customName.trim()"
        @click="adoptMonster"
      >
        <span>🐾</span>
        <span>确认领养</span>
      </button>
    </div>

    <!-- 未选择提示 -->
    <div class="card hint-card" v-else>
      <p class="hint-text">👆 点击上方的小怪兽，选择你想领养的那一个吧！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore, MONSTER_TYPES, type MonsterType } from '../stores/app'

const router = useRouter()
const store = useAppStore()

const monsters = MONSTER_TYPES
const selectedMonster = ref<MonsterType | null>(null)
const customName = ref('')

onMounted(() => {
  // 如果当前用户已经领养过，直接跳转到首页（每个账号只领养一次）
  const currentUser = localStorage.getItem('fp_currentUser')
  if (currentUser) {
    const petType = localStorage.getItem(`fp_petType_${currentUser}`)
    if (petType) {
      router.replace('/home')
    }
  }
})

function adoptMonster() {
  if (!selectedMonster.value || !customName.value.trim()) return

  // 通过 store 保存（按用户存储）
  store.adoptMonster(selectedMonster.value.id, customName.value.trim())

  // 跳转到首页
  router.push('/home')
}
</script>

<style scoped>
.adopt-page {
  padding-top: 24px;
}

/* 头部 */
.adopt-header {
  text-align: center;
  margin-bottom: 24px;
}

.adopt-header .page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 6px;
}

.adopt-header .page-subtitle {
  font-size: 0.9rem;
  color: var(--muted);
}

/* 怪兽网格 */
.monster-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

/* 怪兽卡片 */
.monster-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 20px 16px;
  border: 2.5px solid var(--rule-light);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  text-align: center;
  box-shadow: var(--shadow-card);
}

.monster-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}

.monster-card:active {
  transform: scale(0.97);
}

.monster-card.selected {
  transform: translateY(-3px) scale(1.03);
}

/* 选中勾 */
.monster-check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  font-size: 0.75rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: checkPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes checkPop {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

/* 怪兽 emoji */
.monster-emoji {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  transition: transform 0.3s;
  overflow: hidden;
}

.monster-preview-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.monster-card:hover .monster-emoji {
  transform: scale(1.1);
}

.monster-card.selected .monster-emoji {
  transform: scale(1.15);
  animation: emojiBounce 0.6s ease-in-out infinite;
}

@keyframes emojiBounce {
  0%, 100% { transform: scale(1.15) translateY(0); }
  50% { transform: scale(1.15) translateY(-4px); }
}

/* 怪兽名字 */
.monster-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 8px;
}

/* 性格标签 */
.monster-personality {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
  margin-bottom: 10px;
}

/* 描述 */
.monster-desc {
  font-size: 0.78rem;
  color: var(--muted);
  line-height: 1.5;
}

/* 命名卡片 */
.naming-card {
  margin-bottom: 20px;
  border: 2px solid var(--primary-light);
  background: linear-gradient(135deg, var(--bg-green), var(--bg-card));
}

.naming-card::before {
  background: linear-gradient(90deg, var(--primary-light), var(--primary));
}

.naming-icon {
  font-size: 1.3rem;
}

.naming-monster-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: 50%;
}

.name-input {
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

.name-input:focus {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 4px var(--primary-soft);
}

.name-counter {
  text-align: right;
  font-size: 0.75rem;
  color: var(--muted);
  margin-top: 6px;
}

/* 确认领养按钮 */
.adopt-btn {
  margin-top: 16px;
  font-size: 1.05rem;
  padding: 16px;
}

.adopt-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 提示卡片 */
.hint-card {
  text-align: center;
  background: linear-gradient(135deg, var(--bg-warm), var(--bg-card));
  border: 2px dashed var(--rule);
}

.hint-card::before {
  background: linear-gradient(90deg, var(--warning-light), var(--warning));
}

.hint-text {
  font-size: 0.95rem;
  color: var(--muted);
  font-weight: 600;
  padding: 8px 0;
}
</style>
