"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/lib/supabase'
import { Mail, Loader2, ArrowLeft } from "lucide-react"
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      
      if (error) throw error
      
      setIsSubmitted(true)
      toast({
        title: "ส่งอีเมลสำเร็จ",
        description: "โปรดตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน",
      })
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-blue-900">AuraClear</h1>
        <p className="text-gray-500 mt-2">รีเซ็ตรหัสผ่านของคุณ</p>
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSubmitted ? 'ตรวจสอบอีเมลของคุณ' : 'ลืมรหัสผ่าน?'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSubmitted 
              ? 'เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว' 
              : 'ป้อนอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">อีเมล</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังดำเนินการ...
                  </span>
                ) : (
                  'ส่งลิงก์รีเซ็ตรหัสผ่าน'
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg text-blue-800 mb-4">
                <p>เราได้ส่งอีเมลพร้อมลิงก์รีเซ็ตรหัสผ่านไปที่ <strong>{email}</strong></p>
                <p className="mt-2">หากคุณไม่ได้รับอีเมล โปรดตรวจสอบโฟลเดอร์สแปมของคุณ</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsSubmitted(false)}
              >
                ลองใช้อีเมลอื่น
              </Button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link 
              href="/auth" 
              className="text-sm text-blue-600 hover:underline inline-flex items-center"
            >
              <ArrowLeft size={16} className="mr-1" />
              กลับไปยังหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 