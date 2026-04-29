import { RunwayPicker } from '~/components/runway/RunwayPicker'
import { RunwayBrief } from '~/components/runway/RunwayBrief'

export const RunwaySection = () => (
  <div className="space-y-4">
    <RunwayPicker />
    <RunwayBrief />
  </div>
)
