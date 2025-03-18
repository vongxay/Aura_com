"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/lib/supabase'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, Mail, Phone, MapPin, Save, Award, Lock, ShoppingBag, Clock, CreditCard, ChevronRight, BadgeCheck, Camera, Bell, Gift, LogOut } from "lucide-react"
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"

interface Profile {
  id: string
  email: string
  name: string | null
  phone: string | null
  address: string | null
  avatar_url: string | null
  points?: number
}

interface Order {
  id: string
  created_at: string
  status: string
  total: number
  items: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState("profile")
  const router = useRouter()
  const { toast } = useToast()

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // ดึงข้อมูลผู้ใช้จาก auth.users
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError

      // ดึงข้อมูลโปรไฟล์จากตาราง profiles (ถ้ามี)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      // รวมข้อมูลจากทั้งสองแหล่ง
      const combinedProfile: Profile = {
        id: userData.user.id,
        email: userData.user.email || '',
        name: profileData?.name || userData.user.user_metadata?.name || '',
        phone: profileData?.phone || userData.user.user_metadata?.phone || '',
        address: profileData?.address || userData.user.user_metadata?.address || '',
        avatar_url: profileData?.avatar_url || userData.user.user_metadata?.avatar_url || null,
        points: profileData?.points || 0
      }

      setProfile(combinedProfile)
      setName(combinedProfile.name || '')
      setPhone(combinedProfile.phone || '')
      setAddress(combinedProfile.address || '')
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลโปรไฟล์ได้",
        variant: "destructive"
      })
    }
  }, [toast, setProfile, setName, setPhone, setAddress])

  const fetchOrders = useCallback(async (userId: string) => {
    try {
      // ดึงข้อมูลคำสั่งซื้อจากตาราง orders
      // หมายเหตุ: นี่เป็นเพียงข้อมูลตัวอย่าง ควรปรับให้ตรงกับโครงสร้างฐานข้อมูลจริง
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error

      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      // ใช้ข้อมูลตัวอย่างในกรณีที่ยังไม่มีตาราง orders
      setOrders([
        {
          id: 'ORD-001',
          created_at: '2023-10-15T10:30:00',
          status: 'สำเร็จ',
          total: 1250,
          items: 3
        },
        {
          id: 'ORD-002',
          created_at: '2023-09-28T14:15:00',
          status: 'สำเร็จ',
          total: 890,
          items: 2
        },
        {
          id: 'ORD-003',
          created_at: '2023-08-05T09:45:00',
          status: 'สำเร็จ',
          total: 1500,
          items: 4
        }
      ])
    }
  }, [setOrders])

  const checkUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth')
        return
      }

      fetchProfile(session.user.id)
      fetchOrders(session.user.id)
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/auth')
    } finally {
      setIsLoading(false)
    }
  }, [router, fetchProfile, fetchOrders, setIsLoading])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  async function handleUpdateProfile() {
    if (!profile) return

    setIsSaving(true)
    try {
      // อัปเดตข้อมูลในตาราง profiles (upsert - insert หากไม่มี, update หากมี)
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          name,
          phone,
          address,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // อัปเดตข้อมูลในโปรไฟล์ที่แสดงอยู่
      setProfile({
        ...profile,
        name,
        phone,
        address
      })

      toast({
        title: "บันทึกสำเร็จ",
        description: "ข้อมูลโปรไฟล์ของคุณถูกอัปเดตแล้ว",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตโปรไฟล์ได้",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถออกจากระบบได้",
        variant: "destructive"
      })
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'สำเร็จ':
        return 'bg-green-100 text-green-800'
      case 'กำลังดำเนินการ':
        return 'bg-blue-100 text-blue-800'
      case 'ยกเลิก':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  function getMembershipLevel(points: number) {
    if (points >= 1000) return { name: 'แพลทินัม', color: 'text-purple-600', bgColor: 'bg-purple-100', progress: 100 }
    if (points >= 500) return { name: 'ทอง', color: 'text-yellow-600', bgColor: 'bg-yellow-100', progress: 75 }
    if (points >= 100) return { name: 'เงิน', color: 'text-gray-500', bgColor: 'bg-gray-100', progress: 50 }
    return { name: 'ทั่วไป', color: 'text-blue-600', bgColor: 'bg-blue-100', progress: 25 }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50">
        <div className="p-8 rounded-2xl bg-white shadow-lg flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-lg font-medium text-gray-700">กำลังโหลดข้อมูลของคุณ...</p>
        </div>
      </div>
    )
  }

  const membershipInfo = getMembershipLevel(profile?.points || 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12">
      <div className="container max-w-6xl px-4 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">โปรไฟล์ของฉัน</h1>
          <p className="text-gray-500 mt-2">จัดการข้อมูลส่วนตัวและสิทธิประโยชน์ของคุณ</p>
        </motion.div>
      
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* ส่วนซ้าย - ข้อมูลโปรไฟล์ */}
          <div className="md:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="overflow-hidden border-none shadow-lg">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24 relative"></div>
                <CardContent className="pt-0">
                  <div className="flex flex-col items-center -mt-12">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                        {profile?.avatar_url ? (
                          <AvatarImage src={profile.avatar_url} alt={profile.name || 'User'} />
                        ) : (
                          <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <button 
                        className="absolute bottom-0 right-0 rounded-full bg-white p-1.5 shadow-md hover:bg-gray-100 transition-colors"
                        aria-label="อัพโหลดรูปประจำตัว"
                      >
                        <Camera className="h-4 w-4 text-blue-600" />
                      </button>
                    </div>
                    
                    <h2 className="text-xl font-bold mt-4">{profile?.name || 'ผู้ใช้'}</h2>
                    <p className="text-gray-500 text-sm mb-4">{profile?.email}</p>
                    
                    {/* แสดงคะแนนสะสมและระดับสมาชิก */}
                    <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="text-sm font-medium">ระดับสมาชิก</span>
                        </div>
                        <Badge className={`${membershipInfo.bgColor} ${membershipInfo.color} px-2 py-1`}>
                          {membershipInfo.name}
                        </Badge>
                      </div>
                      
                      <div className="flex items-baseline mb-2">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{profile?.points || 0}</span>
                        <span className="text-gray-600 ml-2 text-sm">คะแนน</span>
                      </div>
                      
                      <Progress value={membershipInfo.progress} className="h-2 bg-gray-200" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>500</span>
                        <span>1000+</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    <Button 
                      variant={activeTab === "profile" ? "default" : "outline"}
                      className={`w-full justify-start rounded-lg ${activeTab === "profile" ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" : ""}`}
                      onClick={() => setActiveTab("profile")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      ข้อมูลส่วนตัว
                    </Button>
                    
                    <Button 
                      variant={activeTab === "orders" ? "default" : "outline"}
                      className={`w-full justify-start rounded-lg ${activeTab === "orders" ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" : ""}`}
                      onClick={() => setActiveTab("orders")}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      ประวัติการสั่งซื้อ
                    </Button>
                    
                    <Button 
                      variant={activeTab === "points" ? "default" : "outline"}
                      className={`w-full justify-start rounded-lg ${activeTab === "points" ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" : ""}`}
                      onClick={() => setActiveTab("points")}
                    >
                      <Award className="mr-2 h-4 w-4" />
                      คะแนนสะสม
                    </Button>
                    
                    <Separator className="my-4" />
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start rounded-lg group hover:border-blue-400 transition-colors"
                      asChild
                    >
                      <Link href="/auth/update-password">
                        <Lock className="mr-2 h-4 w-4 group-hover:text-blue-600 transition-colors" />
                        เปลี่ยนรหัสผ่าน
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start rounded-lg text-red-500 hover:text-red-600 hover:border-red-200 transition-colors"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      ออกจากระบบ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:block"
            >
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">แจ้งเตือนล่าสุด</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Bell className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">การสั่งซื้อของคุณถูกจัดส่งแล้ว</p>
                      <p className="text-xs text-gray-500">2 ชั่วโมงที่แล้ว</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Gift className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">คุณได้รับ 25 คะแนนสะสม</p>
                      <p className="text-xs text-gray-500">1 วันที่แล้ว</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* ส่วนขวา - แท็บข้อมูลต่างๆ */}
          <div className="md:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {activeTab === "profile" && (
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">แก้ไขข้อมูลส่วนตัว</h2>
                    <p className="text-blue-100 text-sm">อัปเดตข้อมูลส่วนตัวของคุณ</p>
                  </div>
                  
                  <CardContent className="space-y-6 p-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">ชื่อ</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg transition-all"
                          placeholder="ชื่อของคุณ"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">อีเมล</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          value={profile?.email || ''}
                          disabled
                          className="pl-10 bg-gray-50 border-gray-200 text-gray-500 rounded-lg"
                        />
                      </div>
                      <p className="text-xs text-gray-500">ไม่สามารถเปลี่ยนอีเมลได้</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">เบอร์โทรศัพท์</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg transition-all"
                          placeholder="เบอร์โทรศัพท์ของคุณ"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium">ที่อยู่</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg transition-all"
                          placeholder="ที่อยู่ของคุณ"
                        />
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="bg-gray-50 px-6 py-4 flex justify-end">
                    <Button 
                      onClick={handleUpdateProfile} 
                      disabled={isSaving}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          กำลังบันทึก...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          บันทึกข้อมูล
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {activeTab === "orders" && (
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">ประวัติการสั่งซื้อ</h2>
                    <p className="text-blue-100 text-sm">รายการคำสั่งซื้อทั้งหมดของคุณ</p>
                  </div>
                  
                  <CardContent className="p-6">
                    {orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map((order, index) => (
                          <motion.div 
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="group"
                          >
                            <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="font-semibold text-gray-800">คำสั่งซื้อ #{order.id}</h3>
                                  <p className="text-sm text-gray-500 flex items-center mt-1">
                                    <Clock className="h-3 w-3 mr-1 inline" />
                                    {formatDate(order.created_at)}
                                  </p>
                                </div>
                                <Badge className={`${getStatusColor(order.status)} px-3 py-1 rounded-full`}>
                                  {order.status}
                                </Badge>
                              </div>
                              
                              <div className="flex justify-between items-center mt-3">
                                <div className="flex items-center">
                                  <ShoppingBag className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-600">{order.items} รายการ</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-gray-800 mr-4 group-hover:text-blue-600 transition-colors">{formatCurrency(order.total)}</span>
                                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 group-hover:bg-blue-50 transition-colors" asChild>
                                    <Link href={`/orders/${order.id}`}>
                                      <span className="flex items-center">
                                        ดูรายละเอียด
                                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                                      </span>
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 px-4">
                        <div className="bg-gray-50 rounded-full p-4 inline-flex mx-auto mb-4">
                          <ShoppingBag className="h-12 w-12 text-blue-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่มีประวัติการสั่งซื้อ</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">คุณยังไม่มีรายการสั่งซื้อใดๆ เริ่มต้นช้อปปิ้งเพื่อสะสมคะแนนและรับสิทธิพิเศษ</p>
                        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all" asChild>
                          <Link href="/products">
                            เริ่มช้อปปิ้ง
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "points" && (
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">คะแนนสะสม</h2>
                    <p className="text-blue-100 text-sm">คะแนนสะสมและสิทธิประโยชน์ของคุณ</p>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">คะแนนสะสมทั้งหมด</h3>
                        <Badge variant="outline" className="bg-white border-blue-200 flex items-center px-3 py-1">
                          <BadgeCheck className="h-4 w-4 text-blue-600 mr-2" />
                          สมาชิก{membershipInfo.name}
                        </Badge>
                      </div>
                      
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{profile?.points || 0}</span>
                        <span className="text-gray-600 ml-2">คะแนน</span>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>ระดับสมาชิก</span>
                          <span className={`font-semibold ${membershipInfo.color}`}>
                            {membershipInfo.name}
                          </span>
                        </div>
                        <Progress value={membershipInfo.progress} className="h-2 bg-white" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>ทั่วไป</span>
                          <span>เงิน</span>
                          <span>ทอง</span>
                          <span>แพลทินัม</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <h3 className="font-medium text-lg mb-3">ประวัติคะแนนสะสม</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center pb-3 border-b">
                            <div>
                              <p className="font-medium">สั่งซื้อสินค้า #ORD-001</p>
                              <p className="text-sm text-gray-500">15 ต.ค. 2023</p>
                            </div>
                            <span className="text-green-600 font-medium">+25 คะแนน</span>
                          </div>
                          
                          <div className="flex justify-between items-center pb-3 border-b">
                            <div>
                              <p className="font-medium">สั่งซื้อสินค้า #ORD-002</p>
                              <p className="text-sm text-gray-500">28 ก.ย. 2023</p>
                            </div>
                            <span className="text-green-600 font-medium">+18 คะแนน</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">แลกของรางวัล</p>
                              <p className="text-sm text-gray-500">10 ส.ค. 2023</p>
                            </div>
                            <span className="text-red-600 font-medium">-50 คะแนน</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
                        <h3 className="font-medium text-lg mb-3">สิทธิพิเศษของคุณ</h3>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
                          <h4 className="font-bold text-lg">ส่วนลด 10%</h4>
                          <p className="text-blue-100 mb-2">สำหรับการสั่งซื้อครั้งต่อไป</p>
                          <div className="flex justify-between items-center">
                            <Badge className="bg-white text-blue-600">สมาชิก{membershipInfo.name}</Badge>
                            <p className="text-sm">หมดอายุ: 31 ธ.ค. 2023</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 transition-colors">
                          ดูสิทธิพิเศษทั้งหมด
                        </Button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-4">ของรางวัลที่สามารถแลกได้</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all group">
                        <div className="flex items-center mb-3">
                          <div className="bg-blue-100 p-3 rounded-full mr-3 group-hover:bg-blue-200 transition-colors">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                          </div>
                          <h4 className="font-medium">ส่วนลด 50 บาท</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">แลกรับส่วนลด 50 บาท สำหรับการสั่งซื้อครั้งต่อไป</p>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">100 คะแนน</span>
                          <Button size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full px-4 transition-all">แลกรับ</Button>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all group">
                        <div className="flex items-center mb-3">
                          <div className="bg-blue-100 p-3 rounded-full mr-3 group-hover:bg-blue-200 transition-colors">
                            <ShoppingBag className="h-6 w-6 text-blue-600" />
                          </div>
                          <h4 className="font-medium">ส่งฟรี 1 ครั้ง</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">รับสิทธิ์จัดส่งฟรี 1 ครั้ง สำหรับการสั่งซื้อครั้งต่อไป</p>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">150 คะแนน</span>
                          <Button size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full px-4 transition-all">แลกรับ</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 