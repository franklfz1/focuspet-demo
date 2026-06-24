<template>
  <div class="pet-float" :class="{ 'pet-hidden': isHidden }" @click="toggleChat">
    <!-- 小怪兽容器 -->
    <div class="pet-wrapper" :class="`state-${currentState}`">
      <!-- 光晕 -->
      <div class="pet-glow"></div>
      <!-- 阴影 -->
      <div class="pet-shadow"></div>
      
      <!-- 小怪兽主体 - 使用GIF动图 -->
      <div class="pet-character">
        <img :src="currentGif" class="pet-gif" :alt="currentState" />
      </div>
      
      <!-- 等级徽章 -->
      <div class="pet-level-badge">
        <img src="/icon-rewards.jpg" class="level-icon" alt="star" />
        <span class="level-text">Lv.{{ petLevel }}</span>
      </div>
      
      <!-- 浮动装饰 -->
      <div class="pet-sparkle sparkle-1">
        <img src="/icon-rewards.jpg" class="sparkle-img" alt="sparkle" />
      </div>
      <div class="pet-sparkle sparkle-2">
        <img src="/icon-rewards.jpg" class="sparkle-img" alt="sparkle" />
      </div>
      
      <!-- 情绪粒子 -->
      <div class="emotion-particles" v-if="showParticles">
        <div v-for="n in 5" :key="n" class="particle" :class="`p-${n}`"></div>
      </div>
    </div>
    
    <!-- 对话气泡 -->
    <transition name="bubble">
      <div v-if="showChat" class="chat-bubble" :class="bubbleType">
        <div class="bubble-content">
          <div class="bubble-avatar">
            <img :src="bubbleAvatarGif" class="bubble-gif" alt="小怪兽" />
          </div>
          <div class="bubble-text">
            <p>{{ currentMessage }}</p>
            <span class="bubble-time">刚刚</span>
          </div>
        </div>
        <div class="bubble-tail"></div>
      </div>
    </transition>
    
    <!-- 主动说话提示 -->
    <transition name="hint">
      <div v-if="showHint" class="pet-hint" @click.stop="say('greeting')">
        <div class="hint-dot"></div>
        <div class="hint-dot"></div>
        <div class="hint-dot"></div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const showChat = ref(false)
const showHint = ref(false)
const isHidden = ref(false)
const currentState = ref<'idle' | 'blink' | 'lookLeft' | 'lookRight' | 'happy' | 'jump' | 'cheer'>('idle')
const currentMessage = ref('')
const showParticles = ref(false)
const bubbleType = ref('normal')

// 根据当前领养的怪兽类型获取对应 webp 动图
const monsterGifs = computed(() => store.currentMonster.gifs)

// 状态到 gif 字段的映射
const stateToGifKey: Record<string, 'idle' | 'happy' | 'thinking' | 'blink' | 'cheer'> = {
  idle: 'idle',
  blink: 'blink',
  lookLeft: 'thinking',
  lookRight: 'thinking',
  thinking: 'thinking',
  happy: 'happy',
  jump: 'happy',
  cheer: 'cheer'
}

const currentGif = computed(() => {
  const key = stateToGifKey[currentState.value] || 'idle'
  return monsterGifs.value[key] || monsterGifs.value.idle
})

// 气泡头像也使用当前怪兽的 happy 图
const bubbleAvatarGif = computed(() => monsterGifs.value.happy || monsterGifs.value.idle)

const petLevel = computed(() => store.petLevel)

const messages = {
  greeting: [
    '今天也要加油哦！',
    '准备好开始今天的作业了吗？',
    '我陪你一起学习吧！',
    '新的一天，新的挑战！'
  ],
  focus: [
    '专注时间开始啦！冲冲冲！',
    '我会一直陪着你的！',
    '认真写作业的你最帅了！',
    '加油加油！你可以的！'
  ],
  earlyFinish: [
    '哇！提前完成了！太厉害了！',
    '效率超高！奖励金币到手！',
    '你真是自律小达人！'
  ],
  overtime: [
    '没关系，下次我们可以预估得更准确哦～',
    '超时了也没关系，重要的是完成了！',
    '下次试试把时间估长一点？'
  ],
  encourage: [
    '坚持住！马上就好啦！',
    '你做得很棒，继续加油！',
    '我在这里看着你呢！'
  ],
  tabletEarly: [
    '太棒了！你主动停止了平板使用！',
    '自控力满分！下次多给你10分钟！',
    '你真的越来越厉害了！'
  ],
  tabletOvertime: [
    '时间到了哦，下次要更注意时间管理～',
    '没关系，我们重新开始！',
    '下次一定能更好地控制时间！'
  ],
  idle: [
    '点我一下，我有话想对你说～',
    '我在这里等你哦！',
    '要不要开始今天的任务？',
    '我好想和你聊天呀！'
  ]
}

function getRandomMessage(type: keyof typeof messages): string {
  const list = messages[type]
  return list[Math.floor(Math.random() * list.length)]
}

function say(type: keyof typeof messages, customState?: typeof currentState.value) {
  currentMessage.value = getRandomMessage(type)
  showChat.value = true
  showHint.value = false
  
  // 根据消息类型设置表情和动画
  if (type === 'earlyFinish' || type === 'tabletEarly') {
    currentState.value = 'cheer'
    showParticles.value = true
    bubbleType.value = 'success'
  } else if (type === 'overtime' || type === 'tabletOvertime') {
    currentState.value = 'lookLeft'
    bubbleType.value = 'warning'
  } else if (type === 'encourage') {
    currentState.value = 'happy'
    bubbleType.value = 'encourage'
  } else if (type === 'idle') {
    currentState.value = 'blink'
    bubbleType.value = 'normal'
  } else {
    currentState.value = 'happy'
    bubbleType.value = 'normal'
  }
  
  // 动画结束后恢复idle
  setTimeout(() => {
    showParticles.value = false
    currentState.value = 'idle'
  }, 4000)
  
  setTimeout(() => { showChat.value = false }, 5000)
}

function toggleChat() {
  if (showChat.value) {
    showChat.value = false
    currentState.value = 'idle'
  } else {
    say('greeting')
  }
}

// 主动说话定时器
let autoSpeakTimer: number
let hintTimer: number

function startAutoSpeak() {
  const showHintLoop = () => {
    if (!showChat.value && !showHint.value) {
      showHint.value = true
      hintTimer = window.setTimeout(() => {
        if (showHint.value) {
          showHint.value = false
          say('idle')
        }
      }, 5000)
    }
    autoSpeakTimer = window.setTimeout(showHintLoop, 20000 + Math.random() * 20000)
  }
  
  autoSpeakTimer = window.setTimeout(showHintLoop, 15000)
}

onMounted(() => {
  window.setTimeout(() => say('greeting'), 2000)
  startAutoSpeak()
})

onUnmounted(() => {
  clearTimeout(autoSpeakTimer)
  clearTimeout(hintTimer)
})

defineExpose({ say, isHidden })
</script>

<style scoped>
.pet-float {
  position: fixed;
  bottom: 90px;
  right: 16px;
  z-index: 1000;
  cursor: pointer;
  user-select: none;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s;
}
.pet-float:hover { transform: scale(1.08); }
.pet-float.pet-hidden { 
  transform: translateX(120px) scale(0.8); 
  opacity: 0; 
  pointer-events: none; 
}

.pet-wrapper {
  position: relative;
  width: 90px;
  height: 90px;
}

/* ===== 光晕效果 ===== */
.pet-glow {
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 179, 66, 0.3) 0%, transparent 70%);
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.9; }
}

/* ===== 阴影 ===== */
.pet-shadow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 10px;
  background: radial-gradient(ellipse, rgba(0,0,0,0.12) 0%, transparent 70%);
  border-radius: 50%;
  animation: shadowPulse 2.5s ease-in-out infinite;
}

@keyframes shadowPulse {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
  50% { transform: translateX(-50%) scale(0.8); opacity: 0.6; }
}

/* ===== 小怪兽Sprite动画系统 ===== */
.pet-character {
  position: relative;
  width: 90px;
  height: 90px;
  z-index: 2;
}

.pet-gif {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(124, 179, 66, 0.3));
  animation: petFloat 3s ease-in-out infinite;
}

/* 浮动动画 */
@keyframes petFloat {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  25% { transform: translateY(-6px) rotate(1deg); }
  50% { transform: translateY(-10px) rotate(-1deg); }
  75% { transform: translateY(-4px) rotate(1deg); }
}

/* ===== 等级徽章 ===== */
.pet-level-badge {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #FFD54F, #FFB74D);
  color: #5D4037;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 2px 10px;
  border-radius: 12px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(255, 183, 77, 0.4);
  display: flex;
  align-items: center;
  gap: 3px;
  border: 2px solid white;
  z-index: 4;
}
.level-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  object-fit: cover;
}

/* ===== 闪光装饰 ===== */
.pet-sparkle {
  position: absolute;
  opacity: 0;
  animation: sparkleFloat 3s ease-in-out infinite;
  z-index: 1;
}
.sparkle-img {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
}
.sparkle-1 {
  top: -5px; right: -8px;
  animation-delay: 0s;
}
.sparkle-2 {
  bottom: 15px; left: -10px;
  animation-delay: 1.5s;
}

@keyframes sparkleFloat {
  0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
  50% { opacity: 0.7; transform: scale(1) rotate(180deg); }
}

/* ===== 情绪粒子 ===== */
.emotion-particles {
  position: absolute;
  inset: -20px;
  pointer-events: none;
  z-index: 5;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0;
}

.particle.p-1 {
  background: #FFD54F;
  top: 0; left: 50%;
  animation: particleUp 1s ease-out forwards;
}
.particle.p-2 {
  background: #FF8A65;
  top: 20%; right: 0;
  animation: particleUp 1s ease-out 0.1s forwards;
}
.particle.p-3 {
  background: #AED581;
  bottom: 20%; left: 0;
  animation: particleUp 1s ease-out 0.2s forwards;
}
.particle.p-4 {
  background: #FFB74D;
  top: 50%; right: 10%;
  animation: particleUp 1s ease-out 0.15s forwards;
}
.particle.p-5 {
  background: #81D4FA;
  top: 30%; left: 10%;
  animation: particleUp 1s ease-out 0.25s forwards;
}

@keyframes particleUp {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-40px) scale(0.3); }
}

/* ===== 对话气泡 ===== */
.chat-bubble {
  position: absolute;
  bottom: 100px;
  right: 0;
  background: white;
  border-radius: 20px 20px 4px 20px;
  box-shadow: 0 4px 24px rgba(124, 179, 66, 0.15);
  max-width: 260px;
  min-width: 200px;
  border: 1px solid rgba(124, 179, 66, 0.15);
  overflow: hidden;
  z-index: 100;
}

.chat-bubble.success {
  border-color: rgba(102, 187, 106, 0.3);
  box-shadow: 0 4px 24px rgba(102, 187, 106, 0.2);
}

.chat-bubble.warning {
  border-color: rgba(255, 138, 101, 0.3);
  box-shadow: 0 4px 24px rgba(255, 138, 101, 0.2);
}

.chat-bubble.encourage {
  border-color: rgba(255, 183, 77, 0.3);
  box-shadow: 0 4px 24px rgba(255, 183, 77, 0.2);
}

.bubble-content {
  display: flex;
  gap: 10px;
  padding: 14px 16px;
}

.bubble-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
}

.bubble-gif {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  border: 2px solid var(--primary-light);
}

.bubble-text {
  flex: 1;
  min-width: 0;
}

.bubble-text p {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--ink);
  font-weight: 600;
}

.bubble-time {
  font-size: 0.7rem;
  color: var(--muted);
  margin-top: 4px;
  display: block;
}

.bubble-tail {
  position: absolute;
  bottom: -8px;
  right: 20px;
  width: 16px;
  height: 16px;
  background: white;
  transform: rotate(45deg);
  border-right: 1px solid rgba(124, 179, 66, 0.15);
  border-bottom: 1px solid rgba(124, 179, 66, 0.15);
}

/* 气泡动画 */
.bubble-enter-active { animation: bubbleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.bubble-leave-active { animation: bubbleOut 0.25s ease; }
@keyframes bubbleIn {
  from { opacity: 0; transform: translateY(15px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes bubbleOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(10px) scale(0.9); }
}

/* ===== 主动说话提示 ===== */
.pet-hint {
  position: absolute;
  top: -8px;
  right: -4px;
  background: linear-gradient(135deg, var(--accent), #FF7043);
  padding: 6px 8px;
  border-radius: 12px;
  display: flex;
  gap: 3px;
  align-items: center;
  z-index: 10;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 138, 101, 0.4);
  animation: hintPulse 1.5s ease-in-out infinite;
}

@keyframes hintPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.hint-dot {
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  animation: hintDot 1s ease-in-out infinite;
}
.hint-dot:nth-child(2) { animation-delay: 0.2s; }
.hint-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes hintDot {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.hint-enter-active { animation: hintIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.hint-leave-active { animation: hintOut 0.2s ease; }
@keyframes hintIn {
  from { opacity: 0; transform: scale(0.5) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes hintOut {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.5); }
}
</style>
