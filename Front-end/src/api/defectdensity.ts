import axios from 'axios';

export async function getDefectDensity(projectId: string | number) {
  // Use the base URL from environment variables
  let baseUrl = process.env.VITE_BASE_URL || 'http://34.56.162.48:8087/api/v1/';
  
  // Remove trailing slash if present to avoid double slashes
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  const url = `${baseUrl}/dashboard/defect-density/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
