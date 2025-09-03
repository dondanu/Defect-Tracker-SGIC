import axios from "axios";

// Fetch defects by module for a given project
export async function getDefectsByModule(projectId: string | number) {
  let baseUrl = process.env.VITE_BASE_URL || "";
  const url = `${baseUrl}/api/v1/dashboard/module?projectId=${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
