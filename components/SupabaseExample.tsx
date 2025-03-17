'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';

export default function SupabaseExample() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .limit(10);
        
        if (error) {
          throw error;
        }
        
        setUsers(data || []);
      } catch (error: any) {
        setError(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">ตัวอย่างการใช้งาน Supabase</h2>
      
      {loading && <p>กำลังโหลด...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <>
          <h3 className="text-xl font-semibold mb-2">รายชื่อผู้ใช้:</h3>
          {users.length === 0 ? (
            <p>ไม่พบข้อมูลผู้ใช้</p>
          ) : (
            <ul className="space-y-2">
              {users.map((user) => (
                <li key={user.id} className="border p-3 rounded">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>อีเมล:</strong> {user.email}</p>
                  <p><strong>ชื่อ:</strong> {user.name || 'ไม่ระบุ'}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
} 