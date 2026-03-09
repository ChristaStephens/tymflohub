import { FileSpreadsheet, AlertCircle, Sparkles, Download, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection, BenefitsBanner } from "@/components/SEOContent";
import { Link } from "wouter";

export default function PDFToExcel() {
  const howItWorksSteps = [
    {
      step: 1,
      title: "Coming Soon",
      description: "PDF to Excel conversion is an advanced feature we're actively developing.",
    },
    {
      step: 2,
      title: "Table Detection",
      description: "We're building intelligent table detection and data extraction technology.",
    },
    {
      step: 3,
      title: "Available Soon",
      description: "This feature will be available to Pro users in our next major update.",
    },
  ];

  const features = [
    {
      icon: <Table className="w-6 h-6" />,
      title: "Smart Table Detection",
      description: "Automatically detect and extract tables from PDF documents.",
    },
    {
      icon: <FileSpreadsheet className="w-6 h-6" />,
      title: "Excel Format",
      description: "Convert PDFs to fully editable Excel spreadsheets (.xlsx format).",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Data Preservation",
      description: "Maintain formulas, formatting, and cell structure from your PDF.",
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Batch Processing",
      description: "Convert multiple PDF files to Excel at once (Pro feature).",
    },
  ];

  const faqItems = [
    {
      question: "When will PDF to Excel be available?",
      answer: "We're actively developing this feature and it will be available to Pro users in our next major update. Follow our announcements for the exact release date.",
    },
    {
      question: "Why is PDF to Excel conversion complex?",
      answer: "Converting PDFs to Excel requires advanced table detection, data extraction, and structure recognition. We're building a solution that accurately identifies tables and preserves data integrity.",
    },
    {
      question: "What types of PDFs will be supported?",
      answer: "Our tool will support both native PDFs with tables and scanned documents. We're implementing OCR technology for scanned documents to ensure accurate data extraction.",
    },
    {
      question: "Will this be a Pro feature?",
      answer: "Yes, PDF to Excel conversion will be available to TymFlo Pro subscribers when it launches, along with batch processing for multiple files.",
    },
    {
      question: "What alternatives are available now?",
      answer: "Currently, you can use our PDF Merge, Split, Compress, and PDF to JPG tools. For simple data extraction, consider manually copying tables from PDF readers.",
    },
  ];

  return (
    <>
      <SEO
        title="PDF to Excel Converter - Coming Soon | TymFlo Hub"
        description="Convert PDF files to Excel spreadsheets. Advanced conversion feature coming soon to TymFlo Pro."
        canonical="https://tymflohub.com/tools/pdf-to-excel"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
              <FileSpreadsheet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              PDF to Excel Converter
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Convert PDF files to Excel spreadsheets
            </p>
          </div>

          <Card className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
            <Alert className="mb-8 border-primary/20 bg-primary/5">
              <AlertCircle className="h-5 w-5 text-primary" />
              <AlertTitle className="text-primary font-bold">Coming Soon - Advanced Feature</AlertTitle>
              <AlertDescription className="text-muted-foreground mt-2">
                PDF to Excel conversion is an advanced feature we're actively developing. This requires intelligent
                table detection, data extraction, and structure recognition technology. It will be available to Pro users in our
                next major update.
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              <div className="text-center py-8">
                <Sparkles className="w-16 h-16 mx-auto text-primary/40 mb-4" />
                <h2 className="text-2xl font-bold text-primary mb-3">
                  Intelligent Data Extraction
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  We're creating a smart PDF to Excel converter that accurately detects tables,
                  preserves data structure, and handles both native and scanned PDFs with OCR.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 border-2">
                  <h3 className="font-bold text-lg mb-2">Try Our Other Tools</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore our available PDF tools:
                  </p>
                  <div className="space-y-2">
                    <Link href="/tools/pdf-merge">
                      <Button variant="outline" className="w-full justify-start" data-testid="link-pdf-merge">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        PDF Merge
                      </Button>
                    </Link>
                    <Link href="/tools/pdf-split">
                      <Button variant="outline" className="w-full justify-start" data-testid="link-pdf-split">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        PDF Split
                      </Button>
                    </Link>
                    <Link href="/tools/pdf-compress">
                      <Button variant="outline" className="w-full justify-start" data-testid="link-pdf-compress">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        PDF Compress
                      </Button>
                    </Link>
                    <Link href="/tools/pdf-to-jpg">
                      <Button variant="outline" className="w-full justify-start" data-testid="link-pdf-to-jpg">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        PDF to JPG
                      </Button>
                    </Link>
                  </div>
                </Card>

                <Card className="p-6 border-2 border-primary/20 bg-primary/5">
                  <h3 className="font-bold text-lg mb-2 text-primary">Early Access</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Be among the first to use PDF to Excel when it launches:
                  </p>
                  <Link href="/pricing">
                    <Button className="w-full" data-testid="button-early-access">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Explore TymFlo Pro
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <HowItWorks title="How PDF to Excel Will Work" steps={howItWorksSteps} />

      <Features title="Upcoming PDF to Excel Features" features={features} />

      <FAQSection title="Frequently Asked Questions" faqs={faqItems} />

      <BenefitsBanner
        title="TymFlo Pro - Advanced Data Tools"
        description="Get early access to features like PDF to Excel, plus unlimited usage of all current tools. Try it free for 7 days."
        ctaText="Learn More About Pro"
        ctaHref="/pricing"
      />
    </>
  );
}
