import axios from "axios";

// Fetch defect types for a given project
export async function getDefectTypeByProjectId(projectId: string | number) {
  // Use the same base URL pattern as other components in the project
  const baseUrl = 'http://34.56.162.48:8087/api/v1';
  const url = `${baseUrl}/dashboard/defect-type/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
