-- สร้างตาราง admin_users ถ้ายังไม่มี
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- เปิดใช้งาน Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล
-- เฉพาะผู้ใช้ที่เป็น admin เท่านั้นที่สามารถอ่านข้อมูลทั้งหมดได้
CREATE POLICY "Admins can view all admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ผู้ใช้สามารถอ่านข้อมูลของตัวเองได้เท่านั้น
CREATE POLICY "Users can view their own admin data" 
  ON public.admin_users 
  FOR SELECT 
  USING (auth.uid() = id);

-- สร้าง policy สำหรับการแก้ไขข้อมูล
-- เฉพาะผู้ใช้ที่เป็น admin เท่านั้นที่สามารถแก้ไขข้อมูลทั้งหมดได้
CREATE POLICY "Admins can update all admin users" 
  ON public.admin_users 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ผู้ใช้ที่เป็น manager สามารถแก้ไขข้อมูลของตัวเองได้เท่านั้น
CREATE POLICY "Managers can update their own data" 
  ON public.admin_users 
  FOR UPDATE 
  USING (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

-- ฟังก์ชันสำหรับการอัปเดตเวลาที่แก้ไขล่าสุด
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- สร้างทริกเกอร์สำหรับการอัปเดตเวลาที่แก้ไขล่าสุด
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- เพิ่มข้อมูลผู้ดูแลระบบเริ่มต้น
-- 1. สร้างผู้ใช้ admin
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- สร้างผู้ใช้ใน auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'admin@gmail.com',
    -- รหัสผ่าน: admin@999
    crypt('admin@999', gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin"}',
    false
  )
  RETURNING id INTO admin_user_id;

  -- เพิ่มข้อมูลผู้ใช้ในตาราง admin_users
  INSERT INTO public.admin_users (id, email, role)
  VALUES (admin_user_id, 'admin@gmail.com', 'admin');
END
$$;

-- 2. สร้างผู้ใช้ manager
DO $$
DECLARE
  manager_user_id UUID;
BEGIN
  -- สร้างผู้ใช้ใน auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'manager@gmail.com',
    -- รหัสผ่าน: manager@999
    crypt('manager@999', gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{"name":"Manager"}',
    false
  )
  RETURNING id INTO manager_user_id;

  -- เพิ่มข้อมูลผู้ใช้ในตาราง admin_users
  INSERT INTO public.admin_users (id, email, role)
  VALUES (manager_user_id, 'manager@gmail.com', 'manager');
END
$$; 