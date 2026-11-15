import { onMounted, onUnmounted } from 'vue'

/** Keep the screen on while the component is mounted; re-acquire after the tab comes back. */
export function useWakeLock() {
  let lock: WakeLockSentinel | undefined
  const request = async () => {
    try {
      lock = await navigator.wakeLock?.request('screen')
    } catch {
      /* unsupported, denied, or battery saver: the game still plays */
    }
  }
  const onVisible = () => { if (document.visibilityState === 'visible') request() }

  onMounted(() => {
    request()
    document.addEventListener('visibilitychange', onVisible)
  })
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisible)
    lock?.release()
  })
}
