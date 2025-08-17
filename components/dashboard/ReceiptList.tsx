'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Receipt, Calendar, Store, DollarSign, Eye, Trash2, Download } from 'lucide-react'
import { format } from 'date-fns'

interface ReceiptData {
  id: string
  filename: string
  original_filename: string
  total_amount: number | null
  store_name: string | null
  transaction_date: string | null
  processed_at: string
  status: string
  transaction_count: number
  calculated_total: number | null
}

interface TransactionData {
  id: string
  item_name: string
  quantity: number
  unit_price: number | null
  total_price: number
  category: string | null
  confidence_score: number | null
  created_at: string
}

export function ReceiptList() {
  const { user } = useAuth()
  const [receipts, setReceipts] = useState<ReceiptData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null)
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [showTransactions, setShowTransactions] = useState(false)

  useEffect(() => {
    if (user) {
      fetchReceipts()
    }
  }, [user])

  const fetchReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select(`
          *,
          transactions (
            id,
            item_name,
            quantity,
            unit_price,
            total_price,
            category,
            confidence_score,
            created_at
          )
        `)
        .eq('user_id', user?.id)
        .order('processed_at', { ascending: false })

      if (error) throw error

      const receiptsWithCounts = data.map((receipt: any) => ({
        ...receipt,
        transaction_count: receipt.transactions?.length || 0,
        calculated_total: receipt.transactions?.reduce((sum: number, t: any) => sum + t.total_price, 0) || 0
      }))

      setReceipts(receiptsWithCounts)
    } catch (error: any) {
      toast.error('Failed to fetch receipts')
      console.error('Error fetching receipts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async (receiptId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('receipt_id', receiptId)
        .order('created_at')

      if (error) throw error
      setTransactions(data)
    } catch (error: any) {
      toast.error('Failed to fetch transactions')
      console.error('Error fetching transactions:', error)
    }
  }

  const handleViewTransactions = async (receipt: ReceiptData) => {
    setSelectedReceipt(receipt)
    await fetchTransactions(receipt.id)
    setShowTransactions(true)
  }

  const handleDeleteReceipt = async (receiptId: string) => {
    if (!confirm('Are you sure you want to delete this receipt?')) return

    try {
      // Delete transactions first
      await supabase
        .from('transactions')
        .delete()
        .eq('receipt_id', receiptId)

      // Delete receipt
      await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId)

      toast.success('Receipt deleted successfully')
      fetchReceipts()
    } catch (error: any) {
      toast.error('Failed to delete receipt')
      console.error('Error deleting receipt:', error)
    }
  }

  const downloadReceipt = async (receipt: ReceiptData) => {
    try {
      const { data, error } = await supabase.storage
        .from('receipts')
        .download(receipt.filename)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = receipt.original_filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Receipt downloaded')
    } catch (error: any) {
      toast.error('Failed to download receipt')
      console.error('Error downloading receipt:', error)
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
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Receipts</h2>
        <div className="text-sm text-gray-600">
          {receipts.length} receipt{receipts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="card text-center py-12">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts yet</h3>
          <p className="text-gray-600">Upload your first grocery receipt to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Receipt className="w-5 h-5 text-primary-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    {receipt.original_filename}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  receipt.status === 'processed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {receipt.status}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {receipt.store_name && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Store className="w-4 h-4 mr-2" />
                    {receipt.store_name}
                  </div>
                )}
                {receipt.transaction_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(receipt.transaction_date), 'MMM dd, yyyy')}
                  </div>
                )}
                {receipt.total_amount && (
                  <div className="flex items-center text-sm font-medium text-gray-900">
                    <DollarSign className="w-4 h-4 mr-2" />
                    ₹{receipt.total_amount.toFixed(2)}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  {receipt.transaction_count} item{receipt.transaction_count !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewTransactions(receipt)}
                  className="flex-1 btn-secondary flex items-center justify-center text-sm"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => downloadReceipt(receipt)}
                  className="btn-secondary flex items-center justify-center text-sm px-3"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteReceipt(receipt.id)}
                  className="btn-secondary flex items-center justify-center text-sm px-3 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transactions Modal */}
      {showTransactions && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Transactions - {selectedReceipt.store_name || 'Unknown Store'}
              </h3>
              <button
                onClick={() => setShowTransactions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {transactions.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No transactions found</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{transaction.item_name}</div>
                        <div className="text-sm text-gray-600">
                          {transaction.category && (
                            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-2">
                              {transaction.category}
                            </span>
                          )}
                          {transaction.quantity > 1 && (
                            <span className="text-gray-500">
                              Qty: {transaction.quantity}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          ₹{transaction.total_price.toFixed(2)}
                        </div>
                        {transaction.unit_price && (
                          <div className="text-sm text-gray-600">
                            @ ₹{transaction.unit_price.toFixed(2)}
                          </div>
                        )}
                        {transaction.confidence_score && (
                          <div className="text-xs text-gray-500">
                            {Math.round(transaction.confidence_score * 100)}% confidence
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
