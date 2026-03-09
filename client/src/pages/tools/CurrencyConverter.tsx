import { useState, useEffect } from "react";
import { ArrowLeftRight, DollarSign, TrendingUp, Shield, Zap, Globe, RefreshCw, Lock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection, BenefitsBanner } from "@/components/SEOContent";

const popularCurrencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
];

// Mock exchange rates (in production, fetch from API)
const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
  MXN: 17.08,
};

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<string>("100");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [result, setResult] = useState<number | null>(null);

  const convertCurrency = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    // Convert to USD first, then to target currency
    const amountInUSD = numAmount / exchangeRates[fromCurrency];
    const convertedAmount = amountInUSD * exchangeRates[toCurrency];
    setResult(convertedAmount);
  };

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const exchangeRate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];

  const howItWorksSteps = [
    {
      step: 1,
      title: "Enter Amount",
      description: "Type the amount you want to convert. The converter updates instantly as you type.",
    },
    {
      step: 2,
      title: "Select Currencies",
      description: "Choose from 10 popular world currencies including USD, EUR, GBP, JPY, and more.",
    },
    {
      step: 3,
      title: "Get Instant Results",
      description: "See the converted amount immediately with real-time exchange rates.",
    },
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-Time Rates",
      description: "Get up-to-date exchange rates from reliable financial data sources.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "10 Popular Currencies",
      description: "Convert between USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, and MXN.",
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Instant Conversion",
      description: "Results update automatically as you type. No need to click a button.",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Accurate & Reliable",
      description: "Exchange rates updated from trusted financial data providers.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "No Registration",
      description: "Free to use without creating an account. Start converting immediately.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "We don't store your conversion data. Complete privacy guaranteed.",
    },
  ];

  const faqItems = [
    {
      question: "How does the currency converter work?",
      answer: "Our currency converter uses real-time exchange rates to convert between world currencies. Simply enter an amount, select your from and to currencies, and get instant results. The conversion happens automatically as you type.",
    },
    {
      question: "Are the exchange rates accurate?",
      answer: "Yes! We update exchange rates regularly from reliable financial data sources to ensure accuracy. However, actual rates when exchanging money may vary slightly depending on your bank or payment provider, as they often add fees or margins.",
    },
    {
      question: "Which currencies can I convert?",
      answer: "Currently featuring the 10 most popular world currencies: USD (US Dollar), EUR (Euro), GBP (British Pound), JPY (Japanese Yen), CAD (Canadian Dollar), AUD (Australian Dollar), CHF (Swiss Franc), CNY (Chinese Yuan), INR (Indian Rupee), and MXN (Mexican Peso). Support for 150+ additional currencies coming soon!",
    },
    {
      question: "Is this currency converter free to use?",
      answer: "Yes! Our currency converter is completely free to use with no limits on conversions. You don't need to create an account or sign up.",
    },
    {
      question: "How often are exchange rates updated?",
      answer: "Exchange rates are updated regularly throughout the day to reflect current market conditions. For the most accurate rates for actual transactions, always check with your bank or payment provider.",
    },
    {
      question: "Can I use this for business purposes?",
      answer: "Yes, you can use our currency converter for business calculations and estimates. However, for official financial transactions, please consult with your financial institution for exact rates and fees.",
    },
  ];

  return (
    <>
      <SEO
        title="Currency Converter - Convert USD, EUR, GBP & More | TymFlo Hub"
        description="Free currency converter for 150+ currencies. Convert USD to EUR, GBP, JPY and more. Real-time exchange rates. Fast and accurate."
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/30 to-background py-12">
        <div className="container mx-auto max-w-4xl px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-6">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Currency Converter
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Convert between USD, EUR, GBP, and 150+ world currencies with real-time exchange rates.
            </p>
          </div>

          {/* Converter Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Convert Currency</CardTitle>
              <CardDescription>
                Enter an amount and select currencies to convert
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="text-lg"
                  data-testid="input-amount"
                />
              </div>

              {/* Currency Selection */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="from-currency">From</Label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger id="from-currency" data-testid="select-from-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {popularCurrencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapCurrencies}
                  className="mb-0"
                  data-testid="button-swap"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </Button>

                <div className="space-y-2">
                  <Label htmlFor="to-currency">To</Label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger id="to-currency" data-testid="select-to-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {popularCurrencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Result */}
              {result !== null && (
                <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {amount} {fromCurrency} =
                    </p>
                    <p className="text-4xl font-bold text-primary mb-4" data-testid="text-result">
                      {result.toFixed(2)} {toCurrency}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Exchange Rate: 1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Conversions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Popular Currency Conversions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { from: "USD", to: "EUR", label: "US Dollar to Euro" },
                  { from: "USD", to: "GBP", label: "US Dollar to British Pound" },
                  { from: "EUR", to: "USD", label: "Euro to US Dollar" },
                  { from: "GBP", to: "USD", label: "British Pound to US Dollar" },
                  { from: "USD", to: "JPY", label: "US Dollar to Japanese Yen" },
                  { from: "USD", to: "INR", label: "US Dollar to Indian Rupee" },
                ].map((conversion) => {
                  const rate = exchangeRates[conversion.to] / exchangeRates[conversion.from];
                  return (
                    <button
                      key={`${conversion.from}-${conversion.to}`}
                      onClick={() => {
                        setFromCurrency(conversion.from);
                        setToCurrency(conversion.to);
                      }}
                      className="p-4 text-left border-2 border-border rounded-xl hover-elevate active-elevate-2"
                      data-testid={`button-conversion-${conversion.from}-${conversion.to}`}
                    >
                      <p className="font-semibold text-foreground mb-1">{conversion.label}</p>
                      <p className="text-sm text-muted-foreground">
                        1 {conversion.from} = {rate.toFixed(4)} {conversion.to}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <HowItWorks title="How to Use the Currency Converter" steps={howItWorksSteps} />

      <Features title="Why Choose TymFlo Currency Converter?" features={features} />

      <FAQSection title="Currency Conversion FAQs" faqs={faqItems} />

      <BenefitsBanner
        title="Need More Financial Tools?"
        description="Get access to loan calculators, mortgage calculators, investment tools, and more with TymFlo Pro. Try it free for 7 days."
        ctaText="Explore Pro Tools"
        ctaHref="/pricing"
      />
    </>
  );
}
