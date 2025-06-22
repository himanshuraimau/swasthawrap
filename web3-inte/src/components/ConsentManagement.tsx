import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface ConsentFormData {
  granteeAddress: string;
  expiryDays: number;
  recordTypes: string[];
}

interface ConsentRecord {
  granterDID: string;
  granteeDID: string;
  expiryTime: string;
  recordTypes: string[];
  consentKey: string;
}

const ConsentManagement = () => {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'grant' | 'manage'>('grant');
  const [formData, setFormData] = useState<ConsentFormData>({
    granteeAddress: '',
    expiryDays: 30,
    recordTypes: []
  });
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [isGranting, setIsGranting] = useState(false);
  const [grantResult, setGrantResult] = useState<ConsentRecord | null>(null);

  const recordTypes = [
    { value: 'lab_report', label: 'Lab Reports', icon: '🧪' },
    { value: 'prescription', label: 'Prescriptions', icon: '💊' },
    { value: 'medical_image', label: 'Medical Images', icon: '🩻' },
    { value: 'consultation_note', label: 'Consultation Notes', icon: '📝' },
    { value: 'vaccination_record', label: 'Vaccination Records', icon: '💉' },
    { value: 'discharge_summary', label: 'Discharge Summaries', icon: '🏥' },
    { value: 'insurance_document', label: 'Insurance Documents', icon: '📋' },
    { value: 'other', label: 'Other Documents', icon: '📄' }
  ];

  useEffect(() => {
    if (isConnected && address) {
      // Load existing consents (mock data for demo)
      setConsents([
        {
          granterDID: `did:ethr:baseSepolia:${address}`,
          granteeDID: 'did:ethr:baseSepolia:0x742d35c67d391d7f1e43cc2c87bb977b66c9b007',
          expiryTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          recordTypes: ['lab_report', 'prescription'],
          consentKey: 'abc123'
        },
        {
          granterDID: `did:ethr:baseSepolia:${address}`,
          granteeDID: 'did:ethr:baseSepolia:0x8ba1f109551bD432803012645Hac136c1ca1234567',
          expiryTime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          recordTypes: ['medical_image', 'consultation_note'],
          consentKey: 'def456'
        }
      ]);
    }
  }, [isConnected, address]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRecordTypeChange = (recordType: string) => {
    const updatedTypes = formData.recordTypes.includes(recordType)
      ? formData.recordTypes.filter(type => type !== recordType)
      : [...formData.recordTypes, recordType];
    
    setFormData({ ...formData, recordTypes: updatedTypes });
  };

  const handleGrantConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!formData.granteeAddress || formData.recordTypes.length === 0) {
      alert('Please provide grantee address and select at least one record type');
      return;
    }

    setIsGranting(true);

    try {
      const response = await fetch('http://localhost:5000/api/consent/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          granterAddress: address,
          granteeAddress: formData.granteeAddress,
          expiryDays: formData.expiryDays,
          recordTypes: formData.recordTypes
        })
      });

      const result = await response.json();

      if (result.success) {
        setGrantResult(result.data);
        // Reset form
        setFormData({
          granteeAddress: '',
          expiryDays: 30,
          recordTypes: []
        });
        // Refresh consents list
        setConsents([...consents, result.data]);
      } else {
        throw new Error(result.error || 'Failed to grant consent');
      }
    } catch (error: unknown) {
      console.error('Grant consent error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to grant consent';
      alert(errorMessage);
    } finally {
      setIsGranting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiryTime: string) => {
    return new Date(expiryTime) < new Date();
  };

  const getDaysUntilExpiry = (expiryTime: string) => {
    const days = Math.ceil((new Date(expiryTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Please connect your wallet to manage data sharing consents.
          </p>
        </div>
      </div>
    );
  }

  if (grantResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🤝</div>
            <h2 className="text-xl font-semibold text-green-900 mb-2">Consent Granted Successfully!</h2>
            <p className="text-gray-600">
              You have successfully granted data access permissions.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Consent Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Granted To:</span>
                  <span className="font-mono ml-2 text-xs">{grantResult.granteeDID}</span>
                </div>
                <div>
                  <span className="text-gray-600">Expires:</span>
                  <span className="ml-2">{formatDate(grantResult.expiryTime)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Record Types:</span>
                  <div className="mt-1">
                    {grantResult.recordTypes.map(type => {
                      const typeInfo = recordTypes.find(t => t.value === type);
                      return (
                        <span key={type} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                          {typeInfo?.icon} {typeInfo?.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">🔗 On-Chain Record</h3>
              <p className="text-blue-700 text-sm mb-3">
                This consent has been recorded on the Base L2 blockchain for transparency and immutability.
              </p>
              <div className="text-blue-700 text-xs font-mono break-all">
                Consent Key: {grantResult.consentKey}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setGrantResult(null)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Grant Another Consent
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Manage Consents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Consent Management</h1>
        <p className="text-gray-600">
          Control who can access your medical records and for how long using blockchain-based consent management.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('grant')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'grant'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🤝 Grant Consent
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Manage Consents ({consents.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'grant' ? (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Grant Data Access Consent</h2>
              
              <form onSubmit={handleGrantConsent} className="space-y-6">
                {/* Grantee Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor/Institution Wallet Address *
                  </label>
                  <input
                    type="text"
                    name="granteeAddress"
                    value={formData.granteeAddress}
                    onChange={handleInputChange}
                    placeholder="0x..."
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the wallet address of the doctor or medical institution you want to grant access to
                  </p>
                </div>

                {/* Expiry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Duration (Days)
                  </label>
                  <select
                    name="expiryDays"
                    value={formData.expiryDays}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={7}>7 days</option>
                    <option value={30}>30 days (1 month)</option>
                    <option value={90}>90 days (3 months)</option>
                    <option value={180}>180 days (6 months)</option>
                    <option value={365}>365 days (1 year)</option>
                  </select>
                </div>

                {/* Record Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accessible Record Types *
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select which types of medical records this consent will cover
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {recordTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-colors ${
                          formData.recordTypes.includes(type.value)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.recordTypes.includes(type.value)}
                          onChange={() => handleRecordTypeChange(type.value)}
                        />
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-xs font-medium">{type.label}</div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isGranting || !formData.granteeAddress || formData.recordTypes.length === 0}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isGranting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Granting Consent...</span>
                    </>
                  ) : (
                    <>
                      <span>🤝</span>
                      <span>Grant Consent</span>
                    </>
                  )}
                </button>

                {/* Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-900 mb-2">⚠️ Important Notes</h3>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Consents are recorded on the blockchain and cannot be easily modified</li>
                    <li>• You can revoke consent at any time through the "Manage Consents" tab</li>
                    <li>• The grantee will only see document metadata, not the actual files</li>
                    <li>• Access expires automatically on the specified date</li>
                  </ul>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Consents</h2>
              
              {consents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Consents</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't granted any data access consents yet.
                  </p>
                  <button
                    onClick={() => setActiveTab('grant')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Grant First Consent
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {consents.map((consent, index) => {
                    const expired = isExpired(consent.expiryTime);
                    const daysLeft = getDaysUntilExpiry(consent.expiryTime);
                    
                    return (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 ${
                          expired ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-gray-900">
                                Medical Data Access Consent
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                expired
                                  ? 'bg-red-100 text-red-800'
                                  : daysLeft <= 7
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {expired ? 'Expired' : daysLeft <= 7 ? `${daysLeft} days left` : 'Active'}
                              </span>
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Granted To:</span>
                                <span className="ml-2 font-mono text-xs">
                                  {consent.granteeDID.slice(-20)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Expires:</span>
                                <span className="ml-2">{formatDate(consent.expiryTime)}</span>
                              </div>
                              <div>
                                <span className="font-medium">Record Types:</span>
                                <div className="mt-1">
                                  {consent.recordTypes.map(type => {
                                    const typeInfo = recordTypes.find(t => t.value === type);
                                    return (
                                      <span key={type} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                                        {typeInfo?.icon} {typeInfo?.label}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <button
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                              onClick={() => {
                                if (confirm('Are you sure you want to revoke this consent?')) {
                                  setConsents(consents.filter((_, i) => i !== index));
                                }
                              }}
                            >
                              Revoke
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsentManagement;
