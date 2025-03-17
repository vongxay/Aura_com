# การใช้งาน Supabase กับ Next.js

โปรเจคนี้แสดงตัวอย่างการใช้งาน Supabase กับ Next.js โดยใช้ App Router

## การตั้งค่า

1. สร้างโปรเจค Supabase ที่ [supabase.com](https://supabase.com)
2. คัดลอก URL และ Anon Key จากหน้า Project Settings > API
3. เพิ่มค่าเหล่านี้ในไฟล์ `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## โครงสร้างโปรเจค

- `lib/supabase.ts` - ไฟล์สำหรับการเชื่อมต่อกับ Supabase (ใช้ได้ทั้งใน client และ server)
- `lib/supabase-client.ts` - ไฟล์สำหรับการเชื่อมต่อกับ Supabase ในฝั่ง client
- `lib/supabase-server.ts` - ไฟล์สำหรับการเชื่อมต่อกับ Supabase ในฝั่ง server
- `types/supabase.ts` - ไฟล์สำหรับ type definitions ของ Supabase
- `middleware.ts` - ไฟล์สำหรับจัดการการเข้าถึงหน้าที่ต้องการการยืนยันตัวตน
- `supabase/migrations/` - ไฟล์ SQL สำหรับการสร้างโครงสร้างฐานข้อมูล

## ตัวอย่างการใช้งาน

### การดึงข้อมูลในฝั่ง Server Component

```tsx
import { createClient } from '@/lib/supabase-server';

export default async function ServerComponent() {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('users')
    .select('*')
    .limit(10);
  
  return (
    <div>
      {/* แสดงข้อมูล */}
    </div>
  );
}
```

### การดึงข้อมูลในฝั่ง Client Component

```tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';

export default function ClientComponent() {
  const [data, setData] = useState(null);
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('users')
        .select('*')
        .limit(10);
      
      setData(data);
    }
    
    fetchData();
  }, []);
  
  return (
    <div>
      {/* แสดงข้อมูล */}
    </div>
  );
}
```

### การใช้งาน Authentication

ดูตัวอย่างได้ที่ `components/AuthExample.tsx` และ `app/auth-example/page.tsx`

### การใช้งาน API Routes

ดูตัวอย่างได้ที่ `app/api/users/route.ts`

## การใช้งาน Row Level Security (RLS)

Supabase มีระบบ Row Level Security ที่ช่วยให้คุณสามารถควบคุมการเข้าถึงข้อมูลในระดับแถวได้ ดูตัวอย่างได้ที่ `supabase/migrations/20240316_create_users_table.sql`

## การรัน Migration

```bash
npx supabase migration up
```

## เอกสารอ้างอิง

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js Documentation](https://nextjs.org/docs) 