"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCart } from "@/hooks/use-cart"
import { supabase } from '@/lib/supabase'
import { useToast } from "@/components/ui/use-toast"
import Products from "./products/page"
interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category?: string
}

interface Category {
  id: string
  name: string
  image_url: string
}

interface Testimonial {
  id: string
  name: string
  comment: string
  avatar: string
  location: string
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { addToCart } = useCart();
  
  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(4)
      
      if (error) {
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลสินค้าได้",
          variant: "destructive"
        })
        return
      }
      
      setFeaturedProducts(data || [])
    } catch (error) {
      console.error("Error fetching featured products:", error)
    }
  }, [toast])
  
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
      
      if (error) {
        console.error("Error fetching categories:", error)
        // ใช้ข้อมูลตายตัวเป็นข้อมูลสำรอง
        setCategories([
          {
            id: "1",
            name: "Skincare",
            image_url: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
          },
          {
            id: "2",
            name: "Makeup",
            image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
          },
          {
            id: "3",
            name: "Fragrances",
            image_url: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
          }
        ])
        return
      }
      
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }, [])
  
  const fetchTestimonials = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .limit(3)
      
      if (error) {
        console.error("Error fetching testimonials:", error)
        // ใช้ข้อมูลตายตัวเป็นข้อมูลสำรอง
        setTestimonials([
          {
            id: "1",
            name: "สุชาติ มีสุข",
            comment: "ครีมบำรุงผิวของ AuraClear ทำให้ผิวของฉันดีขึ้นมาก ไม่แห้งเหมือนก่อน แนะนำมาก!",
            avatar: "https://i.pravatar.cc/150?img=1",
            location: "กรุงเทพฯ"
          },
          {
            id: "2",
            name: "อรัญญา ดาวเรือง",
            comment: "ผลิตภัณฑ์คุณภาพดีมาก ส่งเร็ว ราคาไม่แพง จะกลับมาซื้อแน่นอน",
            avatar: "https://i.pravatar.cc/150?img=5",
            location: "เชียงใหม่"
          },
          {
            id: "3",
            name: "พงศ์พันธ์ วงศ์เจริญ",
            comment: "บริการดีเยี่ยม สินค้าคุณภาพสูง เห็นผลลัพธ์ชัดเจนหลังใช้ไปสองสัปดาห์",
            avatar: "https://i.pravatar.cc/150?img=8",
            location: "ภูเก็ต"
          }
        ])
        return
      }
      
      setTestimonials(data || [])
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    }
  }, [])
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([
        fetchFeaturedProducts(),
        fetchCategories(),
        fetchTestimonials()
      ])
      setLoading(false)
    }
    
    fetchData()
  }, [fetchFeaturedProducts, fetchCategories, fetchTestimonials])
  
  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] sm:h-[500px] md:h-[600px] flex items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80"
          alt="Beauty Products"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="relative text-center text-white z-10 max-w-3xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">ค้นพบความงามที่สมบูรณ์แบบของคุณ</h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8">ผลิตภัณฑ์สวยงามสำหรับคนชอบสวย</p>
          <Link href="/products">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100">
              สั่งซื้อทันที
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center">ช่องทางการสั่งซื้อ</h2>
        {loading ? (
          <div className="text-center py-8">กำลังโหลด...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {categories.map((category) => (
              <Card key={category.id} className="group cursor-pointer overflow-hidden">
                <CardContent className="p-0 relative h-[200px] sm:h-[250px] md:h-[300px]">
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <h3 className="text-white text-xl sm:text-2xl font-semibold">{category.name}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      
      <Products />

      {/* Testimonials - Our clients say */}
      <section className="py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-2 text-center">ลูกค้าบอกว่า</h2>
          <p className="text-gray-600 mb-8 sm:mb-12 text-center max-w-2xl mx-auto text-sm sm:text-base">
            ค้นพบสินค้าที่คุณชื่นชอบจาก AuraClear และประสบการณ์การใช้ผลิตภัณฑ์ของเรา
          </p>
          
          {loading ? (
            <div className="text-center py-8">กำลังโหลด...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                    <p className="text-gray-700 mb-6 italic text-sm sm:text-base">&ldquo;{testimonial.comment}&rdquo;</p>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-3">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm sm:text-base">{testimonial.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
