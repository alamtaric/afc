'use client'

import { useEffect } from 'react'

let initialized = false
let initializing = false
let oneSignalModule: typeof import('react-onesignal') | null = null
let initPromise: Promise<void> | null = null

export default function OneSignalProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    initOneSignal()
  }, [])

  return <>{children}</>
}

async function initOneSignal(): Promise<void> {
  if (initialized) return
  if (initPromise) return initPromise

  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
  if (!appId) {
    return
  }

  initPromise = (async () => {
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
  })()

  return initPromise
}

async function waitForOneSignal(): Promise<boolean> {
  if (initialized && oneSignalModule) return true
  await initOneSignal()
  return initialized && !!oneSignalModule
}

export async function loginOneSignal(familyId: string, memberId: string) {
  const ready = await waitForOneSignal()
  if (!ready || !oneSignalModule) return
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
  const ready = await waitForOneSignal()
  if (!ready || !oneSignalModule) return
  try {
    await oneSignalModule.default.logout()
  } catch (error) {
    console.error('Failed to logout from OneSignal:', error)
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const ready = await waitForOneSignal()
  if (!ready || !oneSignalModule) {
    // Fallback to native Notification API
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      return result === 'granted'
    }
    return false
  }
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
