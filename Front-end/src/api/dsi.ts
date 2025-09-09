import axios from 'axios';

export async function getDefectSeverityIndex(projectId: string | number, authToken?: string) {
  try {
    let baseUrl = process.env.VITE_BASE_URL || "http://192.168.1.85:3000";
    const url = `${baseUrl}/api/dashboard/dsi/${projectId}`;
    console.log('Calling API:', url);
    
    const headers: any = {};
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
      console.log('Added Authorization header');
    }
    
    const response = await axios.get(url, { headers });
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching DSI:', error);
    throw error;
  }
}