import { MdRadio } from 'react-icons/md'
import { useAppStore } from '~/store/useAppStore'

const frequencies = [
  { name: 'ATIS', freq: '125.9' },
  { name: 'Fisk Approach', freq: '120.7' },
  { name: 'Ground', freq: '121.9' },
  { name: 'Tower', freq: '118.5' },
]

export const FrequencyHeader = () => {
  const { mode } = useAppStore()

  return (
    <div className={`bg-base-100 shadow-sm border-b border-base-300 ${mode === 'in-flight' ? 'sticky top-0 z-50' : ''}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <MdRadio className={`${mode === 'in-flight' ? 'h-6 w-6' : 'h-5 w-5'} text-primary`} />
            <span className={`font-semibold ${mode === 'in-flight' ? 'text-base' : 'text-sm'} hidden sm:inline`}>Key Frequencies:</span>
          </div>
          <div className={`grid grid-cols-2 sm:flex gap-3 sm:gap-6 ${mode === 'in-flight' ? 'text-base' : 'text-sm'}`}>
            {frequencies.map((freq) => (
              <div key={freq.name} className={`flex items-center gap-1 ${mode === 'in-flight' ? 'px-3 py-1 bg-base-200 rounded-lg' : ''}`}>
                <span className="text-base-content/70">{freq.name}:</span>
                <span className={`font-mono font-bold text-primary ${mode === 'in-flight' ? 'text-lg' : ''}`}>{freq.freq}</span>
              </div>
            ))}
          </div>
          {mode === 'in-flight' && (
            <div className="badge badge-error badge-lg animate-pulse">
              IN-FLIGHT
            </div>
          )}
        </div>
      </div>
    </div>
  )
}