import { Loader2, Check, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface ProcessingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: "processing" | "complete" | "error";
  progress: number;
  onDownload?: () => void;
  fileName?: string;
}

export default function ProcessingModal({
  open,
  onOpenChange,
  status,
  progress,
  onDownload,
  fileName,
}: ProcessingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {status === "processing" && "Processing Your Files"}
            {status === "complete" && "Success!"}
            {status === "error" && "Something Went Wrong"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {status === "processing" && "This will only take a moment..."}
            {status === "complete" && "Your file is ready to download"}
            {status === "error" && "Please try again or contact support"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-8">
          {status === "processing" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {progress}% complete
              </p>
            </div>
          )}

          {status === "complete" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="w-10 h-10 text-primary" />
                </div>
              </div>
              {fileName && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Ready to download:</p>
                  <p className="font-semibold text-primary">{fileName}</p>
                </div>
              )}
              <Button
                size="lg"
                className="w-full rounded-xl"
                onClick={onDownload}
                data-testid="button-download"
              >
                <Download className="w-5 h-5 mr-2" />
                Download File
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                File will be automatically deleted in 1 hour
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <X className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-muted-foreground">
                An error occurred while processing your files. Please try again.
              </p>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => onOpenChange(false)}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
