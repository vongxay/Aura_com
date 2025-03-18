"use client"

import { ReactNode, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  BarChart3,
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  Menu, 
  Home,
  LayoutDashboard,
  ShoppingBag,
  LineChart,
  Dumbbell,
  LayoutTemplate,
  Layers,
  Mail,
  MessageSquare,
  FileCode2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell } from "lucide-react"

interface SidebarNavProps {
  items: {
    title: string
    href: string
    icon: React.ReactNode
  }[]
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isAuthChecking, setIsAuthChecking] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  
  useEffect(() => {
    // ข้ามการตรวจสอบสิทธิ์ชั่วคราวเพื่อการทดสอบ
    setIsAuthChecking(false)
    
    /* ปิดโค้ดตรวจสอบสิทธิ์ไว้ชั่วคราว
    const checkAdminAuth = async () => {
      try {
        // ตรวจสอบสถานะการเข้าสู่ระบบ
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          // ถ้าไม่ได้เข้าสู่ระบบ ให้ redirect ไปหน้าเข้าสู่ระบบแอดมิน
          router.replace('/admin-login')
          return
        }
        
        // ตรวจสอบว่าผู้ใช้เป็นแอดมินหรือไม่
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          
        if (adminError || !adminData) {
          // ถ้าไม่ใช่แอดมิน ให้ออกจากระบบและนำทางไปยังหน้าเข้าสู่ระบบแอดมิน
          await supabase.auth.signOut()
          toast({
            title: "ไม่มีสิทธิ์เข้าถึง",
            description: "คุณไม่มีสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ",
            variant: "destructive"
          })
          router.replace('/admin-login')
          return
        }
        
        setIsAuthChecking(false)
      } catch (error) {
        console.error("Error checking admin authentication:", error)
        router.replace('/admin-login')
      }
    }
    
    checkAdminAuth()
    */
  }, [router, toast])
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.replace('/admin-login')
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }
  
  const navItems = [
    {
      title: "แดชบอร์ด",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: "อีคอมเมิร์ซ",
      href: "/admin/ecommerce",
      icon: <ShoppingBag className="h-5 w-5" />
    },
    {
      title: "แอนะลิติกส์",
      href: "/admin/analytics",
      icon: <LineChart className="h-5 w-5" />
    },
    {
      title: "ฟิตเนส",
      href: "/admin/fitness",
      icon: <Dumbbell className="h-5 w-5" />
    },
    {
      title: "เทมเพลต",
      href: "/admin/templates",
      icon: <LayoutTemplate className="h-5 w-5" />
    },
    {
      title: "เลย์เอาต์",
      href: "/admin/layouts",
      icon: <Layers className="h-5 w-5" />
    },
    {
      title: "สตาร์ตเตอร์คิต",
      href: "/admin/starter-kit",
      icon: <FileCode2 className="h-5 w-5" />
    },
    {
      title: "อีเมลแอปพลิเคชัน",
      href: "/admin/email",
      icon: <Mail className="h-5 w-5" />
    },
    {
      title: "แชทแอปพลิเคชัน",
      href: "/admin/chat",
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      title: "สินค้า",
      href: "/admin/products",
      icon: <Package className="h-5 w-5" />
    },
    {
      title: "คำสั่งซื้อ",
      href: "/admin/orders",
      icon: <ShoppingCart className="h-5 w-5" />
    },
    {
      title: "ลูกค้า",
      href: "/admin/customers",
      icon: <Users className="h-5 w-5" />
    },
    {
      title: "ตั้งค่า",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />
    }
  ]
  
  // แสดงหน้าว่างระหว่างตรวจสอบสถานะการเข้าสู่ระบบ
  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sidebar for desktop */}
      <aside
        className={cn(
          "fixed z-30 hidden h-screen bg-[#2D3250] transition-all duration-300 lg:flex",
          isSidebarOpen ? "w-64" : "w-[78px]"
        )}
      >
        <div className="flex h-full w-full flex-col">
          <div className={cn(
            "flex h-[60px] items-center px-4",
            isSidebarOpen ? "justify-between" : "justify-center"
          )}>
            {isSidebarOpen && (
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="text-xl font-bold text-white">Stack</span>
              </Link>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-8 w-8 text-white hover:bg-[#3a4065] hover:text-white"
            >
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform",
                !isSidebarOpen && "rotate-180"
              )} />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 px-2 py-4">
            <nav className="grid gap-1">
              {navItems.map((item, index) => (
                <NavItem 
                  key={index} 
                  item={item} 
                  isCollapsed={!isSidebarOpen} 
                />
              ))}
            </nav>
          </ScrollArea>
          
          <div className="px-2 py-2">
            <Link href="/">
              <Button variant="ghost" className={cn(
                "w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-[#3a4065]",
                !isSidebarOpen && "justify-center px-0"
              )}>
                <Home className="h-4 w-4" />
                {isSidebarOpen && <span>กลับไปหน้าร้านค้า</span>}
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className={cn(
                "mt-2 w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-[#3a4065]",
                !isSidebarOpen && "justify-center px-0"
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {isSidebarOpen && <span>ออกจากระบบ</span>}
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile sidebar */}
      <Sheet>
        <div className="lg:hidden border-b sticky top-0 z-40 bg-white h-[60px]">
          <div className="flex h-full items-center px-4">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-xl font-bold text-[#00BFB3]">Stack</span>
            </Link>
            
            <div className="ml-auto flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#FF4B77]">
                  3
                </Badge>
                <Bell className="h-5 w-5 text-[#6C757D]" />
              </Button>
              
              <Button variant="ghost" size="icon" className="relative">
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#FF4B77]">
                  2
                </Badge>
                <ShoppingBag className="h-5 w-5 text-[#6C757D]" />
              </Button>
              
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
        <SheetContent side="left" className="p-0 w-60 bg-[#2D3250]">
          <div className="flex h-[60px] items-center px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-xl font-bold text-white">Stack</span>
            </Link>
          </div>
          <ScrollArea className="flex-1 px-2 py-4 h-[calc(100vh-60px)]">
            <nav className="grid gap-1">
              {navItems.map((item, index) => (
                <NavItem key={index} item={item} isCollapsed={false} />
              ))}
              <Link href="/" className="mt-6">
                <Button variant="ghost" className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-[#3a4065]">
                  <Home className="h-4 w-4" />
                  <span>กลับไปหน้าร้านค้า</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="mt-2 w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-[#3a4065]"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>ออกจากระบบ</span>
              </Button>
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      
      {/* Main content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        isSidebarOpen ? "lg:pl-64" : "lg:pl-[78px]"
      )}>
        {children}
      </main>
    </div>
  )
}

interface NavItemProps {
  item: {
    title: string
    href: string
    icon: React.ReactNode
  }
  isCollapsed: boolean
}

function NavItem({ item, isCollapsed }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === item.href
  
  return (
    <Link href={item.href}>
      <Button 
        variant="ghost" 
        className={cn(
          "w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-[#3a4065]",
          isActive && "bg-[#3a4065] text-white",
          isCollapsed && "justify-center px-0"
        )}
      >
        {item.icon}
        {!isCollapsed && <span>{item.title}</span>}
      </Button>
    </Link>
  )
} 