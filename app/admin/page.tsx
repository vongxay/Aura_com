"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { 
  BarChart3, Package, ShoppingCart, Users, TrendingUp, Calendar, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Maximize2, Search, Bell, 
  ShoppingBag, Globe, ChevronDown, User, Settings, Wallet, BarChart,
  DollarSign, CreditCard, TrendingDown, Activity, Zap, Award, Heart
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Link from "next/link"

export default function AdminDashboard() {
  const [progress1, setProgress1] = useState(13)
  const [progress2, setProgress2] = useState(33)
  const [progress3, setProgress3] = useState(78)
  
  // สำหรับ animate การโหลด
  useEffect(() => {
    const timer = setTimeout(() => setProgress1(65), 500)
    const timer2 = setTimeout(() => setProgress2(87), 700)
    const timer3 = setTimeout(() => setProgress3(93), 900)
    return () => {
      clearTimeout(timer)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FA] to-[#f0f4f8]">
      {/* Header Bar */}
      <header className="h-[60px] border-b bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="ค้นหา..." 
              className="pl-10 w-[240px] h-9 rounded-full border-[#e0e0e0] focus:ring-2 focus:ring-[#00BFB3] focus:ring-opacity-50 transition-all" 
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center text-[#6C757D] hover:bg-[#F8F9FA] transition-colors">
                <Globe className="h-4 w-4 mr-1" />
                <span>ไทย</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-in fade-in-80 zoom-in-95">
              <DropdownMenuItem>ไทย</DropdownMenuItem>
              <DropdownMenuItem>English</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon" className="relative hover:bg-[#F8F9FA] transition-colors">
            <Bell className="h-5 w-5 text-[#6C757D]" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-[#FF4B77] to-[#FF8C69] animate-pulse">
              3
            </Badge>
          </Button>
          
          <Button variant="ghost" size="icon" className="relative hover:bg-[#F8F9FA] transition-colors">
            <ShoppingBag className="h-5 w-5 text-[#6C757D]" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-[#FF4B77] to-[#FF8C69]">
              2
            </Badge>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 h-9 px-2 hover:bg-[#F8F9FA] transition-colors">
                <Avatar className="h-8 w-8 ring-2 ring-[#00BFB3] ring-offset-2 ring-offset-white">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-gradient-to-r from-[#00BFB3] to-[#00a79c] text-white">AD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">แอดมิน</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 animate-in fade-in-80 zoom-in-95">
              <DropdownMenuItem className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>โปรไฟล์</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>ตั้งค่า</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <div className="container mx-auto px-8 max-w-[1200px] py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#2D3250] mb-1">แดชบอร์ด</h1>
            <p className="text-[#6C757D]">ยินดีต้อนรับกลับ! ภาพรวมร้านค้าของคุณสำหรับเดือนนี้</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="shadow-sm hover:shadow transition-all">
              <Calendar className="mr-2 h-4 w-4" />
              เดือนนี้
            </Button>
            <Button size="sm" className="bg-[#00BFB3] hover:bg-[#00a79c] shadow-md hover:shadow-lg transition-all">
              <BarChart className="mr-2 h-4 w-4" />
              ดูรายงาน
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-none rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-[#f5fdfc]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สินค้า</CardTitle>
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-[#00BFB3] to-[#00a79c] flex items-center justify-center shadow-md">
                <Package className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2D3250]">246</div>
              <div className="flex items-center pt-1">
                <ArrowUpRight className="h-4 w-4 text-[#00BFB3] mr-1" />
                <p className="text-xs text-[#00BFB3] font-medium">+4 จากสัปดาห์ที่แล้ว</p>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">เป้าหมาย</span>
                  <span className="font-medium">250</span>
                </div>
                <Progress value={progress1} className="h-1.5 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-[#00BFB3] [&>div]:to-[#00a79c]" />
              </div>
              <div className="mt-4">
                <Link href="/admin/products">
                  <Button variant="outline" size="sm" className="w-full bg-white hover:bg-[#f5fdfc]">
                    <Package className="h-4 w-4 mr-2 text-[#00BFB3]" />
                    จัดการสินค้า
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-[#fcf5fa]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ผู้ใช้ใหม่</CardTitle>
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-[#FF4B77] to-[#FF6C92] flex items-center justify-center shadow-md">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2D3250]">2,350</div>
              <div className="flex items-center pt-1">
                <ArrowUpRight className="h-4 w-4 text-[#FF4B77] mr-1" />
                <p className="text-xs text-[#FF4B77] font-medium">+180 จากเดือนที่แล้ว</p>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">เป้าหมาย</span>
                  <span className="font-medium">2,500</span>
                </div>
                <Progress value={progress2} className="h-1.5 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-[#FF4B77] [&>div]:to-[#FF6C92]" />
              </div>
              <div className="mt-4">
                <Link href="/admin/customers">
                  <Button variant="outline" size="sm" className="w-full bg-white hover:bg-[#fcf5fa]">
                    <Users className="h-4 w-4 mr-2 text-[#FF4B77]" />
                    จัดการลูกค้า
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-[#faf8f5]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คำสั่งซื้อใหม่</CardTitle>
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-[#FF8C69] to-[#FFA47E] flex items-center justify-center shadow-md">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2D3250]">573</div>
              <div className="flex items-center pt-1">
                <ArrowUpRight className="h-4 w-4 text-[#FF8C69] mr-1" />
                <p className="text-xs text-[#FF8C69] font-medium">+201 จากสัปดาห์ที่แล้ว</p>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">เป้าหมาย</span>
                  <span className="font-medium">600</span>
                </div>
                <Progress value={progress3} className="h-1.5 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-[#FF8C69] [&>div]:to-[#FFA47E]" />
              </div>
              <div className="mt-4">
                <Link href="/admin/orders">
                  <Button variant="outline" size="sm" className="w-full bg-white hover:bg-[#faf8f5]">
                    <ShoppingCart className="h-4 w-4 mr-2 text-[#FF8C69]" />
                    จัดการคำสั่งซื้อ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-[#f5f9fd]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้ทั้งหมด</CardTitle>
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8687FC] flex items-center justify-center shadow-md">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2D3250]">฿45,231.89</div>
              <div className="flex items-center pt-1">
                <ArrowUpRight className="h-4 w-4 text-[#6366F1] mr-1" />
                <p className="text-xs text-[#6366F1] font-medium">+20.1% จากเดือนที่แล้ว</p>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">เป้าหมาย</span>
                  <span className="font-medium">฿50,000</span>
                </div>
                <Progress value={87} className="h-1.5 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-[#6366F1] [&>div]:to-[#8687FC]" />
              </div>
              <div className="mt-4">
                <Link href="/admin/analytics">
                  <Button variant="outline" size="sm" className="w-full bg-white hover:bg-[#f5f9fd]">
                    <BarChart className="h-4 w-4 mr-2 text-[#6366F1]" />
                    ดูรายงานรายได้
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Performance Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-[#00BFB3]/10 to-white">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-[#00BFB3]/20 flex items-center justify-center mb-3">
                <TrendingUp className="h-6 w-6 text-[#00BFB3]" />
              </div>
              <h3 className="font-bold text-lg mb-1">เติบโต 32%</h3>
              <p className="text-sm text-gray-500">การเติบโตของยอดขายเมื่อเทียบกับไตรมาสที่แล้ว</p>
            </CardContent>
          </Card>
          
          <Card className="border-none rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-[#FF4B77]/10 to-white">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-[#FF4B77]/20 flex items-center justify-center mb-3">
                <Heart className="h-6 w-6 text-[#FF4B77]" />
              </div>
              <h3 className="font-bold text-lg mb-1">ความพึงพอใจ 94%</h3>
              <p className="text-sm text-gray-500">อัตราความพึงพอใจของลูกค้าในเดือนนี้</p>
            </CardContent>
          </Card>
          
          <Card className="border-none rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-[#6366F1]/10 to-white">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-[#6366F1]/20 flex items-center justify-center mb-3">
                <Zap className="h-6 w-6 text-[#6366F1]" />
              </div>
              <h3 className="font-bold text-lg mb-1">67% ซื้อซ้ำ</h3>
              <p className="text-sm text-gray-500">อัตราการกลับมาซื้อซ้ำของลูกค้าประจำ</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Sales Chart */}
            <Card className="border-none rounded-xl shadow-md hover:shadow-lg transition-all mb-6 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-5">
                <div>
                  <CardTitle className="text-lg font-bold">ยอดขายสินค้า</CardTitle>
                  <CardDescription>แนวโน้มยอดขายรายเดือน</CardDescription>
                </div>
                <Tabs defaultValue="monthly" className="w-[220px]">
                  <TabsList className="grid w-full grid-cols-3 bg-[#F8F9FA]">
                    <TabsTrigger value="weekly">สัปดาห์</TabsTrigger>
                    <TabsTrigger value="monthly">เดือน</TabsTrigger>
                    <TabsTrigger value="yearly">ปี</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="p-6">
                {/* Chart Visualization */}
                <div className="h-[300px] relative">
                  <div className="absolute inset-0 px-2 flex items-end">
                    {['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'].map((month, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                        <div className="relative w-[80%] max-w-[50px]">
                          <div className="absolute bottom-0 left-0 right-0 bg-[#E1F9F7] rounded-t-sm" 
                               style={{ height: `${Math.floor(60 + Math.random() * 130)}px` }} />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#00BFB3] to-[#00a79c] rounded-t-sm transition-all group-hover:translate-y-1" 
                               style={{ 
                                 height: `${Math.floor(60 + Math.random() * 130)}px`,
                                 opacity: 0.85
                               }} />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#2D3250] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            ฿{Math.floor(10000 + Math.random() * 40000).toLocaleString()}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">{month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Orders */}
            <Card className="border-none rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-5">
                <div>
                  <CardTitle className="text-lg font-bold">คำสั่งซื้อล่าสุด</CardTitle>
                  <CardDescription>รายการคำสั่งซื้อล่าสุด 5 รายการ</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="hover:bg-[#F8F9FA] transition-colors">
                  <Link href="/admin/orders">
                    ดูทั้งหมด
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-[#F8F9FA]">
                      <TableHead className="py-3 text-[#6C757D]">รหัสสินค้า</TableHead>
                      <TableHead className="py-3 text-[#6C757D]">เลขที่ใบสั่งซื้อ</TableHead>
                      <TableHead className="py-3 text-[#6C757D]">ชื่อลูกค้า</TableHead>
                      <TableHead className="py-3 text-[#6C757D] text-right">จำนวนเงิน</TableHead>
                      <TableHead className="py-3 text-[#6C757D] text-right">สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { sku: "AUR-001", invoice: "INV-0012", customer: "สมหมาย จิตดี", amount: "฿1,999.00", status: "สำเร็จ" },
                      { sku: "AUR-008", invoice: "INV-0013", customer: "วิชัย ใจดี", amount: "฿3,499.00", status: "รอการชำระเงิน" },
                      { sku: "AUR-005", invoice: "INV-0014", customer: "นารี มากมี", amount: "฿2,500.00", status: "กำลังจัดส่ง" },
                      { sku: "AUR-012", invoice: "INV-0015", customer: "สมศรี รักดี", amount: "฿4,200.00", status: "สำเร็จ" },
                      { sku: "AUR-003", invoice: "INV-0016", customer: "มานะ พากเพียร", amount: "฿1,800.00", status: "รอการตรวจสอบ" },
                    ].map((order, i) => (
                      <TableRow key={i} className="hover:bg-[#F8F9FA] cursor-pointer">
                        <TableCell className="font-medium py-3">{order.sku}</TableCell>
                        <TableCell className="py-3">{order.invoice}</TableCell>
                        <TableCell className="py-3">{order.customer}</TableCell>
                        <TableCell className="py-3 text-right font-medium">{order.amount}</TableCell>
                        <TableCell className="py-3 text-right">
                          <Badge variant={
                            order.status === "สำเร็จ" ? "default" : 
                            order.status === "กำลังจัดส่ง" ? "secondary" : 
                            "outline"
                          }
                          className={
                            order.status === "สำเร็จ" ? "bg-gradient-to-r from-[#00BFB3] to-[#00a79c] hover:from-[#00a79c] hover:to-[#009189] text-white" : 
                            order.status === "กำลังจัดส่ง" ? "bg-gradient-to-r from-[#FF8C69] to-[#FFA47E] hover:from-[#FF8560] hover:to-[#FF9E75] text-white" : 
                            "bg-transparent hover:bg-gray-100"
                          }>
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-center border-t py-3">
                <Link href="/admin/orders">
                  <Button variant="link" className="text-[#00BFB3] hover:text-[#00a79c]">
                    โหลดเพิ่มเติม
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          {/* Sidebar - Recent Buyers */}
          <div className="lg:col-span-4">
            <Card className="border-none rounded-xl shadow-md hover:shadow-lg transition-all h-full overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-5">
                <div>
                  <CardTitle className="text-lg font-bold">ลูกค้าซื้อล่าสุด</CardTitle>
                  <CardDescription>รายการลูกค้าที่ซื้อล่าสุด</CardDescription>
                </div>
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8 hover:bg-[#F8F9FA] transition-colors">
                  <RefreshCw className="h-4 w-4 text-gray-500" />
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  {[
                    { name: "สมหมาย จิตดี", email: "sommai@example.com", amount: "฿1,999.00", image: "/avatar1.png", time: "5 นาทีที่แล้ว" },
                    { name: "วิชัย ใจดี", email: "wichai@example.com", amount: "฿3,499.00", image: "/avatar2.png", time: "25 นาทีที่แล้ว" },
                    { name: "นารี มากมี", email: "naree@example.com", amount: "฿2,500.00", image: "/avatar3.png", time: "40 นาทีที่แล้ว" },
                    { name: "สมศรี รักดี", email: "somsri@example.com", amount: "฿4,200.00", image: "/avatar4.png", time: "1 ชั่วโมงที่แล้ว" },
                    { name: "มานะ พากเพียร", email: "mana@example.com", amount: "฿1,800.00", image: "/avatar5.png", time: "2 ชั่วโมงที่แล้ว" },
                    { name: "สมบูรณ์ รุ่งเรือง", email: "somboon@example.com", amount: "฿2,750.00", image: "/avatar6.png", time: "3 ชั่วโมงที่แล้ว" },
                    { name: "รุ่งนภา จันทร์ตา", email: "rungnapha@example.com", amount: "฿3,250.00", image: "/avatar7.png", time: "5 ชั่วโมงที่แล้ว" }
                  ].map((buyer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F8F9FA] transition-colors cursor-pointer">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                          <AvatarImage src={buyer.image} alt={buyer.name} />
                          <AvatarFallback className="bg-gradient-to-r from-[#00BFB3] to-[#00a79c] text-white">{buyer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3 space-y-1">
                          <p className="text-sm font-medium leading-none">{buyer.name}</p>
                          <div className="flex items-center">
                            <p className="text-xs text-[#6C757D]">{buyer.time}</p>
                            <span className="mx-1 text-[#6C757D]">•</span>
                            <p className="text-xs text-[#6C757D]">{buyer.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="font-medium text-sm text-[#00BFB3]">{buyer.amount}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t py-3">
                <Link href="/admin/customers">
                  <Button variant="link" className="text-[#00BFB3] hover:text-[#00a79c]">
                    ดูทั้งหมด
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}