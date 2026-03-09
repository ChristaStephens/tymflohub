import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAnalytics } from "@/hooks/useAnalytics";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCoffeeButton from "@/components/FloatingCoffeeButton";
import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import ProfitMargin from "@/pages/tools/ProfitMargin";
import Markup from "@/pages/tools/Markup";
import Breakeven from "@/pages/tools/Breakeven";
import ROI from "@/pages/tools/ROI";
import PDFMerge from "@/pages/tools/PDFMerge";
import PDFSplit from "@/pages/tools/PDFSplit";
import PDFCompress from "@/pages/tools/PDFCompress";
import ImageConvert from "@/pages/tools/ImageConvert";
import Timezone from "@/pages/tools/Timezone";
import Pomodoro from "@/pages/tools/Pomodoro";
import CurrencyConverter from "@/pages/tools/CurrencyConverter";
import UnitConverter from "@/pages/tools/UnitConverter";
import PDFRotate from "@/pages/tools/PDFRotate";
import PDFDeletePages from "@/pages/tools/PDFDeletePages";
import PDFExtract from "@/pages/tools/PDFExtract";
import PDFToWord from "@/pages/tools/PDFToWord";
import PDFToExcel from "@/pages/tools/PDFToExcel";
import PDFToJPG from "@/pages/tools/PDFToJPG";
import PDFSign from "@/pages/tools/PDFSign";
import WordToPDF from "@/pages/tools/WordToPDF";
import ExcelToPDF from "@/pages/tools/ExcelToPDF";
import JPGToPDF from "@/pages/tools/JPGToPDF";
import LoanCalculator from "@/pages/tools/LoanCalculator";
import MortgageCalculator from "@/pages/tools/MortgageCalculator";
import InvestmentCalculator from "@/pages/tools/InvestmentCalculator";
import CompoundInterest from "@/pages/tools/CompoundInterest";
import MeanMedianMode from "@/pages/tools/MeanMedianMode";
import StandardDeviation from "@/pages/tools/StandardDeviation";
import PercentageCalculator from "@/pages/tools/PercentageCalculator";
import RatioCalculator from "@/pages/tools/RatioCalculator";
import TextCaseConverter from "@/pages/tools/TextCaseConverter";
import WordCounter from "@/pages/tools/WordCounter";
import TextFormatter from "@/pages/tools/TextFormatter";
import ColorPicker from "@/pages/tools/ColorPicker";
import PaletteGenerator from "@/pages/tools/PaletteGenerator";
import QRCodeGenerator from "@/pages/tools/QRCodeGenerator";
import WiFiQRCode from "@/pages/tools/WiFiQRCode";
import VCardQRCode from "@/pages/tools/VCardQRCode";
import BusinessPageQR from "@/pages/tools/BusinessPageQR";
import MenuQR from "@/pages/tools/MenuQR";
import AppLinkQR from "@/pages/tools/AppLinkQR";
import PresenceAudit from "@/pages/tools/PresenceAudit";
import AdminAnalytics from "@/pages/AdminAnalytics";
import NotFound from "@/pages/not-found";

function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  useAnalytics();
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      
      {/* Business Calculators */}
      <Route path="/tools/profit-margin" component={ProfitMargin} />
      <Route path="/tools/markup" component={Markup} />
      <Route path="/tools/breakeven" component={Breakeven} />
      <Route path="/tools/roi" component={ROI} />
      <Route path="/tools/loan-calculator" component={LoanCalculator} />
      <Route path="/tools/mortgage-calculator" component={MortgageCalculator} />
      <Route path="/tools/investment-calculator" component={InvestmentCalculator} />
      <Route path="/tools/compound-interest" component={CompoundInterest} />
      
      {/* PDF Tools - Organize */}
      <Route path="/tools/pdf-merge" component={PDFMerge} />
      <Route path="/tools/pdf-split" component={PDFSplit} />
      <Route path="/tools/pdf-compress" component={PDFCompress} />
      <Route path="/tools/pdf-rotate" component={PDFRotate} />
      <Route path="/tools/pdf-delete-pages" component={PDFDeletePages} />
      <Route path="/tools/pdf-extract" component={PDFExtract} />
      
      {/* PDF Tools - Convert from PDF */}
      <Route path="/tools/pdf-to-word" component={PDFToWord} />
      <Route path="/tools/pdf-to-excel" component={PDFToExcel} />
      <Route path="/tools/pdf-to-jpg" component={PDFToJPG} />
      <Route path="/tools/pdf-sign" component={PDFSign} />
      
      {/* PDF Tools - Convert to PDF */}
      <Route path="/tools/word-to-pdf" component={WordToPDF} />
      <Route path="/tools/excel-to-pdf" component={ExcelToPDF} />
      <Route path="/tools/jpg-to-pdf" component={JPGToPDF} />
      
      {/* Image & File Tools */}
      <Route path="/tools/image-convert" component={ImageConvert} />
      
      {/* Statistics */}
      <Route path="/tools/mean-median-mode" component={MeanMedianMode} />
      <Route path="/tools/standard-deviation" component={StandardDeviation} />
      <Route path="/tools/percentage" component={PercentageCalculator} />
      <Route path="/tools/ratio" component={RatioCalculator} />
      
      {/* Converters */}
      <Route path="/tools/currency-converter" component={CurrencyConverter} />
      <Route path="/tools/unit-converter" component={UnitConverter} />
      <Route path="/tools/timezone" component={Timezone} />
      
      {/* Productivity */}
      <Route path="/tools/pomodoro" component={Pomodoro} />
      
      {/* Text Tools */}
      <Route path="/tools/text-case" component={TextCaseConverter} />
      <Route path="/tools/word-counter" component={WordCounter} />
      <Route path="/tools/text-formatter" component={TextFormatter} />
      
      {/* Design Tools */}
      <Route path="/tools/color-picker" component={ColorPicker} />
      <Route path="/tools/palette-generator" component={PaletteGenerator} />
      <Route path="/tools/qr-code" component={QRCodeGenerator} />
      <Route path="/tools/wifi-qr" component={WiFiQRCode} />
      <Route path="/tools/vcard-qr" component={VCardQRCode} />
      <Route path="/tools/business-qr" component={BusinessPageQR} />
      <Route path="/tools/menu-qr" component={MenuQR} />
      <Route path="/tools/app-qr" component={AppLinkQR} />
      
      {/* Marketing Tools */}
      <Route path="/tools/presence-audit" component={PresenceAudit} />
      
      {/* Admin */}
      <Route path="/admin/analytics" component={AdminAnalytics} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnalyticsWrapper>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <FloatingCoffeeButton />
          <Toaster />
        </AnalyticsWrapper>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
