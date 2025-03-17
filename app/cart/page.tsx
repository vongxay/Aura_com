"use client"

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from '@/lib/supabase'
import Image from "next/image"
import { Trash2, ArrowLeft, CreditCard, Wallet, MapPin, CheckCircle, Truck, Clock } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import Link from 'next/link'

interface CartItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    image_url: string
  }
  quantity: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const { toast } = useToast()
  const { refreshCart } = useCart()

  const fetchCartItems = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      toast({
        title: "Please sign in",
        description: "Failed to fetch cart items",
        variant: "destructive"
      })
      return
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        product:product_id(
          id,
          name,
          price,
          image_url
        )
      `)
      .eq('user_id', session.user.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch cart items",
        variant: "destructive"
      })
      return
    }

    console.log('Raw cart data:', data)
    
    if (!data || data.length === 0) {
      toast({
        title: "ตะกร้าว่างเปล่า",
        description: "ไม่พบสินค้าในตะกร้าของคุณ"
      })
      setCartItems([])
      return
    }
    
    const formattedItems = data
      .filter(item => item.product)
      .map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: Array.isArray(item.product) ? item.product[0] : item.product
      }))
    
    console.log('Formatted items:', formattedItems)
    
    if (formattedItems.length === 0) {
      toast({
        title: "ข้อมูลสินค้าไม่สมบูรณ์",
        description: "พบสินค้าในตะกร้าแต่ข้อมูลสินค้าไม่สมบูรณ์",
        variant: "destructive"
      })
    }

    setCartItems(formattedItems)
  }, [toast])

  useEffect(() => {
    fetchCartItems()
  }, [fetchCartItems])

  async function removeFromCart(cartItemId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      })
      return
    }

    setCartItems(cartItems.filter(item => item.id !== cartItemId))
    window.dispatchEvent(new Event('cartUpdated'))
    toast({
      title: "Success",
      description: "Item removed from cart"
    })
  }

  async function updateQuantity(cartItemId: string, newQuantity: number) {
    if (newQuantity < 1) return;
    
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', cartItemId)

    if (error) {
      toast({
        title: "ผิดพลาด",
        description: "ไม่สามารถอัปเดตจำนวนสินค้าได้",
        variant: "destructive"
      })
      return
    }

    setCartItems(cartItems.map(item => 
      item.id === cartItemId ? { ...item, quantity: newQuantity } : item
    ))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const total = cartItems.reduce((sum, item) => {
    if (!item.product || typeof item.product.price !== 'number') return sum;
    return sum + (item.product.price * item.quantity)
  }, 0)

  const shippingFee = 0; // ฟรีค่าจัดส่ง
  const discount = 0;
  const grandTotal = total + shippingFee - discount;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary">ตะกร้าสินค้าของคุณ</h1>
        <Link href="/products" className="flex items-center text-gray-600 hover:text-primary">
          <ArrowLeft className="mr-2 h-5 w-5" />
          <span>เลือกซื้อสินค้าเพิ่มเติม</span>
        </Link>
      </div>
      
      <div className="mb-8">
        <div className="relative flex items-center justify-between">
          <div className="w-full absolute h-2 bg-gray-200" />
          <div className="w-1/3 absolute h-2 bg-primary" />
          <div className="z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white">1</div>
            <p className="mt-2 text-sm font-medium">ตะกร้าสินค้า</p>
          </div>
          <div className="z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-500">2</div>
            <p className="mt-2 text-sm font-medium text-gray-500">ข้อมูลการจัดส่ง</p>
          </div>
          <div className="z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-500">3</div>
            <p className="mt-2 text-sm font-medium text-gray-500">ยืนยันคำสั่งซื้อ</p>
          </div>
        </div>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col items-center">
            <Trash2 className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg mb-6">ตะกร้าของคุณว่างเปล่า</p>
            <Button className="bg-primary">เลือกซื้อสินค้า</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-2 hidden md:grid grid-cols-12 font-medium text-gray-600">
              <div className="col-span-6">สินค้า</div>
              <div className="col-span-2 text-center">ราคา</div>
              <div className="col-span-2 text-center">จำนวน</div>
              <div className="col-span-2 text-right">รวม</div>
            </div>
            
            {cartItems.map((item) => (
              <Card key={item.id} className="border-gray-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">
                    <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                      <div className="relative h-24 w-24 flex-shrink-0">
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                        <p className="text-gray-500 text-sm">รหัสสินค้า: {item.product.id}</p>
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 text-center">
                      <p className="font-medium">${item.product.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 flex justify-between md:justify-end items-center">
                      <p className="font-semibold text-primary md:mr-4">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="order-2 md:order-1">
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">คูปองส่วนลด</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="กรอกรหัสคูปอง" 
                      className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button variant="outline">ใช้คูปอง</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 mt-4">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">วิธีการชำระเงิน</h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="payment" id="card" className="mr-3" defaultChecked />
                      <label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                        <CreditCard className="mr-2 h-5 w-5 text-primary" />
                        <span>บัตรเครดิต / เดบิต</span>
                      </label>
                    </div>
                    <div className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="payment" id="wallet" className="mr-3" />
                      <label htmlFor="wallet" className="flex items-center cursor-pointer flex-1">
                        <Wallet className="mr-2 h-5 w-5 text-primary" />
                        <span>โอนเงินผ่านธนาคาร</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 mt-4">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">ที่อยู่จัดส่ง</h3>
                    <Button variant="ghost" size="sm" className="text-primary">
                      <MapPin className="mr-1 h-4 w-4" />
                      เปลี่ยนที่อยู่
                    </Button>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-gray-50">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">บ้าน (ค่าเริ่มต้น)</p>
                        <p className="text-gray-600 mt-1">123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110</p>
                        <p className="text-gray-600 mt-1">โทร: 099-XXX-XXXX</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 mt-4">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">วิธีการจัดส่ง</h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 bg-gray-50 border-primary">
                      <input type="radio" name="shipping" id="standard" className="mr-3" defaultChecked />
                      <label htmlFor="standard" className="flex items-center cursor-pointer flex-1">
                        <Truck className="mr-2 h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <span className="font-medium">จัดส่งมาตรฐาน</span>
                          <p className="text-sm text-gray-500">ฟรี - จัดส่งภายใน 3-5 วันทำการ</p>
                        </div>
                        <div className="flex items-center text-primary">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm">ได้รับสินค้าภายใน 5 วัน</span>
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="shipping" id="express" className="mr-3" />
                      <label htmlFor="express" className="flex items-center cursor-pointer flex-1">
                        <Truck className="mr-2 h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <span className="font-medium">จัดส่งด่วน</span>
                          <p className="text-sm text-gray-500">+$5.00 - จัดส่งภายใน 1-2 วันทำการ</p>
                        </div>
                        <div className="flex items-center text-primary">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm">ได้รับสินค้าภายใน 2 วัน</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="order-1 md:order-2">
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">สรุปคำสั่งซื้อ</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>ราคาสินค้า</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>ค่าจัดส่ง</span>
                      <span>ฟรี</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>ส่วนลด</span>
                      <span>$0.00</span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>ยอดรวมทั้งสิ้น</span>
                        <span className="text-primary">${grandTotal.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">รวมภาษีมูลค่าเพิ่ม 7%</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-6 py-4 bg-gray-50 rounded-b-lg">
                  <Link href="/checkout">
                    <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                      ดำเนินการสั่งซื้อ
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>การกดปุ่ม &ldquo;ดำเนินการสั่งซื้อ&rdquo; หมายถึงคุณยอมรับ <a href="#" className="text-primary hover:underline">เงื่อนไขและข้อตกลง</a> ของเรา</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}