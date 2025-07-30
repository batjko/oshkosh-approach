import { useAppStore } from '~/store/useAppStore'
import { MdFlightTakeoff, MdMap } from 'react-icons/md'

export const ModeToggle = () => {
  const { mode, setMode } = useAppStore()

  return (
    <div className="join">
      <button
        className={`btn join-item ${mode === 'pre-flight' ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => setMode('pre-flight')}
      >
        <MdMap className="h-4 w-4 mr-2" />
        Pre-Flight
      </button>
      <button
        className={`btn join-item ${mode === 'in-flight' ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => setMode('in-flight')}
      >
        <MdFlightTakeoff className="h-4 w-4 mr-2" />
        In-Flight
      </button>
    </div>
  )
}