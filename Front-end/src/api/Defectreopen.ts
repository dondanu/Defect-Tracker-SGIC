import axios from 'axios';

// Fetch reopen count summary for a given project
export async function getReopenCountSummary(projectId: string | number, authToken?: string) {
  try {
    let baseUrl = process.env.VITE_BASE_URL || "http://192.168.1.85:3000";
    const url = `${baseUrl}/api/dashboard/reopen-count_summary/${projectId}`;
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
    console.error('Error fetching reopen summary:', error);
    throw error;
  }
}

