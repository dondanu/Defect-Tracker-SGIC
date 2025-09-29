import axios from "axios";

// Fetch defect severity summary for a given project
export async function getDefectSeveritySummary(projectId: string | number, authToken?: string) {
  try {
    let baseUrl = process.env.VITE_BASE_URL || "http://192.168.1.168:3000";
    const url = `${baseUrl}/api/dashboard/defect_severity_summary/${projectId}`;
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
    console.error('Error fetching defect severity summary:', error);
    throw error;
  }
} 