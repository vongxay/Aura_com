"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { 
  Search, 
  Filter, 
  RefreshCcw, 
  Eye, 
  Calendar, 
  UserCircle2, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Star, 
  Clock,
  ArrowUpRight,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Customer {
  id: string
  created_at: string
  full_name: string
  email: string
  phone: string
  address: string | null
  avatar_url: string | null
  total_orders: number
  total_spent: number
  points: number
  membership_level: string
  last_purchase: string | null
}

export default function CustomersAdminPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [membershipFilter, setMembershipFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchQuery, membershipFilter, activeTab])

  const filterCustomers = () => {
    let filtered = customers.filter(customer => {
      const matchesSearch = customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (customer.phone && customer.phone.includes(searchQuery));
      
      const matchesMembership = membershipFilter === 'all' || customer.membership_level === membershipFilter;
      
      if (activeTab === 'all') return matchesSearch && matchesMembership;
      if (activeTab === 'new') {
        // ลูกค้าใหม่ (สมัครภายใน 30 วัน)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return matchesSearch && matchesMembership && new Date(customer.created_at) >= thirtyDaysAgo;
      }
      if (activeTab === 'loyal') {
        // ลูกค้าประจำ (สั่งซื้อมากกว่า 5 ครั้ง)
        return matchesSearch && matchesMembership && customer.total_orders >= 5;
      }
      if (activeTab === 'inactive') {
        // ลูกค้าไม่มีการซื้อสินค้ามานาน
        if (!customer.last_purchase) return matchesSearch && matchesMembership;
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        return matchesSearch && matchesMembership && new Date(customer.last_purchase) < ninetyDaysAgo;
      }
      
      return matchesSearch && matchesMembership;
    });
    
    setFilteredCustomers(filtered);
  };

  async function fetchCustomers() {
    setLoading(true)
    
    try {
      // สมมติว่าเราต้องการดึงข้อมูลรายละเอียดลูกค้าจากตาราง profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          orders:orders(count),
          total_spent:orders(sum)
        `)
        .order('created_at', { ascending: false })
      
      if (profilesError) throw profilesError
      
      // จัดรูปแบบข้อมูลก่อนใส่ใน state
      const formattedCustomers = profilesData.map(profile => {
        const totalOrders = profile.orders[0]?.count || 0
        const totalSpent = profile.total_spent[0]?.sum || 0
        
        // กำหนดระดับสมาชิกตามจำนวนเงินที่ใช้จ่าย
        let membershipLevel = 'ปกติ'
        if (totalSpent >= 30000) membershipLevel = 'แพลทินัม'
        else if (totalSpent >= 10000) membershipLevel = 'โกลด์'
        else if (totalSpent >= 5000) membershipLevel = 'ซิลเวอร์'
        
        // คำนวณคะแนนสะสม (สมมติว่าได้ 1 คะแนนต่อการซื้อ 100 บาท)
        const points = Math.floor(totalSpent / 100)
        
        return {
          id: profile.id,
          created_at: profile.created_at,
          full_name: profile.full_name || 'ไม่ระบุชื่อ',
          email: profile.email,
          phone: profile.phone || 'ไม่ระบุเบอร์โทร',
          address: profile.address || null,
          avatar_url: profile.avatar_url || null,
          total_orders: totalOrders,
          total_spent: totalSpent,
          points: points,
          membership_level: membershipLevel,
          last_purchase: profile.last_purchase_date || null
        }
      })
      
      setCustomers(formattedCustomers)
      setFilteredCustomers(formattedCustomers)
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลลูกค้าได้",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  async function fetchCustomerOrders(customerId: string) {
    setLoadingOrders(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(
            id,
            product_id,
            quantity,
            price,
            product:products(name, image_url)
          )
        `)
        .eq('user_id', customerId)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (error) throw error
      
      setCustomerOrders(data || [])
    } catch (error) {
      console.error('Error fetching customer orders:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลคำสั่งซื้อของลูกค้าได้",
        variant: "destructive"
      })
    } finally {
      setLoadingOrders(false)
    }
  }
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
    return new Date(dateString).toLocaleDateString('th-TH', options)
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
  }
  
  const getMembershipBadge = (level: string) => {
    switch (level) {
      case 'แพลทินัม':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">แพลทินัม</Badge>
      case 'โกลด์':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">โกลด์</Badge>
      case 'ซิลเวอร์':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">ซิลเวอร์</Badge>
      default:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">ปกติ</Badge>
    }
  }

  // คำนวณสถิติสำหรับแสดงในแดชบอร์ด
  const totalCustomers = customers.length
  const newCustomers = customers.filter(customer => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return new Date(customer.created_at) >= thirtyDaysAgo
  }).length
  const loyalCustomers = customers.filter(customer => customer.total_orders >= 5).length
  const inactiveCustomers = customers.filter(customer => {
    if (!customer.last_purchase) return true
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    return new Date(customer.last_purchase) < ninetyDaysAgo
  }).length

  const handleViewCustomer = async (customer: Customer) => {
    setViewCustomer(customer)
    fetchCustomerOrders(customer.id)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">จัดการลูกค้า</h1>
          <p className="text-muted-foreground">ดูและจัดการข้อมูลลูกค้าทั้งหมดในระบบ</p>
        </div>
        <Button variant="outline" onClick={fetchCustomers} disabled={loading}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          รีเฟรช
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกค้าทั้งหมด</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-800">
              <Users className="h-4 w-4 text-blue-700 dark:text-blue-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground pt-1">จำนวนลูกค้าทั้งหมดในระบบ</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกค้าใหม่</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-800">
              <ArrowUpRight className="h-4 w-4 text-green-700 dark:text-green-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newCustomers}</div>
            <p className="text-xs text-muted-foreground pt-1">ลูกค้าใหม่ใน 30 วันที่ผ่านมา</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกค้าประจำ</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center dark:bg-amber-800">
              <Star className="h-4 w-4 text-amber-700 dark:text-amber-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyalCustomers}</div>
            <p className="text-xs text-muted-foreground pt-1">ลูกค้าที่มีคำสั่งซื้อมากกว่า 5 ครั้ง</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกค้าไม่มีการเคลื่อนไหว</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-800">
              <Clock className="h-4 w-4 text-red-700 dark:text-red-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveCustomers}</div>
            <p className="text-xs text-muted-foreground pt-1">ไม่มีการซื้อใน 90 วันที่ผ่านมา</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ค้นหาตามชื่อลูกค้า, อีเมล, หรือเบอร์โทร..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={membershipFilter} onValueChange={setMembershipFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ระดับสมาชิก" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกระดับ</SelectItem>
            <SelectItem value="แพลทินัม">แพลทินัม</SelectItem>
            <SelectItem value="โกลด์">โกลด์</SelectItem>
            <SelectItem value="ซิลเวอร์">ซิลเวอร์</SelectItem>
            <SelectItem value="ปกติ">ปกติ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
          <TabsTrigger value="new">ลูกค้าใหม่</TabsTrigger>
          <TabsTrigger value="loyal">ลูกค้าประจำ</TabsTrigger>
          <TabsTrigger value="inactive">ไม่มีการเคลื่อนไหว</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card className="border-none shadow-md">
            <CardHeader className="px-6 py-4">
              <CardTitle>รายชื่อลูกค้า ({filteredCustomers.length})</CardTitle>
              <CardDescription>รายชื่อลูกค้าทั้งหมดในระบบที่ตรงกับเงื่อนไขที่เลือก</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">ไม่พบลูกค้าที่ตรงกับเงื่อนไขที่เลือก</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">โปรไฟล์</TableHead>
                      <TableHead className="w-[200px]">ชื่อลูกค้า</TableHead>
                      <TableHead>อีเมล/เบอร์โทร</TableHead>
                      <TableHead>วันที่สมัคร</TableHead>
                      <TableHead>คำสั่งซื้อ</TableHead>
                      <TableHead>ยอดใช้จ่าย</TableHead>
                      <TableHead>คะแนนสะสม</TableHead>
                      <TableHead>ระดับสมาชิก</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <Avatar>
                            <AvatarImage src={customer.avatar_url || ""} alt={customer.full_name} />
                            <AvatarFallback className="bg-[#00BFB3] text-white">
                              {customer.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{customer.full_name}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{customer.email}</p>
                            <p className="text-xs text-muted-foreground">{customer.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(customer.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {customer.total_orders} รายการ
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(customer.total_spent)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {customer.points} คะแนน
                          </Badge>
                        </TableCell>
                        <TableCell>{getMembershipBadge(customer.membership_level)}</TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleViewCustomer(customer)}>
                                <Eye className="h-4 w-4 mr-1" />
                                ดูข้อมูล
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>ข้อมูลลูกค้า</DialogTitle>
                                <DialogDescription>
                                  รายละเอียดและประวัติการสั่งซื้อของลูกค้า
                                </DialogDescription>
                              </DialogHeader>
                              
                              {viewCustomer && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                  {/* ข้อมูลลูกค้า */}
                                  <Card className="md:col-span-1 border-none shadow-sm">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-lg">ข้อมูลส่วนตัว</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div className="flex flex-col items-center mb-4">
                                        <Avatar className="h-20 w-20 mb-3">
                                          <AvatarImage src={viewCustomer.avatar_url || ""} alt={viewCustomer.full_name} />
                                          <AvatarFallback className="bg-[#00BFB3] text-white text-xl">
                                            {viewCustomer.full_name.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <h3 className="font-bold text-lg">{viewCustomer.full_name}</h3>
                                        <p className="text-sm text-muted-foreground">{getMembershipBadge(viewCustomer.membership_level)}</p>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        <div className="flex items-start">
                                          <Mail className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                          <div>
                                            <p className="text-sm font-medium">อีเมล</p>
                                            <p className="text-sm">{viewCustomer.email}</p>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-start">
                                          <Phone className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                          <div>
                                            <p className="text-sm font-medium">เบอร์โทร</p>
                                            <p className="text-sm">{viewCustomer.phone}</p>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-start">
                                          <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                          <div>
                                            <p className="text-sm font-medium">ที่อยู่</p>
                                            <p className="text-sm">{viewCustomer.address || 'ไม่มีข้อมูล'}</p>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-start">
                                          <Calendar className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                          <div>
                                            <p className="text-sm font-medium">วันที่สมัคร</p>
                                            <p className="text-sm">{formatDate(viewCustomer.created_at)}</p>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-start">
                                          <ShoppingBag className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                          <div>
                                            <p className="text-sm font-medium">การซื้อล่าสุด</p>
                                            <p className="text-sm">{viewCustomer.last_purchase ? formatDate(viewCustomer.last_purchase) : 'ไม่มีข้อมูล'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  
                                  {/* สถิติและประวัติการสั่งซื้อ */}
                                  <Card className="md:col-span-2 border-none shadow-sm">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-lg">สถิติและประวัติการสั่งซื้อ</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                      {/* สถิติลูกค้า */}
                                      <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                          <p className="text-xs text-muted-foreground">ยอดคำสั่งซื้อทั้งหมด</p>
                                          <h3 className="text-2xl font-bold">{viewCustomer.total_orders}</h3>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                          <p className="text-xs text-muted-foreground">ยอดใช้จ่ายรวม</p>
                                          <h3 className="text-2xl font-bold">{formatCurrency(viewCustomer.total_spent)}</h3>
                                        </div>
                                        <div className="bg-amber-50 p-4 rounded-lg">
                                          <p className="text-xs text-muted-foreground">คะแนนสะสม</p>
                                          <h3 className="text-2xl font-bold">{viewCustomer.points}</h3>
                                        </div>
                                      </div>
                                      
                                      {/* ความก้าวหน้าระดับสมาชิก */}
                                      <div>
                                        <div className="flex justify-between mb-1">
                                          <h4 className="text-sm font-medium">ความก้าวหน้าระดับสมาชิก</h4>
                                          <span className="text-xs text-muted-foreground">
                                            {viewCustomer.membership_level === 'แพลทินัม' ? 'ระดับสูงสุดแล้ว' : 
                                             viewCustomer.membership_level === 'โกลด์' ? 
                                             `${formatCurrency(viewCustomer.total_spent)}/฿30,000 (ระดับถัดไป: แพลทินัม)` :
                                             viewCustomer.membership_level === 'ซิลเวอร์' ? 
                                             `${formatCurrency(viewCustomer.total_spent)}/฿10,000 (ระดับถัดไป: โกลด์)` :
                                             `${formatCurrency(viewCustomer.total_spent)}/฿5,000 (ระดับถัดไป: ซิลเวอร์)`}
                                          </span>
                                        </div>
                                        <Progress 
                                          value={
                                            viewCustomer.membership_level === 'แพลทินัม' ? 100 : 
                                            viewCustomer.membership_level === 'โกลด์' ? 
                                            (viewCustomer.total_spent / 30000) * 100 :
                                            viewCustomer.membership_level === 'ซิลเวอร์' ? 
                                            (viewCustomer.total_spent / 10000) * 100 :
                                            (viewCustomer.total_spent / 5000) * 100
                                          } 
                                          className="h-2"
                                        />
                                      </div>
                                      
                                      {/* ประวัติการสั่งซื้อ */}
                                      <div>
                                        <h4 className="text-sm font-medium mb-3">ประวัติการสั่งซื้อล่าสุด</h4>
                                        {loadingOrders ? (
                                          <p className="text-sm text-center py-4">กำลังโหลดข้อมูล...</p>
                                        ) : customerOrders.length === 0 ? (
                                          <p className="text-sm text-center py-4">ไม่มีประวัติการสั่งซื้อ</p>
                                        ) : (
                                          <div className="space-y-3">
                                            {customerOrders.map((order) => (
                                              <div key={order.id} className="border rounded-lg p-3">
                                                <div className="flex justify-between mb-2">
                                                  <div>
                                                    <h5 className="font-medium">คำสั่งซื้อ #{order.id.substring(0, 8)}</h5>
                                                    <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                                                  </div>
                                                  <Badge variant={
                                                    order.status === "completed" ? "default" : 
                                                    order.status === "processing" ? "secondary" : 
                                                    "outline"
                                                  }
                                                  className={
                                                    order.status === "completed" ? "bg-green-100 text-green-800" : 
                                                    order.status === "processing" ? "bg-blue-100 text-blue-800" : 
                                                    "bg-amber-100 text-amber-800"
                                                  }>
                                                    {order.status === "completed" ? "เสร็จสิ้น" : 
                                                     order.status === "processing" ? "กำลังดำเนินการ" : 
                                                     "รอดำเนินการ"}
                                                  </Badge>
                                                </div>
                                                
                                                <div className="mt-2 space-y-1">
                                                  {order.order_items.map((item: any) => (
                                                    <div key={item.id} className="flex items-center text-sm">
                                                      <span className="text-muted-foreground mr-2">•</span>
                                                      <span>{item.quantity} x {item.product?.name || 'สินค้า'}</span>
                                                      <span className="ml-auto font-medium">{formatCurrency(item.price * item.quantity)}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                                
                                                <div className="flex justify-between mt-3 pt-2 border-t">
                                                  <span className="text-sm">รวมทั้งสิ้น</span>
                                                  <span className="text-sm font-bold">{formatCurrency(order.total_amount)}</span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        
                                        {customerOrders.length > 0 && (
                                          <div className="text-center mt-3">
                                            <Link href={`/admin/customers/${viewCustomer.id}`}>
                                              <Button variant="outline" size="sm">
                                                ดูประวัติทั้งหมด
                                              </Button>
                                            </Link>
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                              
                              <DialogFooter>
                                <Link href={`/admin/customers/${viewCustomer?.id}`}>
                                  <Button variant="outline">ดูรายละเอียดเพิ่มเติม</Button>
                                </Link>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between p-6 border-t">
              <div className="text-sm text-muted-foreground">
                กำลังแสดง {filteredCustomers.length} จาก {customers.length} รายการ
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 