import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Test API route called')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const apiKey = formData.get('apiKey') as string

    console.log('Test - Form data received:', {
      hasFile: !!file,
      fileSize: file?.size,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length
    })

    // Return a simple test response
    return NextResponse.json({ 
      success: true, 
      message: 'Test API route working',
      data: {
        hasFile: !!file,
        fileSize: file?.size,
        hasApiKey: !!apiKey
      }
    })

  } catch (error: any) {
    console.error('Test API route error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Test API route failed',
        details: error.stack || 'No stack trace'
      },
      { status: 500 }
    )
  }
}
