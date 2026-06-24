<template>
  <div class="page-container">
    <h1 class="page-title">📸 作业验证</h1>
    <p class="page-subtitle">拍一张作业照片，让AI检查一下吧！</p>

    <!-- 拍照区域 -->
    <div class="card">
      <div class="upload-area" @click="takePhoto" v-if="!photoPreview">
        <div class="upload-icon">📷</div>
        <p class="upload-text">点击拍照上传作业</p>
        <p class="upload-hint">AI将自动识别完成度和真实性</p>
      </div>
      <div v-else class="preview-area">
        <img :src="photoPreview" alt="作业照片" class="preview-img" />
        <button class="btn btn-outline btn-block" style="margin-top: 12px;" @click="retakePhoto">重新拍照</button>
      </div>
    </div>

    <!-- AI审核中 -->
    <div v-if="isVerifying" class="card verify-card">
      <div class="verify-animation">
        <div class="scan-line"></div>
        <div class="verify-icon">🤖</div>
      </div>
      <p class="verify-text">AI正在审核中...</p>
      <div class="verify-steps">
        <div class="verify-step" :class="{ done: verifyStep >= 1 }">
          <span class="step-icon">{{ verifyStep >= 1 ? '✅' : '⏳' }}</span>
          <span>作业完成度识别</span>
        </div>
        <div class="verify-step" :class="{ done: verifyStep >= 2 }">
          <span class="step-icon">{{ verifyStep >= 2 ? '✅' : '⏳' }}</span>
          <span>真实性验证</span>
        </div>
        <div class="verify-step" :class="{ done: verifyStep >= 3 }">
          <span class="step-icon">{{ verifyStep >= 3 ? '✅' : '⏳' }}</span>
          <span>错题初步识别</span>
        </div>
        <div class="verify-step" :class="{ done: verifyStep >= 4 }">
          <span class="step-icon">{{ verifyStep >= 4 ? '✅' : '⏳' }}</span>
          <span>作业记录归档</span>
        </div>
      </div>
    </div>

    <!-- 审核结果 -->
    <div v-if="verifyResult" class="card result-card" :class="verifyResult.passed ? 'pass' : 'fail'">
      <div class="result-header">
        <span class="result-icon">{{ verifyResult.passed ? '🎉' : '😅' }}</span>
        <span class="result-title">{{ verifyResult.passed ? 'AI批改完成！' : '需要补充哦' }}</span>
      </div>

      <!-- 综合评分 -->
      <div class="ai-score-section">
        <div class="ai-score-ring">
          <svg viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#E5E7EB" stroke-width="6" />
            <circle cx="40" cy="40" r="34" fill="none" stroke="url(#scoreGrad)" stroke-width="6"
              stroke-linecap="round" :stroke-dasharray="scoreDashArray" transform="rotate(-90 40 40)" />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#7CB342" />
                <stop offset="100%" stop-color="#AED581" />
              </linearGradient>
            </defs>
          </svg>
          <span class="ai-score-num">{{ verifyResult.score }}</span>
        </div>
        <p class="ai-score-label">综合评分</p>
      </div>

      <!-- AI 评语 -->
      <div v-if="verifyResult.comment" class="ai-comment">
        <span class="comment-icon">💬</span>
        <p>{{ verifyResult.comment }}</p>
      </div>

      <div class="result-details">
        <div class="result-item">
          <span>完成度</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: verifyResult.completion + '%' }"></div>
          </div>
          <span class="progress-text">{{ verifyResult.completion }}%</span>
        </div>
        <div class="result-item">
          <span>真实性</span>
          <span class="result-value" :class="verifyResult.authentic ? 'pass' : 'fail'">
            {{ verifyResult.authentic ? '✅ 通过' : '❌ 存疑' }}
          </span>
        </div>
        <div v-if="verifyResult.errorCount > 0" class="result-item">
          <span>错题数</span>
          <span class="result-value warning">{{ verifyResult.errorCount }}处</span>
        </div>
      </div>

      <!-- 错题详情 -->
      <div v-if="verifyResult.errors && verifyResult.errors.length > 0" class="error-details">
        <h4 class="error-title">📋 错题详情</h4>
        <div v-for="(err, idx) in verifyResult.errors" :key="err.id" class="error-item">
          <div class="error-header">
            <span class="error-badge" :class="err.type">{{ errorTypeLabel(err.type) }}</span>
            <span v-if="err.position" class="error-position">{{ err.position }}</span>
          </div>
          <p class="error-desc">{{ err.description }}</p>
          <p class="error-suggestion">💡 {{ err.suggestion }}</p>
        </div>
      </div>

      <div v-if="verifyResult.passed" class="result-reward">
        <span class="reward-coin">💰 +{{ earnedCoins }} 金币</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="verifyResult" style="margin-top: 16px;">
      <button v-if="verifyResult.passed" class="btn btn-primary btn-block" @click="goEntertainment">
        🎮 领取娱乐时间
      </button>
      <button v-else class="btn btn-accent btn-block" @click="retakePhoto">
        📸 重新拍照验证
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const router = useRouter()
const pet = inject<any>('pet')

const photoPreview = ref<string | null>(null)
const isVerifying = ref(false)
const verifyStep = ref(0)
const verifyResult = ref<any>(null)
const earnedCoins = ref(0)

function takePhoto() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.capture = 'environment'
  input.onchange = (e: any) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        photoPreview.value = ev.target?.result as string
        startVerification()
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

function retakePhoto() {
  photoPreview.value = null
  verifyResult.value = null
  verifyStep.value = 0
}

function startVerification() {
  isVerifying.value = true
  verifyStep.value = 0
  
  // 模拟AI审核步骤
  const steps = [1000, 2000, 1500, 1000]
  let total = 0
  steps.forEach((delay, i) => {
    total += delay
    setTimeout(() => {
      verifyStep.value = i + 1
      if (i === 3) {
        setTimeout(() => completeVerification(), 800)
      }
    }, total)
  })
}

function completeVerification() {
  isVerifying.value = false

  // 模拟 AI 批改结果（Demo 中生成详细批改数据）
  const lastTask = store.taskHistory[0]
  if (lastTask) {
    // 更新验证状态
    lastTask.verified = true

    earnedCoins.value = lastTask.earlyFinish ? 25 : (lastTask.overtime ? 5 : 10)

    // 生成模拟错题
    const hasErrors = Math.random() > 0.3
    const errorCount = hasErrors ? Math.floor(Math.random() * 3) + 1 : 0
    const errors = hasErrors ? generateMockErrors(errorCount) : []

    const score = lastTask.earlyFinish
      ? Math.floor(85 + Math.random() * 15)
      : (lastTask.overtime ? Math.floor(60 + Math.random() * 20) : Math.floor(75 + Math.random() * 20))

    const comment = generateAIComment(score, errorCount, lastTask)

    verifyResult.value = {
      passed: true,
      completion: lastTask.earlyFinish ? 100 : (lastTask.overtime ? 75 : 90),
      authentic: true,
      errorCount,
      errors,
      comment,
      score
    }

    // 保存 AI 批改记录到 store
    store.addAICorrectionRecord({
      taskId: lastTask.id,
      taskName: lastTask.name,
      subject: lastTask.subject,
      completedAt: lastTask.completedAt,
      completion: verifyResult.value.completion,
      authentic: verifyResult.value.authentic,
      errorCount,
      errors,
      comment,
      score,
      passed: true
    })

    store.saveState()
  }
}

// 生成模拟错题
function generateMockErrors(count: number) {
  const errorTemplates = [
    { type: 'calculation' as const, desc: '第3题计算结果有误，建议重新检查乘法运算', suggestion: '先列竖式再计算，注意进位' },
    { type: 'concept' as const, desc: '第5题对分数概念理解不够清晰', suggestion: '复习课本第12页分数的定义' },
    { type: 'careless' as const, desc: '第2题漏写了单位', suggestion: '做完后养成检查单位的习惯' },
    { type: 'incomplete' as const, desc: '第7题只写了一半，缺少最后一步', suggestion: '按步骤完整写出解题过程' },
    { type: 'calculation' as const, desc: '第8题小数点位置错了', suggestion: '小数乘法先按整数算，最后数小数位' },
  ]
  const shuffled = [...errorTemplates].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((t, i) => ({
    id: `err_${Date.now()}_${i}`,
    type: t.type,
    description: t.desc,
    suggestion: t.suggestion,
    position: `P${Math.floor(Math.random() * 5) + 1}`
  }))
}

// 生成 AI 评语
function generateAIComment(score: number, errorCount: number, task: any): string {
  if (score >= 90) return '太棒了！完成质量很高，继续保持！🌟'
  if (score >= 80) return '完成得不错，注意检查那几道错题，下次可以更好！💪'
  if (score >= 70) return '基本完成了任务，建议认真复习错题，巩固知识点。📚'
  if (score >= 60) return '完成了作业，但有几处需要改进，建议重新做一遍错题。✏️'
  return '作业完成度偏低，建议和家长一起回顾今天的学习内容。🤝'
}

// 错题类型标签
function errorTypeLabel(type: string): string {
  const map: Record<string, string> = {
    calculation: '计算错误',
    concept: '概念不清',
    careless: '粗心大意',
    incomplete: '未完成',
    other: '其他'
  }
  return map[type] || '其他'
}

function goEntertainment() {
  router.push('/entertainment')
}
</script>

<style scoped>
.upload-area {
  border: 2px dashed var(--rule);
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}
.upload-area:active { background: var(--bg); }
.upload-icon { font-size: 3rem; margin-bottom: 12px; }
.upload-text { font-weight: 700; font-size: 1rem; margin-bottom: 4px; }
.upload-hint { font-size: 0.8rem; color: var(--muted); }

.preview-area { text-align: center; }
.preview-img {
  width: 100%;
  border-radius: 12px;
  max-height: 300px;
  object-fit: cover;
}

.verify-card { text-align: center; }
.verify-animation {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  position: relative;
  border-radius: 50%;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
}
.verify-icon { font-size: 2.5rem; z-index: 1; }
.scan-line {
  position: absolute;
  left: 10%;
  width: 80%;
  height: 3px;
  background: var(--accent2);
  border-radius: 2px;
  animation: scanMove 1.5s ease-in-out infinite;
}
@keyframes scanMove {
  0%, 100% { top: 15%; }
  50% { top: 80%; }
}
.verify-text { font-weight: 700; margin-bottom: 16px; }

.verify-steps { text-align: left; }
.verify-step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 0.9rem;
  color: var(--muted);
  transition: color 0.3s;
}
.verify-step.done { color: var(--ink); font-weight: 600; }
.step-icon { font-size: 1.1rem; }

.result-card {
  border: 2px solid var(--accent2);
  background: linear-gradient(135deg, #E8FAF8, #F0FFFE);
}
.result-card.fail {
  border-color: var(--accent);
  background: linear-gradient(135deg, #FFF5F5, #FFF0F0);
}
.result-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.result-icon { font-size: 2rem; }
.result-title { font-size: 1.2rem; font-weight: 800; }

.result-details { display: flex; flex-direction: column; gap: 12px; }
.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}
.result-item > span:first-child { min-width: 70px; color: var(--muted); }

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--rule);
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--accent2);
  border-radius: 4px;
  transition: width 0.5s ease;
}
.progress-text { font-weight: 700; min-width: 40px; text-align: right; }

.result-value { font-weight: 700; }
.result-value.pass { color: var(--accent2); }
.result-value.fail { color: var(--accent); }
.result-value.warning { color: var(--accent3); }

.result-reward {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(78,205,196,0.2);
  text-align: center;
}
.reward-coin {
  font-size: 1.3rem;
  font-weight: 800;
  color: #D4A017;
}

/* ===== AI 评分区域 ===== */
.ai-score-section {
  text-align: center;
  margin: 16px 0;
}

.ai-score-ring {
  width: 80px;
  height: 80px;
  margin: 0 auto 8px;
  position: relative;
}

.ai-score-ring svg {
  width: 100%;
  height: 100%;
}

.ai-score-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--primary-dark);
}

.ai-score-label {
  font-size: 0.8rem;
  color: var(--muted);
  font-weight: 600;
}

/* AI 评语 */
.ai-comment {
  background: linear-gradient(135deg, #F1F8E9, #E8F5E9);
  border-radius: 12px;
  padding: 14px 16px;
  margin: 12px 0;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.comment-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.ai-comment p {
  font-size: 0.9rem;
  color: var(--ink-secondary);
  line-height: 1.5;
  margin: 0;
}

/* 错题详情 */
.error-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--rule-light);
}

.error-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 12px;
}

.error-item {
  background: var(--bg);
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 8px;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.error-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  color: white;
}

.error-badge.calculation { background: #FF7043; }
.error-badge.concept { background: #AB47BC; }
.error-badge.careless { background: #42A5F5; }
.error-badge.incomplete { background: #FFB74D; }
.error-badge.other { background: #8D6E63; }

.error-position {
  font-size: 0.7rem;
  color: var(--muted);
}

.error-desc {
  font-size: 0.85rem;
  color: var(--ink);
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.error-suggestion {
  font-size: 0.8rem;
  color: var(--primary-dark);
  margin: 0;
  line-height: 1.4;
}
</style>
