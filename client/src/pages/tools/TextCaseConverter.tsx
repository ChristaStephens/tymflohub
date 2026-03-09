import { useState } from "react";
import { Type, Copy, Check, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection } from "@/components/SEOContent";

type CaseType = "uppercase" | "lowercase" | "titlecase" | "sentencecase" | "camelcase" | "pascalcase" | "snakecase" | "kebabcase" | "dotcase" | "constantcase";

const caseOptions: { id: CaseType; label: string; example: string }[] = [
  { id: "uppercase", label: "UPPERCASE", example: "HELLO WORLD" },
  { id: "lowercase", label: "lowercase", example: "hello world" },
  { id: "titlecase", label: "Title Case", example: "Hello World" },
  { id: "sentencecase", label: "Sentence case", example: "Hello world" },
  { id: "camelcase", label: "camelCase", example: "helloWorld" },
  { id: "pascalcase", label: "PascalCase", example: "HelloWorld" },
  { id: "snakecase", label: "snake_case", example: "hello_world" },
  { id: "kebabcase", label: "kebab-case", example: "hello-world" },
  { id: "dotcase", label: "dot.case", example: "hello.world" },
  { id: "constantcase", label: "CONSTANT_CASE", example: "HELLO_WORLD" },
];

function convertCase(text: string, caseType: CaseType): string {
  if (!text.trim()) return "";

  const words = text.trim().split(/[\s_\-\.]+/).filter(w => w.length > 0);
  
  switch (caseType) {
    case "uppercase":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "titlecase":
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    case "sentencecase":
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case "camelcase":
      return words.map((w, i) => 
        i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join("");
    case "pascalcase":
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    case "snakecase":
      return words.map(w => w.toLowerCase()).join("_");
    case "kebabcase":
      return words.map(w => w.toLowerCase()).join("-");
    case "dotcase":
      return words.map(w => w.toLowerCase()).join(".");
    case "constantcase":
      return words.map(w => w.toUpperCase()).join("_");
    default:
      return text;
  }
}

export default function TextCaseConverter() {
  const [inputText, setInputText] = useState("");
  const [selectedCase, setSelectedCase] = useState<CaseType>("uppercase");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const outputText = convertCase(inputText, selectedCase);

  const handleCopy = async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    toast({ title: "Copied!", description: "Text copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const howItWorksSteps = [
    { step: 1, title: "Paste Text", description: "Enter or paste your text in the input area." },
    { step: 2, title: "Choose Case", description: "Select the text case format you need." },
    { step: 3, title: "Copy Result", description: "Copy the converted text with one click." },
  ];

  const features = [
    { icon: <Type className="w-6 h-6" />, title: "10 Case Formats", description: "From UPPERCASE to camelCase and more." },
    { icon: <ArrowRight className="w-6 h-6" />, title: "Instant Conversion", description: "See results as you type." },
    { icon: <Copy className="w-6 h-6" />, title: "One-Click Copy", description: "Copy to clipboard instantly." },
  ];

  const faqItems = [
    { question: "What is camelCase?", answer: "camelCase starts with a lowercase letter and capitalizes the first letter of each subsequent word, with no spaces (e.g., 'helloWorld')." },
    { question: "What is snake_case?", answer: "snake_case uses underscores between words, all lowercase (e.g., 'hello_world'). Common in Python and database naming." },
    { question: "When should I use Title Case?", answer: "Title Case capitalizes the first letter of each word. Use it for headlines, titles, and proper nouns." },
  ];

  return (
    <>
      <SEO
        title="Text Case Converter - Convert Text to Any Case | TymFlo Hub"
        description="Free online text case converter. Convert text to uppercase, lowercase, Title Case, camelCase, snake_case, and more."
        canonical="https://tymflohub.com/tools/text-case"
        keywords="text case converter, uppercase, lowercase, title case, camelCase, snake_case"
      />

      <div className="py-8 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Type className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Text Case Converter</h1>
            </div>
            <p className="text-muted-foreground">
              Convert text to any case format instantly
            </p>
          </div>

          <Card className="p-6 mb-8">
            {/* Case Options */}
            <div className="flex flex-wrap gap-2 mb-4">
              {caseOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={selectedCase === option.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCase(option.id)}
                  className="text-xs"
                  data-testid={`button-case-${option.id}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Input */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Input Text</label>
              <Textarea
                placeholder="Type or paste your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-32 resize-none"
                data-testid="textarea-input"
              />
            </div>

            {/* Output */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  Result ({caseOptions.find(c => c.id === selectedCase)?.label})
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!outputText}
                  data-testid="button-copy"
                >
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div 
                className="min-h-32 p-4 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap break-all"
                data-testid="text-output"
              >
                {outputText || <span className="text-muted-foreground">Converted text will appear here...</span>}
              </div>
            </div>
          </Card>

          <div className="space-y-12">
            <HowItWorks title="How It Works" steps={howItWorksSteps} />
            <Features title="Features" features={features} />
            <FAQSection title="Frequently Asked Questions" faqs={faqItems} />
          </div>
        </div>
      </div>
    </>
  );
}
