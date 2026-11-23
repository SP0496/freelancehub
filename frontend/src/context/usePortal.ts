import { useContext } from 'react'
import { PortalContext } from './portalTypes'

export function usePortal() {
  const context = useContext(PortalContext)
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider')
  }
  return context
}
