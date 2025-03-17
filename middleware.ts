import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // สร้าง supabase client ที่ใช้ cookies จาก request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  // อัปเดต session ถ้ามี
  const { data: { session } } = await supabase.auth.getSession();
  
  // ตรวจสอบเส้นทางของแอดมิน
  const path = req.nextUrl.pathname;
  
  if (path.startsWith('/admin') && !path.startsWith('/admin-login')) {
    // ถ้าไม่มี session ให้เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบแอดมิน
    if (!session) {
      const redirectUrl = new URL('/admin-login', req.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // ตรวจสอบว่าผู้ใช้เป็นแอดมินหรือไม่
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (adminError || !adminData) {
      // ถ้าไม่ใช่แอดมิน ให้เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบแอดมิน
      const redirectUrl = new URL('/admin-login', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return res;
}

// ระบุ path ที่ middleware นี้จะทำงาน
export const config = {
  matcher: [
    // ทำงานกับทุก route ยกเว้น static files, api routes, และ _next
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}; 