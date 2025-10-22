import { NextRequest, NextResponse } from 'next/server'

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
    if (!data.food_items || !Array.isArray(data.food_items)) {
      return NextResponse.json(
        { error: 'Invalid response from food recognition service' },
        { status: 502 }
      )
    }

    // Transform the response to match our expected format
    // Handle different response formats from the Python service
    const transformedData = {
      food_items: data.food_items.map((item: any) => {
        // Handle recognized food format (with estimated_nutrients_per_serving)
        if (item.estimated_nutrients_per_serving) {
          return {
            name: item.name || 'Unknown Food',
            description: item.description || 'No description available',
            quantity: typeof item.quantity === 'string' ? 1 : (item.quantity || 1),
            estimated_nutrition: {
              carbohydrates_g: parseFloat(item.estimated_nutrients_per_serving?.carbohydrates_g) || 0,
              protein_g: parseFloat(item.estimated_nutrients_per_serving?.protein_g) || 0,
              fat_g: parseFloat(item.estimated_nutrients_per_serving?.fat_g) || 0,
              calories: parseFloat(item.estimated_nutrients_per_serving?.calories) || 0,
            }
          }
        }
        
        // Handle your actual response format (with direct nutrition fields)
        if (item.name && item.carbohydrates !== undefined) {
          return {
            name: item.name || 'Unknown Food',
            description: item.description || 'No description available',
            quantity: typeof item.quantity === 'string' ? 1 : (item.quantity || 1),
            estimated_nutrition: {
              carbohydrates_g: parseFloat(item.carbohydrates) || 0,
              protein_g: parseFloat(item.proteins) || 0, // Note: 'proteins' not 'protein'
              fat_g: parseFloat(item.fats) || 0,
              calories: parseFloat(item.estimated_calories) || 0,
            }
          }
        }
        
        // Handle unrecognized food format (with direct nutrition fields)
        if (item.item) {
          return {
            name: item.item || 'Unknown Food',
            description: item.description || 'No description available',
            quantity: typeof item.quantity === 'string' ? 1 : (item.quantity || 1),
            estimated_nutrition: {
              carbohydrates_g: parseFloat(item.carbohydrates) || 0,
              protein_g: parseFloat(item.protein) || 0,
              fat_g: parseFloat(item.fat) || 0,
              calories: parseFloat(item.calories) || 0,
            }
          }
        }
        
        // Fallback for any other format
        return {
          name: item.name || item.item || 'Unknown Food',
          description: item.description || 'No description available',
          quantity: typeof item.quantity === 'string' ? 1 : (item.quantity || 1),
          estimated_nutrition: {
            carbohydrates_g: 0,
            protein_g: 0,
            fat_g: 0,
            calories: 0,
          }
        }
      }),
      total_nutrition: {
        total_carbohydrates_g: parseFloat(data.total_nutritional_values?.total_carbohydrates || data.total_nutrition?.total_carbohydrates_g || data.total_nutrition?.total_carbohydrates) || 0,
        total_protein_g: parseFloat(data.total_nutritional_values?.total_proteins || data.total_nutrition?.total_protein_g || data.total_nutrition?.total_protein) || 0,
        total_fat_g: parseFloat(data.total_nutritional_values?.total_fats || data.total_nutrition?.total_fat_g || data.total_nutrition?.total_fat) || 0,
        total_calories: parseFloat(data.total_nutritional_values?.total_estimated_calories || data.total_nutrition?.total_calories) || 0,
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
