

// Fetch releases for a specific project
export async function getReleasesByProjectId(projectId: number, authToken?: string) {
  let baseUrl = process.env.VITE_BASE_URL || "http://74.235.80.66:8087";
  // Remove trailing slash if present to avoid double slashes
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }
  // Use the actual existing backend endpoint
  const url = `${baseUrl}/api/v1/releases/project/${projectId}`;
  
  console.log('API CALL:', url);
  
  try {
    const fetchOptions: any = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (authToken) {
      fetchOptions.headers.Authorization = `Bearer ${authToken}`;
      console.log('DEBUG: Added Authorization header');
    } else {
      console.log('DEBUG: No auth token provided');
    }
    
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching releases:', error);
    throw error;
  }
}

// Fetch time to find defects data for a specific release
export async function getTimeToFindDefects(projectId: number, releaseName: string, authToken?: string) {
  let baseUrl = process.env.VITE_BASE_URL || "http://74.235.80.66:8087";
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }
  // Use the correct endpoint: /api/v1/dashboard/releases/{projectId}/{releaseName}/defects/daily
  const url = `${baseUrl}/api/v1/dashboard/releases/${projectId}/${releaseName}/defects/daily`;
  console.log('API CALL:', url);
  
  try {
    const fetchOptions: any = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (authToken) {
      fetchOptions.headers.Authorization = `Bearer ${authToken}`;
    }
    
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching time to find defects:', error);
    throw error;
  }
}

// Fetch time to fix defects data for a specific release
export async function getTimeToFixDefects(projectId: number, releaseId: number, authToken?: string) {
  let baseUrl = process.env.VITE_BASE_URL || "http://74.235.80.66:8087";
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }
  // Use the correct endpoint: /api/v1/dashboard/daily-fix/{projectId}/{releaseId}
  const url = `${baseUrl}/api/v1/dashboard/daily-fix/${projectId}/${releaseId}`;
  console.log('API CALL:', url);
  
  try {
    const fetchOptions: any = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (authToken) {
      fetchOptions.headers.Authorization = `Bearer ${authToken}`;
    }
    
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching time to fix defects:', error);
    throw error;
  }
}
