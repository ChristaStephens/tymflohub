import { useCallback, useState, useEffect } from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  accept: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  onFilesChange: (files: File[]) => void;
  fileType?: "pdf" | "image";
  files?: File[]; // Optional controlled prop
}

export default function FileUpload({
  accept,
  multiple = true,
  maxFiles = 5,
  maxSizeMB = 10,
  onFilesChange,
  fileType = "pdf",
  files,
}: FileUploadProps) {
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Sync internal state when parent's files prop changes (e.g., reset to empty)
  useEffect(() => {
    if (files !== undefined) {
      setInternalFiles(files);
    }
  }, [files]);

  // Sync internal state with parent when parent changes
  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles);
    const validFiles = fileArray.filter((file) => {
      const sizeMB = file.size / 1024 / 1024;
      return sizeMB <= maxSizeMB;
    });

    const updatedFiles = multiple
      ? [...internalFiles, ...validFiles].slice(0, maxFiles)
      : validFiles.slice(0, 1);

    setInternalFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [internalFiles, multiple, maxFiles, maxSizeMB, onFilesChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    const updatedFiles = internalFiles.filter((_, i) => i !== index);
    setInternalFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const Icon = fileType === "pdf" ? FileText : ImageIcon;

  return (
    <div className="space-y-6">
      <div
        className={`border-3 border-dashed rounded-2xl p-12 md:p-16 text-center transition-all ${
          dragActive
            ? "border-primary bg-primary/10"
            : internalFiles.length > 0
            ? "border-primary/30 bg-primary/5"
            : "border-border bg-muted/30"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        data-testid="dropzone-upload"
      >
        <Upload className="w-16 h-16 mx-auto mb-6 text-primary" />
        <h3 className="text-xl font-bold text-primary mb-2">
          {dragActive ? "Drop files here" : "Choose Files"}
        </h3>
        <p className="text-muted-foreground mb-6">
          or drag and drop them here
        </p>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
          id="file-upload"
          data-testid="input-file-upload"
        />
        <label htmlFor="file-upload">
          <Button size="lg" className="rounded-xl" asChild>
            <span>Select {fileType === "pdf" ? "PDF" : "Image"} Files</span>
          </Button>
        </label>
        <p className="text-sm text-muted-foreground mt-4">
          Maximum {maxFiles} files • {maxSizeMB}MB each (Free plan)
        </p>
      </div>

      {internalFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-primary">
              Selected Files ({internalFiles.length}/{maxFiles})
            </h3>
          </div>
          {internalFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-border hover:border-primary transition-colors"
              data-testid={`file-item-${index}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">{file.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                className="rounded-lg hover:bg-destructive/10 hover:text-destructive"
                data-testid={`button-remove-${index}`}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
