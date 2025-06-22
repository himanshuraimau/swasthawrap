import { useState, useEffect, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';

interface MedicalRecord {
  recordId: number;
  documentCID: string;
  userDID: string;
  recordType: string;
  timestamp: string;
  authorizedBy: string;
  isActive: boolean;
  metadataHash: string;
}

const RecordsList = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [filter, setFilter] = useState('all');

  const explorerUrl = chainId === base.id ? 'https://basescan.org' : 'https://sepolia.basescan.org';

  const recordTypeLabels: Record<string, { label: string; icon: string; color: string }> = {
    lab_report: { label: 'Lab Report', icon: '🧪', color: 'bg-blue-100 text-blue-800' },
    prescription: { label: 'Prescription', icon: '💊', color: 'bg-green-100 text-green-800' },
    medical_image: { label: 'Medical Image', icon: '🩻', color: 'bg-purple-100 text-purple-800' },
    consultation_note: { label: 'Consultation Note', icon: '📝', color: 'bg-yellow-100 text-yellow-800' },
    vaccination_record: { label: 'Vaccination Record', icon: '💉', color: 'bg-red-100 text-red-800' },
    discharge_summary: { label: 'Discharge Summary', icon: '🏥', color: 'bg-indigo-100 text-indigo-800' },
    insurance_document: { label: 'Insurance Document', icon: '📋', color: 'bg-gray-100 text-gray-800' },
    other: { label: 'Other', icon: '📄', color: 'bg-gray-100 text-gray-800' }
  };

  const fetchRecords = useCallback(async () => {
    if (!isConnected || !address) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/medical-records/user/${address}`);
      const result = await response.json();

      if (result.success) {
        setRecords(result.data.records);
      } else {
        console.error('Failed to fetch records:', result.error);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  }, [isConnected, address]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredRecords = () => {
    if (filter === 'all') return records;
    return records.filter(record => record.recordType === filter);
  };

  const getUniqueRecordTypes = () => {
    const types = [...new Set(records.map(record => record.recordType))];
    return types;
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Please connect your wallet to view your medical records.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your medical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Medical Records</h1>
            <p className="text-gray-600 mt-1">
              {records.length} records stored on IPFS with Base L2 verification
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Records</div>
              <div className="text-2xl font-bold text-blue-600">{records.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter by type:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Records ({records.length})</option>
            {getUniqueRecordTypes().map(type => {
              const count = records.filter(r => r.recordType === type).length;
              const typeInfo = recordTypeLabels[type] || recordTypeLabels.other;
              return (
                <option key={type} value={type}>
                  {typeInfo.icon} {typeInfo.label} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Records Found</h3>
          <p className="text-gray-600 mb-4">
            You haven't uploaded any medical records yet.
          </p>
          <button
            onClick={() => window.location.href = '/upload'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Your First Record
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {getFilteredRecords().map((record) => {
            const typeInfo = recordTypeLabels[record.recordType] || recordTypeLabels.other;
            
            return (
              <div
                key={record.recordId}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{typeInfo.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {typeInfo.label}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            {record.recordType}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {record.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Record ID:</span>
                            <span className="ml-2 font-mono">{record.recordId}</span>
                          </div>
                          <div>
                            <span className="font-medium">Created:</span>
                            <span className="ml-2">{formatDate(record.timestamp)}</span>
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-medium">IPFS CID:</span>
                            <span className="ml-2 font-mono text-xs break-all">{record.documentCID}</span>
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-medium">Authorized By:</span>
                            <span className="ml-2 font-mono text-xs">
                              {record.authorizedBy.slice(0, 6)}...{record.authorizedBy.slice(-4)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                      <a
                        href={`${explorerUrl}/address/${record.authorizedBy}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors text-center"
                      >
                        BaseScan ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Record Details</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Record ID:</span>
                      <span className="ml-2 font-mono">{selectedRecord.recordId}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2">{recordTypeLabels[selectedRecord.recordType]?.label}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2">{formatDate(selectedRecord.timestamp)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedRecord.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedRecord.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3">🔗 Blockchain Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-blue-700">IPFS CID:</span>
                      <div className="font-mono text-xs break-all bg-white p-2 rounded border mt-1">
                        {selectedRecord.documentCID}
                      </div>
                    </div>
                    <div>
                      <span className="text-blue-700">User DID:</span>
                      <div className="font-mono text-xs break-all bg-white p-2 rounded border mt-1">
                        {selectedRecord.userDID}
                      </div>
                    </div>
                    <div>
                      <span className="text-blue-700">Authorized By:</span>
                      <div className="font-mono text-xs bg-white p-2 rounded border mt-1">
                        {selectedRecord.authorizedBy}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-3">✅ Verification</h3>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex items-center space-x-2">
                      <span>✓</span>
                      <span>Document stored on IPFS</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>✓</span>
                      <span>Verifiable credential created</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>✓</span>
                      <span>Anchored on Base L2 blockchain</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>✓</span>
                      <span>Cryptographically signed</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <a
                    href={`${explorerUrl}/address/${selectedRecord.authorizedBy}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    View on BaseScan ↗
                  </a>
                  <button
                    onClick={() => window.location.href = `/verify?cid=${selectedRecord.documentCID}&id=${selectedRecord.recordId}`}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Verify Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsList;
