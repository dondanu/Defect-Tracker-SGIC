import axios from "axios";

// Fetch Reopen Count Summary for a given project
export async function getReopenCountSummary(projectId: string | number) {
  let baseUrl = process.env.VITE_BASE_URL || "";
  const url = `${baseUrl}/api/v1/dashboard/reopen-count_summary/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}

