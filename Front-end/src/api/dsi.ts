import axios from 'axios';

export async function getDefectSeverityIndex(projectId: string | number) {
  // Use the same base URL pattern as other components in the project
  const baseUrl = 'http://74.235.80.66:8087/api/v1';
  const url = `${baseUrl}/dashboard/dsi/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}