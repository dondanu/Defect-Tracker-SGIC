import axios from "axios";

// Fetch defects by module for a given project
export async function getDefectsByModule(projectId: string | number) {
  // Use the same base URL pattern as other components in the project
  const baseUrl = 'http://34.56.162.48:8087/api/v1';
  const url = `${baseUrl}/dashboard/module?projectId=${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
