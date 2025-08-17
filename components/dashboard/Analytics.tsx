'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { DollarSign, TrendingUp, Calendar, ShoppingCart } from 'lucide-react'

interface AnalyticsData {
  category: string
  icon: string
  color: string
  transaction_count: number
  total_spent: number
  avg_price: number
}

interface SummaryData {
  totalSpent: number
  totalTransactions: number
  avgTransactionValue: number
  topCategory: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1']

export function Analytics() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30') // days

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user, timeRange])

  const fetchAnalytics = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(timeRange))

      // Get spending by category
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          category,
          total_price,
          receipts!inner(user_id)
        `)
        .eq('receipts.user_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (error) throw error

      // Process data
      const categoryMap = new Map<string, { count: number; total: number; prices: number[] }>()
      
      data.forEach((transaction: any) => {
        const category = transaction.category || 'Uncategorized'
        const existing = categoryMap.get(category) || { count: 0, total: 0, prices: [] }
        existing.count++
        existing.total += transaction.total_price
        existing.prices.push(transaction.total_price)
        categoryMap.set(category, existing)
      })

      const analyticsData: AnalyticsData[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        icon: getCategoryIcon(category),
        color: getCategoryColor(category),
        transaction_count: data.count,
        total_spent: data.total,
        avg_price: data.total / data.count
      }))

      // Sort by total spent
      analyticsData.sort((a, b) => b.total_spent - a.total_spent)
      setAnalytics(analyticsData)

      // Calculate summary
      const totalSpent = analyticsData.reduce((sum, item) => sum + item.total_spent, 0)
      const totalTransactions = analyticsData.reduce((sum, item) => sum + item.transaction_count, 0)
      
      setSummary({
        totalSpent,
        totalTransactions,
        avgTransactionValue: totalTransactions > 0 ? totalSpent / totalTransactions : 0,
        topCategory: analyticsData[0]?.category || 'None'
      })

    } catch (error: any) {
      toast.error('Failed to fetch analytics')
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Fruits & Vegetables': '🥬',
      'Dairy & Eggs': '🥛',
      'Meat & Fish': '🥩',
      'Bakery': '🥖',
      'Pantry': '🥫',
      'Beverages': '🥤',
      'Snacks': '🍿',
      'Frozen Foods': '🧊',
      'Household': '🧽',
      'Personal Care': '🧴',
      'Uncategorized': '❓'
    }
    return icons[category] || '❓'
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Fruits & Vegetables': '#4CAF50',
      'Dairy & Eggs': '#FFEB3B',
      'Meat & Fish': '#F44336',
      'Bakery': '#FF9800',
      'Pantry': '#795548',
      'Beverages': '#2196F3',
      'Snacks': '#9C27B0',
      'Frozen Foods': '#00BCD4',
      'Household': '#607D8B',
      'Personal Care': '#E91E63',
      'Uncategorized': '#9E9E9E'
    }
    return colors[category] || '#9E9E9E'
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
        <h2 className="text-2xl font-bold text-gray-900">Spending Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field w-auto"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₹{summary.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Transaction</p>
                <p className="text-2xl font-bold text-gray-900">₹{summary.avgTransactionValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Category</p>
                <p className="text-lg font-bold text-gray-900">{summary.topCategory}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {analytics.length === 0 ? (
        <div className="card text-center py-12">
          <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600">Upload some receipts to see your spending analytics</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bar Chart */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`₹${value.toFixed(2)}`, 'Amount']}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Bar dataKey="total_spent" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total_spent"
                >
                  {analytics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`₹${value.toFixed(2)}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Breakdown Table */}
      {analytics.length > 0 && (
        <div className="card mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Transactions</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Total Spent</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Average</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((item, index) => {
                  const percentage = summary ? (item.total_spent / summary.totalSpent) * 100 : 0
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{item.icon}</span>
                          <span className="font-medium text-gray-900">{item.category}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-gray-900">{item.transaction_count}</td>
                      <td className="text-right py-3 px-4 font-medium text-gray-900">₹{item.total_spent.toFixed(2)}</td>
                      <td className="text-right py-3 px-4 text-gray-600">₹{item.avg_price.toFixed(2)}</td>
                      <td className="text-right py-3 px-4 text-gray-600">{percentage.toFixed(1)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
