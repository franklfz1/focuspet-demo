import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface TaskRecord {
  id: string
  name: string
  subject: string
  estimatedMinutes: number
  actualMinutes: number
  completedAt: string
  verified: boolean
  earlyFinish: boolean
  overtime: boolean
}

export interface TabletSession {
  id: string
  baseMinutes: number
  actualMinutes: number
  earlyQuit: boolean
  overtime: boolean
  wonBonus: boolean
  date: string
}

export interface Achievement {
  id: string
  name: string
  icon: string
  description: string
  unlocked: boolean
  unlockedAt?: string
}

// ===== AI 批改记录 =====
export interface AICorrectionRecord {
  id: string
  taskId: string
  taskName: string
  subject: string
  completedAt: string
  completion: number // 完成度 0-100
  authentic: boolean // 真实性
  errorCount: number // 错题数
  errors: AIErrorItem[] // 具体错题列表
  comment: string // AI 评语
  score: number // 综合评分 0-100
  passed: boolean // 是否通过
}

export interface AIErrorItem {
  id: string
  type: 'calculation' | 'concept' | 'careless' | 'incomplete' | 'other'
  description: string
  suggestion: string
  position?: string // 题目位置/页码
}

// ===== 本地存储辅助 =====
function loadInt(key: string, fallback: number): number {
  const val = localStorage.getItem(key)
  return val ? parseInt(val) : fallback
}
function loadStr(key: string, fallback: string): string {
  return localStorage.getItem(key) || fallback
}

// ===== 小怪兽类型定义 =====
export interface MonsterGifs {
  idle: string
  happy: string
  thinking: string
  blink?: string
  cheer?: string
}

export interface MonsterType {
  id: string
  name: string
  emoji: string
  color: string
  personality: string
  desc: string
  gifs: MonsterGifs
}

export const MONSTER_TYPES: MonsterType[] = [
  {
    id: 'flora', name: '小花', emoji: '🌿', color: '#7CB342',
    personality: '温柔体贴，喜欢鼓励你', desc: '绿色小精灵，总是用温暖的目光陪伴你学习',
    gifs: {
      idle: 'monsters/green_monster_idle.webp',
      happy: 'monsters/green_monster_happy.webp',
      thinking: 'monsters/green_monster_thinking.webp',
      blink: 'monsters/green_monster_blink.webp',
      cheer: 'monsters/green_monster_cheer.webp',
    }
  },
  {
    id: 'blaze', name: '小火', emoji: '🔥', color: '#FF7043',
    personality: '热情活泼，充满活力', desc: '火焰小怪兽，会用热情点燃你的学习动力',
    gifs: {
      idle: 'monsters/orange_monster_idle.webp',
      happy: 'monsters/orange_monster_happy.webp',
      thinking: 'monsters/orange_monster_thinking.webp',
    }
  },
  {
    id: 'aqua', name: '小水', emoji: '💧', color: '#42A5F5',
    personality: '冷静沉稳，善于思考', desc: '水滴精灵，帮助你保持冷静专注',
    gifs: {
      idle: 'monsters/blue_monster_idle.webp',
      happy: 'monsters/blue_monster_happy.webp',
      thinking: 'monsters/blue_monster_thinking.webp',
      blink: 'monsters/blue_monster_blink.webp',
      cheer: 'monsters/blue_monster_cheer.webp',
    }
  },
  {
    id: 'star', name: '小星', emoji: '⭐', color: '#FFD54F',
    personality: '乐观开朗，闪闪发光', desc: '星星小怪兽，让你的每一天都充满光芒',
    gifs: {
      idle: 'monsters/pink_monster_idle.webp',
      happy: 'monsters/pink_monster_happy.webp',
      thinking: 'monsters/pink_monster_thinking.webp',
      blink: 'monsters/pink_monster_blink.webp',
      cheer: 'monsters/pink_monster_cheer.webp',
    }
  },
  {
    id: 'thunder', name: '小雷', emoji: '⚡', color: '#AB47BC',
    personality: '果断勇敢，行动力强', desc: '雷电精灵，给你雷厉风行的执行力',
    gifs: {
      idle: 'monsters/purple_monster_idle.webp',
      happy: 'monsters/purple_monster_happy.webp',
      thinking: 'monsters/purple_monster_thinking.webp',
    }
  },
  {
    id: 'snow', name: '小雪', emoji: '❄️', color: '#4FC3F7',
    personality: '纯净善良，心思细腻', desc: '冰雪小精灵，用纯净的心灵守护你',
    gifs: {
      idle: 'monsters/teal_monster_idle.webp',
      happy: 'monsters/teal_monster_happy.webp',
      thinking: 'monsters/teal_monster_thinking.webp',
    }
  },
]

export const useAppStore = defineStore('app', () => {
  // ===== 用户认证 =====
  const currentUser = ref(loadStr('fp_currentUser', ''))
  const isLoggedIn = computed(() => !!currentUser.value)

  function login(username: string) {
    currentUser.value = username
    localStorage.setItem('fp_currentUser', username)
    // 登录后加载该用户的领养信息
    loadUserPetData()
  }

  function logout() {
    currentUser.value = ''
    localStorage.removeItem('fp_currentUser')
    // 清空当前怪兽信息
    petType.value = ''
    petCustomName.value = ''
  }

  // ===== 小怪兽领养（按用户存储） =====
  const petType = ref('')
  const petCustomName = ref('')
  const isAdopted = computed(() => !!petType.value)

  // 从 localStorage 加载当前用户的领养数据
  function loadUserPetData() {
    const user = currentUser.value
    if (!user) return
    petType.value = loadStr(`fp_petType_${user}`, '')
    petCustomName.value = loadStr(`fp_petCustomName_${user}`, '')
  }

  function adoptMonster(typeId: string, customName: string) {
    // 直接从 localStorage 读取当前用户（兼容直接读取 localStorage 的场景）
    const user = currentUser.value || localStorage.getItem('fp_currentUser') || ''
    petType.value = typeId
    petCustomName.value = customName
    if (user) {
      localStorage.setItem(`fp_petType_${user}`, typeId)
      localStorage.setItem(`fp_petCustomName_${user}`, customName)
    }
  }

  // 获取当前怪兽信息
  const currentMonster = computed((): MonsterType => {
    const found = MONSTER_TYPES.find(m => m.id === petType.value)
    return found || MONSTER_TYPES[0]
  })

  // ===== 娱乐计时共享状态 =====
  // EntertainmentView 和 EntertainmentContent 共用此状态
  const entertainmentPlaying = ref(false)
  const entertainmentElapsedSeconds = ref(0)
  let entertainmentInterval: number | null = null

  function startEntertainmentTimer() {
    if (entertainmentPlaying.value) return
    if (todayRemainingMinutes.value <= 0) return
    entertainmentPlaying.value = true
    entertainmentElapsedSeconds.value = 0
    entertainmentInterval = window.setInterval(() => {
      entertainmentElapsedSeconds.value++
    }, 1000)
  }

  function stopEntertainmentTimer() {
    entertainmentPlaying.value = false
    entertainmentElapsedSeconds.value = 0
    if (entertainmentInterval) {
      clearInterval(entertainmentInterval)
      entertainmentInterval = null
    }
  }

  // 初始化时加载当前用户的领养数据
  loadUserPetData()

  // ===== 基础状态 =====
  const coins = ref(loadInt('fp_coins', 0))
  const totalFocusMinutes = ref(loadInt('fp_totalFocus', 0))
  const streak = ref(loadInt('fp_streak', 0))
  const lastActiveDate = ref(loadStr('fp_lastActive', ''))

  // ===== 任务历史 =====
  const taskHistory = ref<TaskRecord[]>(
    JSON.parse(localStorage.getItem('fp_taskHistory') || '[]')
  )

  // ===== 平板使用记录 =====
  const tabletSessions = ref<TabletSession[]>(
    JSON.parse(localStorage.getItem('fp_tabletSessions') || '[]')
  )

  // ===== AI 批改记录 =====
  const aiCorrectionRecords = ref<AICorrectionRecord[]>(
    JSON.parse(localStorage.getItem('fp_aiCorrections') || '[]')
  )

  // ===== 娱乐时间核心状态 =====
  // 家长设置：起始娱乐额度 & 封顶娱乐额度
  const parentBaseAllowance = ref(loadInt('fp_parentBaseAllowance', 30))
  const parentMaxAllowance = ref(loadInt('fp_parentMaxAllowance', 60))

  // tabletAllowance: 下一天的基础娱乐额度（对赌奖励累加到这里，但不超过封顶）
  const tabletAllowance = ref(loadInt('fp_tabletAllowance', parentBaseAllowance.value))
  // todayBaseAllowance: 当天的总娱乐额度（每天重置）
  const todayBaseAllowance = ref(loadInt('fp_todayBaseAllowance', parentBaseAllowance.value))
  // todayUsedMinutes: 当天已使用的娱乐时间（累计）
  const todayUsedMinutes = ref(loadInt('fp_todayUsedMinutes', 0))
  // todayTasksCompleted: 当天是否完成作业
  const todayTasksCompleted = ref(loadInt('fp_todayTasksCompleted', 0))

  // 初始化当天额度（日期变化时重置）
  function initDay() {
    const today = new Date().toDateString()
    const lastDate = loadStr('fp_lastDate', '')
    if (lastDate !== today) {
      // 新的一天：额度从"下一天"转正为"今天"
      todayBaseAllowance.value = tabletAllowance.value
      todayUsedMinutes.value = 0
      // 检查昨天是否有对赌失败→下一天重置为家长设定起始值
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      const lastSession = tabletSessions.value[0]
      if (lastSession && lastSession.date === yesterday && lastSession.overtime) {
        // 昨天超时，今天的基础额度重置为家长设定起始值
        todayBaseAllowance.value = parentBaseAllowance.value
      }
      // 重置任务完成标记
      todayTasksCompleted.value = 0
      localStorage.setItem('fp_todayBaseAllowance', String(todayBaseAllowance.value))
      localStorage.setItem('fp_todayUsedMinutes', '0')
      localStorage.setItem('fp_todayTasksCompleted', '0')
      localStorage.setItem('fp_lastDate', today)
    }
  }
  initDay()

  // 当天剩余娱乐时间
  const todayRemainingMinutes = computed(() =>
    Math.max(0, todayBaseAllowance.value - todayUsedMinutes.value)
  )

  // 当天是否解锁娱乐
  const canEntertainment = computed(() => todayTasksCompleted.value >= 1)

  // ===== 成就 =====
  const achievements = ref<Achievement[]>(
    JSON.parse(localStorage.getItem('fp_achievements') || 'null') || [
      { id: 'first_task', name: '初次完成', icon: '🌟', description: '完成第一个作业任务', unlocked: false },
      { id: 'streak_3', name: '三连专注', icon: '🔥', description: '连续3天完成作业', unlocked: false },
      { id: 'streak_7', name: '一周自律', icon: '💪', description: '连续7天完成作业', unlocked: false },
      { id: 'early_3', name: '效率达人', icon: '⚡', description: '提前完成3次作业', unlocked: false },
      { id: 'coins_100', name: '小富翁', icon: '💰', description: '累计获得100金币', unlocked: false },
      { id: 'bet_win_3', name: '自控高手', icon: '🏆', description: '成功对赌3次', unlocked: false },
      { id: 'tablet_early_5', name: '欲望克星', icon: '🛡️', description: '提前结束平板使用5次', unlocked: false },
    ]
  )

  // ===== 小怪兽等级 =====
  const petLevel = computed(() => {
    const total = coins.value + totalFocusMinutes.value * 2
    if (total >= 500) return 5
    if (total >= 300) return 4
    if (total >= 150) return 3
    if (total >= 50) return 2
    return 1
  })

  const petName = computed(() => {
    // 优先使用用户自定义名字
    if (petCustomName.value) return petCustomName.value
    // 其次使用当前怪兽的默认名字
    return currentMonster.value.name
  })

  // ===== 保存状态 =====
  function saveState() {
    localStorage.setItem('fp_coins', String(coins.value))
    localStorage.setItem('fp_totalFocus', String(totalFocusMinutes.value))
    localStorage.setItem('fp_streak', String(streak.value))
    localStorage.setItem('fp_lastActive', lastActiveDate.value)
    localStorage.setItem('fp_taskHistory', JSON.stringify(taskHistory.value))
    localStorage.setItem('fp_tabletSessions', JSON.stringify(tabletSessions.value))
    localStorage.setItem('fp_tabletAllowance', String(tabletAllowance.value))
    localStorage.setItem('fp_todayBaseAllowance', String(todayBaseAllowance.value))
    localStorage.setItem('fp_todayUsedMinutes', String(todayUsedMinutes.value))
    localStorage.setItem('fp_todayTasksCompleted', String(todayTasksCompleted.value))
    localStorage.setItem('fp_consecutiveBetWins', String(consecutiveBetWins.value))
    localStorage.setItem('fp_parentBaseAllowance', String(parentBaseAllowance.value))
    localStorage.setItem('fp_parentMaxAllowance', String(parentMaxAllowance.value))
    localStorage.setItem('fp_achievements', JSON.stringify(achievements.value))
    localStorage.setItem('fp_aiCorrections', JSON.stringify(aiCorrectionRecords.value))
  }

  // ===== 添加任务记录 =====
  function addTaskRecord(record: TaskRecord) {
    taskHistory.value.unshift(record)

    let earnedCoins = 10
    if (record.earlyFinish) earnedCoins += 15
    if (record.overtime) earnedCoins = Math.max(5, earnedCoins - 5)

    coins.value += earnedCoins
    totalFocusMinutes.value += record.actualMinutes

    // 解锁今天的娱乐时间
    todayTasksCompleted.value = 1

    // 更新连续天数
    const today = new Date().toDateString()
    if (lastActiveDate.value !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      streak.value = lastActiveDate.value === yesterday ? streak.value + 1 : 1
      lastActiveDate.value = today
    }

    checkAchievements()
    saveState()
    return earnedCoins
  }

  // ===== 获取科目历史 =====
  function getSubjectHistory(subject: string): TaskRecord[] {
    return taskHistory.value.filter(t => t.subject === subject)
  }

  function getSubjectAvgTime(subject: string): number {
    const records = getSubjectHistory(subject)
    if (records.length === 0) return 0
    return Math.round(records.reduce((sum, r) => sum + r.actualMinutes, 0) / records.length)
  }

  // ===== 连续对赌天数（用于递增奖励） =====
  const consecutiveBetWins = ref(loadInt('fp_consecutiveBetWins', 0))

  /**
   * 对赌奖励机制（前快后慢递进版）：
   * 前期快速给甜头建立习惯，后期逐步拉长间距提高门槛。
   *
   * 里程碑表：
   *   第   1 天 → +5 分钟（第一次就奖励！）
   *   第   2 天 → +5 分钟
   *   第   3 天 → +8 分钟
   *   第   5 天 → +8 分钟   （间隔 2 天）
   *   第   7 天 → +10 分钟  （间隔 2 天）
   *   第  10 天 → +12 分钟  （间隔 3 天）
   *   第  14 天 → +15 分钟  （间隔 4 天）
   *   第  20 天 → +15 分钟  （间隔 6 天）
   *   第  30 天+ → +15 分钟（每 10 天一次）
   *
   * 非里程碑天不给奖励（积累中），超时则清零重来。
   */
  // 里程碑表：天数 → 奖励分钟数
  const betMilestones: { days: number; reward: number }[] = [
    { days: 1,  reward: 5 },
    { days: 2,  reward: 5 },
    { days: 3,  reward: 8 },
    { days: 5,  reward: 8 },
    { days: 7,  reward: 10 },
    { days: 10, reward: 12 },
    { days: 14, reward: 15 },
    { days: 20, reward: 15 },
    { days: 30, reward: 15 },
  ]

  function getBetRewardMinutes(streak: number): number {
    if (streak <= 0) return 0
    // 精确匹配里程碑表
    const hit = betMilestones.find(m => m.days === streak)
    if (hit) return hit.reward
    // 超过30天后，每10天给一次15分钟
    if (streak > 30 && streak % 10 === 0) return 15
    return 0
  }

  // 查询下一个里程碑天数（用于UI显示倒计时）
  function getNextMilestoneDays(currentStreak: number): number {
    for (const m of betMilestones) {
      if (m.days > currentStreak) return m.days
    }
    // 超过30天后，下一个10的倍数
    if (currentStreak >= 30) {
      return Math.ceil((currentStreak + 1) / 10) * 10
    }
    return betMilestones[betMilestones.length - 1].days
  }

  // 查询下一个里程碑的奖励分钟数
  function getNextMilestoneReward(currentStreak: number): number {
    for (const m of betMilestones) {
      if (m.days > currentStreak) return m.reward
    }
    return 15
  }

  // ===== 添加平板使用记录 =====
  // usedMinutes: 本次使用的分钟数
  function addTabletSession(usedMinutes: number, earlyQuit: boolean) {
    const overtime = usedMinutes >= todayBaseAllowance.value
    const wonBonus = earlyQuit

    const record: TabletSession = {
      id: Date.now().toString(),
      baseMinutes: todayBaseAllowance.value,
      actualMinutes: usedMinutes,
      earlyQuit,
      overtime,
      wonBonus,
      date: new Date().toDateString()
    }
    tabletSessions.value.unshift(record)

    // 更新当天已用时间
    todayUsedMinutes.value += usedMinutes

    if (earlyQuit) {
      // 对赌成功：连续天数+1
      consecutiveBetWins.value += 1
      // 只有达到里程碑才发放奖励
      const bonus = getBetRewardMinutes(consecutiveBetWins.value)
      if (bonus > 0) {
        // 达到封顶后不再增加，只维持
        if (tabletAllowance.value < parentMaxAllowance.value) {
          const before = tabletAllowance.value
          tabletAllowance.value = Math.min(parentMaxAllowance.value, tabletAllowance.value + bonus)
          // 记录实际增加量（用于UI提示）
          record.wonBonus = true
        }
        // 已封顶：wonBonus保持true但不加时间
      }
      todayUsedMinutes.value = todayBaseAllowance.value // 当日剩余归零
    } else if (overtime) {
      // 超时使用：下一天重置为家长设定起始值，连续天数清零
      tabletAllowance.value = parentBaseAllowance.value
      consecutiveBetWins.value = 0
    }
    // else: 正常用完，连续天数清零
    else {
      consecutiveBetWins.value = 0
    }

    checkAchievements()
    saveState()
  }

  // ===== 解锁成就 =====
  function unlockAchievement(id: string) {
    const ach = achievements.value.find(a => a.id === id)
    if (ach && !ach.unlocked) {
      ach.unlocked = true
      ach.unlockedAt = new Date().toISOString()
      coins.value += 20
      saveState()
      return true
    }
    return false
  }

  function checkAchievements() {
    if (taskHistory.value.length >= 1) unlockAchievement('first_task')
    if (streak.value >= 3) unlockAchievement('streak_3')
    if (streak.value >= 7) unlockAchievement('streak_7')
    if (taskHistory.value.filter(t => t.earlyFinish).length >= 3) unlockAchievement('early_3')
    if (coins.value >= 100) unlockAchievement('coins_100')
    if (tabletSessions.value.filter(s => s.wonBonus).length >= 3) unlockAchievement('bet_win_3')
    if (tabletSessions.value.filter(s => s.wonBonus).length >= 5) unlockAchievement('tablet_early_5')
  }

  // ===== 添加 AI 批改记录 =====
  function addAICorrectionRecord(record: Omit<AICorrectionRecord, 'id'>) {
    const fullRecord: AICorrectionRecord = {
      ...record,
      id: Date.now().toString()
    }
    aiCorrectionRecords.value.unshift(fullRecord)
    saveState()
    return fullRecord
  }

  // 获取今日 AI 批改记录
  function getTodayAICorrections(): AICorrectionRecord[] {
    const today = new Date().toDateString()
    return aiCorrectionRecords.value.filter(r => new Date(r.completedAt).toDateString() === today)
  }

  // 获取最近 N 条 AI 批改记录
  function getRecentAICorrections(count: number = 10): AICorrectionRecord[] {
    return aiCorrectionRecords.value.slice(0, count)
  }

  // ===== AI建议 =====
  function getAISuggestions() {
    const suggestions: string[] = []
    const recentTasks = taskHistory.value.slice(0, 10)
    const overtimeTasks = recentTasks.filter(t => t.overtime)
    if (overtimeTasks.length > recentTasks.length * 0.5) {
      suggestions.push('近期作业超时率较高，建议适当降低任务难度，或拆分为更小的目标。')
    }
    const subjects: Record<string, { total: number; count: number }> = {}
    recentTasks.forEach(t => {
      if (!subjects[t.subject]) subjects[t.subject] = { total: 0, count: 0 }
      subjects[t.subject].total += t.actualMinutes
      subjects[t.subject].count++
    })
    Object.entries(subjects).forEach(([subject, data]) => {
      const avg = data.total / data.count
      const records = getSubjectHistory(subject)
      const avgEst = records.reduce((s, r) => s + r.estimatedMinutes, 0) / records.length
      if (avg > avgEst * 1.5) {
        suggestions.push(`${subject}作业经常超时，建议和孩子一起重新评估所需时间。`)
      }
    })
    const recentTablet = tabletSessions.value.slice(0, 5)
    if (recentTablet.filter(s => s.overtime).length > 2) {
      suggestions.push('平板使用超时次数较多，建议和孩子沟通设定更合理的使用时间。')
    }
    if (suggestions.length === 0) {
      suggestions.push('表现不错！继续保持当前的学习节奏。')
    }
    return suggestions
  }

  // ===== 专注趋势 =====
  function getFocusTrend(): { date: string; minutes: number }[] {
    const trend: { date: string; minutes: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000)
      const dateStr = date.toDateString()
      const dayMinutes = taskHistory.value
        .filter(t => new Date(t.completedAt).toDateString() === dateStr)
        .reduce((sum, t) => sum + t.actualMinutes, 0)
      trend.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        minutes: dayMinutes
      })
    }
    return trend
  }

  // ===== 家长设置：更新起始/封顶额度 =====
  function updateParentAllowance(base: number, max: number) {
    parentBaseAllowance.value = Math.max(5, Math.min(120, base))
    parentMaxAllowance.value = Math.max(parentBaseAllowance.value, Math.min(180, max))
    // 如果当前额度低于新的起始值，提升到起始值
    if (tabletAllowance.value < parentBaseAllowance.value) {
      tabletAllowance.value = parentBaseAllowance.value
    }
    // 如果当前额度超过新的封顶值，截断
    if (tabletAllowance.value > parentMaxAllowance.value) {
      tabletAllowance.value = parentMaxAllowance.value
    }
    // 同步当天额度
    if (todayBaseAllowance.value < parentBaseAllowance.value) {
      todayBaseAllowance.value = parentBaseAllowance.value
    }
    saveState()
  }

  // 是否已达封顶
  const isAllowanceCapped = computed(() => tabletAllowance.value >= parentMaxAllowance.value)

  return {
    // 用户认证
    currentUser, isLoggedIn, login, logout,
    // 小怪兽领养
    petType, petCustomName, isAdopted, currentMonster, adoptMonster,
    // 娱乐计时共享
    entertainmentPlaying, entertainmentElapsedSeconds, startEntertainmentTimer, stopEntertainmentTimer,
    // 基础
    coins, totalFocusMinutes, streak, lastActiveDate,
    taskHistory, tabletSessions,
    tabletAllowance, todayBaseAllowance, todayUsedMinutes, todayRemainingMinutes,
    todayTasksCompleted, canEntertainment,
    parentBaseAllowance, parentMaxAllowance, isAllowanceCapped,
    consecutiveBetWins, getBetRewardMinutes, getNextMilestoneDays, getNextMilestoneReward, betMilestones,
    achievements, petLevel, petName,
    // AI 批改
    aiCorrectionRecords, addAICorrectionRecord, getTodayAICorrections, getRecentAICorrections,
    addTaskRecord, getSubjectHistory, getSubjectAvgTime,
    addTabletSession, getAISuggestions, getFocusTrend,
    updateParentAllowance, saveState
  }
})
