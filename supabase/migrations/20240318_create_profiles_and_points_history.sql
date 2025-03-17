-- สร้างตาราง profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT
);

-- เปิดใช้งาน Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล
-- ผู้ใช้สามารถอ่านข้อมูลของตัวเองได้เท่านั้น
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" 
      ON public.profiles 
      FOR SELECT 
      USING (auth.uid() = id);
  END IF;
END
$$;

-- สร้าง policy สำหรับการแก้ไขข้อมูล
-- ผู้ใช้สามารถแก้ไขข้อมูลของตัวเองได้เท่านั้น
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" 
      ON public.profiles 
      FOR UPDATE 
      USING (auth.uid() = id);
  END IF;
END
$$;

-- สร้าง policy สำหรับการสร้างข้อมูล
-- ผู้ใช้สามารถสร้างข้อมูลของตัวเองได้เท่านั้น
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" 
      ON public.profiles 
      FOR INSERT 
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- สร้าง function สำหรับการสร้างข้อมูลโปรไฟล์ใหม่อัตโนมัติเมื่อมีการลงทะเบียน
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- สร้าง trigger สำหรับการเรียกใช้ function เมื่อมีการสร้างผู้ใช้ใหม่
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- สร้างตาราง points_history
CREATE TABLE IF NOT EXISTS public.points_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- เปิดใช้งาน Row Level Security
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล
-- ผู้ใช้สามารถอ่านข้อมูลของตัวเองได้เท่านั้น
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'points_history' AND policyname = 'Users can view their own points history'
  ) THEN
    CREATE POLICY "Users can view their own points history" 
      ON public.points_history 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- สร้าง policy สำหรับการสร้างข้อมูล (สำหรับแอดมิน)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'points_history' AND policyname = 'Only admins can insert points history'
  ) THEN
    CREATE POLICY "Only admins can insert points history" 
      ON public.points_history 
      FOR INSERT 
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_users 
          WHERE admin_users.id = auth.uid()
        )
      );
  END IF;
END
$$;

-- ตรวจสอบว่ามีตาราง user_points หรือไม่ ถ้าไม่มีให้สร้าง
CREATE TABLE IF NOT EXISTS public.user_points (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  points INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- เปิดใช้งาน Row Level Security
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล
-- ผู้ใช้สามารถอ่านข้อมูลของตัวเองได้เท่านั้น
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_points' AND policyname = 'Users can view their own points'
  ) THEN
    CREATE POLICY "Users can view their own points" 
      ON public.user_points 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- สร้าง policy สำหรับการแก้ไขข้อมูล (สำหรับแอดมิน)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_points' AND policyname = 'Only admins can update points'
  ) THEN
    CREATE POLICY "Only admins can update points" 
      ON public.user_points 
      FOR UPDATE 
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_users 
          WHERE admin_users.id = auth.uid()
        )
      );
  END IF;
END
$$;

-- สร้าง function สำหรับการอัปเดตคะแนนสะสมเมื่อมีการเพิ่มประวัติคะแนน
CREATE OR REPLACE FUNCTION public.update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  -- ถ้ามีข้อมูลอยู่แล้วให้อัปเดต ถ้าไม่มีให้สร้างใหม่
  INSERT INTO public.user_points (user_id, points, updated_at)
  VALUES (NEW.user_id, NEW.points, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    points = user_points.points + NEW.points,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- สร้าง trigger สำหรับการเรียกใช้ function เมื่อมีการเพิ่มประวัติคะแนน
DROP TRIGGER IF EXISTS on_points_history_inserted ON public.points_history;
CREATE TRIGGER on_points_history_inserted
  AFTER INSERT ON public.points_history
  FOR EACH ROW EXECUTE FUNCTION public.update_user_points(); 