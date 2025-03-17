import { createClient } from '@/lib/supabase-server';
import SupabaseExample from '@/components/SupabaseExample';

export default async function SupabaseExamplePage() {
  const supabase = createClient();
  
  // ตัวอย่างการดึงข้อมูลในฝั่ง server
  const { data: serverUsers } = await supabase
    .from('users')
    .select('id, name, email')
    .limit(5);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Supabase Example</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">ข้อมูลจาก Server Component</h2>
        {serverUsers && serverUsers.length > 0 ? (
          <div className="grid gap-4">
            {serverUsers.map((user) => (
              <div key={user.id} className="border p-4 rounded-lg">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>อีเมล:</strong> {user.email}</p>
                <p><strong>ชื่อ:</strong> {user.name || 'ไม่ระบุ'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>ไม่พบข้อมูลผู้ใช้</p>
        )}
      </div>
      
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">ข้อมูลจาก Client Component</h2>
        <SupabaseExample />
      </div>
    </div>
  );
} 