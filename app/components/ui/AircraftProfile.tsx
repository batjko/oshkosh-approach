import { useState } from 'react'
import { useAppStore } from '~/store/useAppStore'
import { MdAirplaneTicket, MdEdit, MdSave, MdCancel } from 'react-icons/md'

export const AircraftProfile = () => {
  const { aircraftProfile, setAircraftProfile } = useAppStore()
  const [isEditing, setIsEditing] = useState(!aircraftProfile)
  const [formData, setFormData] = useState(
    aircraftProfile || { type: '', color: '', callSign: '' }
  )

  const handleSave = () => {
    if (formData.type && formData.color) {
      setAircraftProfile(formData)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setFormData(aircraftProfile || { type: '', color: '', callSign: '' })
    setIsEditing(false)
  }

  const commonAircraftTypes = [
    'Cessna 172', 'Cessna 182', 'Cessna 206', 'Piper Cherokee', 'Piper Archer',
    'Cirrus SR20', 'Cirrus SR22', 'Beechcraft Bonanza', 'Mooney', 'RV-4', 'RV-6', 'RV-7', 'RV-8'
  ]

  const commonColors = [
    'White', 'Red', 'Blue', 'Yellow', 'Green', 'Black', 'Silver', 'Orange'
  ]

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h3 className="card-title">
            <MdAirplaneTicket className="text-primary" />
            Aircraft Profile
          </h3>
          {!isEditing && aircraftProfile && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setIsEditing(true)}
            >
              <MdEdit className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Aircraft Type *</span>
              </label>
              <input
                type="text"
                list="aircraft-types"
                placeholder="e.g., Cessna 172"
                className="input input-bordered"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
              <datalist id="aircraft-types">
                {commonAircraftTypes.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Primary Color *</span>
              </label>
              <input
                type="text"
                list="aircraft-colors"
                placeholder="e.g., White"
                className="input input-bordered"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
              <datalist id="aircraft-colors">
                {commonColors.map((color) => (
                  <option key={color} value={color} />
                ))}
              </datalist>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Call Sign (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., N123AB"
                className="input input-bordered"
                value={formData.callSign}
                onChange={(e) => setFormData({ ...formData, callSign: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleCancel}
              >
                <MdCancel className="w-4 h-4 mr-1" />
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={!formData.type || !formData.color}
              >
                <MdSave className="w-4 h-4 mr-1" />
                Save
              </button>
            </div>
          </div>
        ) : aircraftProfile ? (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base-content/70">Type:</span>
              <span className="font-semibold">{aircraftProfile.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Color:</span>
              <span className="font-semibold">{aircraftProfile.color}</span>
            </div>
            {aircraftProfile.callSign && (
              <div className="flex justify-between">
                <span className="text-base-content/70">Call Sign:</span>
                <span className="font-mono font-semibold">{aircraftProfile.callSign}</span>
              </div>
            )}
            <div className="mt-4 p-3 bg-info/10 rounded-lg border-l-4 border-info">
              <p className="text-sm text-info">
                ATC will identify you as: <strong>"{aircraftProfile.color} {aircraftProfile.type}"</strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-base-content/60 mb-4">
              Set your aircraft profile so ATC can identify you properly
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsEditing(true)}
            >
              Add Aircraft Profile
            </button>
          </div>
        )}
      </div>
    </div>
  )
}