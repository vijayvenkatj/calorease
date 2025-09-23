'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload } from 'lucide-react'

export default function ImageFoodLogger() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/food/recognize', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      console.log('Recognized foods:', data)
      // here you’d insert into Supabase DB
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      setFile(null)
    }
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>Log by Photo</CardTitle>
        <CardDescription>Upload a food photo to detect and log items</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label
          htmlFor="food-photo"
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition"
        >
          {file ? (
            <span className="text-sm text-gray-700">{file.name}</span>
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <Upload className="h-8 w-8 mb-2" />
              <span className="text-sm">Click to upload or drag & drop</span>
              <span className="text-xs text-gray-400">PNG, JPG, JPEG</span>
            </div>
          )}
          <input
            id="food-photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        <Button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload & Detect
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
