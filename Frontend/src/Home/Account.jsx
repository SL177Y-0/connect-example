
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName || undefined }); 

  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-900  p-8 w-96 text-center ">
        {ensAvatar && (
          <img
            alt="ENS Avatar"
            src={ensAvatar}
            className="w-20 h-20 mx-auto mb-4"
          />
        )}
        {address && (
          <div className="text-lg font-semibold text-gray-300">
            {ensName ? (
              <span>
                {ensName} <span className="text-gray-500">({address})</span>
              </span>
            ) : (
              <span>{address}</span>
            )}
          </div>
        )}
        <button
          onClick={() => disconnect()}
          className="mt-6 bg-red-600 text-white px-2 py-2 rounded-lg hover:bg-red-500 transition font-medium shadow-md"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
