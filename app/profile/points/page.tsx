"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/lib/supabase'
import { Award, ArrowLeft, Loader2, Gift } from "lucide-react"
import Link from 'next/link'

interface PointsData {
  points: number
  updated_at: string
}

interface PointsHistory {
  id: string
  user_id: string
  points: number
  description: string
  created_at: string
}

export default function ProfilePointsPage() {
  const [pointsData, setPointsData] = useState<PointsData | null>(null)
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const fetchPoints = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('points, updated_at')
        .eq('user_id', userId)
        .single()

      if (error) {
        // ถ้าเป็นข้อผิดพลาดที่ไม่พบข้อมูล ใช้ค่าเริ่มต้น
        if (error.code === 'PGRST116') {
          // ไม่พบข้อมูล ใช้ค่าเริ่มต้น
          setPointsData({ points: 0, updated_at: new Date().toISOString() })
          return
        }
        throw error
      }

      setPointsData(data)
    } catch (error) {
      console.error('Error fetching points:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลคะแนนสะสมได้",
        variant: "destructive"
      })
      // ตั้งค่าเริ่มต้นเพื่อให้ UI ยังแสดงผลได้
      setPointsData({ points: 0, updated_at: new Date().toISOString() })
    }
  }, [setPointsData, toast])

  const fetchPointsHistory = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      setPointsHistory(data || [])
    } catch (error) {
      console.error('Error fetching points history:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงประวัติคะแนนสะสมได้",
        variant: "destructive"
      })
      // ตั้งค่าเป็นอาร์เรย์ว่างเพื่อไม่ให้ UI แสดงผิดพลาด
      setPointsHistory([])
    }
  }, [setPointsHistory, toast])

  const checkUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth')
        return
      }

      try {
        await Promise.all([
          fetchPoints(session.user.id),
          fetchPointsHistory(session.user.id)
        ])
      } catch (fetchError) {
        console.error('Error fetching user data:', fetchError)
        // ยังคงแสดงข้อมูลที่โหลดได้บางส่วน ไม่ redirect ผู้ใช้
      }
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/auth')
    } finally {
      setIsLoading(false)
    }
  }, [router, fetchPoints, fetchPointsHistory, setIsLoading])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-500">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">คะแนนสะสมของฉัน</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ส่วนซ้าย - แสดงคะแนนสะสม */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Award className="h-12 w-12 text-amber-600" />
            </div>
            
            <h2 className="text-4xl font-bold text-amber-600">
              {pointsData?.points || 0}
            </h2>
            <p className="text-gray-500 mb-4">คะแนนสะสมทั้งหมด</p>
            
            <div className="w-full mt-4">
              <Button 
                variant="outline" 
                className="w-full justify-center"
                asChild
              >
                <Link href="/products">
                  <Gift className="mr-2 h-4 w-4" />
                  แลกของรางวัล
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* ส่วนขวา - ประวัติคะแนน */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>ประวัติคะแนนสะสม</CardTitle>
            <CardDescription>รายการเคลื่อนไหวคะแนนสะสมล่าสุด</CardDescription>
          </CardHeader>
          
          <CardContent>
            {pointsHistory.length > 0 ? (
              <div className="space-y-4">
                {pointsHistory.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
                    </div>
                    <div className={`font-semibold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.points > 0 ? `+${item.points}` : item.points}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>ยังไม่มีประวัติคะแนนสะสม</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 