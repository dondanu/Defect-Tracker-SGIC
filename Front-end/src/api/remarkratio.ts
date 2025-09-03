import axios from 'axios';

// Fetch defect and remark ratio data for a given project
export async function getDefectRemarkRatioByProjectId(projectId: string | number) {
  let baseUrl = process.env.VITE_BASE_URL || "";
  const url = `${baseUrl}/api/v1/dashboard/defect-remark-ratio?projectId=${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
