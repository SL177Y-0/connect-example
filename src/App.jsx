import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "./config";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { usePrivy } from "@privy-io/react-auth";

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { authenticated } = usePrivy();
  return authenticated ? children : <Navigate to="/" />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard/:username/:address"
        element={
          <ProtectedRoute>
            <WagmiProvider config={config}>
              <QueryClientProvider client={queryClient}>
                <Dashboard />
              </QueryClientProvider>
            </WagmiProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
