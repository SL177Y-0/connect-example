import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const { login, authenticated, user } = usePrivy();
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated && user) {
      const username = user?.twitter?.username || "guest";
      const address = user?.wallet?.address || "null";

      console.log("Redirecting to:", `/dashboard/${username}/${address}`);
      navigate(`/dashboard/${username}/${address}`);
    }
  }, [authenticated, user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 shadow-xl rounded-lg p-8 w-96 text-center border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-gray-200">Welcome Back</h2>
        <p className="mb-4 text-gray-400">Login using your preferred method</p>

        <button
          onClick={login}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-500 transition font-medium w-full"
        >
          Login
        </button>

        <p className="mt-4 text-sm text-gray-500">Powered by Cluster Protocol</p>
      </div>
    </div>
  );
};

export default Login;
