import { useAppStore } from '~/store/useAppStore'
import { MdLightMode, MdDarkMode } from 'react-icons/md'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useAppStore()

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <MdDarkMode className="h-5 w-5" />
      ) : (
        <MdLightMode className="h-5 w-5" />
      )}
    </button>
  )
}