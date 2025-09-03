// API Configuration for different environments
export const API_CONFIG = {
  // Development - Android Emulator
  development: {
    baseURL: "http://10.0.2.2:3000/api/",
    timeout: 10000,
  },
  
  // Development - Physical Device (replace with your machine's IP)
  developmentPhysical: {
    baseURL: "http://192.168.1.45:3000/api/", // Change this to your machine's IP
    timeout: 10000,
  },
  
  // Production
  production: {
    baseURL: "https://your-production-domain.com/api/", // Change this when deploying
    timeout: 15000,
  }
};

// Get current environment (you can modify this based on your build process)
export const getCurrentConfig = () => {
  // Switch to developmentPhysical when using your local IP
  return API_CONFIG.developmentPhysical;
};

export default API_CONFIG;
