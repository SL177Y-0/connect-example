import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setScore } from "../redux/scoreSlice";
import { VeridaClient } from "@verida/client-ts";
import { WebVaultAccount } from "@verida/account-web-vault";
import axios from "axios";
import styled from "styled-components";

// Styled components for better UI
const Container = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #111827;
  border-radius: 0.5rem;
  border: 1px solid #374151;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #d1d5db;
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.connected ? "#065f46" : "#111827"};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  margin-bottom: 0.75rem;
`;

const Button = styled.button`
  background-color: ${props => props.disconnect ? "#dc2626" : "#2563eb"};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  hover: ${props => props.disconnect ? "#b91c1c" : "#1d4ed8"};
  transition: background-color 0.3s;
  width: 100%;
  cursor: pointer;
  
  &:disabled {
    background-color: #6b7280;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  margin-top: 0.5rem;
`;

const TelegramConnect = ({ onConnected }) => {
  const containerRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const { username, address } = useParams();
  const dispatch = useDispatch();
  const [veridaClient, setVeridaClient] = useState(null);
  const [veridaContext, setVeridaContext] = useState(null);

  // Check for existing connection on mount
  useEffect(() => {
    // Check if already connected via localStorage
    const telegramData = localStorage.getItem("telegramData");
    if (telegramData) {
      setIsConnected(true);
      setUserData(JSON.parse(telegramData));
    }

    // Initialize Verida client if needed
    const initVerida = async () => {
      try {
        // Only initialize if we don't already have a client
        if (!veridaClient) {
          const client = new VeridaClient({
            network: "testnet", // Change to mainnet for production
            didClientConfig: {
              rpcUrl: "https://node1-testnet.verida.network:5001" // Update for production
            }
          });
          
          setVeridaClient(client);
          
          // Check if already connected to Verida
          const isVeridaConnected = await client.isConnected();
          
          if (isVeridaConnected) {
            const context = await client.getContext("fomoscore");
            setVeridaContext(context);
            
            // Check if Telegram data already exists in Verida
            try {
              const telegramDb = await context.openDatabase("telegram_data");
              const telegramDataFromVerida = await telegramDb.getMany();
              
              if (telegramDataFromVerida && telegramDataFromVerida.length > 0) {
                setUserData(telegramDataFromVerida[0]);
                localStorage.setItem("telegramData", JSON.stringify(telegramDataFromVerida[0]));
                setIsConnected(true);
                if (onConnected) onConnected(telegramDataFromVerida[0]);
              }
            } catch (dbErr) {
              console.log("No Telegram data found in Verida", dbErr);
              // This is fine - user might not have connected Telegram yet
            }
          }
        }
      } catch (err) {
        console.error("Failed to initialize Verida:", err);
      }
    };
    
    initVerida();
    
    // Initialize Telegram Login Widget
    if (!window.TelegramLoginWidget) {
      window.TelegramLoginWidget = {
        dataOnauth: async (user) => {
          console.log("Telegram auth successful:", user);
          setUserData(user);
          setIsConnecting(true);
          
          try {
            await handleTelegramData(user);
          } catch (err) {
            console.error("Telegram connect error:", err);
            setError(err.message || "Connection failed");
          } finally {
            setIsConnecting(false);
          }
        }
      };
    }
    
    // Create and add Telegram widget script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "cluster_fomo_bot"); // Use your bot name from .env
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "TelegramLoginWidget.dataOnauth(user)");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-radius", "4");
    
    if (containerRef.current && !isConnected) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [isConnected, veridaClient, onConnected]);

  // Connect to Verida
  const connectVerida = async () => {
    setIsConnecting(true);
    setError("");
    
    try {
      // Create web vault account for authentication
      const account = new WebVaultAccount({
        request: {
          logoUrl: "https://your-logo-url.png", // Add your app logo
          appName: "FOMOscore App",
          description: "Calculate your Fear of Missing Out score"
        }
      });
      
      // Connect to Verida
      await veridaClient.connect(account);
      
      // Open context for our app
      const context = await veridaClient.getContext("fomoscore");
      setVeridaContext(context);
      
      // Store DID in localStorage for other components
      const did = await veridaClient.getDid();
      localStorage.setItem("veridaDid", did);
      
      return true;
    } catch (err) {
      console.error("Verida connection error:", err);
      setError("Failed to connect to Verida: " + err.message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Process Telegram data
  const handleTelegramData = async (telegramUser) => {
    try {
      // First check if we need to connect to Verida
      const did = localStorage.getItem("veridaDid");
      
      if (!did && veridaClient) {
        const connected = await connectVerida();
        if (!connected) {
          throw new Error("Failed to connect to Verida");
        }
      }
      
      // Try to store in Verida if we have a context
      if (veridaContext) {
        try {
          // Store Telegram public data in Verida
          const telegramData = {
            ...telegramUser,
            type: "telegram_profile",
            saved: new Date().toISOString()
          };
          
          // Open database and save data
          const db = await veridaContext.openDatabase("telegram_data");
          await db.save(telegramData);
        } catch (veridaErr) {
          console.error("Could not store in Verida:", veridaErr);
          // Continue anyway - we'll store in localStorage
        }
      }

      // Call backend to connect Telegram
      const veridaDid = localStorage.getItem("veridaDid") || "";
      const response = await axios.post("http://localhost:5000/api/telegram/connect", {
        did: veridaDid,
        chatId: telegramUser.id,
        telegramData: telegramUser // Send full data for validation
      });

      if (!response.data.message) {
        throw new Error("Failed to connect Telegram");
      }

      // Store telegram connection data in localStorage
      localStorage.setItem("telegramData", JSON.stringify(telegramUser));
      setIsConnected(true);
      
      if (onConnected) onConnected(telegramUser);
      
      // Refresh score
      fetchUpdatedScore();
    } catch (err) {
      throw err; // Rethrow to handle in the caller
    }
  };

  // Fetch updated score
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

  // Handle disconnect
  const handleDisconnect = () => {
    localStorage.removeItem("telegramData");
    setIsConnected(false);
    setUserData(null);
    
    // Also remove from Verida if connected
    if (veridaContext) {
      try {
        const removeVeridaData = async () => {
          const db = await veridaContext.openDatabase("telegram_data");
          // Get all telegram data
          const existingData = await db.getMany({
            type: "telegram_profile"
          });
          
          // Delete each record
          for (const record of existingData) {
            await db.delete(record._id);
          }
        };
        
        removeVeridaData();
      } catch (err) {
        console.error("Failed to remove Verida data:", err);
      }
    }
    
    fetchUpdatedScore();
  };

  return (
    <Container>
      <Title>Telegram Connection</Title>
      
      {isConnected ? (
        <div>
          <ConnectionStatus connected={true}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>
              Connected to Telegram 
              {userData?.username ? ` (@${userData.username})` : ''}
            </span>
          </ConnectionStatus>
          <Button 
            disconnect={true}
            onClick={handleDisconnect}
          >
            Disconnect Telegram
          </Button>
        </div>
      ) : (
        <div>
          <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
            Connect your Telegram account to enhance your FOMO score
          </p>
          {isConnecting ? (
            <div style={{ color: '#60a5fa' }}>Connecting to Telegram...</div>
          ) : (
            <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center' }}></div>
          )}
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </div>
      )}
    </Container>
  );
};

export default TelegramConnect;