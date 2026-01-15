import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader } from 'lucide-react';
import { contractsAPI } from '../services/api';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const FileUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await contractsAPI.uploadContract(file, (progress) => {
        setUploadProgress(progress);
      });

      setUploading(false);
      setUploadProgress(0);

      // Show success toast
      toast({
        title: "Upload Successful!",
        description: `${file.name} has been uploaded and is being analyzed.`,
        duration: 5000,
      });

      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }

    } catch (error) {
      setUploading(false);
      setUploadProgress(0);

      // Show error toast
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.response?.data?.detail || 'Upload failed. Please try again.',
        duration: 7000,
      });

      console.error('Upload error:', error);
    }
  }, [onUploadSuccess, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-slate-300 p-12 text-center cursor-pointer transition-all duration-300",
          "bg-white shadow-sm hover:shadow-md",
          "hover:border-blue-400 hover:bg-blue-50/30",
          isDragActive && "border-blue-500 bg-blue-50/50 shadow-lg scale-[1.02]",
          uploading && "opacity-60 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-5">
          {uploading ? (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                <Loader className="w-16 h-16 text-blue-600 animate-spin relative" />
              </div>
              <div className="w-full max-w-xs space-y-3">
                <div className="bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300 rounded-full shadow-sm"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm font-medium text-slate-700">Uploading... {uploadProgress}%</p>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                {isDragActive ? (
                  <>
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                    <FileText className="w-20 h-20 text-blue-600 relative animate-bounce" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-slate-200/50 rounded-full blur-lg"></div>
                    <Upload className="w-20 h-20 text-slate-400 relative" />
                  </>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-slate-800">
                  {isDragActive ? 'Drop your file here' : 'Upload Your Contract'}
                </p>
                <p className="text-sm text-slate-600">
                  Drag & drop or <span className="text-blue-600 font-semibold">click to browse</span>
                </p>
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500">
                  <span className="px-2 py-1 bg-slate-100 rounded">PDF</span>
                  <span className="px-2 py-1 bg-slate-100 rounded">DOCX</span>
                  <span className="text-slate-400">•</span>
                  <span>Max 50MB</span>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FileUpload;
