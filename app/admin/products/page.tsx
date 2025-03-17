"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/lib/supabase'
import { Package, Pencil, Trash2, Search, Plus, Filter, RefreshCcw } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock_quantity: number
  category?: string
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลสินค้าได้",
        variant: "destructive"
      })
      return
    }

    setProducts(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!editingProduct) return

    const { name, description, price, image_url, stock_quantity } = editingProduct
    
    const updates = {
      name,
      description,
      price,
      image_url,
      stock_quantity,
      updated_at: new Date()
    }
    
    let result
    
    if (editingProduct.id) {
      // Update existing product
      result = await supabase
        .from('products')
        .update(updates)
        .eq('id', editingProduct.id)
    } else {
      // Create new product
      result = await supabase
        .from('products')
        .insert([{ ...updates, created_at: new Date() }])
    }
    
    const { error } = result
    
    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกสินค้าได้",
        variant: "destructive"
      })
      return
    }
    
    await fetchProducts()
    setEditingProduct(null)
    setIsDialogOpen(false)
    
    toast({
      title: "บันทึกสำเร็จ",
      description: "ข้อมูลสินค้าถูกบันทึกเรียบร้อยแล้ว",
    })
  }

  async function deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสินค้าได้",
        variant: "destructive"
      })
      return
    }
    
    await fetchProducts()
    
    toast({
      title: "ลบสำเร็จ",
      description: "สินค้าถูกลบออกจากระบบแล้ว",
    })
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "low-stock") return matchesSearch && product.stock_quantity < 10;
    if (activeTab === "out-stock") return matchesSearch && product.stock_quantity === 0;
    
    return matchesSearch && product.category === activeTab;
  });

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return <Badge variant="destructive">หมด</Badge>;
    if (quantity < 10) return <Badge variant="warning" className="bg-amber-500">ใกล้หมด</Badge>;
    return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">มีสินค้า</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">จัดการสินค้า</h1>
          <p className="text-muted-foreground">ดูและจัดการสินค้าทั้งหมดในระบบ</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct({
              id: '',
              name: '',
              description: '',
              price: 0,
              image_url: '',
              stock_quantity: 0
            })}>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มสินค้าใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editingProduct?.id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</DialogTitle>
              <DialogDescription>
                กรอกรายละเอียดสินค้าให้ครบถ้วน แล้วกดบันทึกเมื่อเสร็จสิ้น
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อสินค้า</Label>
                  <Input
                    id="name"
                    value={editingProduct?.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct!, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">ราคา (บาท)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={editingProduct?.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct!, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียดสินค้า</Label>
                <Textarea
                  id="description"
                  value={editingProduct?.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct!, description: e.target.value })}
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image">URL รูปภาพ</Label>
                  <Input
                    id="image"
                    value={editingProduct?.image_url || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct!, image_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">จำนวนในคลัง</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={editingProduct?.stock_quantity || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct!, stock_quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit">บันทึก</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ค้นหาสินค้า..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>กรองตามหมวดหมู่</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setActiveTab("all")}>ทั้งหมด</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab("beauty")}>เครื่องสำอาง</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab("skincare")}>สกินแคร์</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab("haircare")}>ผลิตภัณฑ์ดูแลเส้นผม</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="icon" onClick={fetchProducts}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
          <TabsTrigger value="low-stock">ใกล้หมด</TabsTrigger>
          <TabsTrigger value="out-stock">หมดแล้ว</TabsTrigger>
          <TabsTrigger value="skincare">สกินแคร์</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card className="border-none shadow-md">
            <CardHeader className="px-6 py-4">
              <CardTitle>รายการสินค้า ({filteredProducts.length})</CardTitle>
              <CardDescription>รายชื่อสินค้าทั้งหมดในระบบ</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">รูป</TableHead>
                    <TableHead className="w-[300px]">ชื่อสินค้า</TableHead>
                    <TableHead>ราคา</TableHead>
                    <TableHead>สต็อก</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        ไม่พบสินค้าที่ค้นหา
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.name}
                          <p className="text-xs text-muted-foreground truncate max-w-[250px]">{product.description}</p>
                        </TableCell>
                        <TableCell>{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(product.price)}</TableCell>
                        <TableCell>{product.stock_quantity}</TableCell>
                        <TableCell>{getStockStatus(product.stock_quantity)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => {
                                setEditingProduct(product)
                                setIsDialogOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="icon"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}