import { useState, useEffect } from "react";

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div
      className={`w-full text-center py-2 text-sm font-semibold ${
        isOnline ? "bg-green-500 text-white" : "bg-red-600 text-white"
      }`}
    >
      {isOnline ? "✅ You are Online" : "❌ No Internet Connection"}
    </div>
  );
}
