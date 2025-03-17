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
import { useToast } from "@/hooks/use-toast"
import { Eye, CheckCircle, XCircle, Search, Filter, RefreshCcw, TrendingUp, AlertCircle, Clock, CreditCard } from 'lucide-react'
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
import { Separator } from "@/components/ui/separator"

interface Order {
  id: string
  created_at: string
  status: string
  payment_status: string
  total_amount: number
  full_name: string
  payment_method: string
  user: {
    email: string
  }
}

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter, paymentFilter, activeTab])

  const filterOrders = () => {
    let filtered = orders.filter(order => {
      const matchesSearch = order.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (order.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
      
      if (activeTab === 'all') return matchesSearch && matchesStatus && matchesPayment;
      if (activeTab === 'pending') return matchesSearch && order.status === 'pending';
      if (activeTab === 'processing') return matchesSearch && order.status === 'processing';
      if (activeTab === 'completed') return matchesSearch && order.status === 'completed';
      if (activeTab === 'cancelled') return matchesSearch && order.status === 'cancelled';
      
      return matchesSearch && matchesStatus && matchesPayment;
    });
    
    setFilteredOrders(filtered);
  };

  async function fetchOrders() {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:user_id (
          email
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลคำสั่งซื้อได้",
        variant: "destructive"
      })
      setLoading(false)
      return
    }
    
    setOrders(data)
    setFilteredOrders(data)
    setLoading(false)
  }
  
  async function updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
    
    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้",
        variant: "destructive"
      })
      return
    }
    
    // Update local state
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    )
    
    toast({
      title: "อัปเดตสำเร็จ",
      description: `สถานะคำสั่งซื้อถูกเปลี่ยนเป็น "${status}" แล้ว`
    })
  }
  
  async function updatePaymentStatus(orderId: string, paymentStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId)
    
    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะการชำระเงินได้",
        variant: "destructive"
      })
      return
    }
    
    // Update local state
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, payment_status: paymentStatus } : order
      )
    )
    
    toast({
      title: "อัปเดตสำเร็จ",
      description: `สถานะการชำระเงินถูกเปลี่ยนเป็น "${paymentStatus}" แล้ว`
    })
  }
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('th-TH', options)
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">รอดำเนินการ</Badge>
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">กำลังดำเนินการ</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">เสร็จสิ้น</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">ยกเลิก</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">ชำระแล้ว</Badge>
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">รอชำระ</Badge>
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">ล้มเหลว</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculate dashboard statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const totalRevenue = orders
    .filter(order => order.payment_status === 'paid')
    .reduce((sum, order) => sum + order.total_amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">จัดการคำสั่งซื้อ</h1>
          <p className="text-muted-foreground">ดูและจัดการคำสั่งซื้อทั้งหมดในระบบ</p>
        </div>
        <Button variant="outline" onClick={fetchOrders} disabled={loading}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          รีเฟรช
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คำสั่งซื้อทั้งหมด</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-800">
              <CreditCard className="h-4 w-4 text-blue-700 dark:text-blue-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground pt-1">คำสั่งซื้อทั้งหมดในระบบ</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รอดำเนินการ</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center dark:bg-amber-800">
              <Clock className="h-4 w-4 text-amber-700 dark:text-amber-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground pt-1">คำสั่งซื้อที่รอดำเนินการ</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เสร็จสิ้น</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-800">
              <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
            <p className="text-xs text-muted-foreground pt-1">คำสั่งซื้อที่เสร็จสิ้นแล้ว</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายได้ทั้งหมด</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-800">
              <TrendingUp className="h-4 w-4 text-purple-700 dark:text-purple-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground pt-1">จากคำสั่งซื้อที่ชำระแล้ว</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ค้นหาตามชื่อลูกค้า, อีเมล, หรือรหัสคำสั่งซื้อ..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="สถานะคำสั่งซื้อ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกสถานะ</SelectItem>
            <SelectItem value="pending">รอดำเนินการ</SelectItem>
            <SelectItem value="processing">กำลังดำเนินการ</SelectItem>
            <SelectItem value="completed">เสร็จสิ้น</SelectItem>
            <SelectItem value="cancelled">ยกเลิก</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="สถานะการชำระเงิน" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกสถานะ</SelectItem>
            <SelectItem value="paid">ชำระแล้ว</SelectItem>
            <SelectItem value="pending">รอชำระ</SelectItem>
            <SelectItem value="failed">ล้มเหลว</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
          <TabsTrigger value="pending">รอดำเนินการ</TabsTrigger>
          <TabsTrigger value="processing">กำลังดำเนินการ</TabsTrigger>
          <TabsTrigger value="completed">เสร็จสิ้น</TabsTrigger>
          <TabsTrigger value="cancelled">ยกเลิก</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card className="border-none shadow-md">
            <CardHeader className="px-6 py-4">
              <CardTitle>รายการคำสั่งซื้อ ({filteredOrders.length})</CardTitle>
              <CardDescription>รายการคำสั่งซื้อทั้งหมดในระบบที่ตรงกับเงื่อนไขที่เลือก</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-10 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไขที่เลือก</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">รหัสคำสั่งซื้อ</TableHead>
                      <TableHead className="w-[200px]">วันที่</TableHead>
                      <TableHead className="w-[200px]">ลูกค้า</TableHead>
                      <TableHead>จำนวนเงิน</TableHead>
                      <TableHead>วิธีชำระเงิน</TableHead>
                      <TableHead>สถานะการชำระเงิน</TableHead>
                      <TableHead>สถานะคำสั่งซื้อ</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.full_name}</p>
                            <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(order.total_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.payment_method}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 p-0">
                                {getPaymentStatusBadge(order.payment_status)}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>เปลี่ยนสถานะการชำระเงิน</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => updatePaymentStatus(order.id, 'paid')}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span>ชำระแล้ว</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updatePaymentStatus(order.id, 'pending')}>
                                <Clock className="mr-2 h-4 w-4 text-amber-500" />
                                <span>รอชำระ</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updatePaymentStatus(order.id, 'failed')}>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                <span>ล้มเหลว</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 p-0">
                                {getStatusBadge(order.status)}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>เปลี่ยนสถานะคำสั่งซื้อ</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'pending')}>
                                <Clock className="mr-2 h-4 w-4 text-amber-500" />
                                <span>รอดำเนินการ</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'processing')}>
                                <RefreshCcw className="mr-2 h-4 w-4 text-blue-500" />
                                <span>กำลังดำเนินการ</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'completed')}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span>เสร็จสิ้น</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                <span>ยกเลิก</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              ดูรายละเอียด
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between p-6 border-t">
              <div className="text-sm text-muted-foreground">
                กำลังแสดง {filteredOrders.length} จาก {orders.length} รายการ
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 