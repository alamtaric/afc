'use client'

import { useEffect } from 'react'

let initialized = false
let oneSignalModule: typeof import('react-onesignal') | null = null

export default function OneSignalProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const initOneSignal = async () => {
      if (initialized) return

      const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
      if (!appId) {
        console.warn('OneSignal App ID is not configured')
        return
      }

      try {
        const OneSignal = await import('react-onesignal')
        oneSignalModule = OneSignal
        await OneSignal.default.init({
          appId,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
        })
        initialized = true
      } catch (error) {
        console.error('Failed to initialize OneSignal:', error)
      }
    }

    initOneSignal()
  }, [])

  return <>{children}</>
}

export async function loginOneSignal(familyId: string, memberId: string) {
  if (!oneSignalModule) return
  try {
    await oneSignalModule.default.login(memberId)
    await oneSignalModule.default.User.addTags({
      familyId,
      memberId,
    })
  } catch (error) {
    console.error('Failed to login to OneSignal:', error)
  }
}

export async function logoutOneSignal() {
  if (!oneSignalModule) return
  try {
    await oneSignalModule.default.logout()
  } catch (error) {
    console.error('Failed to logout from OneSignal:', error)
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!oneSignalModule) return false
  try {
    const permission = await oneSignalModule.default.Notifications.requestPermission()
    return permission
  } catch (error) {
    console.error('Failed to request notification permission:', error)
    return false
  }
}

export function getNotificationPermission(): boolean {
  if (!oneSignalModule) return false
  try {
    return oneSignalModule.default.Notifications.permission
  } catch {
    return false
  }
}
