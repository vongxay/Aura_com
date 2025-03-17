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
import { Loader2, User, Mail, Phone, MapPin, Save, Award, Lock, ShoppingBag, Clock, CreditCard, ChevronRight, BadgeCheck } from "lucide-react"
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-500">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-10">
      <h1 className="text-3xl font-bold mb-6">โปรไฟล์ของฉัน</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ส่วนซ้าย - ข้อมูลโปรไฟล์ */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4 border-4 border-blue-100">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.name || 'User'} />
              ) : (
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            
            <h2 className="text-xl font-semibold">{profile?.name || 'ผู้ใช้'}</h2>
            <p className="text-gray-500 mb-2">{profile?.email}</p>
            
            {/* แสดงคะแนนสะสมแบบย่อ */}
            <div className="w-full bg-blue-50 rounded-lg p-3 mt-2 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium">คะแนนสะสม</span>
              </div>
              <span className="font-bold text-blue-600">{profile?.points || 0} คะแนน</span>
            </div>
            
            <div className="w-full space-y-2 mt-2">
              <Button 
                variant={activeTab === "profile" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("profile")}
              >
                <User className="mr-2 h-4 w-4" />
                ข้อมูลส่วนตัว
              </Button>
              
              <Button 
                variant={activeTab === "orders" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("orders")}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                ประวัติการสั่งซื้อ
              </Button>
              
              <Button 
                variant={activeTab === "points" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("points")}
              >
                <Award className="mr-2 h-4 w-4" />
                คะแนนสะสม
              </Button>
              
              <Separator className="my-2" />
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                asChild
              >
                <Link href="/auth/update-password">
                  <Lock className="mr-2 h-4 w-4" />
                  เปลี่ยนรหัสผ่าน
                </Link>
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full mt-4"
                onClick={handleSignOut}
              >
                ออกจากระบบ
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* ส่วนขวา - แท็บข้อมูลต่างๆ */}
        <div className="md:col-span-3">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>แก้ไขข้อมูลส่วนตัว</CardTitle>
                <CardDescription>อัปเดตข้อมูลส่วนตัวของคุณ</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อ</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      placeholder="ชื่อของคุณ"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      value={profile?.email || ''}
                      disabled
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">ไม่สามารถเปลี่ยนอีเมลได้</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      placeholder="เบอร์โทรศัพท์ของคุณ"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">ที่อยู่</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10"
                      placeholder="ที่อยู่ของคุณ"
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={isSaving}
                  className="ml-auto"
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === "orders" && (
            <Card>
              <CardHeader>
                <CardTitle>ประวัติการสั่งซื้อ</CardTitle>
                <CardDescription>รายการคำสั่งซื้อทั้งหมดของคุณ</CardDescription>
              </CardHeader>
              
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">คำสั่งซื้อ #{order.id}</h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center">
                            <ShoppingBag className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-600">{order.items} รายการ</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium mr-4">{formatCurrency(order.total)}</span>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/orders/${order.id}`}>
                                <span className="flex items-center">
                                  ดูรายละเอียด
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </span>
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">ไม่มีประวัติการสั่งซื้อ</h3>
                    <p className="text-gray-500 mt-1">คุณยังไม่มีรายการสั่งซื้อใดๆ</p>
                    <Button className="mt-4" asChild>
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
            <Card>
              <CardHeader>
                <CardTitle>คะแนนสะสม</CardTitle>
                <CardDescription>คะแนนสะสมและสิทธิประโยชน์ของคุณ</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">คะแนนสะสมทั้งหมด</h3>
                    <Badge variant="outline" className="bg-white">
                      <BadgeCheck className="h-4 w-4 text-blue-600 mr-1" />
                      สมาชิก
                    </Badge>
                  </div>
                  
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-blue-600">{profile?.points || 0}</span>
                    <span className="text-gray-600 ml-2">คะแนน</span>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>ระดับสมาชิก</span>
                      <span className="font-medium">
                        {(profile?.points || 0) < 100 ? 'ทั่วไป' : 
                         (profile?.points || 0) < 500 ? 'เงิน' : 
                         (profile?.points || 0) < 1000 ? 'ทอง' : 'แพลทินัม'}
                      </span>
                    </div>
                    <Progress value={(profile?.points || 0) % 500 / 5} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>500 คะแนน</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-medium mb-3">ประวัติคะแนนสะสม</h3>
                <div className="space-y-3">
                  <div className="border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">สั่งซื้อสินค้า #ORD-001</p>
                      <p className="text-sm text-gray-500">15 ต.ค. 2023</p>
                    </div>
                    <span className="text-green-600 font-medium">+25 คะแนน</span>
                  </div>
                  
                  <div className="border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">สั่งซื้อสินค้า #ORD-002</p>
                      <p className="text-sm text-gray-500">28 ก.ย. 2023</p>
                    </div>
                    <span className="text-green-600 font-medium">+18 คะแนน</span>
                  </div>
                  
                  <div className="border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">แลกของรางวัล</p>
                      <p className="text-sm text-gray-500">10 ส.ค. 2023</p>
                    </div>
                    <span className="text-red-600 font-medium">-50 คะแนน</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-3">สิทธิประโยชน์ที่คุณจะได้รับ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-medium">ส่วนลด 50 บาท</h4>
                      </div>
                      <p className="text-sm text-gray-600">แลกรับส่วนลด 50 บาท สำหรับการสั่งซื้อครั้งต่อไป</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-sm font-medium">100 คะแนน</span>
                        <Button size="sm" variant="outline">แลกรับ</Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <ShoppingBag className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-medium">ส่งฟรี 1 ครั้ง</h4>
                      </div>
                      <p className="text-sm text-gray-600">รับสิทธิ์จัดส่งฟรี 1 ครั้ง สำหรับการสั่งซื้อครั้งต่อไป</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-sm font-medium">150 คะแนน</span>
                        <Button size="sm" variant="outline">แลกรับ</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 