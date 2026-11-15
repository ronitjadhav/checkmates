import { onMounted, onUnmounted, ref } from 'vue'

type Doc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void }
type Root = HTMLElement & { webkitRequestFullscreen?: () => void }

/** Fullscreen toggle that also covers older iPad Safari (webkit-prefixed API). */
export function useFullscreen() {
  const doc = document as Doc
  const root = document.documentElement as Root
  const request = root.requestFullscreen ?? root.webkitRequestFullscreen
  const installed = matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches
  const supported = !!request && !installed
  const active = ref(false)

  const update = () => { active.value = !!(doc.fullscreenElement ?? doc.webkitFullscreenElement) }
  // the request can be refused (no user gesture, browser policy); there is nothing to do about it
  const toggle = () => Promise.resolve(active.value ? (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc) : request?.call(root)).catch(() => {})

  const events = ['fullscreenchange', 'webkitfullscreenchange']
  onMounted(() => {
    update() // the page may still be fullscreen from the previous game
    events.forEach(ev => document.addEventListener(ev, update))
  })
  onUnmounted(() => events.forEach(ev => document.removeEventListener(ev, update)))

  return { supported, active, toggle }
}
