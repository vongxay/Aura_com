"use client"

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { supabase } from '@/lib/supabase'
import { useToast } from "@/components/ui/use-toast"
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const { toast } = useToast()
  const { addToCart, isLoading } = useCart()

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      })
      return
    }

    setProducts(data)
  }, [toast])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1)
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8">สินค้าทั้งหมด</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <Link href={`/products/${product.id}`}>
              <CardContent className="p-0 cursor-pointer">
                <div className="relative h-[200px]">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">${product.price}</span>
                  </div>
                </div>
              </CardContent>
            </Link>
            <CardFooter className="p-4 pt-0">
              <Button 
                className="w-full"
                onClick={() => handleAddToCart(product)}
                disabled={isLoading}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                เพิ่มลงตะกร้า
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}