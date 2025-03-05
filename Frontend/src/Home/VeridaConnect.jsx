import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setScore } from "../redux/scoreSlice";
import { Network, VaultAccount, VeridaClient } from '@verida/client-ts';

const VeridaConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const { username, address } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if already connected
    const veridaDid = localStorage.getItem("veridaDid");
    if (veridaDid) {
      setIsConnected(true);
    }
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError("");
    
    try {
      const veridaClient = new VeridaClient({
        network: 'testnet',
        appName: 'FomoScoreApp'
      });
      
      await veridaClient.connectVault();
      const did = await veridaClient.getDid();
      
      localStorage.setItem("veridaDid", did);
      setIsConnected(true);
      fetchUpdatedScore();
    } catch (err) {
      console.error('Failed to connect with Verida:', err);
      setError('Failed to connect. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      // Clear local storage
      localStorage.removeItem("veridaDid");
      setIsConnected(false);
      
      // Refresh score
      fetchUpdatedScore();
    } catch (err) {
      console.error('Failed to disconnect from Verida:', err);
      setError('Failed to disconnect. Please try again.');
    }
  };

  const fetchUpdatedScore = async () => {
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
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700 shadow-md">
      <h3 className="text-xl font-semibold mb-3 text-gray-300">Verida Wallet</h3>
      
      {isConnected ? (
        <div>
          <div className="flex items-center justify-center bg-green-800 text-white py-2 px-4 rounded-md mb-3">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Connected to Verida</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full"
          >
            Disconnect Verida
          </button>
        </div>
      ) : (
        <div>
          <p className="text-gray-400 mb-4">Connect your Verida Wallet for secure data storage</p>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full"
          >
            {isConnecting ? 'Connecting...' : 'Connect Verida Wallet'}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default VeridaConnect;
