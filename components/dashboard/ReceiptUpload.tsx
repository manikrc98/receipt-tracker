'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Upload, Camera, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface ProcessedReceipt {
  store_name: string
  total_amount: number
  transaction_date: string
  transactions: Array<{
    item_name: string
    quantity: number
    unit_price: number | null
    total_price: number
    category: string
    confidence_score: number
  }>
}

export function ReceiptUpload() {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [processedData, setProcessedData] = useState<ProcessedReceipt | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setProcessedData(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const uploadReceipt = async () => {
    if (!uploadedFile || !user) return

    setUploading(true)
    try {
      // Upload file to Supabase Storage
      const fileExt = uploadedFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, uploadedFile)

      if (error) throw error

      // Save receipt record to database
      const { data: receiptData, error: receiptError } = await supabase
        .from('receipts')
        .insert({
          user_id: user.id,
          filename: data.path,
          original_filename: uploadedFile.name,
          file_path: data.path,
          status: 'pending'
        })
        .select()
        .single()

      if (receiptError) throw receiptError

      toast.success('Receipt uploaded successfully!')
      return receiptData

    } catch (error: any) {
      toast.error(error.message || 'Failed to upload receipt')
      throw error
    } finally {
      setUploading(false)
    }
  }

  const processWithAI = async () => {
    if (!uploadedFile || !user) return

    setProcessing(true)
    try {
      // First upload the receipt
      const receiptData = await uploadReceipt()
      if (!receiptData) return

      // Get user's AI API key
      const { data: userData } = await supabase
        .from('users')
        .select('ai_api_key')
        .eq('id', user.id)
        .single()

      if (!userData?.ai_api_key) {
        toast.error('Please configure your AI API key in settings first')
        return
      }

      // Process with AI (this would be a serverless function in production)
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('apiKey', userData.ai_api_key)

      const response = await fetch('/api/process-receipt', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process receipt')
      }

      const result = await response.json()
      setProcessedData(result.data)

      // Save processed transactions
      if (result.data.transactions.length > 0) {
        await supabase
          .from('transactions')
          .insert(
            result.data.transactions.map((t: any) => ({
              receipt_id: receiptData.id,
              item_name: t.item_name,
              quantity: t.quantity,
              unit_price: t.unit_price,
              total_price: t.total_price,
              category: t.category,
              confidence_score: t.confidence_score
            }))
          )

        // Update receipt with extracted data
        await supabase
          .from('receipts')
          .update({
            total_amount: result.data.total_amount,
            store_name: result.data.store_name,
            transaction_date: result.data.transaction_date,
            status: 'processed'
          })
          .eq('id', receiptData.id)

        toast.success(`Processed ${result.data.transactions.length} transactions!`)
      }

    } catch (error: any) {
      toast.error(error.message || 'Failed to process receipt')
    } finally {
      setProcessing(false)
    }
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setProcessedData(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Receipt</h2>
        <p className="text-gray-600">Upload a grocery receipt to automatically extract and categorize transactions</p>
      </div>

      {/* Upload Area */}
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`card border-2 border-dashed transition-colors cursor-pointer ${
            isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-center py-12">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop the receipt here' : 'Upload your receipt'}
            </p>
            <p className="text-gray-600 mb-4">
              Drag and drop an image, or click to select
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Camera className="w-4 h-4 mr-1" />
                Take photo
              </div>
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Upload file
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Receipt Preview</h3>
              <button
                onClick={resetUpload}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Upload another
              </button>
            </div>
            <div className="relative">
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="w-full h-64 object-contain rounded-lg border border-gray-200"
              />
              <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Ready to process
              </div>
            </div>
          </div>

          {/* Process Button */}
          <div className="flex justify-center">
            <button
              onClick={processWithAI}
              disabled={processing}
              className="btn-primary flex items-center px-8 py-3 text-lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing with AI...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Process with AI
                </>
              )}
            </button>
          </div>

          {/* Processing Status */}
          {processing && (
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center">
                <Loader2 className="w-5 h-5 text-blue-600 mr-3 animate-spin" />
                <div>
                  <p className="font-medium text-blue-900">Processing receipt...</p>
                  <p className="text-sm text-blue-700">Extracting transactions and categorizing items</p>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {processedData && (
            <div className="card bg-green-50 border-green-200">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-green-900 mb-2">Processing Complete!</h3>
                  <div className="space-y-2 text-sm text-green-800">
                    <p><strong>Store:</strong> {processedData.store_name}</p>
                    <p><strong>Total:</strong> ₹{processedData.total_amount}</p>
                    <p><strong>Date:</strong> {processedData.transaction_date}</p>
                    <p><strong>Items:</strong> {processedData.transactions.length} transactions</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 card bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-3">How it works</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary-600 rounded-full mr-3 mt-2 flex-shrink-0" />
            <p>Upload a clear image of your grocery receipt</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary-600 rounded-full mr-3 mt-2 flex-shrink-0" />
            <p>AI automatically extracts all items and prices</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary-600 rounded-full mr-3 mt-2 flex-shrink-0" />
            <p>Transactions are categorized into grocery categories</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary-600 rounded-full mr-3 mt-2 flex-shrink-0" />
            <p>View your spending analytics and track expenses</p>
          </div>
        </div>
      </div>
    </div>
  )
}
