"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  Printer, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Package, 
  CreditCard,
  FileText,
  FileImage
} from 'lucide-react'
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

interface PaymentHistory {
  id: string
  payment_date: string
  amount: number
  payment_method: string
  payment_status: string
  proof_url: string | null
  notes: string | null
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
  user: {
    id: string
    email: string
  }
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrderDetails()
  }, [params.id])

  async function fetchOrderDetails() {
    try {
      setLoading(true)
      
      // ดึงข้อมูลคำสั่งซื้อ
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          user:user_id(
            id,
            email
          )
        `)
        .eq('id', params.id)
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
        .eq('order_id', params.id)

      if (itemsError) throw new Error('ไม่พบข้อมูลรายการสินค้า')
      
      // ดึงข้อมูลประวัติการชำระเงิน
      const { data: paymentHistory, error: paymentError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('order_id', params.id)
        .order('payment_date', { ascending: false })
        
      if (paymentError) {
        console.error('ไม่สามารถดึงข้อมูลประวัติการชำระเงิน:', paymentError)
      }

      setOrder({ 
        ...orderData, 
        items: orderItems,
        payment_history: paymentHistory || []
      })
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถดึงข้อมูลคำสั่งซื้อได้",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  async function confirmPayment() {
    if (!order) return
    
    try {
      // อัปเดตสถานะการชำระเงินในคำสั่งซื้อ
      const { error: updateOrderError } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'confirmed',
          status: order.status === 'pending' ? 'confirmed' : order.status
        })
        .eq('id', order.id)
      
      if (updateOrderError) throw updateOrderError
      
      // อัปเดตสถานะการชำระเงินในประวัติการชำระเงินล่าสุด
      if (order.payment_history && order.payment_history.length > 0) {
        const { error: updateHistoryError } = await supabase
          .from('payment_history')
          .update({ payment_status: 'confirmed' })
          .eq('id', order.payment_history[0].id)
        
        if (updateHistoryError) {
          console.error('ไม่สามารถอัปเดตประวัติการชำระเงิน:', updateHistoryError)
        }
      }
      
      toast({
        title: "ยืนยันการชำระเงินสำเร็จ",
        description: "สถานะการชำระเงินถูกอัปเดตเป็น 'ยืนยันแล้ว'",
      })
      
      // อัปเดตข้อมูลในหน้าจอ
      if (order) {
        setOrder({
          ...order,
          payment_status: 'confirmed',
          status: order.status === 'pending' ? 'confirmed' : order.status,
          payment_history: order.payment_history.map((payment, index) => 
            index === 0 ? { ...payment, payment_status: 'confirmed' } : payment
          )
        })
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถยืนยันการชำระเงินได้",
        variant: "destructive"
      })
    } finally {
      setConfirmDialogOpen(false)
    }
  }

  async function cancelPayment() {
    if (!order) return
    
    try {
      // อัปเดตสถานะการชำระเงินในคำสั่งซื้อ
      const { error: updateOrderError } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'cancelled'
        })
        .eq('id', order.id)
      
      if (updateOrderError) throw updateOrderError
      
      // อัปเดตสถานะการชำระเงินในประวัติการชำระเงินล่าสุด
      if (order.payment_history && order.payment_history.length > 0) {
        const { error: updateHistoryError } = await supabase
          .from('payment_history')
          .update({ payment_status: 'cancelled' })
          .eq('id', order.payment_history[0].id)
        
        if (updateHistoryError) {
          console.error('ไม่สามารถอัปเดตประวัติการชำระเงิน:', updateHistoryError)
        }
      }
      
      toast({
        title: "ยกเลิกการชำระเงินสำเร็จ",
        description: "สถานะการชำระเงินถูกอัปเดตเป็น 'ยกเลิก'",
      })
      
      // อัปเดตข้อมูลในหน้าจอ
      if (order) {
        setOrder({
          ...order,
          payment_status: 'cancelled',
          payment_history: order.payment_history.map((payment, index) => 
            index === 0 ? { ...payment, payment_status: 'cancelled' } : payment
          )
        })
      }
    } catch (error) {
      console.error('Error cancelling payment:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถยกเลิกการชำระเงินได้",
        variant: "destructive"
      })
    } finally {
      setCancelDialogOpen(false)
    }
  }

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

  const viewImage = (imageUrl: string) => {
    setCurrentImage(imageUrl)
    setImageDialogOpen(true)
  }

  const handlePrint = () => {
    window.print()
  }

  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, icon: JSX.Element, label: string }> = {
      pending: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: <Package className="h-4 w-4 mr-2" />, 
        label: "รอดำเนินการ" 
      },
      confirmed: { 
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: <CheckCircle className="h-4 w-4 mr-2" />, 
        label: "ยืนยันแล้ว" 
      },
      processing: { 
        color: "bg-cyan-100 text-cyan-800 border-cyan-200", 
        icon: <Package className="h-4 w-4 mr-2" />, 
        label: "กำลังดำเนินการ" 
      },
      shipped: { 
        color: "bg-indigo-100 text-indigo-800 border-indigo-200", 
        icon: <Truck className="h-4 w-4 mr-2" />, 
        label: "จัดส่งแล้ว" 
      },
      delivered: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: <CheckCircle className="h-4 w-4 mr-2" />, 
        label: "จัดส่งเรียบร้อย" 
      },
      cancelled: { 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: <XCircle className="h-4 w-4 mr-2" />, 
        label: "ยกเลิก" 
      }
    }
    
    const { color, icon, label } = statusMap[status] || { 
      color: "bg-gray-100 text-gray-800 border-gray-200", 
      icon: <Package className="h-4 w-4 mr-2" />, 
      label: status 
    }
    
    return (
      <Badge className={`${color} border px-3 py-1 flex items-center`} variant="outline">
        {icon}
        {label}
      </Badge>
    )
  }

  const renderPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, icon: JSX.Element, label: string }> = {
      pending: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: <CreditCard className="h-4 w-4 mr-2" />, 
        label: "รอตรวจสอบ" 
      },
      confirmed: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: <CheckCircle className="h-4 w-4 mr-2" />, 
        label: "ยืนยันแล้ว" 
      },
      cancelled: { 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: <XCircle className="h-4 w-4 mr-2" />, 
        label: "ยกเลิก" 
      },
      refunded: { 
        color: "bg-gray-100 text-gray-800 border-gray-200", 
        icon: <CreditCard className="h-4 w-4 mr-2" />, 
        label: "คืนเงิน" 
      }
    }
    
    const { color, icon, label } = statusMap[status] || { 
      color: "bg-gray-100 text-gray-800 border-gray-200", 
      icon: <CreditCard className="h-4 w-4 mr-2" />, 
      label: status 
    }
    
    return (
      <Badge className={`${color} border px-3 py-1 flex items-center`} variant="outline">
        {icon}
        {label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="mb-4">
                <XCircle className="h-12 w-12 text-red-500 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูลคำสั่งซื้อ</h2>
              <p className="text-gray-600 mb-6">ไม่พบข้อมูลคำสั่งซื้อที่คุณต้องการดู</p>
              <Link href="/admin/orders">
                <Button>กลับไปยังรายการคำสั่งซื้อ</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/admin/orders" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">รายละเอียดคำสั่งซื้อ</h1>
            <p className="text-gray-500">คำสั่งซื้อหมายเลข: {order.id}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            พิมพ์ใบเสร็จ
          </Button>
          
          {order.payment_status === 'pending' && (
            <>
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setConfirmDialogOpen(true)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                ยืนยันการชำระเงิน
              </Button>
              <Button 
                variant="destructive"
                onClick={() => setCancelDialogOpen(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                ปฏิเสธการชำระเงิน
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">สถานะคำสั่งซื้อ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div>{renderStatusBadge(order.status)}</div>
              <div className="text-sm text-gray-500">อัปเดตล่าสุด: {formatDate(order.updated_at || order.created_at)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">สถานะการชำระเงิน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div>{renderPaymentStatusBadge(order.payment_status)}</div>
              <div className="text-sm text-gray-500">วิธีชำระเงิน: {
                order.payment_method === 'bankTransfer' ? 'โอนผ่านธนาคาร' + (order.bank_type ? ` (${order.bank_type})` : '') :
                order.payment_method === 'creditCard' ? 'บัตรเครดิต' :
                order.payment_method === 'qrCode' ? 'QR Code' : order.payment_method
              }</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">ลูกค้า</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="font-medium">{order.full_name}</div>
              <div>{order.email}</div>
              <div>{order.phone}</div>
              <div className="text-xs text-gray-500 mt-2">User ID: {order.user?.id.slice(0, 8)}...</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>รายการสินค้า</CardTitle>
            </CardHeader>
            <CardContent>
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
              
              <div className="mt-4 border-t pt-4">
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
            </CardContent>
          </Card>
          
          {order.payment_history && order.payment_history.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>ประวัติการชำระเงิน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.payment_history.map((payment, index) => (
                    <div key={payment.id} className={`${index > 0 ? 'border-t pt-4' : ''}`}>
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium text-gray-900">การชำระเงินครั้งที่ {index + 1}</h4>
                        {renderPaymentStatusBadge(payment.payment_status)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">วันที่ชำระเงิน</p>
                          <p className="font-medium">{formatDate(payment.payment_date)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">จำนวนเงิน</p>
                          <p className="font-medium">฿{payment.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">วิธีการชำระเงิน</p>
                          <p className="font-medium">{
                            payment.payment_method === 'bankTransfer' ? 'โอนผ่านธนาคาร' :
                            payment.payment_method === 'creditCard' ? 'บัตรเครดิต' :
                            payment.payment_method === 'qrCode' ? 'QR Code' : payment.payment_method
                          }</p>
                        </div>
                        {payment.notes && (
                          <div>
                            <p className="text-gray-600">หมายเหตุ</p>
                            <p className="font-medium">{payment.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      {payment.proof_url && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">หลักฐานการชำระเงิน</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center text-sm"
                            onClick={() => viewImage(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payments/${payment.proof_url}`)}
                          >
                            <FileImage className="h-4 w-4 mr-2" />
                            ดูหลักฐานการชำระเงิน
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลจัดส่ง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">ชื่อผู้รับ</h4>
                  <p className="text-gray-700">{order.full_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">ที่อยู่จัดส่ง</h4>
                  <p className="text-gray-700 whitespace-pre-line">{order.shipping_address}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">ข้อมูลติดต่อ</h4>
                  <p className="text-gray-700">{order.email}</p>
                  <p className="text-gray-700">{order.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {order.payment_proof_url && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>หลักฐานการชำระเงิน</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => viewImage(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payments/${order.payment_proof_url}`)}
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payments/${order.payment_proof_url}`}
                    alt="หลักฐานการชำระเงิน"
                    width={300}
                    height={200}
                    className="object-contain w-full"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full"
                  onClick={() => viewImage(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payments/${order.payment_proof_url}`)}
                >
                  <FileImage className="h-4 w-4 mr-2" />
                  ดูรูปขนาดเต็ม
                </Button>
              </CardContent>
            </Card>
          )}
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>หมายเหตุ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 text-sm">
                <p>คำสั่งซื้อวันที่ {formatDate(order.created_at)}</p>
                <p>รหัสอ้างอิง: {order.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการชำระเงิน</DialogTitle>
            <DialogDescription>
              คุณต้องการยืนยันการชำระเงินสำหรับคำสั่งซื้อนี้ใช่หรือไม่?
              การยืนยันจะเปลี่ยนสถานะการชำระเงินเป็น "ยืนยันแล้ว"
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>ยกเลิก</Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmPayment}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              ยืนยันการชำระเงิน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ปฏิเสธการชำระเงิน</DialogTitle>
            <DialogDescription>
              คุณต้องการปฏิเสธการชำระเงินสำหรับคำสั่งซื้อนี้ใช่หรือไม่?
              การปฏิเสธจะเปลี่ยนสถานะการชำระเงินเป็น "ยกเลิก"
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>ยกเลิก</Button>
            <Button 
              variant="destructive"
              onClick={cancelPayment}
            >
              <XCircle className="h-4 w-4 mr-2" />
              ปฏิเสธการชำระเงิน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>หลักฐานการชำระเงิน</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-2">
            {currentImage && (
              <Image
                src={currentImage}
                alt="หลักฐานการชำระเงิน"
                width={800}
                height={600}
                className="object-contain max-h-[70vh]"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>ปิด</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
</rewritten_file>