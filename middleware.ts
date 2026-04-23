import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicPaths = ['/login', '/register']
  const isPublicPath = publicPaths.includes(pathname)

  // If cookie exists, prevent accessing login/register again
  const token = request.cookies.get('access_token')?.value
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Allow all other routes (auth handled on client by storage in HomeClient)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
