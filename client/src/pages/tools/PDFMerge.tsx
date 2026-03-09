import { useState } from "react";
import { FileText, Shield, Zap, Globe, Lock, Cloud, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import FAQ from "@/components/FAQ";
import FileUpload from "@/components/FileUpload";
import ProcessingModal from "@/components/ProcessingModal";
import PDFPreview from "@/components/PDFPreview";
import { useToast } from "@/hooks/use-toast";
import { HowItWorks, Features, FAQSection, BenefitsBanner } from "@/components/SEOContent";

export default function PDFMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<"processing" | "complete" | "error">("processing");
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const { toast } = useToast();

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: "Not enough files",
        description: "Please select at least 2 PDF files to merge",
        variant: "destructive",
      });
      return;
    }

    setModalOpen(true);
    setProcessingStatus("processing");
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90));
      }, 300);

      const response = await fetch("/api/pdf/merge", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Failed to merge PDFs");
      }

      const data = await response.json();
      setProgress(100);
      setProcessingStatus("complete");
      setDownloadUrl(data.downloadUrl);
      setFileName(data.filename);
    } catch (error) {
      console.error("Merge error:", error);
      setProcessingStatus("error");
      toast({
        title: "Error",
        description: "Failed to merge PDFs. Please try again.",
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
        description: "Your merged PDF is downloading",
      });
    }
  };

  const howItWorksSteps = [
    {
      step: 1,
      title: "Upload Your Files",
      description: "Drag and drop or click to upload the PDF files you want to merge. You can upload up to 5 files at once.",
    },
    {
      step: 2,
      title: "Arrange & Merge",
      description: "Files are automatically arranged in upload order. Click 'Merge PDFs' to combine them into a single document.",
    },
    {
      step: 3,
      title: "Download",
      description: "Your merged PDF is ready in seconds! Download it instantly or save it to cloud storage.",
    },
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Merge multiple PDFs in seconds with our high-speed processing engine.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Files are encrypted with 256-bit TLS and automatically deleted after 1 hour.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Works Everywhere",
      description: "Use on any device - Windows, Mac, Linux, iOS, or Android. No software installation required.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "No Registration",
      description: "Free to use without creating an account. Start merging PDFs immediately.",
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Cloud Integration",
      description: "Save directly to Google Drive or Dropbox (Pro feature).",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Quality Preserved",
      description: "Original PDF quality is maintained. No compression or quality loss.",
    },
  ];

  const faqItems = [
    {
      question: "How many PDFs can I merge at once?",
      answer: "Free users can merge up to 5 PDF files at once, with each file up to 10MB. Pro users can merge unlimited files up to 100MB each.",
    },
    {
      question: "Is my data secure?",
      answer: "Yes! All files are encrypted during upload and processing using 256-bit TLS encryption. We're ISO/IEC 27001 certified and fully GDPR compliant. All files are automatically deleted from our servers after 1 hour.",
    },
    {
      question: "What file formats are supported?",
      answer: "We support all standard PDF files, both scanned and digital. The output will always be a standard PDF file compatible with all PDF readers.",
    },
    {
      question: "Will the quality of my PDFs be affected?",
      answer: "No, your PDFs will maintain their original quality. We don't compress or reduce quality during the merge process.",
    },
    {
      question: "Do I need to install any software?",
      answer: "No installation required! Our PDF merger works entirely in your web browser on any device.",
    },
    {
      question: "Can I change the order of the PDFs?",
      answer: "Currently, PDFs are merged in the order they're uploaded. We're working on a drag-and-drop reorder feature for our next update.",
    },
    {
      question: "What's the difference between Free and Pro?",
      answer: "Free users can merge up to 5 files (10MB each) with 5 operations per day. Pro users get unlimited merges, larger file sizes (100MB), batch processing, and cloud storage integration.",
    },
  ];

  return (
    <>
      <SEO
        title="Merge PDF Files Online - Free PDF Merger | TymFlo Hub"
        description="Combine multiple PDF files into one document quickly and easily. Free online PDF merger tool with no registration required."
        canonical="https://tymflohub.com/tools/pdf-merge"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Merge PDF Files
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Combine multiple PDF files into one document in seconds
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
            <FileUpload
              accept="application/pdf"
              multiple={true}
              maxFiles={5}
              maxSizeMB={10}
              onFilesChange={setFiles}
              fileType="pdf"
              files={files}
            />

            {files.length > 0 && (
              <div className="mt-8 space-y-4">
                <h3 className="font-bold text-lg text-primary">
                  Files to Merge ({files.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {files.map((file, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      </div>
                      <PDFPreview 
                        file={file}
                      />
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <Button
                size="lg"
                className="w-full h-14 rounded-xl text-lg"
                disabled={files.length < 2}
                onClick={handleMerge}
                data-testid="button-merge-pdf"
              >
                {files.length < 2
                  ? "Select at least 2 PDFs"
                  : `Merge ${files.length} PDF${files.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>

        </div>
      </div>

      <HowItWorks title="How to Merge PDF Files Online" steps={howItWorksSteps} />

      <Features title="Why Choose TymFlo PDF Merger?" features={features} />

      <FAQSection title="Frequently Asked Questions" faqs={faqItems} />

      <BenefitsBanner
        title="Do More with TymFlo Pro"
        description="Get unlimited access to all tools, larger file sizes, batch processing, and cloud storage integration. Try it free for 7 days."
        ctaText="Try Pro Free"
        ctaHref="/pricing"
      />

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
