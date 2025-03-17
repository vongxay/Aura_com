-- ตารางสำหรับคำสั่งซื้อ (orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_method VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
    payment_proof_url TEXT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    bank_type VARCHAR(50),
    transaction_ref VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS สำหรับตาราง orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ผู้ใช้สามารถดูคำสั่งซื้อของตัวเองได้" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "ผู้ใช้สามารถสร้างคำสั่งซื้อของตัวเองได้" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ผู้ใช้สามารถอัปเดตคำสั่งซื้อของตัวเองได้" 
ON public.orders FOR UPDATE 
USING (auth.uid() = user_id);

-- ตารางสำหรับรายการสินค้าในคำสั่งซื้อ (order_items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS สำหรับตาราง order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ผู้ใช้สามารถดูรายการในคำสั่งซื้อของตัวเองได้" 
ON public.order_items FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

CREATE POLICY "ผู้ใช้สามารถเพิ่มรายการในคำสั่งซื้อของตัวเองได้" 
ON public.order_items FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- ตารางสำหรับตะกร้าสินค้า (cart_items)
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

-- RLS สำหรับตาราง cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ผู้ใช้สามารถดูตะกร้าสินค้าของตัวเองได้" 
ON public.cart_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "ผู้ใช้สามารถเพิ่มสินค้าในตะกร้าของตัวเองได้" 
ON public.cart_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ผู้ใช้สามารถอัปเดตสินค้าในตะกร้าของตัวเองได้" 
ON public.cart_items FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "ผู้ใช้สามารถลบสินค้าในตะกร้าของตัวเองได้" 
ON public.cart_items FOR DELETE 
USING (auth.uid() = user_id);

-- ตารางสำหรับประวัติการชำระเงิน (payment_history)
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    transaction_ref VARCHAR(100),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS สำหรับตาราง payment_history
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ผู้ใช้สามารถดูประวัติการชำระเงินของตัวเองได้" 
ON public.payment_history FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payment_history.order_id AND orders.user_id = auth.uid()));

-- สร้าง storage bucket สำหรับหลักฐานการชำระเงิน
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('payments', 'รูปภาพหลักฐานการชำระเงิน', false, 5242880, array['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- ตั้งค่า RLS สำหรับ payments bucket
DROP POLICY IF EXISTS "ผู้ใช้ที่ล็อกอินสามารถดูหลักฐานการชำระเงินของตัวเองได้" ON storage.objects;
CREATE POLICY "ผู้ใช้ที่ล็อกอินสามารถดูหลักฐานการชำระเงินของตัวเองได้"
ON storage.objects FOR SELECT
USING (auth.role() = 'authenticated' AND bucket_id = 'payments' AND 
       EXISTS (
         SELECT 1 FROM public.orders o 
         WHERE o.user_id = auth.uid() AND 
               (storage.filename(name) LIKE CONCAT('payment-proof/', o.id, '-%'))
       ));

DROP POLICY IF EXISTS "ผู้ใช้ที่ล็อกอินสามารถอัปโหลดหลักฐานการชำระเงินได้" ON storage.objects;
CREATE POLICY "ผู้ใช้ที่ล็อกอินสามารถอัปโหลดหลักฐานการชำระเงินได้"
ON storage.objects FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'payments');

-- สร้าง function สำหรับอัพเดทเวลาล่าสุด
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- สร้าง trigger สำหรับอัพเดทเวลาล่าสุดในตาราง
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('orders', 'order_items', 'cart_items', 'payment_history')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
      CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
    ', t, t);
  END LOOP;
END;
$$ LANGUAGE plpgsql; 