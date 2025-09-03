import axios from 'axios';

export async function getDefectDensity(projectId: string | number) {
  let baseUrl = process.env.VITE_BASE_URL || "";
  const url = `${baseUrl}/api/v1/dashboard/defect-density/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
