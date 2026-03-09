import { useState, useEffect, useMemo } from "react";
import { Globe, Plus, X, Clock, Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection } from "@/components/SEOContent";

const popularTimezones = [
  { id: "America/New_York", label: "New York", abbr: "EST", country: "USA" },
  { id: "America/Los_Angeles", label: "Los Angeles", abbr: "PST", country: "USA" },
  { id: "America/Chicago", label: "Chicago", abbr: "CST", country: "USA" },
  { id: "America/Denver", label: "Denver", abbr: "MST", country: "USA" },
  { id: "Europe/London", label: "London", abbr: "GMT", country: "UK" },
  { id: "Europe/Paris", label: "Paris", abbr: "CET", country: "France" },
  { id: "Europe/Berlin", label: "Berlin", abbr: "CET", country: "Germany" },
  { id: "Asia/Tokyo", label: "Tokyo", abbr: "JST", country: "Japan" },
  { id: "Asia/Shanghai", label: "Shanghai", abbr: "CST", country: "China" },
  { id: "Asia/Hong_Kong", label: "Hong Kong", abbr: "HKT", country: "Hong Kong" },
  { id: "Asia/Singapore", label: "Singapore", abbr: "SGT", country: "Singapore" },
  { id: "Asia/Dubai", label: "Dubai", abbr: "GST", country: "UAE" },
  { id: "Asia/Kolkata", label: "Mumbai", abbr: "IST", country: "India" },
  { id: "Australia/Sydney", label: "Sydney", abbr: "AEDT", country: "Australia" },
  { id: "Pacific/Auckland", label: "Auckland", abbr: "NZDT", country: "New Zealand" },
  { id: "America/Toronto", label: "Toronto", abbr: "EST", country: "Canada" },
  { id: "America/Sao_Paulo", label: "São Paulo", abbr: "BRT", country: "Brazil" },
  { id: "Africa/Cairo", label: "Cairo", abbr: "EET", country: "Egypt" },
  { id: "Europe/Moscow", label: "Moscow", abbr: "MSK", country: "Russia" },
  { id: "Asia/Seoul", label: "Seoul", abbr: "KST", country: "South Korea" },
];

interface TimezoneRow {
  id: string;
  timezone: string;
  label: string;
  isHome: boolean;
}

function formatHour12(hour: number): string {
  if (hour === 0) return "12am";
  if (hour === 12) return "12pm";
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

function formatTime12(hour: number, minute: number): string {
  const period = hour >= 12 ? "p" : "a";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${String(minute).padStart(2, "0")}${period}`;
}

function getHourOffset(baseTimezone: string, targetTimezone: string, baseDate: Date): number {
  try {
    const baseTime = new Date(baseDate.toLocaleString("en-US", { timeZone: baseTimezone }));
    const targetTime = new Date(baseDate.toLocaleString("en-US", { timeZone: targetTimezone }));
    return Math.round((targetTime.getTime() - baseTime.getTime()) / (1000 * 60 * 60));
  } catch {
    return 0;
  }
}

function getTimeInTimezone(date: Date, timezone: string): { hour: number; minute: number; dayName: string; monthDay: string } {
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    };
    const formatted = new Intl.DateTimeFormat("en-US", options).format(date);
    const [hourStr, minuteStr] = formatted.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    const dayName = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short" }).format(date);
    const monthDay = new Intl.DateTimeFormat("en-US", { timeZone: timezone, month: "short", day: "numeric" }).format(date);

    return { hour, minute, dayName, monthDay };
  } catch {
    return { hour: 0, minute: 0, dayName: "Mon", monthDay: "Jan 1" };
  }
}

function getHourStyle(hour: number, isSelected: boolean): string {
  const base = isSelected ? "ring-2 ring-primary ring-offset-1 z-10 " : "";
  // Night hours (dark blue)
  if (hour >= 0 && hour < 6) return base + "bg-blue-300 dark:bg-blue-800";
  // Morning (light blue transition)
  if (hour >= 6 && hour < 9) return base + "bg-blue-100 dark:bg-blue-700";
  // Working hours (white/light - highlight with orange underline)
  if (hour >= 9 && hour < 18) return base + "bg-white dark:bg-slate-600";
  // Evening (light blue transition)
  if (hour >= 18 && hour < 21) return base + "bg-blue-100 dark:bg-blue-700";
  // Night (dark blue)
  return base + "bg-blue-300 dark:bg-blue-800";
}

export default function Timezone() {
  const [rows, setRows] = useState<TimezoneRow[]>([
    { id: "1", timezone: "America/New_York", label: "New York", isHome: true },
    { id: "2", timezone: "Europe/London", label: "London", isHome: false },
    { id: "3", timezone: "Asia/Tokyo", label: "Tokyo", isHome: false },
  ]);

  const [selectedHour, setSelectedHour] = useState<number>(new Date().getHours());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const homeTimezone = rows.find(r => r.isHome)?.timezone || rows[0]?.timezone || "America/New_York";

  const handleHourClick = (hour: number) => {
    setSelectedHour(hour);
  };

  const addRow = (timezoneId: string) => {
    const tz = popularTimezones.find((t) => t.id === timezoneId);
    if (tz && !rows.find((r) => r.timezone === timezoneId)) {
      setRows([
        ...rows,
        { id: Date.now().toString(), timezone: tz.id, label: tz.label, isHome: false },
      ]);
    }
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      const rowToRemove = rows.find(r => r.id === id);
      const newRows = rows.filter((r) => r.id !== id);
      if (rowToRemove?.isHome && newRows.length > 0) {
        newRows[0].isHome = true;
      }
      setRows(newRows);
    }
  };

  const setAsHome = (id: string) => {
    setRows(rows.map(r => ({ ...r, isHome: r.id === id })));
  };

  const availableTimezones = useMemo(() => {
    return popularTimezones.filter((tz) => !rows.find((r) => r.timezone === tz.id));
  }, [rows]);

  const howItWorksSteps = [
    { step: 1, title: "Add Cities", description: "Select cities from the dropdown to compare their times." },
    { step: 2, title: "Click Any Hour", description: "Click on an hour in any row to see that time across all zones." },
    { step: 3, title: "Find Overlap", description: "White hours are typical work hours - find when everyone is available." },
  ];

  const features = [
    { icon: <Globe className="w-6 h-6" />, title: "20+ Cities", description: "Popular cities from every continent for global teams." },
    { icon: <Clock className="w-6 h-6" />, title: "Visual Timeline", description: "See the full day at a glance with color-coded hours." },
    { icon: <Home className="w-6 h-6" />, title: "Home Timezone", description: "Set your home city as the reference point." },
  ];

  const faqItems = [
    { question: "How do I find the best meeting time?", answer: "Look for white hours (9am-6pm) that align across all timezones. These represent typical working hours." },
    { question: "What do the colors mean?", answer: "White = work hours (9am-6pm), light blue = early morning/evening, dark blue = night hours." },
    { question: "How do I change my home timezone?", answer: "Click the home icon next to any city to set it as your reference timezone." },
  ];

  return (
    <>
      <SEO
        title="World Time Converter - Compare Times Across Timezones | TymFlo Hub"
        description="Free online timezone converter. Compare times across multiple cities, find the best meeting times for global teams."
        canonical="https://tymflohub.com/tools/timezone"
        keywords="timezone converter, world clock, time zone comparison, meeting planner"
      />

      <div className="py-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">World Time Converter</h1>
            </div>
            <p className="text-muted-foreground">
              Click any hour to compare times across cities
            </p>
          </div>

          <Card className="p-4 mb-8">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b">
              {availableTimezones.length > 0 && (
                <Select onValueChange={addRow}>
                  <SelectTrigger className="w-52" data-testid="select-add-timezone">
                    <Plus className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Add city or timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimezones.map((tz) => (
                      <SelectItem key={tz.id} value={tz.id}>
                        {tz.label}, {tz.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
                data-testid="input-date"
              />

              <div className="ml-auto text-sm text-muted-foreground">
                Selected: <span className="font-semibold">{formatHour12(selectedHour)}</span> in {rows.find(r => r.isHome)?.label || "New York"}
              </div>
            </div>

            {/* Timezone Rows */}
            <div className="space-y-3">
              {rows.map((row) => {
                const offset = getHourOffset(homeTimezone, row.timezone, new Date(selectedDate));
                const baseDate = new Date(selectedDate);
                baseDate.setHours(selectedHour, 0, 0, 0);
                const timeData = getTimeInTimezone(baseDate, row.timezone);
                const tzInfo = popularTimezones.find(t => t.id === row.timezone);

                return (
                  <div
                    key={row.id}
                    className="group"
                    data-testid={`timezone-row-${row.timezone}`}
                  >
                    {/* City info row */}
                    <div className="flex items-center gap-2 mb-1">
                      {rows.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeRow(row.id)}
                          data-testid={`button-remove-${row.timezone}`}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                      {rows.length <= 1 && <div className="w-5" />}
                      
                      <span className="w-8 text-xs text-muted-foreground font-mono text-center">
                        {offset === 0 ? "" : offset > 0 ? `+${offset}` : offset}
                      </span>

                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-5 w-5 ${row.isHome ? "text-primary" : "text-muted-foreground/30 hover:text-muted-foreground"}`}
                        onClick={() => setAsHome(row.id)}
                        title="Set as home timezone"
                        data-testid={`button-home-${row.timezone}`}
                      >
                        <Home className="w-3 h-3" />
                      </Button>

                      <span className="font-semibold">{row.label}</span>
                      <span className="text-xs text-muted-foreground">{tzInfo?.abbr}</span>

                      <span className="text-lg font-bold font-mono ml-2" data-testid={`text-time-${row.timezone}`}>
                        {formatTime12(timeData.hour, timeData.minute)}
                      </span>

                      <span className="text-xs text-muted-foreground ml-2">
                        {timeData.dayName}, {timeData.monthDay}
                      </span>
                    </div>

                    {/* Hour timeline - single row, no scrolling */}
                    <div className="flex ml-[72px]">
                      {Array.from({ length: 24 }, (_, i) => {
                        const actualHour = (i + offset + 24) % 24;
                        const isSelected = i === selectedHour;
                        const isWorkHour = actualHour >= 9 && actualHour < 18;
                        
                        return (
                          <button
                            key={i}
                            onClick={() => handleHourClick(i)}
                            className={`
                              flex-1 h-8 flex flex-col items-center justify-center text-[10px] font-mono
                              border-t border-b first:border-l first:rounded-l last:border-r last:rounded-r
                              border-slate-200 dark:border-slate-600
                              transition-all cursor-pointer hover:brightness-95
                              ${getHourStyle(actualHour, isSelected)}
                              ${isWorkHour ? "border-b-2 border-b-orange-300" : ""}
                            `}
                            title={`${formatHour12(actualHour)} in ${row.label}`}
                            data-testid={`hour-${row.timezone}-${i}`}
                          >
                            <span>{actualHour === 0 || actualHour === 12 ? 12 : actualHour % 12}</span>
                            <span className="text-[8px] opacity-60">{actualHour < 12 ? "am" : "pm"}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-white dark:bg-slate-600 border border-b-2 border-b-orange-300" />
                <span>Work hours (9am-6pm)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-700 border" />
                <span>Early/Late</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-blue-300 dark:bg-blue-800 border" />
                <span>Night</span>
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
