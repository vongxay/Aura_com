"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, Package, ShoppingCart, Users, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">แดชบอร์ดผู้ดูแลระบบ</h1>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          เดือนนี้
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายได้ทั้งหมด</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-800">
              <BarChart3 className="h-4 w-4 text-blue-700 dark:text-blue-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿45,231.89</div>
            <div className="flex items-center pt-1">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-xs text-green-500 font-medium">+20.1% จากเดือนที่แล้ว</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คำสั่งซื้อ</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-800">
              <ShoppingCart className="h-4 w-4 text-purple-700 dark:text-purple-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <div className="flex items-center pt-1">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-xs text-green-500 font-medium">+201 ตั้งแต่สัปดาห์ที่แล้ว</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สินค้า</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center dark:bg-amber-800">
              <Package className="h-4 w-4 text-amber-700 dark:text-amber-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">246</div>
            <div className="flex items-center pt-1">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-xs text-green-500 font-medium">+4 สินค้าใหม่</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้ใช้ที่ใช้งานอยู่</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-800">
              <Users className="h-4 w-4 text-green-700 dark:text-green-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <div className="flex items-center pt-1">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-xs text-green-500 font-medium">+180 ตั้งแต่เดือนที่แล้ว</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 border-none shadow-md">
            <CardHeader>
              <CardTitle>รายได้ตามช่วงเวลา</CardTitle>
              <CardDescription>ยอดขายและรายได้ในปีที่ผ่านมา</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {/* สร้าง Chart Component จำลอง */}
              <div className="h-[300px] w-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 rounded-md relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-[70%] flex items-end">
                  <div className="w-[8.33%] h-[45%] bg-blue-500 dark:bg-blue-600 mx-[1.2%] rounded-t-sm"></div>
                  <div className="w-[8.33%] h-[80%] bg-blue-500 dark:bg-blue-600 mx-[1.2%] rounded-t-sm"></div>
                  <div className="w-[8.33%] h-[60%] bg-blue-500 dark:bg-blue-600 mx-[1.2%] rounded-t-sm"></div>
                  <div className="w-[8.33%] h-[75%] bg-blue-500 dark:bg-blue-600 mx-[1.2%] rounded-t-sm"></div>
                  <div className="w-[8.33%] h-[50%] bg-blue-500 dark:bg-blue-600 mx-[1.2%] rounded-t-sm"></div>
                  <div className="w-[8.33%] h-[65%] bg-blue-500 dark:bg-blue-600 mx-[1.2%] rounded-t-sm"></div>
                  <div className="w-[8.33%] h-[85%] bg-blue-500 dark:bg-blue-600 mx-[1.2%] rounded-t-sm"></div>
                  <div className="w-[8.33%] h-[90%] bg-blue-500 dark:bg-blue-600 mx-[1.2%] rounded-t-sm"></div>
                </div>
                <div className="absolute bottom-1 left-0 w-full flex justify-between px-4 text-xs text-gray-500">
                  <span>ม.ค.</span>
                  <span>ก.พ.</span>
                  <span>มี.ค.</span>
                  <span>เม.ย.</span>
                  <span>พ.ค.</span>
                  <span>มิ.ย.</span>
                  <span>ก.ค.</span>
                  <span>ส.ค.</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-3 border-none shadow-md">
            <CardHeader>
              <CardTitle>การขายล่าสุด</CardTitle>
              <CardDescription>ธุรกรรมล่าสุด 5 รายการ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { name: "สมหมาย จิตดี", email: "sommai@example.com", amount: "฿1,999.00", image: "/avatar1.png" },
                  { name: "วิชัย ใจดี", email: "wichai@example.com", amount: "฿3,499.00", image: "/avatar2.png" },
                  { name: "นารี มากมี", email: "naree@example.com", amount: "฿2,500.00", image: "/avatar3.png" },
                  { name: "สมศรี รักดี", email: "somsri@example.com", amount: "฿4,200.00", image: "/avatar4.png" },
                  { name: "มานะ พากเพียร", email: "mana@example.com", amount: "฿1,800.00", image: "/avatar5.png" }
                ].map((sale, index) => (
                  <div key={index} className="flex items-center">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={sale.image} alt={sale.name} />
                      <AvatarFallback>{sale.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{sale.name}</p>
                      <p className="text-sm text-muted-foreground">{sale.email}</p>
                    </div>
                    <div className="ml-auto font-medium">{sale.amount}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}