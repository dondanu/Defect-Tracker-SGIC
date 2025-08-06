import axios from "axios";
// Fetch defect severity summary for a given project
export async function getDefectSeveritySummary(projectId: string) {
  let baseUrl = process.env.VITE_BASE_URL || "";
  // Remove trailing slash if present to avoid double slashes
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }
  const url = `${baseUrl}/dashboard/defect_severity_summary/${projectId}`;
  const response = await axios.get(url);
  return response.data;
} 