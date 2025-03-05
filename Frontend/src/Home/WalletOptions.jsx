import * as React from "react";
import { useConnect } from "wagmi";

export function WalletOptions() {
  const { connectors, connect } = useConnect();

  return (
    <div>
      <div className="bg-gray-800 shadow-lg rounded-xl p-8 w-96 text-center border border-gray-700">
        <h3 className="text-lg font-semibold text-red-500">Connect Wallet to Increase Score</h3>
        <p className="text-gray-400 text-sm mb-6">
          Choose a wallet to connect securely.
        </p>

        <div className="flex flex-col space-y-4">
          {connectors.map((connector) => (
            <WalletOption
              key={connector.uid}
              connector={connector}
              onClick={() => connect({ connector })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WalletOption({ connector, onClick }) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  return (
    <button
      disabled={!ready}
      onClick={onClick}
      className={`w-full px-5 py-3 rounded-lg transition font-medium text-white
        ${ready ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-700 cursor-not-allowed"}`}
    >
      {ready ? connector.name : `Loading ${connector.name}...`}
    </button>
  );
}