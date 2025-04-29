'use client'

import { useEffect, useState } from 'react'

export default function TestPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/test')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError('Failed to fetch data')
        console.error(err)
      }
    }

    fetchData()
  }, [])

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  if (!data) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Relationships</h2>
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(data.relationships, null, 2)}</pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Questions</h2>
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(data.questions, null, 2)}</pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Answers</h2>
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(data.answers, null, 2)}</pre>
      </div>
    </div>
  )
} 