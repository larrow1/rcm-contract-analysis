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
        <Card className="border-slate-200 shadow-md overflow-hidden bg-white">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-2">
                <Skeleton className="h-14 w-14 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-[280px]" />
                  <Skeleton className="h-3 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-28 rounded-full" />
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
          <h2 className="text-2xl font-bold text-slate-800">
            Your Contracts
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {contracts.length} {contracts.length === 1 ? 'contract' : 'contracts'} uploaded
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-md overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">File Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700">Size</TableHead>
              <TableHead className="font-semibold text-slate-700">Uploaded</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow
                key={contract.id}
                onClick={() => navigate(`/contract/${contract.id}`)}
                className="cursor-pointer hover:bg-blue-50/50 transition-colors border-b border-slate-100"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">
                        {contract.original_filename}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {contract.file_type.toUpperCase()} Document
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={contract.status} />
                </TableCell>
                <TableCell className="text-slate-600 font-medium">
                  {formatFileSize(contract.file_size)}
                </TableCell>
                <TableCell className="text-slate-600">
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
                        className="hover:bg-blue-100 hover:text-blue-700"
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
                      className="hover:bg-red-100 hover:text-red-700"
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
