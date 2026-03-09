import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SEO from "@/components/SEO";
import FAQ from "@/components/FAQ";
import FileUpload from "@/components/FileUpload";
import ProcessingModal from "@/components/ProcessingModal";
import { useToast } from "@/hooks/use-toast";

export default function ImageConvert() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState("png");
  const [modalOpen, setModalOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<"processing" | "complete" | "error">("processing");
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const { toast } = useToast();

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select an image file to convert",
        variant: "destructive",
      });
      return;
    }

    setModalOpen(true);
    setProcessingStatus("processing");
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("format", format);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90));
      }, 200);

      const response = await fetch("/api/image/convert", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Failed to convert image");
      }

      const data = await response.json();
      setProgress(100);
      setProcessingStatus("complete");
      setDownloadUrl(data.downloadUrl);
      setFileName(data.filename);
    } catch (error) {
      console.error("Convert error:", error);
      setProcessingStatus("error");
      toast({
        title: "Error",
        description: "Failed to convert image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.location.href = downloadUrl;
      setModalOpen(false);
      setFiles([]);
      toast({
        title: "Download started",
        description: "Your converted image is downloading",
      });
    }
  };

  const faqItems = [
    {
      question: "What image formats are supported?",
      answer: "You can convert between PNG, JPG/JPEG, and WebP formats. All common image formats are supported as input.",
    },
    {
      question: "Will the quality be preserved?",
      answer: "Yes! We use high-quality conversion settings to maintain image quality. For JPG, we use 90% quality, and for PNG, maximum compression.",
    },
    {
      question: "What's the maximum file size?",
      answer: "Free users can convert images up to 10MB. Pro users can handle files up to 100MB.",
    },
  ];

  return (
    <>
      <SEO
        title="Convert Images Online - PNG, JPG, WebP Converter | TymFlo Hub"
        description="Convert images between PNG, JPG, and WebP formats online. Free, fast, and high-quality image conversion tool."
        canonical="https://tymflohub.com/tools/image-convert"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 mb-6 shadow-lg">
              <ImageIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Convert Images
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Convert between PNG, JPG, and WebP formats with perfect quality
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
            <FileUpload
              accept="image/*"
              multiple={false}
              maxFiles={1}
              maxSizeMB={10}
              onFilesChange={setFiles}
              fileType="image"
              files={files}
            />

            <div className="mt-8 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="format" className="text-base font-semibold text-primary">
                  Convert to Format
                </Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="h-14 text-lg rounded-xl border-2" data-testid="select-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG - Best for graphics with transparency</SelectItem>
                    <SelectItem value="jpg">JPG - Best for photos, smaller file size</SelectItem>
                    <SelectItem value="webp">WebP - Modern format, best compression</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="lg"
                className="w-full h-14 rounded-xl text-lg"
                disabled={files.length === 0}
                onClick={handleConvert}
                data-testid="button-convert-image"
              >
                {files.length === 0 ? "Select an image" : `Convert to ${format.toUpperCase()}`}
              </Button>
            </div>
          </div>

          <FAQ items={faqItems} />
        </div>
      </div>

      <ProcessingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        status={processingStatus}
        progress={progress}
        onDownload={handleDownload}
        fileName={fileName}
      />
    </>
  );
}
