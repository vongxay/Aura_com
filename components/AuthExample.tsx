'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';

export default function AuthExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const supabase = createClient();

  // ตรวจสอบสถานะการเข้าสู่ระบบเมื่อคอมโพเนนต์โหลด
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    checkUser();
    
    // ตั้งค่า listener สำหรับการเปลี่ยนแปลงสถานะการเข้าสู่ระบบ
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setMessage(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      setMessage({
        text: 'ลงทะเบียนสำเร็จ! กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี',
        type: 'success',
      });
      
      // เคลียร์ฟอร์ม
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setMessage({
        text: error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน',
        type: 'error',
      });
      console.error('Error signing up:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setMessage(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      setMessage({
        text: 'เข้าสู่ระบบสำเร็จ!',
        type: 'success',
      });
      
      // เคลียร์ฟอร์ม
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setMessage({
        text: error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
        type: 'error',
      });
      console.error('Error signing in:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setMessage({
        text: 'ออกจากระบบสำเร็จ!',
        type: 'success',
      });
    } catch (error: any) {
      setMessage({
        text: error.message || 'เกิดข้อผิดพลาดในการออกจากระบบ',
        type: 'error',
      });
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">ตัวอย่างการใช้งาน Supabase Auth</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <p>{message.text}</p>
        </div>
      )}
      
      {user ? (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">ผู้ใช้ที่เข้าสู่ระบบ</h3>
          <div className="border p-3 rounded mb-4">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>อีเมล:</strong> {user.email}</p>
          </div>
          
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {loading ? 'กำลังดำเนินการ...' : 'ออกจากระบบ'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <form onSubmit={handleSignUp} className="mb-4">
            <h3 className="text-xl font-semibold mb-2">ลงทะเบียน</h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-email">
                อีเมล
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-password">
                รหัสผ่าน
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {loading ? 'กำลังดำเนินการ...' : 'ลงทะเบียน'}
            </button>
          </form>
          
          <div className="border-t pt-4">
            <form onSubmit={handleSignIn}>
              <h3 className="text-xl font-semibold mb-2">เข้าสู่ระบบ</h3>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signin-email">
                  อีเมล
                </label>
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signin-password">
                  รหัสผ่าน
                </label>
                <input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {loading ? 'กำลังดำเนินการ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 