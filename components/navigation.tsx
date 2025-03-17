"use client";

import { ShoppingBag, User, Search, Award, Menu, X, Home, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Badge } from "./ui/badge";
import { useCart } from "@/hooks/use-cart";

export default function Navigation() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [points, setPoints] = useState(() => {
    // ดึงค่าจาก localStorage ถ้ามี
    if (typeof window !== 'undefined') {
      const savedPoints = localStorage.getItem('userPoints');
      return savedPoints ? parseInt(savedPoints) : 0;
    }
    return 0;
  });
  const { cartItemsCount } = useCart();

  if (isAdmin) {
    return <AdminNavigation />;
  }

  return (
    <nav className="border-b shadow-sm bg-gradient-to-r from-white to-slate-50 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 transition-transform hover:scale-105 duration-300">
          AuraClear
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-12">
          <div className={`relative w-full transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="ค้นหาสินค้า..." 
              className="w-full pl-10 border-slate-200 focus:border-indigo-300 rounded-full transition-all"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>
        
        {/* Desktop Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-slate-100 transition-colors">
            <Search className="h-5 w-5" />
          </Button>
          <Link href="/points">
            <Button variant="ghost" size="icon" className="hover:bg-slate-100 transition-colors relative">
              <Award className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-amber-400 hover:bg-amber-500">
                {points}
              </Badge>
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="hover:bg-slate-100 transition-colors relative">
              <ShoppingBag className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                {cartItemsCount}
              </Badge>
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="hover:bg-slate-100 transition-colors">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex justify-between items-center mb-8">
                <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
                  AuraClear
                </Link>
              </div>
              <nav className="flex flex-col gap-6">
                <Link href="/" className="flex items-center gap-3 text-lg font-medium hover:text-indigo-600 transition-colors">
                  <Home className="h-5 w-5" />
                  หน้าหลัก
                </Link>
                <Link href="/products" className="flex items-center gap-3 text-lg font-medium hover:text-indigo-600 transition-colors">
                  <Package className="h-5 w-5" />
                  สินค้า
                </Link>
                <Link href="/points" className="flex items-center gap-3 text-lg font-medium hover:text-indigo-600 transition-colors">
                  <Award className="h-5 w-5" />
                  คะแนนสะสม
                </Link>
                <Link href="/cart" className="flex items-center gap-3 text-lg font-medium hover:text-indigo-600 transition-colors">
                  <ShoppingBag className="h-5 w-5" />
                  ตะกร้าสินค้า
                </Link>
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="ค้นหาสินค้า..." className="w-full pl-10 rounded-full" />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

function AdminNavigation() {
  return (
    <nav className="border-b bg-gradient-to-r from-slate-800 to-slate-900 text-white sticky top-0 z-50 shadow-md">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto">
        <Link href="/admin" className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-200">
          Admin Dashboard
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/" className="hidden sm:block">
            <Button variant="outline" className="border-slate-600 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors">
              เข้าสู่หน้าร้านค้า
            </Button>
          </Link>
          <Link href="/" className="sm:hidden">
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors">
              ร้านค้า
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="text-slate-200 hover:bg-slate-700 transition-colors">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
