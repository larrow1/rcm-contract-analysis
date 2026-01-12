import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  Loader
} from 'lucide-react';
import { contractsAPI } from '../services/api';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    uploaded: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Uploaded' },
    processing: { color: 'bg-blue-100 text-blue-700', icon: Loader, label: 'Processing' },
    completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
    failed: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Failed' }
  };

  const config = statusConfig[status] || statusConfig.uploaded;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className={`w-3 h-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {config.label}
    </span>
  );
};

const ContractList = ({ refreshTrigger }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await contractsAPI.getContracts({ page: 1, page_size: 50 });
      setContracts(response.data.contracts);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [refreshTrigger]);

  // Auto-refresh for processing contracts
  useEffect(() => {
    const hasProcessing = contracts.some(c => c.status === 'processing');
    if (hasProcessing) {
      const interval = setInterval(fetchContracts, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [contracts]);

  const handleDelete = async (contractId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this contract?')) return;

    try {
      setDeleting(contractId);
      await contractsAPI.deleteContract(contractId);
      setContracts(contracts.filter(c => c.id !== contractId));
    } catch (error) {
      console.error('Failed to delete contract:', error);
      alert('Failed to delete contract');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No contracts uploaded yet</p>
        <p className="text-gray-400 text-sm mt-2">Upload your first RCM contract to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Contracts ({contracts.length})
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map((contract) => (
                <tr
                  key={contract.id}
                  onClick={() => navigate(`/contract/${contract.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contract.original_filename}
                        </div>
                        <div className="text-xs text-gray-500">
                          {contract.file_type.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={contract.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(contract.file_size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(contract.upload_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {contract.status === 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/contract/${contract.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                          title="View Analysis"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(contract.id, e)}
                        disabled={deleting === contract.id}
                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === contract.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContractList;
