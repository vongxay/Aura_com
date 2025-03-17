import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';

export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

export function useCart() {
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCartItemsCount();

    // เพิ่ม event listener เพื่อรับฟังการเปลี่ยนแปลงของตะกร้า
    window.addEventListener('cartUpdated', fetchCartItemsCount);
    
    return () => {
      window.removeEventListener('cartUpdated', fetchCartItemsCount);
    };
  }, []);

  async function fetchCartItemsCount() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // ถ้ามีการล็อกอิน ดึงข้อมูลจาก supabase
        const { data, error } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', session.user.id);

        if (error) {
          console.error("Error fetching cart items:", error);
          return;
        }

        // นับรวมจำนวนสินค้าทั้งหมด
        const totalItems = data.reduce((sum: number, item: {quantity?: number}) => sum + (item.quantity || 1), 0);
        setCartItemsCount(totalItems);
      } else {
        // ถ้าไม่มีการล็อกอิน ดึงข้อมูลจาก localStorage
        const localCartItems = localStorage.getItem('cartItems');
        if (localCartItems) {
          try {
            const items = JSON.parse(localCartItems);
            // นับรวมจำนวนสินค้าทั้งหมด
            const totalItems = items.reduce((sum: number, item: {quantity?: number}) => sum + (item.quantity || 1), 0);
            setCartItemsCount(totalItems);
          } catch (e) {
            console.error("Error parsing cart items from localStorage:", e);
            setCartItemsCount(0);
          }
        } else {
          setCartItemsCount(0);
        }
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      // ในกรณีที่มีข้อผิดพลาด ลองดึงข้อมูลจาก localStorage
      const localCartItems = localStorage.getItem('cartItems');
      if (localCartItems) {
        try {
          const items = JSON.parse(localCartItems);
          const totalItems = items.reduce((sum: number, item: {quantity?: number}) => sum + (item.quantity || 1), 0);
          setCartItemsCount(totalItems);
        } catch (e) {
          console.error("Error parsing cart items from localStorage:", e);
          setCartItemsCount(0);
        }
      }
    }
  }

  async function addToCart(product: Product, quantity: number = 1) {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // ถ้ามีการล็อกอิน บันทึกข้อมูลไปยัง supabase
        // ตรวจสอบว่าสินค้านี้อยู่ในตะกร้าอยู่แล้วหรือไม่
        const { data: existingItems, error: fetchError } = await supabase
          .from('cart_items')
          .select()
          .eq('user_id', session.user.id)
          .eq('product_id', product.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (existingItems) {
          // อัปเดตจำนวนสินค้าที่มีอยู่แล้ว
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: existingItems.quantity + quantity })
            .eq('id', existingItems.id);

          if (updateError) throw updateError;
        } else {
          // เพิ่มสินค้าใหม่เข้าตะกร้า
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({
              user_id: session.user.id,
              product_id: product.id,
              quantity
            });

          if (insertError) throw insertError;
        }
      } else {
        // ถ้าไม่มีการล็อกอิน บันทึกข้อมูลไว้ใน localStorage
        let cartItems = [];
        const localCartItems = localStorage.getItem('cartItems');
        
        if (localCartItems) {
          cartItems = JSON.parse(localCartItems);
          const existingItemIndex = cartItems.findIndex((item: any) => item.product_id === product.id);
          
          if (existingItemIndex >= 0) {
            // อัปเดตจำนวนสินค้าที่มีอยู่แล้ว
            cartItems[existingItemIndex].quantity += quantity;
          } else {
            // เพิ่มสินค้าใหม่
            cartItems.push({
              product_id: product.id,
              product_name: product.name,
              product_price: product.price,
              product_image: product.image_url,
              quantity
            });
          }
        } else {
          // สร้างตะกร้าใหม่
          cartItems.push({
            product_id: product.id,
            product_name: product.name,
            product_price: product.price,
            product_image: product.image_url,
            quantity
          });
        }
        
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
      }

      // แจ้งเตือนการอัปเดตตะกร้าด้วย custom event แทนที่จะเรียก fetchCartItemsCount
      window.dispatchEvent(new Event('cartUpdated'));
      
      toast({
        title: "เพิ่มสินค้าสำเร็จ",
        description: `เพิ่ม ${product.name} เข้าตะกร้าแล้ว`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มสินค้าลงตะกร้าได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    cartItemsCount,
    isLoading,
    addToCart,
    refreshCart: fetchCartItemsCount
  };
} 