<template>
  <nav class="bottom-nav">
    <router-link 
      v-for="item in navItems" 
      :key="item.path"
      :to="item.path" 
      class="nav-item" 
      :class="{ active: currentRoute === item.path }"
    >
      <div class="nav-icon-wrapper">
        <img :src="item.icon" class="nav-icon" :alt="item.label" />
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </div>
      <span class="nav-label">{{ item.label }}</span>
      <div class="nav-indicator"></div>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentRoute = computed(() => route.path)

const navItems = [
  { path: '/home', icon: '/icon-home.jpg', label: '首页' },
  { path: '/focus', icon: '/icon-focus.jpg', label: '专注' },
  { path: '/entertainment', icon: '/icon-entertainment.jpg', label: '娱乐' },
  { path: '/rewards', icon: '/icon-rewards.jpg', label: '奖励' },
  { path: '/parent', icon: '/icon-parent.jpg', label: '看板' },
]
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -4px 24px rgba(124, 179, 66, 0.1);
  z-index: 999;
  padding-bottom: env(safe-area-inset-bottom, 0);
  border-top: 1px solid rgba(124, 179, 66, 0.08);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: var(--muted-light);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  padding: 6px 14px;
  position: relative;
  flex: 1;
}

.nav-item.active { 
  color: var(--primary); 
}
.nav-item:active { transform: scale(0.92); }

.nav-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 36px;
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nav-item.active .nav-icon-wrapper {
  background: linear-gradient(135deg, var(--primary-soft), rgba(124, 179, 66, 0.2));
}

.nav-icon { 
  width: 26px;
  height: 26px;
  object-fit: contain;
  border-radius: 6px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.nav-item.active .nav-icon {
  transform: scale(1.15) translateY(-1px);
}

.nav-label { 
  font-size: 0.7rem; 
  font-weight: 700;
  transition: all 0.3s;
}

.nav-indicator {
  position: absolute;
  bottom: 4px;
  width: 20px;
  height: 3px;
  border-radius: 2px;
  background: var(--primary);
  opacity: 0;
  transform: scaleX(0);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.nav-item.active .nav-indicator {
  opacity: 1;
  transform: scaleX(1);
}

.nav-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: linear-gradient(135deg, var(--accent), #FF7043);
  color: white;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 8px;
  min-width: 16px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(255, 138, 101, 0.4);
}
</style>
