import { supabase } from '@/lib/supabase'
import ClientProductPage from './ClientProductPage'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock_quantity: number
  category?: string
}

// เพิ่มฟังก์ชัน generateStaticParams สำหรับการทำ static export
export async function generateStaticParams() {
  const { data } = await supabase
    .from('products')
    .select('id')
  
  return (data || []).map((product) => ({
    id: product.id,
  }))
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return <ClientProductPage productId={params.id} />
} 