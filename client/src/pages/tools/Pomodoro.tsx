import { useState, useEffect } from "react";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import FAQ from "@/components/FAQ";

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            if (!isBreak) {
              setIsBreak(true);
              setMinutes(5);
              console.log("Pomodoro complete! Starting break.");
            } else {
              setIsBreak(false);
              setMinutes(25);
              console.log("Break complete! Starting new pomodoro.");
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, isBreak]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  const faqItems = [
    {
      question: "What is the Pomodoro Technique?",
      answer: "The Pomodoro Technique is a time management method that uses 25-minute focused work sessions followed by 5-minute breaks to boost productivity.",
    },
    {
      question: "How do I use this timer?",
      answer: "Click Start to begin a 25-minute work session. When it ends, take a 5-minute break. After 4 pomodoros, take a longer 15-30 minute break.",
    },
    {
      question: "Can I customize the timer?",
      answer: "Pro users can customize work and break durations to fit their workflow. Upgrade to unlock this feature.",
    },
  ];

  return (
    <>
      <SEO
        title="Pomodoro Timer - TymFlo Hub"
        description="Stay focused with the Pomodoro technique. Free online Pomodoro timer to boost productivity."
        canonical="https://tymflohub.com/tools/pomodoro"
      />

      <div className="py-12 bg-background min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Pomodoro Timer</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Stay focused with the Pomodoro technique. Work in 25-minute intervals with short breaks to boost your productivity.
            </p>
          </div>

          <Card className="p-12">
            <div className="text-center mb-8">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {isBreak ? "Break Time" : "Focus Time"}
              </div>
              <div className="text-8xl font-mono font-bold mb-8" data-testid="text-timer">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                onClick={toggleTimer}
                className="w-32"
                data-testid="button-toggle-timer"
              >
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={resetTimer}
                className="w-32"
                data-testid="button-reset-timer"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </Card>

          <FAQ items={faqItems} />
        </div>
      </div>
    </>
  );
}
