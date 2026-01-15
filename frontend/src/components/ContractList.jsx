import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Eye, Loader } from 'lucide-react';
import { contractsAPI } from '../services/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import { formatDate, formatFileSize } from '@/lib/formatting';

const ContractList = ({ refreshTrigger }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchContracts = async () => {
    try {
      const isInitialLoad = loading && contracts.length === 0;
      if (isInitialLoad) setLoading(true);

      const response = await contractsAPI.getContracts({ page: 1, page_size: 50 });
      setContracts(response.data.contracts);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      toast({
        variant: "destructive",
        title: "Failed to load contracts",
        description: "Please try refreshing the page.",
      });
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
      const interval = setInterval(fetchContracts, 5000);
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

      toast({
        title: "Contract deleted",
        description: "The contract has been successfully deleted.",
      });
    } catch (error) {
      console.error('Failed to delete contract:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete contract",
        description: "Please try again.",
      });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Card className="border-gray-200 shadow-stripe overflow-hidden bg-white rounded-xl">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-2">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-[280px]" />
                  <Skeleton className="h-3 w-[200px]" />
                </div>
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-20" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (contracts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Your Contracts
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {contracts.length} {contracts.length === 1 ? 'contract' : 'contracts'} uploaded
          </p>
        </div>
      </div>

      <Card className="border-gray-200 shadow-stripe overflow-hidden bg-white rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 border-b border-gray-200">
              <TableHead className="font-medium text-gray-600">File Name</TableHead>
              <TableHead className="font-medium text-gray-600">Status</TableHead>
              <TableHead className="font-medium text-gray-600">Size</TableHead>
              <TableHead className="font-medium text-gray-600">Uploaded</TableHead>
              <TableHead className="text-right font-medium text-gray-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow
                key={contract.id}
                onClick={() => navigate(`/contract/${contract.id}`)}
                className="cursor-pointer hover:bg-stripe-indigo/[0.03] transition-colors duration-150 border-b border-gray-100"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-stripe-indigo/10 rounded-xl">
                      <FileText className="w-5 h-5 text-stripe-indigo" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {contract.original_filename}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {contract.file_type.toUpperCase()} Document
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={contract.status} />
                </TableCell>
                <TableCell className="text-gray-600 font-medium">
                  {formatFileSize(contract.file_size)}
                </TableCell>
                <TableCell className="text-gray-500">
                  {formatDate(contract.upload_date)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {contract.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/contract/${contract.id}`);
                        }}
                        title="View Analysis"
                        className="hover:bg-stripe-indigo/10 hover:text-stripe-indigo rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(contract.id, e)}
                      disabled={deleting === contract.id}
                      title="Delete"
                      className="hover:bg-red-50 hover:text-red-600 rounded-lg"
                    >
                      {deleting === contract.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ContractList;
