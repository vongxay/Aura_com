"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Lock, Loader2, CheckCircle2 } from "lucide-react"
import Link from 'next/link'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  // ตรวจสอบว่าผู้ใช้มาจากลิงก์รีเซ็ตรหัสผ่านหรือไม่
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        toast({
          title: "ไม่พบเซสชัน",
          description: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว",
          variant: "destructive"
        })
        router.push('/auth')
      }
    }
    
    checkSession()
  }, [router, toast])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
    }
    
    if (!/[A-Z]/.test(password)) {
      return 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว'
    }
    
    if (!/[a-z]/.test(password)) {
      return 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว'
    }
    
    if (!/[0-9]/.test(password)) {
      return 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว'
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว'
    }
    
    return ''
  }

  const checkPasswordStrength = (password: string) => {
    let strength = 0
    
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1
    
    return strength
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return 'ไม่ปลอดภัย'
    if (passwordStrength === 1) return 'อ่อนมาก'
    if (passwordStrength === 2) return 'อ่อน'
    if (passwordStrength === 3) return 'ปานกลาง'
    if (passwordStrength === 4) return 'ดี'
    if (passwordStrength === 5) return 'แข็งแกร่ง'
    return ''
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200'
    if (passwordStrength === 1) return 'bg-red-500'
    if (passwordStrength === 2) return 'bg-orange-500'
    if (passwordStrength === 3) return 'bg-yellow-500'
    if (passwordStrength === 4) return 'bg-blue-500'
    if (passwordStrength === 5) return 'bg-green-500'
    return 'bg-gray-200'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    
    // ตรวจสอบความถูกต้องของรหัสผ่าน
    const error = validatePassword(password)
    if (error) {
      setPasswordError(error)
      return
    }
    
    // ตรวจสอบว่ารหัสผ่านและยืนยันรหัสผ่านตรงกันหรือไม่
    if (password !== confirmPassword) {
      setPasswordError('รหัสผ่านไม่ตรงกัน')
      return
    }
    
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) throw error
      
      setIsSuccess(true)
      toast({
        title: "อัปเดตรหัสผ่านสำเร็จ",
        description: "รหัสผ่านของคุณได้รับการอัปเดตแล้ว",
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
        <p className="text-gray-500 mt-2">อัปเดตรหัสผ่านของคุณ</p>
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSuccess ? 'รหัสผ่านถูกอัปเดตแล้ว' : 'สร้างรหัสผ่านใหม่'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSuccess 
              ? 'คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว' 
              : 'กรุณาป้อนรหัสผ่านใหม่ของคุณ'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">รหัสผ่านใหม่</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      const error = validatePassword(e.target.value)
                      setPasswordError(error)
                      setPasswordStrength(checkPasswordStrength(e.target.value))
                    }}
                    placeholder="ป้อนรหัสผ่านใหม่"
                    className={`pl-10 pr-10 ${passwordError ? 'border-red-500' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getPasswordStrengthColor()}`} 
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2 min-w-[70px] text-right">
                      {password ? getPasswordStrengthText() : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    รหัสผ่านควรมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">ยืนยันรหัสผ่านใหม่</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="ยืนยันรหัสผ่านใหม่"
                    className={`pl-10 pr-10 ${passwordError ? 'border-red-500' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              {passwordError && (
                <div className="text-red-500 text-sm">{passwordError}</div>
              )}
              
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
                  'อัปเดตรหัสผ่าน'
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-gray-700">รหัสผ่านของคุณได้รับการอัปเดตเรียบร้อยแล้ว</p>
              <Button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 h-11"
                onClick={() => router.push('/auth')}
              >
                ไปยังหน้าเข้าสู่ระบบ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 