"use client"

import { useEffect, useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from '@/lib/supabase'
import Image from "next/image"
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, Heart } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReviewForm from '@/components/ReviewForm'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock_quantity: number
  category?: string
}

interface Review {
  id: string
  user_name: string
  rating: number
  comment: string
  created_at: string
}

interface ClientProductPageProps {
  productId: string
}

export default function ClientProductPage({ productId }: ClientProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { addToCart, isLoading: isAddingToCart } = useCart()

  const fetchReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error("Error fetching product reviews:", error)
        return
      }
      
      setReviews(data || [])
    } catch (error) {
      console.error("Error fetching reviews:", error)
    }
  }, [productId])

  const fetchProduct = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()
    
    if (error) {
      toast({
        title: "Error",
        description: "ไม่สามารถดึงข้อมูลสินค้าได้",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    setProduct(data)
    setLoading(false)
    
    // เมื่อได้ข้อมูลสินค้าแล้วให้ดึงข้อมูลสินค้าที่เกี่ยวข้อง
    if (data.category) {
      fetchRelatedProducts(data.category, data.id)
    }
    
    // ดึงข้อมูลรีวิว
    fetchReviews()
  }, [productId, toast, fetchReviews])
  
  const fetchRelatedProducts = async (category: string, currentProductId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .neq('id', currentProductId)
      .limit(4)
    
    if (error) {
      console.error("Error fetching related products:", error)
      return
    }
    
    setRelatedProducts(data || [])
  }

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  async function handleAddToCart() {
    if (!product) return
    
    await addToCart(product, quantity)
  }

  function decreaseQuantity() {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  function increaseQuantity() {
    if (product && quantity < product.stock_quantity) {
      setQuantity(quantity + 1)
    }
  }
  
  function renderStars(rating: number) {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ))
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-6 flex justify-center">
        <p>กำลังโหลด...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-6">
        <p>ไม่พบสินค้า</p>
        <Link href="/products" className="text-blue-500 hover:underline mt-4 inline-block">
          กลับไปที่สินค้า
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <Link href="/products" className="flex items-center text-sm mb-8 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        กลับไปที่สินค้า
      </Link>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="relative h-[500px] rounded-xl overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
          {product.category && (
            <p className="text-sm text-gray-500 mb-4">หมวดหมู่: {product.category}</p>
          )}
          <div className="flex items-center mb-6">
            <div className="flex mr-2">
              {renderStars(4)}
            </div>
            <span className="text-sm text-gray-500">({reviews.length} รีวิว)</span>
          </div>
          <p className="text-3xl font-semibold mb-6">{product.price.toLocaleString()} บาท</p>
          <div className="p-4 bg-gray-50 rounded-lg mb-8">
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">จำนวน</p>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-4 w-8 text-center">{quantity}</span>
              <Button 
                variant="outline" 
                size="icon"
                onClick={increaseQuantity}
                disabled={!product || quantity >= product.stock_quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            {product.stock_quantity > 0 
              ? `มีสินค้าคงเหลือ ${product.stock_quantity} ชิ้น` 
              : 'สินค้าหมด'}
          </p>
          
          <div className="flex space-x-4">
            <Button 
              className="flex-1"
              size="lg"
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0 || isAddingToCart}
            >
              {isAddingToCart ? (
                "กำลังเพิ่ม..."
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  เพิ่มลงตะกร้า
                </>
              )}
            </Button>
            
            <Button variant="outline" size="lg">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="mb-4">
          <TabsTrigger value="description">รายละเอียด</TabsTrigger>
          <TabsTrigger value="reviews">รีวิวจากลูกค้า ({reviews.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="p-4 bg-white rounded-lg border">
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-4">รายละเอียดสินค้า</h3>
            <p>{product.description}</p>
            <ul className="mt-4">
              <li>คุณภาพสูง</li>
              <li>รับประกัน 12 เดือน</li>
              <li>จัดส่งฟรีทั่วประเทศ</li>
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="p-4 bg-white rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">รีวิวจากลูกค้า</h3>
          <div className="mb-8">
            <ReviewForm 
              productId={productId} 
              onReviewAdded={fetchReviews}
            />
          </div>
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
            ) : (
              reviews.map(review => (
                <Card key={review.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{review.user_name}</h4>
                      <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString('th-TH')}</span>
                    </div>
                    <div className="flex mb-3">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">สินค้าที่เกี่ยวข้อง</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <Card key={relatedProduct.id} className="overflow-hidden">
                <Link href={`/products/${relatedProduct.id}`}>
                  <CardContent className="p-0 cursor-pointer">
                    <div className="relative h-[200px]">
                      <Image
                        src={relatedProduct.image_url}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{relatedProduct.name}</h3>
                      <p className="text-gray-600 font-medium">{relatedProduct.price.toLocaleString()} บาท</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 