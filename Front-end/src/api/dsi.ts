import axios from 'axios';

export async function getDefectSeverityIndex(projectId: string | number) {
  let baseUrl = process.env.VITE_BASE_URL || "";
  const url = `${baseUrl}/api/v1/dashboard/dsi/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}