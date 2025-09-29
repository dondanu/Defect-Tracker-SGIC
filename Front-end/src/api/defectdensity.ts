import axios from 'axios';

export async function getDefectDensity(projectId: string | number, authToken?: string) {
  try {
    let baseUrl = process.env.VITE_BASE_URL || "http://192.168.1.168:3000";
    const url = `${baseUrl}/api/dashboard/defect-density/${projectId}`;
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
    console.error('Error fetching defect density:', error);
    throw error;
  }
}
