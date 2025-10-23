import { NextRequest, NextResponse } from 'next/server'


interface FoodItem {
  name: string
  description: string
  carbohydrates_g: string
  protein_g: string
  fat_g: string
  calories_kcal: string
}

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Create new FormData to forward to the Python service
    const forwardFormData = new FormData()
    forwardFormData.append('file', file)

    // Forward the request to the Python service
    const response = await fetch('http://localhost:8000/nutrition', {
      method: 'POST',
      body: forwardFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Python service error:', response.status, errorText)
      
      return NextResponse.json(
        { error: 'Food recognition service unavailable' },
        { status: 503 }
      )
    }

    const data = await response.json()
    
    // Validate the response structure
    if (!data.items || !Array.isArray(data.items)) {
      return NextResponse.json(
        { error: 'Invalid response from food recognition service' },
        { status: 502 }
      )
    }

    // Transform the response to match our expected format
    const transformedData = {
        food_items: data.items.map((item: FoodItem) => {
          return {
            name: item.name || 'Unknown Food',
            description: item.description || 'No description available',
            quantity: 1,
            estimated_nutrition: {
              carbohydrates_g: parseFloat(item.carbohydrates_g) || 0,
              protein_g: parseFloat(item.protein_g) || 0,
              fat_g: parseFloat(item.fat_g) || 0,
              calories: parseFloat(item.calories_kcal) || 0,
            }
          }
      }),
      total_nutrition: {
        total_carbohydrates_g: parseFloat(data.totals.total_carbohydrates_g) || 0,
        total_protein_g: parseFloat(data.totals.total_protein_g) || 0,
        total_fat_g: parseFloat(data.totals.total_fat_g) || 0,
        total_calories: parseFloat(data.totals.total_calories_kcal) || 0,
      }
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error in food recognition API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
