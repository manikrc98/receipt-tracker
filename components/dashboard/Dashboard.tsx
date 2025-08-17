'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { ReceiptUpload } from './ReceiptUpload'
import { ReceiptList } from './ReceiptList'
import { Analytics } from './Analytics'
import { Settings } from './Settings'
import { Receipt, BarChart3, Settings as SettingsIcon, LogOut, User } from 'lucide-react'

type TabType = 'upload' | 'receipts' | 'analytics' | 'settings'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('upload')
  const { user, signOut } = useAuth()

  const tabs = [
    { id: 'upload' as TabType, label: 'Upload', icon: Receipt },
    { id: 'receipts' as TabType, label: 'Receipts', icon: Receipt },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Settings', icon: SettingsIcon },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <ReceiptUpload />
      case 'receipts':
        return <ReceiptList />
      case 'analytics':
        return <Analytics />
      case 'settings':
        return <Settings />
      default:
        return <ReceiptUpload />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Receipt className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Receipt Tracker</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="w-4 h-4 mr-2" />
                {user?.email}
              </div>
              <button
                onClick={signOut}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-3 px-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>
    </div>
  )
}
