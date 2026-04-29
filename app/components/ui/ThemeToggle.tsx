import { MdLightMode, MdDarkMode } from 'react-icons/md'
import { useAppStore } from '~/store/useAppStore'

export const ThemeToggle = () => {
  const theme = useAppStore((s) => s.theme)
  const toggle = useAppStore((s) => s.toggleTheme)
  const isCockpit = theme === 'cockpit'
  return (
    <button
      type="button"
      onClick={toggle}
      className="btn btn-ghost btn-circle btn-sm"
      aria-label={`Switch to ${isCockpit ? 'chart (day)' : 'cockpit (night)'} theme`}
      title={isCockpit ? 'Switch to chart (day)' : 'Switch to cockpit (night)'}
    >
      {isCockpit ? (
        <MdLightMode className="h-5 w-5" />
      ) : (
        <MdDarkMode className="h-5 w-5" />
      )}
    </button>
  )
}
