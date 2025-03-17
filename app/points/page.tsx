"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from '@/lib/supabase'
import { Award } from 'lucide-react'

interface PointsData {
  points: number
  updated_at: string
}

export default function PointsPage() {
  const [pointsData, setPointsData] = useState<PointsData | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPoints()
  }, [])

  async function fetchPoints() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to view your points",
        variant: "destructive"
      })
      return
    }

    const { data, error } = await supabase
      .from('user_points')
      .select('points, updated_at')
      .eq('user_id', session.user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // No rows returned
      toast({
        title: "Error",
        description: "Failed to fetch points",
        variant: "destructive"
      })
      return
    }

    setPointsData(data)
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8">My Points</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Reward Points</CardTitle>
          <Award className="h-8 w-8 text-primary" />
        </CardHeader>
        <CardContent className="pt-6">
          {pointsData ? (
            <>
              <div className="text-4xl font-bold mb-4">{pointsData.points} points</div>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(pointsData.updated_at).toLocaleDateString()}
              </p>
              <div className="mt-6 space-y-2">
                <h3 className="font-semibold">How to earn points:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>1 point for each item purchased</li>
                </ul>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Start shopping to earn points!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}