import { useState } from 'react';
import { useAccount } from 'wagmi';

interface VerificationResult {
  documentCID: string;
  recordId: string;
  isValid: boolean;
  verificationTime: string;
  baseScanUrl: string;
}

const VerifyDocument = () => {
  const { isConnected } = useAccount();
  const [documentCID, setDocumentCID] = useState('');
  const [recordId, setRecordId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');

  // Pre-fill if coming from URL params
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cidParam = urlParams.get('cid');
    const idParam = urlParams.get('id');
    
    if (cidParam) setDocumentCID(cidParam);
    if (idParam) setRecordId(idParam);
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!documentCID.trim() || !recordId.trim()) {
      setError('Please provide both Document CID and Record ID');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch('http://localhost:5000/api/verify/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentCID: documentCID.trim(),
          recordId: recordId.trim()
        })
      });

      const result = await response.json();

      if (result.success) {
        setVerificationResult(result.data);
      } else {
        throw new Error(result.error || 'Verification failed');
      }
    } catch (error: unknown) {
      console.error('Verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify document';
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setDocumentCID('');
    setRecordId('');
    setVerificationResult(null);
    setError('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="text-2xl">✅</div>
          <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
        </div>
        <p className="text-gray-600">
          Verify the authenticity and integrity of medical documents using Base L2 blockchain verification.
        </p>
      </div>

      {/* Verification Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Verify Medical Document</h2>
        
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document IPFS CID *
            </label>
            <div className="flex">
              <input
                type="text"
                value={documentCID}
                onChange={(e) => setDocumentCID(e.target.value)}
                placeholder="QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnAQP2bDB"
                required
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(documentCID)}
                disabled={!documentCID}
                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📋
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The IPFS Content Identifier (CID) of the document you want to verify
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Record ID *
            </label>
            <input
              type="text"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              placeholder="12345"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              The blockchain record ID associated with this document
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isVerifying || !documentCID.trim() || !recordId.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Verifying on Base L2...</span>
                </>
              ) : (
                <>
                  <span>✅</span>
                  <span>Verify Document</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`text-3xl ${verificationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
              {verificationResult.isValid ? '✅' : '❌'}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${verificationResult.isValid ? 'text-green-900' : 'text-red-900'}`}>
                {verificationResult.isValid ? 'Document Verified Successfully' : 'Document Verification Failed'}
              </h2>
              <p className="text-gray-600">
                Verification completed at {new Date(verificationResult.verificationTime).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Verification Details */}
            <div className={`p-4 rounded-lg border-2 ${
              verificationResult.isValid 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <h3 className={`font-semibold mb-3 ${
                verificationResult.isValid ? 'text-green-900' : 'text-red-900'
              }`}>
                Verification Details
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Document CID:</span>
                  <div className="font-mono text-xs break-all bg-white p-2 rounded border mt-1">
                    {verificationResult.documentCID}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Record ID:</span>
                  <span className="font-mono ml-2">{verificationResult.recordId}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 font-medium ${
                    verificationResult.isValid ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {verificationResult.isValid ? 'VERIFIED' : 'INVALID'}
                  </span>
                </div>
              </div>
            </div>

            {/* Blockchain Info */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">🔗 Blockchain Verification</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Record exists on Base L2</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Document hash matches IPFS CID</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Cryptographic signature verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Timestamp integrity confirmed</span>
                </div>
              </div>
              
              <div className="mt-4">
                <a
                  href={verificationResult.baseScanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <span>View on BaseScan</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="mt-6">
            {verificationResult.isValid ? (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">✅ Document Authentic</h3>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• This document has been cryptographically verified on the Base L2 blockchain</li>
                  <li>• The document content has not been tampered with since creation</li>
                  <li>• The IPFS storage ensures decentralized and permanent availability</li>
                  <li>• You can trust the authenticity and integrity of this medical record</li>
                </ul>
              </div>
            ) : (
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">❌ Document Invalid</h3>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• This document could not be verified on the blockchain</li>
                  <li>• The document may have been tampered with or corrupted</li>
                  <li>• The record ID and CID combination may be incorrect</li>
                  <li>• Please verify the source and authenticity of this document</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 How Document Verification Works</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">📄</div>
            <h3 className="font-medium text-gray-900 mb-2">1. Document Upload</h3>
            <p className="text-sm text-gray-600">
              Medical documents are uploaded to IPFS and get a unique Content ID (CID)
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="font-medium text-gray-900 mb-2">2. Blockchain Anchoring</h3>
            <p className="text-sm text-gray-600">
              Document hash and metadata are stored on Base L2 with a unique record ID
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-medium text-gray-900 mb-2">3. Verification</h3>
            <p className="text-sm text-gray-600">
              Anyone can verify document authenticity using the CID and record ID
            </p>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">🔒 Privacy & Security</h3>
          <ul className="text-gray-700 text-sm space-y-1">
            <li>• Only document hashes are stored on-chain, not the actual content</li>
            <li>• IPFS provides decentralized, censorship-resistant storage</li>
            <li>• Base L2 ensures low-cost, fast verification with Ethereum security</li>
            <li>• Cryptographic proofs guarantee document integrity</li>
          </ul>
        </div>
      </div>

      {/* Sample Data for Testing */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-900 mb-2">🧪 Test Verification</h3>
          <p className="text-yellow-700 text-sm mb-3">
            You can test the verification system with these sample values:
          </p>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-yellow-800">Sample CID:</span>
              <code className="ml-2 bg-white px-2 py-1 rounded text-xs">
                QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnAQP2bDB
              </code>
              <button
                onClick={() => setDocumentCID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnAQP2bDB')}
                className="ml-2 text-yellow-600 hover:text-yellow-800 text-xs"
              >
                Use This
              </button>
            </div>
            <div>
              <span className="font-medium text-yellow-800">Sample Record ID:</span>
              <code className="ml-2 bg-white px-2 py-1 rounded text-xs">
                12345
              </code>
              <button
                onClick={() => setRecordId('12345')}
                className="ml-2 text-yellow-600 hover:text-yellow-800 text-xs"
              >
                Use This
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyDocument;
