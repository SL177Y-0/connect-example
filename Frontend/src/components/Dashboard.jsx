import { usePrivy } from "@privy-io/react-auth";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setScore } from "../redux/scoreSlice";
import ConnectWallet from "../Home/ConnectWallet";
import TwitterAuth from "../Home/TwitterAuth";
import WalletConnect from "../Home/WalletConnect";
import DownloadButton from "../Home/DownloadButton";
import TelegramConnect from "./TelegramConnect"; 
import VeridaConnect from "../Home/VeridaConnect";

const Dashboard = () => {
  const { logout, user } = usePrivy();
  const navigate = useNavigate();
  const { username, address } = useParams();
  const dispatch = useDispatch();

  const totalScore = useSelector((state) => state.score.totalScore);
  const scoreTitle = useSelector((state) => state.score.title);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userNameFromPrivy = user?.twitter?.username || user?.wallet?.id || "guest";
    const walletAddressFromPrivy = user?.wallet?.address || "null";

    if (!username || !address) {
      navigate(`/dashboard/${userNameFromPrivy}/${walletAddressFromPrivy}`);
    } else {
      fetchScore(username, address);
    }
  }, [username, address, user?.twitter, user?.wallet, navigate]);

  const fetchScore = async (username, address) => {
    setLoading(true);
    setError("");

    try {
      const did = localStorage.getItem("veridaDid") || "";
      const response = await fetch(
        `http://localhost:5000/api/score/get-score/${username}/${address}${did ? `?did=${did}` : ""}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch score");

      dispatch(setScore(data));
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col">
      <nav className="bg-gray-800 shadow-md p-4 flex items-center justify-between px-8">
        <h1 className="text-xl font-bold text-gray-300">Cluster Protocol</h1>
        <button className="text-gray-400 hover:text-white transition">Home</button>
        <div className="flex items-center space-x-4">
          <p className="text-gray-300">{username || "Guest"}</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="flex flex-1 items-center justify-center p-8">
        <div className="bg-gray-800 shadow-xl rounded-lg p-8 w-full max-w-2xl text-center border border-gray-700">
          <h2 className="text-4xl font-bold text-green-400 mb-6">Your FOMO Score</h2>

          {loading ? (
            <p className="text-gray-400 mb-6">Calculating...</p>
          ) : totalScore ? (
            <div className="mb-6">
              <p className="text-6xl font-extrabold text-white">{totalScore}</p>
              <p className="text-lg text-gray-400 mt-2">{scoreTitle}</p>
            </div>
          ) : (
            <p className="text-gray-400 mb-6">No score available. Connect your wallet, Twitter, and Telegram to get started.</p>
          )}

          <div className="mt-6 bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-md">
            <DownloadButton score={totalScore} />
          </div>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          {!address || address === "null" ? <ConnectWallet /> : null}
          {!user?.twitter && <TwitterAuth />}
          <WalletConnect />
          <VeridaConnect />
          <TelegramConnect />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;