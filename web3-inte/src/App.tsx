import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import UploadRecord from './components/UploadRecord';
import RecordsList from './components/RecordsList';
import ConsentManagement from './components/ConsentManagement';
import VerifyDocument from './components/VerifyDocument';

import './App.css';

const config = getDefaultConfig({
  appName: 'SwasthWrap Web3 Medical Records',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'default-project-id',
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Router>
            <div className="min-h-screen">
              <Header />
              <main className="main-content">
                <div className="container">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/upload" element={<UploadRecord />} />
                    <Route path="/records" element={<RecordsList />} />
                    <Route path="/consent" element={<ConsentManagement />} />
                    <Route path="/verify" element={<VerifyDocument />} />
                  </Routes>
                </div>
              </main>
            </div>
          </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
