// 图标路径辅助函数
// 在 GitHub Pages 子路径部署时，自动加上 base 路径前缀

const BASE = import.meta.env.BASE_URL || '/'

export function icon(name: string): string {
  return `${BASE}icon-${name}.jpg`
}

export function monster(name: string): string {
  return `${BASE}monsters/${name}`
}
