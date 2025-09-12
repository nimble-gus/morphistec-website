import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Interceptar peticiones de favicon
  if (request.nextUrl.pathname === '/favicon.ico') {
    // Redirigir a nuestro favicon personalizado
    return NextResponse.redirect(new URL('/faviconoktae.png', request.url))
  }
  
  // Interceptar peticiones de app.ico (Vercel específico)
  if (request.nextUrl.pathname === '/app.ico') {
    return NextResponse.redirect(new URL('/faviconoktae.png', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/favicon.ico',
    '/app.ico',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
