import { useAccount, useChainId } from 'wagmi';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { base } from 'wagmi/chains';

interface StatsCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  description: string;
}

interface ActivityItem {
  id: number;
  type: 'upload' | 'consent' | 'verify';
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'active' | 'verified';
  txHash: string;
}

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [stats, setStats] = useState<StatsCard[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  const networkName = chainId === base.id ? 'Base Mainnet' : 'Base Sepolia';
  const explorerUrl = chainId === base.id ? 'https://basescan.org' : 'https://sepolia.basescan.org';

  useEffect(() => {
    if (isConnected && address) {
      // Mock data - in production, fetch from API
      setStats([
        {
          title: 'Total Records',
          value: 12,
          icon: '📋',
          color: 'bg-blue-500',
          description: 'Medical documents stored'
        },
        {
          title: 'On-Chain Proofs',
          value: 12,
          icon: '🔗',
          color: 'bg-green-500', 
          description: 'Verifiable credentials'
        },
        {
          title: 'Active Consents',
          value: 3,
          icon: '🤝',
          color: 'bg-purple-500',
          description: 'Data sharing permissions'
        },
        {
          title: 'Verified Docs',
          value: '100%',
          icon: '✅',
          color: 'bg-emerald-500',
          description: 'Document authenticity'
        }
      ]);

      setRecentActivity([
        {
          id: 1,
          type: 'upload',
          title: 'Lab Report Uploaded',
          description: 'Blood test results added to IPFS',
          timestamp: '2 hours ago',
          status: 'completed',
          txHash: '0x1234...5678'
        },
        {
          id: 2,
          type: 'consent',
          title: 'Consent Granted',
          description: 'Dr. Smith granted access to prescriptions',
          timestamp: '1 day ago',
          status: 'active',
          txHash: '0xabcd...efgh'
        },
        {
          id: 3,
          type: 'verify',
          title: 'Document Verified',
          description: 'MRI scan authenticity confirmed',
          timestamp: '3 days ago',
          status: 'verified',
          txHash: '0x9876...4321'
        }
      ]);
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🏥</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to SwasthWrap
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            A Web3-powered medical records management system built on Base L2. 
            Securely store your medical documents on IPFS with verifiable credentials 
            anchored on-chain for ultimate transparency and control.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="font-semibold text-gray-900 mb-2">Verifiable Records</h3>
              <p className="text-gray-600 text-sm">
                Every document gets a verifiable credential stored on Base L2 for authenticity
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-3xl mb-3">🌐</div>
              <h3 className="font-semibold text-gray-900 mb-2">IPFS Storage</h3>
              <p className="text-gray-600 text-sm">
                Documents stored on IPFS with only hash references on-chain for privacy
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-semibold text-gray-900 mb-2">Consent Control</h3>
              <p className="text-gray-600 text-sm">
                Grant and revoke access to medical data using DID-based consent management
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">🚀 Connect Your Wallet to Get Started</h3>
            <p className="text-blue-700 text-sm">
              Connect your Web3 wallet to start managing your medical records on Base L2
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical Records Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Connected to {networkName} • {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm text-gray-500">Network</div>
              <div className="font-medium text-gray-900">{networkName}</div>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/upload"
          className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <div className="text-3xl mb-2">📤</div>
          <h3 className="font-medium text-gray-900 mb-1">Upload Record</h3>
          <p className="text-sm text-gray-600">Add new medical document</p>
        </Link>

        <Link
          to="/records"
          className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 hover:bg-green-50 transition-colors"
        >
          <div className="text-3xl mb-2">📋</div>
          <h3 className="font-medium text-gray-900 mb-1">View Records</h3>
          <p className="text-sm text-gray-600">Browse your documents</p>
        </Link>

        <Link
          to="/consent"
          className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition-colors"
        >
          <div className="text-3xl mb-2">🤝</div>
          <h3 className="font-medium text-gray-900 mb-1">Manage Consent</h3>
          <p className="text-sm text-gray-600">Control data access</p>
        </Link>

        <Link
          to="/verify"
          className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
        >
          <div className="text-3xl mb-2">✅</div>
          <h3 className="font-medium text-gray-900 mb-1">Verify Document</h3>
          <p className="text-sm text-gray-600">Check authenticity</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'upload' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'consent' ? 'bg-purple-100 text-purple-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {activity.type === 'upload' ? '📤' : 
                       activity.type === 'consent' ? '🤝' : '✅'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      <span className="text-gray-300">•</span>
                      <a 
                        href={`${explorerUrl}/tx/${activity.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View on BaseScan
                      </a>
                    </div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  activity.status === 'active' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activity.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
