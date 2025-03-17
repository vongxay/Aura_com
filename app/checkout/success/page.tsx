"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Printer, Home, FileText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface OrderItem {
  id: string
  product_id: string
  order_id: string
  quantity: number
  price: number
  product: {
    name: string
    image_url: string
  }
}

interface Order {
  id: string
  created_at: string
  status: string
  total_amount: number
  shipping_address: string
  payment_method: string
  payment_status: string
  payment_proof_url: string | null
  full_name: string
  email: string
  phone: string
  bank_type: string | null
  items: OrderItem[]
  payment_history: PaymentHistory[]
}

interface PaymentHistory {
  id: string
  payment_date: string
  amount: number
  payment_method: string
  payment_status: string
  proof_url: string | null
  notes: string | null
}

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setError('ไม่พบรหัสคำสั่งซื้อ')
      setLoading(false)
      return
    }

    async function fetchOrder() {
      try {
        // ดึงข้อมูลคำสั่งซื้อ
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()

        if (orderError) throw new Error('ไม่พบข้อมูลคำสั่งซื้อ')
        
        // ดึงข้อมูลรายการสินค้าในคำสั่งซื้อ
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            product:product_id (
              name,
              image_url
            )
          `)
          .eq('order_id', orderId)

        if (itemsError) throw new Error('ไม่พบข้อมูลรายการสินค้า')
        
        // ดึงข้อมูลประวัติการชำระเงิน
        const { data: paymentHistory, error: paymentError } = await supabase
          .from('payment_history')
          .select('*')
          .eq('order_id', orderId)
          .order('payment_date', { ascending: false })
          
        if (paymentError) {
          console.error('ไม่สามารถดึงข้อมูลประวัติการชำระเงิน:', paymentError)
        }

        setOrder({ 
          ...orderData, 
          items: orderItems,
          payment_history: paymentHistory || []
        })
      } catch (err) {
        console.error('Error fetching order:', err)
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-6">{error || 'ไม่สามารถดึงข้อมูลคำสั่งซื้อได้'}</p>
          <Link href="/">
            <Button>กลับไปยังหน้าหลัก</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  
  const paymentStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="max-w-4xl mx-auto my-12 p-6 print:p-4 print:shadow-none">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <div className="flex items-center">
          <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">การสั่งซื้อสำเร็จ</h1>
        </div>
        <div className="space-x-3">
          <Button onClick={handlePrint} variant="outline" className="flex items-center">
            <Printer className="h-4 w-4 mr-2" />
            พิมพ์ใบเสร็จ
          </Button>
          <Link href="/">
            <Button variant="default" className="flex items-center">
              <Home className="h-4 w-4 mr-2" />
              กลับหน้าหลัก
            </Button>
          </Link>
        </div>
      </div>

      <Card className="print:shadow-none border print:border-none">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">ใบเสร็จรับเงิน</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">เลขที่คำสั่งซื้อ: {order.id}</p>
              <p className="text-sm text-muted-foreground">วันที่สั่งซื้อ: {formatDate(order.created_at)}</p>
            </div>
            <div className="text-right print:hidden">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                สถานะ: {order.status === 'pending' ? 'รอดำเนินการ' : 
                        order.status === 'confirmed' ? 'ยืนยันแล้ว' : 
                        order.status === 'processing' ? 'กำลังดำเนินการ' : 
                        order.status === 'shipped' ? 'จัดส่งแล้ว' : 
                        order.status === 'delivered' ? 'จัดส่งเรียบร้อย' : 
                        order.status === 'cancelled' ? 'ยกเลิก' : order.status}
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${paymentStatusColors[order.payment_status as keyof typeof paymentStatusColors] || 'bg-gray-100 text-gray-800'}`}>
                การชำระเงิน: {order.payment_status === 'pending' ? 'รอการตรวจสอบ' : 
                           order.payment_status === 'confirmed' ? 'ยืนยันแล้ว' : 
                           order.payment_status === 'cancelled' ? 'ยกเลิก' : 
                           order.payment_status === 'refunded' ? 'คืนเงิน' : order.payment_status}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">ข้อมูลลูกค้า</h3>
              <p className="text-gray-700">{order.full_name}</p>
              <p className="text-gray-700">{order.email}</p>
              <p className="text-gray-700">{order.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">ที่อยู่จัดส่ง</h3>
              <p className="text-gray-700">{order.shipping_address}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">รายการสินค้า</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สินค้า</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.product.image_url && (
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              <Image 
                                src={item.product.image_url} 
                                alt={item.product.name}
                                width={40}
                                height={40}
                                className="rounded-md object-cover"
                              />
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                        ฿{item.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">ยอดรวม:</span>
              <span className="text-gray-900 font-medium">฿{order.total_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">ค่าจัดส่ง:</span>
              <span className="text-gray-900 font-medium">ฟรี</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-lg font-bold text-gray-900">ยอดรวมทั้งสิ้น:</span>
              <span className="text-lg font-bold text-gray-900">฿{order.total_amount.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">วิธีการชำระเงิน</h3>
            <p className="text-gray-700">
              {order.payment_method === 'bank_transfer' ? 'โอนเงินผ่านธนาคาร' + (order.bank_type ? ` (${order.bank_type})` : '') : 
               order.payment_method === 'credit_card' ? 'บัตรเครดิต' : 
               order.payment_method === 'qr_code' ? 'QR Code' : order.payment_method}
            </p>
            
            {order.payment_history && order.payment_history.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">ประวัติการชำระเงิน</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  {order.payment_history.map((payment, index) => (
                    <div key={payment.id} className={`${index > 0 ? 'border-t pt-2 mt-2' : ''}`}>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">วันที่</span>
                        <span className="text-gray-900">{formatDate(payment.payment_date)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">จำนวนเงิน</span>
                        <span className="text-gray-900">฿{payment.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">สถานะ</span>
                        <span className={`${
                          payment.payment_status === 'confirmed' ? 'text-green-600' : 
                          payment.payment_status === 'pending' ? 'text-yellow-600' : 
                          payment.payment_status === 'cancelled' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {payment.payment_status === 'pending' ? 'รอการตรวจสอบ' : 
                          payment.payment_status === 'confirmed' ? 'ยืนยันแล้ว' : 
                          payment.payment_status === 'cancelled' ? 'ยกเลิก' : 
                          payment.payment_status}
                        </span>
                      </div>
                      {payment.notes && (
                        <div className="text-sm text-gray-600 mt-1">
                          หมายเหตุ: {payment.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {order.payment_proof_url && (
              <div className="mt-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">หลักฐานการชำระเงิน</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payments/${order.payment_proof_url}`}
                    alt="หลักฐานการชำระเงิน"
                    width={300}
                    height={200}
                    className="object-contain mx-auto"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t p-6 bg-gray-50 print:bg-white">
          <div className="w-full text-center">
            <div className="flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-gray-500 mr-2" />
              <p className="text-gray-600">คำสั่งซื้อทั้งหมดจะได้รับการยืนยันทางอีเมล</p>
            </div>
            <p className="text-sm text-gray-500">หากมีคำถามหรือต้องการความช่วยเหลือเพิ่มเติม โปรดติดต่อเรา</p>
            <div className="mt-4 print:hidden">
              <Link href="/orders">
                <Button variant="outline">ดูคำสั่งซื้อทั้งหมด</Button>
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
