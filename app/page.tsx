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
import { BadgeCheck, ChevronRight, Leaf, Package, ShieldCheck, Sparkles, ThumbsUp, Truck } from "lucide-react"

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
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)
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
  
  // สร้าง interval สำหรับการเลื่อน carousel ทุก 5 วินาที
  useEffect(() => {
    const featureItems = 4; // จำนวนข้อมูลใน feature carousel
    
    const interval = setInterval(() => {
      setActiveFeatureIndex((prev) => (prev + 1) % featureItems);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };
  
  // ข้อมูลคุณสมบัติ
  const features = [
    {
      icon: <Leaf className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-100",
      title: "ส่วนผสมธรรมชาติ",
      description: "ผลิตภัณฑ์ของเราใช้ส่วนผสมจากธรรมชาติที่ผ่านการคัดสรรอย่างพิถีพิถัน"
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-100",
      title: "ปลอดภัยสำหรับทุกสภาพผิว",
      description: "ผ่านการทดสอบโดยผู้เชี่ยวชาญด้านผิวหนังและเหมาะกับทุกสภาพผิว"
    },
    {
      icon: <ThumbsUp className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-100",
      title: "คุณภาพสูงสุด",
      description: "เราเลือกใช้เฉพาะวัตถุดิบคุณภาพสูงเพื่อผลลัพธ์ที่ดีที่สุดสำหรับคุณ"
    },
    {
      icon: <Truck className="h-6 w-6 text-red-600" />,
      bgColor: "bg-red-100",
      title: "จัดส่งฟรีทั่วประเทศ",
      description: "เมื่อสั่งซื้อครบ 1,000 บาท รับประกันการจัดส่งที่รวดเร็วและปลอดภัย"
    }
  ];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section - Enhanced */}
      <section className="relative h-[500px] sm:h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 z-10"></div>
        <Image
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80"
          alt="Beauty Products"
          fill
          className="object-cover scale-105 animate-slow-zoom"
          priority
        />
        <div className="relative text-center text-white z-20 max-w-4xl mx-auto px-4 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            ค้นพบ<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-200">ความงาม</span>ที่สมบูรณ์แบบของคุณ
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 max-w-2xl mx-auto text-gray-100">
            ผลิตภัณฑ์ความงามคุณภาพสูงที่จะเปลี่ยนโฉมผิวของคุณให้เปล่งประกายอย่างเป็นธรรมชาติ
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 hover:scale-105 transition-all px-8 py-6 text-lg shadow-xl">
                สั่งซื้อทันที
              </Button>
            </Link>
            <Link href="/products" className="flex items-center text-white hover:text-purple-200 transition-all">
              <span className="mr-2">ดูสินค้าทั้งหมด</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits/Features Section - New with Mobile Carousel */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">ทำไมต้องเลือก <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">AuraClear</span></h2>
          
          {/* Desktop: Grid layout */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className={`p-3 rounded-full ${feature.bgColor} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
          
          {/* Mobile: Carousel */}
          <div className="sm:hidden">
            <div className="relative overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out" 
                style={{ transform: `translateX(-${activeFeatureIndex * 100}%)` }}
              >
                {features.map((feature, index) => (
                  <div key={index} className="min-w-full px-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center">
                      <div className={`p-3 rounded-full ${feature.bgColor} mb-4`}>
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Carousel indicators */}
            <div className="flex justify-center mt-6 gap-2">
              {features.map((_, index) => (
                <button 
                  key={index} 
                  className={`w-2 h-2 rounded-full transition-colors ${index === activeFeatureIndex ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  onClick={() => setActiveFeatureIndex(index)}
                  aria-label={`ไปที่สไลด์ ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories - Enhanced */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">ช่องทางการสั่งซื้อ</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">เลือกผลิตภัณฑ์ที่เหมาะกับความต้องการของคุณจากหมวดหมู่ต่างๆ ของเรา</p>
        </div>
        
        {loading ? (
          <div className="text-center py-8 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {categories.map((category) => (
              <Link href={`/products?category=${category.name}`} key={category.id}>
                <Card className="group cursor-pointer overflow-hidden h-[280px] sm:h-[320px] transition-all duration-300 hover:shadow-xl border-0 rounded-xl">
                  <CardContent className="p-0 relative h-full">
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center p-6">
                      <div className="text-center">
                        <h3 className="text-white text-2xl font-bold mb-2">{category.name}</h3>
                        <span className="inline-flex items-center text-sm text-white/90 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                          <span>ดูสินค้า</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <Products />

      {/* Testimonials - Enhanced */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">ลูกค้าของเรากล่าวว่า</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ค้นพบประสบการณ์ของลูกค้าที่ใช้ผลิตภัณฑ์ AuraClear และการเปลี่ยนแปลงที่เกิดขึ้น
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-8 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 rounded-xl bg-white">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400 mr-1">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic text-sm sm:text-base leading-relaxed">&ldquo;{testimonial.comment}&rdquo;</p>
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-4 ring-2 ring-purple-100">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback className="bg-gradient-to-r from-indigo-400 to-purple-400 text-white">{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-base">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Link href="/products">
              <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                ดูรีวิวเพิ่มเติม <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Newsletter - New */}
      <section className="py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">รับส่วนลดพิเศษ 10%</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            สมัครรับจดหมายข่าวของเราเพื่อรับส่วนลดพิเศษ 10% สำหรับการสั่งซื้อครั้งแรกและข่าวสารเกี่ยวกับผลิตภัณฑ์ใหม่
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="อีเมลของคุณ"
              className="flex-1 px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button className="bg-white text-indigo-600 hover:bg-gray-100 px-6">
              สมัครรับข่าวสาร
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
