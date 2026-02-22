const ServerAddress = import.meta.env.VITE_API_URL || "http://localhost:8080";
// To override, set VITE_API_URL in .env.local (e.g. http://kiosk:8080)
export default ServerAddress;