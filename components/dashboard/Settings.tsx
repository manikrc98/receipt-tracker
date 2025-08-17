'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Key, User, Shield, Info, Save, Eye, EyeOff } from 'lucide-react'

interface UserSettings {
  ai_api_key: string | null
  ai_provider: string
  name: string | null
}

export function Settings() {
  const { user, updateApiKey } = useAuth()
  const [settings, setSettings] = useState<UserSettings>({
    ai_api_key: '',
    ai_provider: 'gemini',
    name: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserSettings()
    }
  }, [user])

  const fetchUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('ai_api_key, ai_provider, name')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      setSettings({
        ai_api_key: data.ai_api_key || '',
        ai_provider: data.ai_provider || 'gemini',
        name: data.name || ''
      })
    } catch (error: any) {
      console.error('Error fetching user settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update API key
      if (settings.ai_api_key) {
        const { error } = await updateApiKey(settings.ai_api_key, settings.ai_provider)
        if (error) throw error
      }

      // Update user profile
      const { error } = await supabase
        .from('users')
        .update({
          name: settings.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)

      if (error) throw error

      toast.success('Settings saved successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600">Manage your account settings and AI API configuration</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Profile</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input-field bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={settings.name || ''}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="input-field"
                placeholder="Enter your full name"
              />
            </div>
          </div>
        </div>

        {/* AI API Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Key className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">AI API Configuration</h3>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="space-y-1">
                  <li>• Your API key is stored securely and used only for processing receipts</li>
                  <li>• We use Google's Gemini Vision API to extract transaction data</li>
                  <li>• You can use your own Gemini API key for better control over costs</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI Provider
              </label>
              <select
                value={settings.ai_provider}
                onChange={(e) => setSettings({ ...settings, ai_provider: e.target.value })}
                className="input-field"
              >
                <option value="gemini">Google Gemini (Gemini 1.5 Flash)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.ai_api_key || ''}
                  onChange={(e) => setSettings({ ...settings, ai_api_key: e.target.value })}
                  className="input-field pr-10"
                  placeholder="Enter your Gemini API key"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from{' '}
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Security</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <button className="btn-secondary text-sm">
                Coming Soon
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Data Export</p>
                <p className="text-sm text-gray-600">Download all your receipt data</p>
              </div>
              <button className="btn-secondary text-sm">
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center px-6 py-3"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 card bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-3">Need Help?</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Make sure your OpenAI API key has access to GPT-4 Vision</p>
          <p>• Keep your API key secure and don't share it with others</p>
          <p>• Contact support if you encounter any issues</p>
        </div>
      </div>
    </div>
  )
}
