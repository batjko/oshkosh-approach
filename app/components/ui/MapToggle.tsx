import { useAppStore } from '~/store/useAppStore'
import { MdMap, MdLocationOff } from 'react-icons/md'

export const MapToggle = () => {
  const { enableMap, setEnableMap } = useAppStore()

  return (
    <button
      onClick={() => setEnableMap(!enableMap)}
      className="btn btn-ghost btn-circle"
      aria-label={`${enableMap ? 'Disable' : 'Enable'} interactive map`}
      title={`${enableMap ? 'Disable' : 'Enable'} interactive map`}
    >
      {enableMap ? (
        <MdMap className="h-5 w-5" />
      ) : (
        <MdLocationOff className="h-5 w-5" />
      )}
    </button>
  )
}