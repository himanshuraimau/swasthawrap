import { NextResponse } from 'next/server'

export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return NextResponse.json({
    status: 'OK',
    message: 'SwasthWrap Web3 API is running',
    network: isProduction ? 'Base Mainnet' : 'Base Sepolia',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/users/create-did',
      '/api/medical-records/upload',
      '/api/medical-records/user/[address]',
      '/api/consent/grant',
      '/api/verify/document',
      '/api/contract/info'
    ]
  })
}
