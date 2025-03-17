"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Lock, Loader2, ShieldAlert } from "lucide-react"
import Link from 'next/link'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault()
    
    setIsLoading(true)

    try {
      // ล็อกอินด้วย Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // ตรวจสอบว่าผู้ใช้มีสิทธิ์แอดมินหรือไม่
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', data.user?.id)
        .single()

      if (adminError || !adminData) {
        // ถ้าไม่ใช่แอดมิน ให้ออกจากระบบและแจ้งเตือน
        await supabase.auth.signOut()
        throw new Error('คุณไม่มีสิทธิ์เข้าถึงหน้าผู้ดูแลระบบ')
      }

      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ยินดีต้อนรับสู่ระบบผู้ดูแล!",
      })
      
      // นำทางไปยังหน้าแดชบอร์ดแอดมิน
      router.push('/admin')
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <ShieldAlert className="h-12 w-12 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl font-bold">ระบบผู้ดูแล</CardTitle>
          <CardDescription>เข้าสู่ระบบเพื่อจัดการ AuraClear</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังดำเนินการ...
                </>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/" className="text-indigo-600 hover:text-indigo-700 hover:underline">
              กลับไปยังหน้าร้านค้า
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 