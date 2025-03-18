"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "กรุณากรอกอีเมลและรหัสผ่าน",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsLoading(true)
      
      // เข้าสู่ระบบผ่าน Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        throw error
      }
      
      if (!data.session) {
        throw new Error("เข้าสู่ระบบไม่สำเร็จ")
      }
      
      // ตรวจสอบว่าผู้ใช้เป็นแอดมินหรือไม่
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', data.session.user.id)
        .single()
        
      if (adminError || !adminData) {
        // ถ้าไม่ใช่แอดมิน ให้ออกจากระบบและแสดงข้อความผิดพลาด
        await supabase.auth.signOut()
        throw new Error("คุณไม่มีสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ")
      }
      
      // เข้าสู่ระบบสำเร็จ และเป็นแอดมิน
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ยินดีต้อนรับกลับมา, คุณกำลังเข้าสู่แดชบอร์ดผู้ดูแลระบบ",
      })
      
      // นำทางไปยังแดชบอร์ดแอดมิน
      router.push('/admin')
      
    } catch (error: any) {
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: error?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองอีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-4">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">ระบบผู้ดูแล</CardTitle>
          <CardDescription>
            กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบผู้ดูแล
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <Button className="w-full bg-[#00BFB3] hover:bg-[#00a79c]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </Button>
            
            <div className="mt-4 text-center text-sm">
              <Link href="/" className="text-[#00BFB3] hover:underline">
                กลับไปยังหน้าหลัก
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
