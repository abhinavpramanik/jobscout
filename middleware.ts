import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware disabled due to Edge runtime incompatibility with MongoDB and bcrypt
// Authentication is handled in individual pages and API routes
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
