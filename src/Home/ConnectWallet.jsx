import { Account } from './Account';
import { useAccount } from 'wagmi';
import { WalletOptions } from './WalletOptions';

function ConnectWallet() {
  const { isConnected } = useAccount();
  return isConnected ? <Account /> : <WalletOptions />;
}

export default ConnectWallet;