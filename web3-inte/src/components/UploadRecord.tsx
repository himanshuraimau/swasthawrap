import { useState } from 'react';
import { useAccount } from 'wagmi';

interface UploadFormData {
  recordType: string;
  file: File | null;
  authorizedBy: string;
  notes: string;
}

interface UploadResult {
  recordId: number;
  documentCID: string;
  userDID: string;
  recordType: string;
  verifiableCredential: object;
  metadata: object;
  timestamp: string;
  baseScanUrl: string;
}

const UploadRecord = () => {
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState<UploadFormData>({
    recordType: '',
    file: null,
    authorizedBy: '',
    notes: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const recordTypes = [
    { value: 'lab_report', label: 'Lab Report', icon: '🧪' },
    { value: 'prescription', label: 'Prescription', icon: '💊' },
    { value: 'medical_image', label: 'Medical Image (X-Ray, MRI)', icon: '🩻' },
    { value: 'consultation_note', label: 'Consultation Note', icon: '📝' },
    { value: 'vaccination_record', label: 'Vaccination Record', icon: '💉' },
    { value: 'discharge_summary', label: 'Discharge Summary', icon: '🏥' },
    { value: 'insurance_document', label: 'Insurance Document', icon: '📋' },
    { value: 'other', label: 'Other', icon: '📄' }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, image (JPEG, PNG, WebP), or Word document');
      return;
    }

    setFormData({ ...formData, file });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!formData.file || !formData.recordType) {
      alert('Please select a file and record type');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append('document', formData.file);
      uploadFormData.append('userAddress', address || '');
      uploadFormData.append('recordType', formData.recordType);
      uploadFormData.append('authorizedBy', formData.authorizedBy || address || '');
      uploadFormData.append('notes', formData.notes);

      // Upload to backend
      const response = await fetch('http://localhost:5000/api/medical-records/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const result = await response.json();

      if (result.success) {
        setUploadResult(result.data);
        // Reset form
        setFormData({
          recordType: '',
          file: null,
          authorizedBy: '',
          notes: ''
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload document';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Please connect your wallet to upload medical records to the blockchain.
          </p>
        </div>
      </div>
    );
  }

  if (uploadResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-green-900 mb-2">Upload Successful!</h2>
            <p className="text-gray-600">
              Your medical record has been securely uploaded to IPFS and anchored on Base L2.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Upload Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Record ID:</span>
                  <span className="font-mono ml-2">{uploadResult.recordId}</span>
                </div>
                <div>
                  <span className="text-gray-600">IPFS CID:</span>
                  <span className="font-mono ml-2">{uploadResult.documentCID}</span>
                </div>
                <div>
                  <span className="text-gray-600">User DID:</span>
                  <span className="font-mono ml-2 text-xs">{uploadResult.userDID}</span>
                </div>
                <div>
                  <span className="text-gray-600">Record Type:</span>
                  <span className="ml-2">{uploadResult.recordType}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">🔗 On-Chain Proof</h3>
              <p className="text-blue-700 text-sm mb-3">
                Your document is now verifiable on the Base L2 blockchain:
              </p>
              <a
                href={uploadResult.baseScanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <span>View on BaseScan</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setUploadResult(null)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Another Document
            </button>
            <button
              onClick={() => window.location.href = '/records'}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View All Records
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Medical Record</h1>
          <p className="text-gray-600">
            Securely upload your medical documents to IPFS with verifiable credentials on Base L2.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Record Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Record Type *
            </label>
            <select
              name="recordType"
              value={formData.recordType}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select record type...</option>
              {recordTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document File *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {formData.file ? (
                <div className="space-y-2">
                  <div className="text-2xl">📄</div>
                  <div className="text-sm font-medium text-gray-900">{formData.file.name}</div>
                  <div className="text-xs text-gray-500">
                    {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, file: null })}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-3xl">📤</div>
                  <div className="text-gray-600">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </div>
                  <div className="text-xs text-gray-500">
                    PDF, JPEG, PNG, WebP, or Word documents (max 10MB)
                  </div>
                </div>
              )}
              <input
                type="file"
                onChange={handleFileInputChange}
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                className="hidden"
                id="file-upload"
              />
              {!formData.file && (
                <label
                  htmlFor="file-upload"
                  className="absolute inset-0 cursor-pointer"
                />
              )}
            </div>
          </div>

          {/* Authorized By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authorized By (Doctor/Institution Address)
            </label>
            <input
              type="text"
              name="authorizedBy"
              value={formData.authorizedBy}
              onChange={handleInputChange}
              placeholder="0x... (optional, defaults to your address)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any additional information about this record..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || !formData.file || !formData.recordType}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Uploading to IPFS & Base L2...</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>Upload Medical Record</span>
              </>
            )}
          </button>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">🔒 Privacy & Security</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Your document is encrypted and stored on IPFS</li>
              <li>• Only the document hash is stored on Base L2 blockchain</li>
              <li>• You maintain full control and ownership of your data</li>
              <li>• Verifiable credentials ensure document authenticity</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadRecord;
