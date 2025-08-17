import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('API route called - starting receipt processing')
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      'https://hsoeronoacqhkfwkbbrw.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options)
            } catch {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 })
            } catch {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    // Skip server-side auth check since we're using the API key directly
    // The client-side already validates the user is authenticated

    const formData = await request.formData()
    const file = formData.get('file') as File
    const apiKey = formData.get('apiKey') as string

    console.log('Form data received:', {
      hasFile: !!file,
      fileSize: file?.size,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length
    })

    if (!file || !apiKey) {
      return NextResponse.json({ error: 'Missing file or API key' }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Process with OpenAI Vision API
    const result = await processWithOpenAI(base64Image, apiKey)

    return NextResponse.json({ 
      success: true, 
      data: result 
    })

  } catch (error: any) {
    console.error('Receipt processing error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process receipt',
        details: error.stack || 'No stack trace available'
      },
      { status: 500 }
    )
  }
}

async function processWithOpenAI(base64Image: string, apiKey: string) {
  const prompt = `Analyze this grocery receipt image and extract all transactions. For each item, provide:
1. Item name
2. Quantity (if specified)
3. Unit price (if specified)
4. Total price for that item
5. Category (choose from: Fruits & Vegetables, Dairy & Eggs, Meat & Fish, Bakery, Pantry, Beverages, Snacks, Frozen Foods, Household, Personal Care)
6. Confidence score (0-1)

Also extract:
- Store name
- Total amount
- Transaction date (if visible)

Return the data in this exact JSON format:
{
  "store_name": "Store Name",
  "total_amount": 123.45,
  "transaction_date": "2024-01-15",
  "transactions": [
    {
      "item_name": "Item Name",
      "quantity": 1,
      "unit_price": 10.00,
      "total_price": 10.00,
      "category": "Category Name",
      "confidence_score": 0.95
    }
  ]
}

Focus on Indian grocery stores and products. Amounts should be in Indian Rupees (₹).`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content

  // Try to parse JSON from the response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (parseError) {
    console.error('JSON parsing error:', parseError)
  }

  // Fallback: try to extract structured data from text
  return parseStructuredData(content)
}

function parseStructuredData(content: string) {
  const lines = content.split('\n')
  const transactions = []
  let storeName = ''
  let totalAmount = 0
  let transactionDate = ''

  for (const line of lines) {
    // Extract store name
    if (line.toLowerCase().includes('store') || line.toLowerCase().includes('mart') || line.toLowerCase().includes('supermarket')) {
      storeName = line.trim()
    }

    // Extract total amount
    const totalMatch = line.match(/total.*?(\d+\.?\d*)/i)
    if (totalMatch) {
      totalAmount = parseFloat(totalMatch[1])
    }

    // Extract date
    const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/)
    if (dateMatch) {
      transactionDate = dateMatch[1]
    }

    // Extract individual items (simplified parsing)
    const itemMatch = line.match(/(.+?)\s+(\d+\.?\d*)/)
    if (itemMatch && !line.toLowerCase().includes('total')) {
      const itemName = itemMatch[1].trim()
      const price = parseFloat(itemMatch[2])
      
      if (itemName && price > 0) {
        transactions.push({
          item_name: itemName,
          quantity: 1,
          unit_price: price,
          total_price: price,
          category: 'Pantry', // Default category
          confidence_score: 0.7
        })
      }
    }
  }

  return {
    store_name: storeName,
    total_amount: totalAmount,
    transaction_date: transactionDate,
    transactions
  }
}
