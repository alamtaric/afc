'use client'

import { useState, useEffect } from 'react'
import {
  requestNotificationPermission,
  getNotificationPermission,
} from './OneSignalProvider'

export default function NotificationPermission() {
  const [showBanner, setShowBanner] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    const checkPermission = () => {
      if (typeof window === 'undefined') return

      if (!('Notification' in window)) {
        return
      }

      // iOS Safari (非PWA) では通知非対応なのでバナーを表示しない
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      if (isIOS && !isStandalone) {
        return
      }

      const permission = Notification.permission
      if (permission === 'default') {
        setShowBanner(true)
      }
    }

    const timer = setTimeout(checkPermission, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleRequestPermission = async () => {
    setIsRequesting(true)
    try {
      await requestNotificationPermission()
      setShowBanner(false)
    } catch (error) {
      console.error('Failed to request permission:', error)
    } finally {
      setIsRequesting(false)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-indigo-700">
          <span>🔔</span>
          <span>通知をオンにすると、新しいメッセージをお知らせします</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="text-xs text-indigo-400 hover:text-indigo-600 transition-colors"
          >
            あとで
          </button>
          <button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-full hover:bg-indigo-600 transition-colors disabled:opacity-50"
          >
            {isRequesting ? '...' : '許可する'}
          </button>
        </div>
      </div>
    </div>
  )
}
