-- สร้างตาราง users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT
);

-- เปิดใช้งาน Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล
-- ผู้ใช้สามารถอ่านข้อมูลของตัวเองได้เท่านั้น
CREATE POLICY "Users can view their own data" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- สร้าง policy สำหรับการแก้ไขข้อมูล
-- ผู้ใช้สามารถแก้ไขข้อมูลของตัวเองได้เท่านั้น
CREATE POLICY "Users can update their own data" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- สร้าง function สำหรับการสร้างข้อมูลผู้ใช้ใหม่อัตโนมัติเมื่อมีการลงทะเบียน
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- สร้าง trigger สำหรับการเรียกใช้ function เมื่อมีการสร้างผู้ใช้ใหม่
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 