"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface ReviewFormProps {
  productId: string
  onReviewAdded: () => void
}

export default function ReviewForm({ productId, onReviewAdded }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast({
        title: "กรุณาให้คะแนน",
        description: "โปรดให้คะแนนสินค้าก่อนส่งรีวิว",
        variant: "destructive"
      })
      return
    }
    
    if (!comment.trim()) {
      toast({
        title: "กรุณาใส่ความคิดเห็น",
        description: "โปรดแสดงความคิดเห็นเกี่ยวกับสินค้า",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast({
          title: "กรุณาเข้าสู่ระบบ",
          description: "คุณต้องเข้าสู่ระบบก่อนแสดงความคิดเห็น",
          variant: "destructive"
        })
        setIsSubmitting(false)
        return
      }
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()
        
      if (userError) {
        throw userError
      }
      
      const userName = userData?.full_name || session.user.email || 'ผู้ใช้งาน'
      
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: session.user.id,
          user_name: userName,
          rating,
          comment
        })
        
      if (error) {
        // ตรวจสอบว่ามีรีวิวอยู่แล้วหรือไม่
        if (error.message.includes('User has already reviewed this product')) {
          toast({
            title: "คุณได้รีวิวสินค้านี้ไปแล้ว",
            description: "ไม่สามารถรีวิวสินค้าเดิมได้มากกว่า 1 ครั้ง",
            variant: "destructive"
          })
        } else {
          throw error
        }
      } else {
        toast({
          title: "ขอบคุณสำหรับรีวิว",
          description: "ความคิดเห็นของคุณได้รับการบันทึกแล้ว"
        })
        setRating(0)
        setComment('')
        onReviewAdded()
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งรีวิวได้ โปรดลองอีกครั้งในภายหลัง",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>รีวิวสินค้านี้</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">ให้คะแนนสินค้า</p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                  aria-label={`ให้คะแนน ${star} ดาว`}
                >
                  <Star 
                    className={`h-6 w-6 ${
                      (hoverRating ? star <= hoverRating : star <= rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">ความคิดเห็นของคุณ</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="แสดงความคิดเห็นเกี่ยวกับสินค้านี้..."
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "กำลังส่ง..." : "ส่งรีวิว"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 