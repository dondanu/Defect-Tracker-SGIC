import axios from "axios";

// Fetch defect types for a given project
export async function getDefectTypeByProjectId(projectId: string | number) {
  let baseUrl = process.env.VITE_BASE_URL || "";
  const url = `${baseUrl}/api/v1/dashboard/defect-type/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
