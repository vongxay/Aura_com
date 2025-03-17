/*
  # AuraClear Database Schema
  
  ไฟล์นี้ประกอบด้วยโครงสร้างฐานข้อมูลหลักสำหรับระบบ AuraClear
  
  โครงสร้างตาราง:
  1. profiles - ข้อมูลโปรไฟล์ผู้ใช้
  2. products - ข้อมูลสินค้า
  3. categories - หมวดหมู่สินค้า
  4. product_images - รูปภาพสินค้า
  5. inventory - ข้อมูลสต็อกสินค้า
  6. promotions - โปรโมชั่นและส่วนลด
*/

-- ตาราง profiles (ข้อมูลโปรไฟล์ผู้ใช้)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  district TEXT,
  province TEXT,
  postal_code TEXT,
  is_admin BOOLEAN DEFAULT false
);

-- เปิดใช้งาน Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล
CREATE POLICY "ผู้ใช้สามารถดูข้อมูลโปรไฟล์ของตัวเองได้" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- สร้าง policy สำหรับการแก้ไขข้อมูล
CREATE POLICY "ผู้ใช้สามารถแก้ไขข้อมูลโปรไฟล์ของตัวเองได้" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- ตาราง categories (หมวดหมู่สินค้า)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- เปิดใช้งาน Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล
CREATE POLICY "ทุกคนสามารถดูหมวดหมู่สินค้าได้" 
  ON public.categories 
  FOR SELECT 
  TO PUBLIC
  USING (true);

-- สร้าง policy สำหรับการแก้ไขข้อมูล (เฉพาะแอดมิน)
CREATE POLICY "เฉพาะแอดมินสามารถแก้ไขหมวดหมู่สินค้าได้" 
  ON public.categories 
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ตาราง products (สินค้า)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  category_id UUID REFERENCES public.categories(id),
  features JSONB,
  specifications JSONB,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- เปิดใช้งาน Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล
CREATE POLICY "ทุกคนสามารถดูสินค้าที่เปิดใช้งานได้" 
  ON public.products 
  FOR SELECT 
  TO PUBLIC
  USING (is_active = true);

-- สร้าง policy สำหรับการแก้ไขข้อมูล (เฉพาะแอดมิน)
CREATE POLICY "เฉพาะแอดมินสามารถแก้ไขสินค้าได้" 
  ON public.products 
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ตาราง product_images (รูปภาพสินค้า)
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- เปิดใช้งาน Row Level Security
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล
CREATE POLICY "ทุกคนสามารถดูรูปภาพสินค้าได้" 
  ON public.product_images 
  FOR SELECT 
  TO PUBLIC
  USING (true);

-- สร้าง policy สำหรับการแก้ไขข้อมูล (เฉพาะแอดมิน)
CREATE POLICY "เฉพาะแอดมินสามารถแก้ไขรูปภาพสินค้าได้" 
  ON public.product_images 
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ตาราง inventory (สต็อกสินค้า)
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  low_stock_threshold INTEGER DEFAULT 5,
  last_restock_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- เปิดใช้งาน Row Level Security
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล (เฉพาะแอดมิน)
CREATE POLICY "เฉพาะแอดมินสามารถดูข้อมูลสต็อกสินค้าได้" 
  ON public.inventory 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- สร้าง policy สำหรับการแก้ไขข้อมูล (เฉพาะแอดมิน)
CREATE POLICY "เฉพาะแอดมินสามารถแก้ไขข้อมูลสต็อกสินค้าได้" 
  ON public.inventory 
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ตาราง promotions (โปรโมชั่นและส่วนลด)
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- เปิดใช้งาน Row Level Security
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล
CREATE POLICY "ทุกคนสามารถดูโปรโมชั่นที่เปิดใช้งานได้" 
  ON public.promotions 
  FOR SELECT 
  TO PUBLIC
  USING (is_active = true AND start_date <= now() AND end_date >= now());

-- สร้าง policy สำหรับการแก้ไขข้อมูล (เฉพาะแอดมิน)
CREATE POLICY "เฉพาะแอดมินสามารถแก้ไขโปรโมชั่นได้" 
  ON public.promotions 
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- สร้าง function สำหรับอัพเดทเวลาล่าสุด
CREATE OR REPLACE FUNCTION public.update_timestamp_column()
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
    AND table_name IN ('profiles', 'categories', 'products', 'product_images', 'inventory', 'promotions')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_timestamp ON public.%I;
      CREATE TRIGGER set_updated_timestamp
      BEFORE UPDATE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();
    ', t, t);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- สร้าง function สำหรับการสร้างข้อมูลโปรไฟล์ผู้ใช้ใหม่อัตโนมัติเมื่อมีการลงทะเบียน
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- สร้าง trigger สำหรับการเรียกใช้ function เมื่อมีการสร้างผู้ใช้ใหม่
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- สร้าง storage bucket สำหรับรูปภาพสินค้า
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product_images', 'รูปภาพสินค้า', true, 5242880, array['image/png', 'image/jpeg', 'image/jpg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- สร้าง storage bucket สำหรับรูปโปรไฟล์
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'รูปโปรไฟล์', true, 2097152, array['image/png', 'image/jpeg', 'image/jpg'])
ON CONFLICT (id) DO NOTHING; 