import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const generateTrip = async (tripData) => {
  try {
    const response = await api.post('/generate-trip/', tripData)
    return response.data
  } catch (error) {
    console.error('Error generating trip:', error)
    throw error
  }
}

export default api
