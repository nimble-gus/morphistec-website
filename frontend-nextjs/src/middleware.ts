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
  
  // Interceptar peticiones de favicon con diferentes extensiones
  if (request.nextUrl.pathname === '/favicon.png') {
    return NextResponse.redirect(new URL('/faviconoktae.png', request.url))
  }
  
  // Interceptar peticiones de favicon con diferentes tamaños
  if (request.nextUrl.pathname.startsWith('/favicon-')) {
    return NextResponse.redirect(new URL('/faviconoktae.png', request.url))
  }
  
  return NextResponse.next()
}

// Solo rutas de favicon: un catch-all aquí hace que el middleware corra en *cada*
// petición en dev y puede dejar el servidor colgado o muy lento tras "Starting...".
export const config = {
  matcher: ["/favicon.ico", "/app.ico", "/favicon.png", "/favicon-:path*"],
};
