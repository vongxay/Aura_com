"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { supabase } from '@/lib/supabase'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Image from "next/image"
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle, 
  Building2, 
  CreditCard as CreditCardIcon,
  QrCode 
} from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// สร้างสคีมาสำหรับตรวจสอบข้อมูลผู้สั่งซื้อ
const checkoutFormSchema = z.object({
  fullName: z.string().min(3, { message: "ชื่อ-นามสกุลต้องมีอย่างน้อย 3 ตัวอักษร" }),
  email: z.string().email({ message: "กรุณากรอกอีเมลให้ถูกต้อง" }),
  phone: z.string().min(9, { message: "เบอร์โทรศัพท์ไม่ถูกต้อง" }),
  address: z.string().min(5, { message: "ที่อยู่ต้องมีอย่างน้อย 5 ตัวอักษร" }),
  city: z.string().min(2, { message: "กรุณากรอกชื่อเมือง" }),
  country: z.string().min(2, { message: "กรุณาเลือกประเทศ" }),
  postalCode: z.string().min(3, { message: "กรุณากรอกรหัสไปรษณีย์" }),
  paymentMethod: z.string({
    required_error: "กรุณาเลือกวิธีการชำระเงิน",
  }),
  bankType: z.string().optional(),
  cardNumber: z.string().optional(),
  cardHolderName: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  paymentProof: z.any().optional(),
})

// ประเภทของข้อมูลสินค้าในตะกร้า
interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
  quantity: number;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("thailand")
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // สร้างฟอร์มพร้อมการตรวจสอบข้อมูล
  const form = useForm<z.infer<typeof checkoutFormSchema>>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "thailand",
      postalCode: "",
      paymentMethod: "creditCard",
    },
  })

  // ดึงข้อมูลสินค้าในตะกร้า
  useEffect(() => {
    async function fetchCartItems() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast({
          title: "กรุณาเข้าสู่ระบบ",
          description: "ต้องเข้าสู่ระบบก่อนดำเนินการสั่งซื้อ",
          variant: "destructive"
        })
        router.push('/auth')
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
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลตะกร้าสินค้าได้",
          variant: "destructive"
        })
        return
      }

      if (!data || data.length === 0) {
        toast({
          title: "ตะกร้าว่างเปล่า",
          description: "กรุณาเพิ่มสินค้าในตะกร้าก่อนดำเนินการสั่งซื้อ",
        })
        router.push('/cart')
        return
      }
      
      const formattedItems = data
        .filter(item => item.product)
        .map(item => ({
          id: item.id,
          quantity: item.quantity,
          product: Array.isArray(item.product) ? item.product[0] : item.product
        }))
      
      setCartItems(formattedItems)
    }

    fetchCartItems()
  }, [toast, router])

  // เปลี่ยนข้อมูลประเทศที่เลือก
  const country = form.watch("country")
  useEffect(() => {
    setSelectedCountry(country)
  }, [country])

  // คำนวณราคารวม
  const total = cartItems.reduce((sum, item) => {
    if (!item.product || typeof item.product.price !== 'number') return sum;
    return sum + (item.product.price * item.quantity)
  }, 0)

  const shippingFee = 0; // ฟรีค่าจัดส่ง
  const discount = 0;
  const grandTotal = total + shippingFee - discount;

  // ฟังก์ชันจัดการอัพโหลดไฟล์
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProofFile(e.target.files[0]);
      form.setValue("paymentProof", e.target.files[0]);
    }
  };

  // เพิ่มรูปหลักฐานการชำระเงินลง Storage
  async function uploadPaymentProof(orderId: string): Promise<string | null> {
    if (!paymentProofFile) return null;
    
    const fileExt = paymentProofFile.name.split('.').pop();
    const fileName = `payment-proof/${orderId}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('payments')
      .upload(fileName, paymentProofFile);
      
    if (uploadError) {
      console.error('อัพโหลดหลักฐานการชำระเงินไม่สำเร็จ:', uploadError);
      return null;
    }
    
    return fileName;
  }

  // ฟังก์ชันดำเนินการเมื่อส่งฟอร์ม
  async function onSubmit(values: z.infer<typeof checkoutFormSchema>) {
    setIsLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast({
          title: "กรุณาเข้าสู่ระบบ",
          description: "ต้องเข้าสู่ระบบก่อนดำเนินการสั่งซื้อ",
          variant: "destructive"
        })
        router.push('/auth')
        return
      }

      // สร้างคำสั่งซื้อใหม่
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          status: 'pending',
          total_amount: grandTotal,
          shipping_address: `${values.address}, ${values.city}, ${values.country}, ${values.postalCode}`,
          shipping_method: 'standard',
          payment_method: values.paymentMethod,
          payment_status: 'pending',
          full_name: values.fullName,
          email: values.email,
          phone: values.phone,
          bank_type: values.bankType,
        })
        .select('id')
        .single()

      if (orderError) {
        throw new Error("ไม่สามารถสร้างคำสั่งซื้อได้")
      }

      // เพิ่มรายการสินค้าในคำสั่งซื้อ
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }))

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (orderItemsError) {
        throw new Error("ไม่สามารถบันทึกรายการสินค้าในคำสั่งซื้อได้")
      }

      // อัปโหลดหลักฐานการชำระเงิน (ถ้ามี)
      let paymentProofUrl = null;
      if (values.paymentMethod === 'bankTransfer' && paymentProofFile) {
        paymentProofUrl = await uploadPaymentProof(order.id);
        
        // อัปเดตคำสั่งซื้อด้วยลิงก์หลักฐานการชำระเงิน
        if (paymentProofUrl) {
          const { error: updateOrderError } = await supabase
            .from('orders')
            .update({ payment_proof_url: paymentProofUrl })
            .eq('id', order.id);
            
          if (updateOrderError) {
            console.error('ไม่สามารถอัปเดตข้อมูลหลักฐานการชำระเงิน:', updateOrderError);
          }
        }
      }
      
      // บันทึกประวัติการชำระเงิน
      const { error: paymentHistoryError } = await supabase
        .from('payment_history')
        .insert({
          order_id: order.id,
          amount: grandTotal,
          payment_method: values.paymentMethod,
          payment_status: 'pending',
          proof_url: paymentProofUrl,
          notes: values.paymentMethod === 'bankTransfer' ? `โอนผ่านธนาคาร ${values.bankType}` : null
        });
        
      if (paymentHistoryError) {
        console.error('ไม่สามารถบันทึกประวัติการชำระเงิน:', paymentHistoryError);
      }

      // ลบรายการสินค้าในตะกร้า
      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', session.user.id)

      if (clearCartError) {
        throw new Error("ไม่สามารถลบรายการสินค้าในตะกร้าได้")
      }

      // แจ้งเตือนสำเร็จ
      toast({
        title: "การสั่งซื้อสำเร็จ",
        description: "ขอบคุณสำหรับการสั่งซื้อ เราได้รับคำสั่งซื้อของคุณแล้ว",
      })

      // เปลี่ยนเส้นทางไปยังหน้าแสดงผลคำสั่งซื้อ
      router.push(`/checkout/success?order_id=${order.id}`)

    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถดำเนินการสั่งซื้อได้",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary">การชำระเงิน</h1>
        <Link href="/cart" className="flex items-center text-gray-600 hover:text-primary">
          <ArrowLeft className="mr-2 h-5 w-5" />
          <span>กลับไปยังตะกร้าสินค้า</span>
        </Link>
      </div>
      
      <div className="mb-8">
        <div className="relative flex items-center justify-between">
          <div className="w-full absolute h-2 bg-gray-200" />
          <div className="w-2/3 absolute h-2 bg-primary" />
          <div className="z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white">
              <CheckCircle className="h-5 w-5" />
            </div>
            <p className="mt-2 text-sm font-medium">ตะกร้าสินค้า</p>
          </div>
          <div className="z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white">2</div>
            <p className="mt-2 text-sm font-medium">ข้อมูลการจัดส่ง</p>
          </div>
          <div className="z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-500">3</div>
            <p className="mt-2 text-sm font-medium text-gray-500">ยืนยันคำสั่งซื้อ</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลการจัดส่งและการชำระเงิน</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">ข้อมูลผู้สั่งซื้อ</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ชื่อ-นามสกุล</FormLabel>
                            <FormControl>
                              <Input placeholder="กรุณากรอกชื่อ-นามสกุล" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>อีเมล</FormLabel>
                            <FormControl>
                              <Input placeholder="กรุณากรอกอีเมล" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>เบอร์โทรศัพท์</FormLabel>
                          <FormControl>
                            <Input placeholder="กรุณากรอกเบอร์โทรศัพท์" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium">ที่อยู่จัดส่ง</h3>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ที่อยู่</FormLabel>
                          <FormControl>
                            <Input placeholder="บ้านเลขที่ ถนน ตำบล/แขวง อำเภอ/เขต" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>เมือง/จังหวัด</FormLabel>
                            <FormControl>
                              <Input placeholder="กรุณากรอกเมือง/จังหวัด" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ประเทศ</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedCountry(value);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="เลือกประเทศ" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="thailand">ไทย (Thailand)</SelectItem>
                                <SelectItem value="laos">ลาว (Laos)</SelectItem>
                                <SelectItem value="vietnam">เวียดนาม (Vietnam)</SelectItem>
                                <SelectItem value="china">จีน (China)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>รหัสไปรษณีย์</FormLabel>
                            <FormControl>
                              <Input placeholder="กรุณากรอกรหัสไปรษณีย์" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium">วิธีการชำระเงิน</h3>
                    
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="creditCard" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex items-center">
                                  <CreditCardIcon className="h-5 w-5 mr-2 text-gray-600" />
                                  บัตรเครดิต/เดบิต
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="bankTransfer" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex items-center">
                                  <Building2 className="h-5 w-5 mr-2 text-gray-600" />
                                  โอนเงินผ่านธนาคาร
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="qrCode" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex items-center">
                                  <QrCode className="h-5 w-5 mr-2 text-gray-600" />
                                  สแกน QR Code
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("paymentMethod") === "bankTransfer" && (
                      <div className="pl-7 space-y-4">
                        <FormField
                          control={form.control}
                          name="bankType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>เลือกธนาคาร</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="เลือกธนาคาร" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {selectedCountry === "thailand" && (
                                    <>
                                      <SelectItem value="scb">ธนาคารไทยพาณิชย์ (SCB)</SelectItem>
                                      <SelectItem value="kbank">ธนาคารกสิกรไทย (KBANK)</SelectItem>
                                      <SelectItem value="bbl">ธนาคารกรุงเทพ (BBL)</SelectItem>
                                      <SelectItem value="ktb">ธนาคารกรุงไทย (KTB)</SelectItem>
                                      <SelectItem value="bay">ธนาคารกรุงศรี (BAY)</SelectItem>
                                    </>
                                  )}
                                  {selectedCountry === "laos" && (
                                    <>
                                      <SelectItem value="bcel">ธนาคารการค้าต่างประเทศลาว (BCEL)</SelectItem>
                                      <SelectItem value="ldb">ธนาคารพัฒนาลาว (LDB)</SelectItem>
                                      <SelectItem value="acleda">ธนาคาร ACLEDA</SelectItem>
                                      <SelectItem value="jdb">ธนาคารร่วมพัฒนา (JDB)</SelectItem>
                                    </>
                                  )}
                                  {selectedCountry === "vietnam" && (
                                    <>
                                      <SelectItem value="vietcombank">ธนาคาร Vietcombank</SelectItem>
                                      <SelectItem value="bidv">ธนาคาร BIDV</SelectItem>
                                      <SelectItem value="vietinbank">ธนาคาร VietinBank</SelectItem>
                                      <SelectItem value="agribank">ธนาคาร Agribank</SelectItem>
                                    </>
                                  )}
                                  {selectedCountry === "china" && (
                                    <>
                                      <SelectItem value="icbc">ธนาคาร Industrial and Commercial Bank of China (ICBC)</SelectItem>
                                      <SelectItem value="ccb">ธนาคาร China Construction Bank (CCB)</SelectItem>
                                      <SelectItem value="abc">ธนาคาร Agricultural Bank of China (ABC)</SelectItem>
                                      <SelectItem value="boc">ธนาคาร Bank of China (BOC)</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm">ชำระเงินโดยการโอนเงินเข้าบัญชี</p>
                          <p className="font-medium mt-2">บริษัท อาราเคลียร์ จำกัด</p>
                          <p className="text-sm">เลขที่บัญชี: 123-4-56789-0</p>
                          <p className="text-sm text-gray-500 mt-2">* กรุณาอัพโหลดหลักฐานการโอนเงินหลังจากทำรายการ</p>
                        </div>

                        <div className="space-y-2">
                          <FormLabel>อัปโหลดหลักฐานการชำระเงิน</FormLabel>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,application/pdf"
                              onChange={handleFileUpload}
                              className="w-full"
                              aria-label="อัปโหลดหลักฐานการชำระเงิน"
                            />
                            <p className="text-xs text-gray-500 mt-2">รองรับไฟล์ JPG, PNG, PDF ขนาดไม่เกิน 5MB</p>
                          </div>
                          {paymentProofFile && (
                            <p className="text-sm text-green-600">
                              อัปโหลดไฟล์ {paymentProofFile.name} ({(paymentProofFile.size / 1024 / 1024).toFixed(2)} MB) เรียบร้อยแล้ว
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {form.watch("paymentMethod") === "creditCard" && (
                      <div className="pl-7 space-y-4">
                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>เลขบัตร</FormLabel>
                              <FormControl>
                                <Input placeholder="xxxx xxxx xxxx xxxx" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="cardHolderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ชื่อผู้ถือบัตร</FormLabel>
                              <FormControl>
                                <Input placeholder="ชื่อบนบัตร" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="expiryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>วันหมดอายุ</FormLabel>
                                <FormControl>
                                  <Input placeholder="MM/YY" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                  <Input placeholder="xxx" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex items-center mt-2 space-x-2">
                          <Image src="/images/visa.png" alt="Visa" width={40} height={30} />
                          <Image src="/images/mastercard.png" alt="Mastercard" width={40} height={30} />
                          <Image src="/images/jcb.png" alt="JCB" width={40} height={30} />
                          <Image src="/images/unionpay.png" alt="UnionPay" width={40} height={30} />
                        </div>
                      </div>
                    )}
                    
                    {form.watch("paymentMethod") === "qrCode" && (
                      <div className="pl-7 space-y-4">
                        <Tabs defaultValue="promptpay">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="promptpay">PromptPay</TabsTrigger>
                            <TabsTrigger value="alipay">Alipay</TabsTrigger>
                            <TabsTrigger value="wechat">WeChat Pay</TabsTrigger>
                            <TabsTrigger value="other">อื่นๆ</TabsTrigger>
                          </TabsList>
                          <TabsContent value="promptpay" className="mt-4">
                            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                              <Image src="/images/qr-promptpay.png" alt="PromptPay QR" width={200} height={200} />
                              <p className="mt-2 font-medium">สแกนเพื่อชำระเงินด้วย PromptPay</p>
                              <p className="text-sm text-gray-500">PromptPay ID: 0891234567</p>
                            </div>
                          </TabsContent>
                          <TabsContent value="alipay" className="mt-4">
                            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                              <Image src="/images/qr-alipay.png" alt="Alipay QR" width={200} height={200} />
                              <p className="mt-2 font-medium">สแกนเพื่อชำระเงินด้วย Alipay</p>
                            </div>
                          </TabsContent>
                          <TabsContent value="wechat" className="mt-4">
                            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                              <Image src="/images/qr-wechat.png" alt="WeChat Pay QR" width={200} height={200} />
                              <p className="mt-2 font-medium">สแกนเพื่อชำระเงินด้วย WeChat Pay</p>
                            </div>
                          </TabsContent>
                          <TabsContent value="other" className="mt-4">
                            <FormField
                              control={form.control}
                              name="bankType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>เลือกช่องทางการชำระเงิน</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="เลือกช่องทางการชำระเงิน" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {selectedCountry === "laos" && <SelectItem value="onepay">OnePay Laos</SelectItem>}
                                      {selectedCountry === "vietnam" && <SelectItem value="momo">MoMo</SelectItem>}
                                      {selectedCountry === "vietnam" && <SelectItem value="zalopay">ZaloPay</SelectItem>}
                                      {selectedCountry === "china" && <SelectItem value="unionpay">UnionPay QR</SelectItem>}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "กำลังดำเนินการ..." : "สั่งซื้อและชำระเงิน"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">รายการสินค้า ({cartItems.length})</h4>
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                        {item.product.image_url && (
                          <Image 
                            src={item.product.image_url} 
                            alt={item.product.name} 
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="font-medium line-clamp-1">{item.product.name}</span>
                        <span className="text-gray-500 text-sm">จำนวน: {item.quantity}</span>
                        <span className="text-primary">${item.product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-2">
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
          </Card>
        </div>
      </div>
    </div>
  )
}
