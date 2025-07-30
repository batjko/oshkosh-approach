import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppMode = 'pre-flight' | 'in-flight'
export type Theme = 'light' | 'dark'

interface AppState {
  // Current stage in the approach
  currentStage: number
  
  // App mode - switches UI context
  mode: AppMode
  
  // Theme
  theme: Theme
  
  // Map settings
  enableMap: boolean
  
  // User aircraft profile
  aircraftProfile: {
    type: string
    color: string
    callSign: string
  } | null
  
  // Geolocation
  currentLocation: {
    lat: number
    lng: number
    accuracy: number
  } | null
  
  // Actions
  setCurrentStage: (stage: number) => void
  nextStage: () => void
  prevStage: () => void
  setMode: (mode: AppMode) => void
  setTheme: (theme: Theme) => void
  setAircraftProfile: (profile: AppState['aircraftProfile']) => void
  setCurrentLocation: (location: AppState['currentLocation']) => void
  toggleTheme: () => void
  setEnableMap: (enable: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentStage: 0,
      mode: 'pre-flight',
      theme: 'light',
      enableMap: true,
      aircraftProfile: null,
      currentLocation: null,
      
      setCurrentStage: (stage) => set({ currentStage: stage }),
      
      nextStage: () => set((state) => ({ 
        currentStage: Math.min(state.currentStage + 1, 10) // Max 10 stages based on current data
      })),
      
      prevStage: () => set((state) => ({ 
        currentStage: Math.max(state.currentStage - 1, 0) 
      })),
      
      setMode: (mode) => set({ mode }),
      
      setTheme: (theme) => {
        set({ theme })
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme)
      },
      
      toggleTheme: () => {
        const { theme } = get()
        const newTheme = theme === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
      },
      
      setAircraftProfile: (profile) => set({ aircraftProfile: profile }),
      
      setCurrentLocation: (location) => set({ currentLocation: location }),
      
      setEnableMap: (enable) => set({ enableMap: enable }),
    }),
    {
      name: 'oshkosh-app-storage',
      partialize: (state) => ({
        theme: state.theme,
        aircraftProfile: state.aircraftProfile,
        mode: state.mode,
        enableMap: state.enableMap,
      }),
    }
  )
)