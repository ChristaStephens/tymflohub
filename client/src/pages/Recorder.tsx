import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import {
  Monitor, Camera, Layers, Mic, MicOff, Play, Pause, Square,
  Download, Trash2, Plus, ChevronUp, ChevronDown, FileText, Video,
  Circle, CheckCircle, ClipboardCopy, RotateCcw, Scissors, Info,
  GripVertical, Image, PenLine,
} from "lucide-react";

type RecordMode = "screen" | "camera" | "screen+camera";
type RecordState = "idle" | "recording" | "paused" | "done";
type Tab = "recorder" | "process";

interface ProcessStep {
  id: string;
  screenshot: string;
  title: string;
  description: string;
}

export default function Recorder() {
  const [activeTab, setActiveTab] = useState<Tab>("recorder");

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Screen Recorder & Process Capture - TymFlo Hub"
        description="Record your screen, webcam, or both. Capture step-by-step process guides — all free, no install needed."
      />
      <div className="bg-gradient-to-br from-[#463176] to-[#6b4fa8] text-white py-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 mb-4">
            <Video className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Screen Recorder</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Record your screen, camera, or both. Build step-by-step guides. Free, no install.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-1 bg-white border rounded-xl p-1 mb-8 w-fit">
          {([["recorder", Video, "Screen Recorder"], ["process", FileText, "Process Guide"]] as const).map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              data-testid={`tab-${id}`}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id ? "bg-[#463176] text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === "recorder" ? <ScreenRecorderTab /> : <ProcessGuideTab />}
      </div>
    </div>
  );
}

// ─── Screen Recorder ────────────────────────────────────────────────────────

function ScreenRecorderTab() {
  const { toast } = useToast();
  const [mode, setMode] = useState<RecordMode>("screen");
  const [micEnabled, setMicEnabled] = useState(true);
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [recordingName, setRecordingName] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isTrimming, setIsTrimming] = useState(false);
  const [showTrimmer, setShowTrimmer] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const camStreamRef = useRef<MediaStream | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<number | null>(null);
  const screenVidRef = useRef<HTMLVideoElement | null>(null);
  const camVidRef = useRef<HTMLVideoElement | null>(null);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(Math.floor(s % 60)).padStart(2,"0")}`;

  // Attach live stream to preview video via useEffect
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  useEffect(() => {
    const video = previewRef.current;
    if (!video) return;
    if (liveStream) {
      video.srcObject = liveStream;
      video.muted = true;
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [liveStream]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    camStreamRef.current?.getTracks().forEach(t => t.stop());
    liveStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
    camStreamRef.current = null;
    liveStreamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  };

  const waitForVideoReady = (video: HTMLVideoElement): Promise<void> =>
    new Promise(resolve => {
      if (video.readyState >= 2) return resolve();
      video.addEventListener("loadeddata", () => resolve(), { once: true });
      setTimeout(resolve, 2000); // fallback
    });

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      const audioConstraints = micEnabled ? { echoCancellation: true, noiseSuppression: true } : false;
      let recordStream: MediaStream;

      if (mode === "screen") {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
        screenStreamRef.current = screen;

        if (micEnabled) {
          try {
            const mic = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false });
            const actx = new AudioContext();
            const dest = actx.createMediaStreamDestination();
            if (screen.getAudioTracks().length) actx.createMediaStreamSource(screen).connect(dest);
            actx.createMediaStreamSource(mic).connect(dest);
            recordStream = new MediaStream([...screen.getVideoTracks(), ...dest.stream.getTracks()]);
          } catch {
            recordStream = screen;
          }
        } else {
          recordStream = screen;
        }

        // Attach screen stream directly for preview
        setLiveStream(recordStream);

        screen.getVideoTracks()[0]?.addEventListener("ended", () => {
          if (mediaRecorderRef.current?.state !== "inactive") doStop();
        });

      } else if (mode === "camera") {
        const cam = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, frameRate: 30 },
          audio: audioConstraints,
        });
        camStreamRef.current = cam;
        recordStream = cam;
        setLiveStream(cam);

      } else {
        // Screen + Camera PiP via canvas
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
        const cam = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
          audio: audioConstraints,
        });
        screenStreamRef.current = screen;
        camStreamRef.current = cam;

        // Set up hidden video elements
        const screenVid = document.createElement("video");
        screenVid.srcObject = screen;
        screenVid.muted = true;
        screenVid.autoplay = true;
        screenVid.playsInline = true;
        screenVidRef.current = screenVid;

        const camVid = document.createElement("video");
        camVid.srcObject = cam;
        camVid.muted = true;
        camVid.autoplay = true;
        camVid.playsInline = true;
        camVidRef.current = camVid;

        await Promise.all([screenVid.play(), camVid.play()]);
        await Promise.all([waitForVideoReady(screenVid), waitForVideoReady(camVid)]);

        const canvas = document.createElement("canvas");
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext("2d")!;

        // Draw initial frame so canvas isn't blank
        ctx.drawImage(screenVid, 0, 0, 1280, 720);

        // Draw cam PiP in bottom-right circle
        const pipW = 220, pipH = 220, pipM = 20;
        const drawFrame = () => {
          ctx.drawImage(screenVid, 0, 0, 1280, 720);
          ctx.save();
          ctx.beginPath();
          ctx.arc(1280 - pipW / 2 - pipM, 720 - pipH / 2 - pipM, pipW / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(camVid, 1280 - pipW - pipM, 720 - pipH - pipM, pipW, pipH);
          ctx.restore();
          // Border ring on cam circle
          ctx.beginPath();
          ctx.arc(1280 - pipW / 2 - pipM, 720 - pipH / 2 - pipM, pipW / 2 + 2, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,255,255,0.8)";
          ctx.lineWidth = 3;
          ctx.stroke();
          animRef.current = requestAnimationFrame(drawFrame);
        };
        drawFrame();

        // Build audio mix
        const audioTracks: MediaStreamTrack[] = [];
        try {
          const actx = new AudioContext();
          const dest = actx.createMediaStreamDestination();
          if (screen.getAudioTracks().length) actx.createMediaStreamSource(screen).connect(dest);
          if (cam.getAudioTracks().length) actx.createMediaStreamSource(cam).connect(dest);
          audioTracks.push(...dest.stream.getTracks());
        } catch { /* audio mixing failed, skip */ }

        const canvasStream = canvas.captureStream(30);
        recordStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);
        liveStreamRef.current = recordStream;
        setLiveStream(recordStream);

        screen.getVideoTracks()[0]?.addEventListener("ended", () => {
          if (mediaRecorderRef.current?.state !== "inactive") doStop();
        });
      }

      const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
        .find(m => MediaRecorder.isTypeSupported(m)) ?? "video/webm";

      const recorder = new MediaRecorder(recordStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setTrimStart(0);
        setTrimEnd(0);
        setShowTrimmer(false);
        setLiveStream(null);
        cleanup();
        setRecordState("done");
      };

      recorder.start(100);
      setRecordState("recording");
      setElapsed(0);
      setVideoUrl(null);
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (!msg.toLowerCase().includes("denied") && !msg.toLowerCase().includes("cancel")) {
        toast({ title: "Recording failed", description: msg, variant: "destructive" });
      }
    }
  };

  const doStop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current?.stop();
  }, []);

  const pauseRecording = () => {
    mediaRecorderRef.current?.pause();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordState("paused");
  };

  const resumeRecording = () => {
    mediaRecorderRef.current?.resume();
    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    setRecordState("recording");
  };

  const downloadFull = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `${recordingName || "tymflo-recording"}-${new Date().toISOString().slice(0,10)}.webm`;
    a.click();
    toast({ title: "Downloading", description: "Your recording is saving." });
  };

  const downloadTrimmed = async () => {
    if (!videoUrl || !playbackRef.current) return;
    setIsTrimming(true);
    try {
      const video = playbackRef.current;
      video.currentTime = trimStart;
      await new Promise<void>(r => video.addEventListener("seeked", () => r(), { once: true }));

      const stream = (video as HTMLVideoElement & { captureStream: () => MediaStream }).captureStream();
      const chunks: Blob[] = [];
      const mimeType = ["video/webm;codecs=vp9,opus", "video/webm"].find(m => MediaRecorder.isTypeSupported(m)) ?? "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${recordingName || "tymflo-trimmed"}-trimmed.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsTrimming(false);
        toast({ title: "Trimmed download ready!" });
      };

      recorder.start(100);
      video.play();

      const checkEnd = setInterval(() => {
        if (video.currentTime >= trimEnd - 0.05) {
          video.pause();
          recorder.stop();
          clearInterval(checkEnd);
        }
      }, 50);
    } catch (e) {
      setIsTrimming(false);
      toast({ title: "Trim failed", description: "Try downloading the full recording instead.", variant: "destructive" });
    }
  };

  const reset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setRecordState("idle");
    setElapsed(0);
    setRecordingName("");
    setShowTrimmer(false);
    cleanup();
  };

  const modes = [
    { id: "screen" as RecordMode, label: "Screen Only", Icon: Monitor, desc: "Record your full screen or a browser tab" },
    { id: "camera" as RecordMode, label: "Camera Only", Icon: Camera, desc: "Record from your webcam" },
    { id: "screen+camera" as RecordMode, label: "Screen + Camera", Icon: Layers, desc: "Screen with webcam in picture-in-picture" },
  ];

  return (
    <div className="space-y-6">
      {recordState === "idle" && (
        <>
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Recording Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {modes.map(({ id, label, Icon, desc }) => (
                <button
                  key={id}
                  data-testid={`mode-${id}`}
                  onClick={() => setMode(id)}
                  className={`relative flex flex-col gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    mode === id ? "border-[#463176] bg-[#463176]/5" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {mode === id && (
                    <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-[#463176]" />
                  )}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mode === id ? "bg-[#463176] text-white" : "bg-gray-100 text-gray-500"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{label}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Audio</h2>
            <button
              data-testid="toggle-mic"
              onClick={() => setMicEnabled(!micEnabled)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                micEnabled ? "border-[#463176] bg-[#463176]/5 text-[#463176]" : "border-gray-200 text-gray-500"
              }`}
            >
              {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              Microphone {micEnabled ? "On" : "Off"}
            </button>
            <p className="text-xs text-gray-400 mt-2">Your browser will ask for permission when recording starts.</p>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              size="lg"
              data-testid="button-start-recording"
              onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white gap-2 px-10 text-base"
            >
              <Circle className="w-4 h-4 fill-white" />
              Start Recording
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            <strong>Note:</strong> For Screen + Camera, your browser will ask you to pick a screen/tab, then your webcam. The webcam appears as a round overlay in the bottom-right corner.
          </div>
        </>
      )}

      {(recordState === "recording" || recordState === "paused") && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="bg-gray-950 relative aspect-video flex items-center justify-center">
            <video
              ref={previewRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
              data-testid="video-preview"
            />
            {recordState === "paused" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-xl font-semibold">Paused</div>
              </div>
            )}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${recordState === "recording" ? "bg-red-500 animate-pulse" : "bg-yellow-400"}`} />
              <span className="bg-black/70 text-white text-sm font-mono px-2 py-0.5 rounded">{fmt(elapsed)}</span>
            </div>
          </div>
          <div className="p-4 flex items-center justify-center gap-3 bg-gray-50">
            {recordState === "recording" ? (
              <Button variant="outline" onClick={pauseRecording} data-testid="button-pause" className="gap-2">
                <Pause className="w-4 h-4" /> Pause
              </Button>
            ) : (
              <Button variant="outline" onClick={resumeRecording} data-testid="button-resume" className="gap-2">
                <Play className="w-4 h-4" /> Resume
              </Button>
            )}
            <Button onClick={doStop} data-testid="button-stop" className="bg-red-500 hover:bg-red-600 text-white gap-2">
              <Square className="w-4 h-4 fill-white" /> Stop
            </Button>
          </div>
        </div>
      )}

      {recordState === "done" && videoUrl && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="bg-gray-950 aspect-video">
              <video
                ref={playbackRef}
                src={videoUrl}
                controls
                className="w-full h-full object-contain"
                data-testid="video-playback"
                onLoadedMetadata={e => {
                  const dur = (e.target as HTMLVideoElement).duration;
                  if (isFinite(dur)) {
                    setVideoDuration(dur);
                    setTrimEnd(dur);
                  }
                }}
              />
            </div>

            <div className="p-5 space-y-5">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Recording name</label>
                <Input
                  placeholder="my-screen-recording"
                  value={recordingName}
                  onChange={e => setRecordingName(e.target.value)}
                  data-testid="input-recording-name"
                  className="max-w-sm"
                />
              </div>

              {/* Trim section */}
              <div className="border rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowTrimmer(!showTrimmer)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  data-testid="button-toggle-trimmer"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Scissors className="w-4 h-4 text-[#463176]" />
                    Trim Recording
                  </div>
                  <span className="text-xs text-gray-400">{showTrimmer ? "Hide" : "Show"}</span>
                </button>

                {showTrimmer && videoDuration > 0 && (
                  <div className="px-5 pb-5 border-t space-y-4 pt-4">
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>Total: <strong>{fmt(videoDuration)}</strong></span>
                      <span>Trimmed: <strong>{fmt(trimEnd - trimStart)}</strong></span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-medium text-gray-500 w-14 shrink-0">Start</label>
                        <input
                          type="range"
                          min={0}
                          max={videoDuration}
                          step={0.1}
                          value={trimStart}
                          onChange={e => {
                            const v = parseFloat(e.target.value);
                            if (v < trimEnd - 0.5) {
                              setTrimStart(v);
                              if (playbackRef.current) playbackRef.current.currentTime = v;
                            }
                          }}
                          className="flex-1 accent-[#463176]"
                          data-testid="slider-trim-start"
                        />
                        <span className="text-xs font-mono text-gray-600 w-10 text-right">{fmt(trimStart)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-medium text-gray-500 w-14 shrink-0">End</label>
                        <input
                          type="range"
                          min={0}
                          max={videoDuration}
                          step={0.1}
                          value={trimEnd}
                          onChange={e => {
                            const v = parseFloat(e.target.value);
                            if (v > trimStart + 0.5) setTrimEnd(v);
                          }}
                          className="flex-1 accent-[#463176]"
                          data-testid="slider-trim-end"
                        />
                        <span className="text-xs font-mono text-gray-600 w-10 text-right">{fmt(trimEnd)}</span>
                      </div>
                    </div>

                    <Button
                      onClick={downloadTrimmed}
                      disabled={isTrimming}
                      data-testid="button-download-trimmed"
                      className="gap-2 bg-[#463176] hover:bg-[#5a3f91]"
                    >
                      <Download className="w-4 h-4" />
                      {isTrimming ? "Exporting trimmed…" : `Download Trimmed (${fmt(trimEnd - trimStart)})`}
                    </Button>
                    <p className="text-xs text-gray-400">Plays the trimmed section in real-time to create the clip.</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <Button onClick={downloadFull} data-testid="button-download" className="gap-2 bg-[#463176] hover:bg-[#5a3f91]">
                  <Download className="w-4 h-4" /> Download Full (.webm)
                </Button>
                <Button variant="outline" onClick={reset} data-testid="button-new-recording" className="gap-2">
                  <RotateCcw className="w-4 h-4" /> New Recording
                </Button>
              </div>
              <p className="text-xs text-gray-400">Nothing is uploaded — recordings stay on your device.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Process Guide ───────────────────────────────────────────────────────────

function ProcessGuideTab() {
  const { toast } = useToast();
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [guideTitle, setGuideTitle] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const idRef = useRef(0);

  const capture = async () => {
    // 3-second countdown so user can switch to the right window
    setCountdown(3);
    await new Promise<void>(resolve => {
      let c = 3;
      const t = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) { clearInterval(t); resolve(); }
      }, 1000);
    });

    setCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];

      // Use ImageCapture if available, fall back to canvas+video
      let dataUrl: string;
      try {
        const IC = (window as unknown as { ImageCapture?: new (t: MediaStreamTrack) => { grabFrame(): Promise<ImageBitmap> } }).ImageCapture;
        if (IC) {
          const ic = new IC(track);
          const bitmap = await ic.grabFrame();
          track.stop();
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
          dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        } else {
          throw new Error("no ImageCapture");
        }
      } catch {
        // Fallback: draw first frame from video
        const video = document.createElement("video");
        video.srcObject = stream;
        video.muted = true;
        await video.play();
        await new Promise(r => setTimeout(r, 300));
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        canvas.getContext("2d")!.drawImage(video, 0, 0);
        dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        stream.getTracks().forEach(t => t.stop());
      }

      const id = String(++idRef.current);
      setSteps(prev => {
        const num = prev.length + 1;
        return [...prev, { id, screenshot: dataUrl, title: `Step ${num}`, description: "" }];
      });
      setExpandedStep(id);
      toast({ title: `Step captured`, description: "Add a title and description to describe this step." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.toLowerCase().includes("denied") && !msg.toLowerCase().includes("cancel")) {
        toast({ title: "Capture failed", description: "Could not take screenshot.", variant: "destructive" });
      }
    } finally {
      setCapturing(false);
      setCountdown(0);
    }
  };

  const update = (id: string, field: "title" | "description", val: string) =>
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));

  const remove = (id: string) => {
    setSteps(prev => {
      const next = prev.filter(s => s.id !== id);
      // Renumber titles that are still "Step N" defaults
      return next.map((s, i) => ({
        ...s,
        title: s.title.match(/^Step \d+$/) ? `Step ${i + 1}` : s.title,
      }));
    });
    if (expandedStep === id) setExpandedStep(null);
  };

  const move = (id: string, dir: "up" | "down") => {
    setSteps(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if ((dir === "up" && idx === 0) || (dir === "down" && idx === prev.length - 1)) return prev;
      const next = [...prev];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const exportHTML = () => {
    if (!steps.length) { toast({ title: "No steps yet", variant: "destructive" }); return; }
    const title = guideTitle || "Process Guide";
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8f9fa;margin:0;padding:0;color:#1a1a2e}
  .header{background:linear-gradient(135deg,#463176,#6b4fa8);color:#fff;padding:48px 24px;text-align:center}
  .header h1{margin:0 0 8px;font-size:2rem;font-weight:700}
  .header p{margin:0;opacity:.8;font-size:1rem}
  .content{max-width:800px;margin:0 auto;padding:40px 24px}
  .step{background:#fff;border-radius:12px;margin-bottom:24px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}
  .step-header{display:flex;align-items:center;gap:16px;padding:16px 24px;border-bottom:1px solid #f0f0f0}
  .step-num{width:36px;height:36px;border-radius:50%;background:#463176;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0}
  .step-title{font-weight:600;font-size:1rem;color:#1a1a2e}
  .step-img{width:100%;display:block;border-bottom:1px solid #f0f0f0}
  .step-desc{padding:16px 24px;font-size:.95rem;color:#4b5563;line-height:1.7}
  .footer{text-align:center;padding:32px;color:#9ca3af;font-size:.8rem}
  .footer a{color:#463176;text-decoration:none}
</style>
</head>
<body>
<div class="header">
  <h1>${title}</h1>
  <p>${steps.length} steps &middot; Created ${new Date().toLocaleDateString()} with TymFlo Hub</p>
</div>
<div class="content">
${steps.map((s, i) => `<div class="step">
  <div class="step-header"><div class="step-num">${i + 1}</div><div class="step-title">${s.title}</div></div>
  ${s.screenshot ? `<img class="step-img" src="${s.screenshot}" alt="${s.title}"/>` : ""}
  ${s.description ? `<div class="step-desc">${s.description.replace(/\n/g, "<br/>")}</div>` : ""}
</div>`).join("\n")}
</div>
<div class="footer">Created with <a href="https://christastephens.github.io/tymflohub/">TymFlo Hub</a></div>
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${guideTitle||"process-guide"}.html`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: "Open the .html file in any browser." });
  };

  const copyMarkdown = () => {
    if (!steps.length) { toast({ title: "No steps yet", variant: "destructive" }); return; }
    const md = `# ${guideTitle || "Process Guide"}\n\n${steps.map((s, i) =>
      `## Step ${i+1}: ${s.title}${s.description ? `\n\n${s.description}` : ""}`
    ).join("\n\n")}`;
    navigator.clipboard.writeText(md);
    toast({ title: "Copied!", description: "Markdown copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      {/* How it works banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>How it works:</strong> Click "Capture Step" — you'll get a 3-second countdown to switch to the window you want to document — then pick your screen/tab and a screenshot is taken automatically. Repeat for each step, then add titles and descriptions.
          <span className="block mt-1 text-amber-600 text-xs">
            Note: Auto-tracking of clicks and scrolls requires a browser extension (like Tango's Chrome extension). As a web app, we use manual screenshot capture instead.
          </span>
        </div>
      </div>

      {/* Guide title */}
      <div className="bg-white rounded-xl border p-6">
        <label className="text-sm font-semibold text-gray-700 block mb-2">Guide Title</label>
        <Input
          placeholder="e.g. How to set up a new client in HubSpot"
          value={guideTitle}
          onChange={e => setGuideTitle(e.target.value)}
          data-testid="input-guide-title"
          className="max-w-lg text-base"
        />
      </div>

      {/* Capture button */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Capture Steps</h2>
            <p className="text-xs text-gray-500 mt-0.5">Each click starts a 3-second countdown, then your browser asks which screen or tab to capture.</p>
          </div>
          {steps.length > 0 && (
            <Badge className="bg-[#463176]/10 text-[#463176] border-0 text-sm">
              {steps.length} {steps.length === 1 ? "step" : "steps"}
            </Badge>
          )}
        </div>

        {countdown > 0 ? (
          <div className="flex items-center justify-center h-20">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#463176] animate-pulse">{countdown}</div>
              <div className="text-sm text-gray-500 mt-1">Switch to your target window…</div>
            </div>
          </div>
        ) : (
          <Button
            onClick={capture}
            disabled={capturing}
            data-testid="button-capture-step"
            size="lg"
            className="gap-2 bg-[#463176] hover:bg-[#5a3f91]"
          >
            <Image className="w-4 h-4" />
            {capturing ? "Capturing…" : "Capture Step"}
          </Button>
        )}
      </div>

      {/* Steps list */}
      {steps.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 px-1">Steps</h2>

          {steps.map((step, idx) => {
            const isOpen = expandedStep === step.id;
            return (
              <div key={step.id} className="bg-white rounded-xl border overflow-hidden" data-testid={`step-card-${step.id}`}>
                {/* Step header — always visible */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedStep(isOpen ? null : step.id)}
                >
                  <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                  <div className="w-7 h-7 rounded-full bg-[#463176] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  {/* Thumbnail */}
                  {step.screenshot && (
                    <img src={step.screenshot} alt="" className="h-9 w-14 object-cover rounded border shrink-0" />
                  )}
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">{step.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={e => { e.stopPropagation(); move(step.id, "up"); }} disabled={idx === 0}
                      className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors" data-testid={`btn-up-${step.id}`}>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); move(step.id, "down"); }} disabled={idx === steps.length - 1}
                      className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors" data-testid={`btn-down-${step.id}`}>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); remove(step.id); }}
                      className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors" data-testid={`btn-delete-${step.id}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded edit area */}
                {isOpen && (
                  <div className="border-t">
                    {step.screenshot && (
                      <div className="bg-gray-950 max-h-80 overflow-hidden">
                        <img src={step.screenshot} alt={step.title} className="w-full object-contain max-h-80" />
                      </div>
                    )}
                    <div className="p-4 space-y-3 bg-gray-50">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1">
                          <PenLine className="w-3 h-3" /> Title
                        </label>
                        <Input
                          value={step.title}
                          onChange={e => update(step.id, "title", e.target.value)}
                          data-testid={`input-title-${step.id}`}
                          className="text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1">
                          <PenLine className="w-3 h-3" /> Description / Instruction
                        </label>
                        <Textarea
                          placeholder="Describe what to do in this step…"
                          value={step.description}
                          onChange={e => update(step.id, "description", e.target.value)}
                          data-testid={`textarea-desc-${step.id}`}
                          rows={2}
                          className="resize-none text-sm bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add another step */}
          <button
            onClick={capture}
            disabled={capturing || countdown > 0}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#463176] hover:text-[#463176] transition-colors flex items-center justify-center gap-2"
            data-testid="button-add-step"
          >
            <Plus className="w-4 h-4" />
            {countdown > 0 ? `Capturing in ${countdown}…` : "Add Another Step"}
          </button>

          {/* Export */}
          <div className="bg-white rounded-xl border p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Export Guide</h3>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={exportHTML} data-testid="button-export-html" className="gap-2 bg-[#463176] hover:bg-[#5a3f91]">
                <Download className="w-4 h-4" /> Export as HTML
              </Button>
              <Button variant="outline" onClick={copyMarkdown} data-testid="button-copy-md" className="gap-2">
                <ClipboardCopy className="w-4 h-4" /> Copy Markdown
              </Button>
              <Button
                variant="outline"
                onClick={() => { setSteps([]); setGuideTitle(""); setExpandedStep(null); }}
                data-testid="button-clear"
                className="gap-2 text-red-500 border-red-200 hover:bg-red-50 ml-auto"
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </Button>
            </div>
          </div>
        </div>
      )}

      {steps.length === 0 && countdown === 0 && !capturing && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <Image className="w-14 h-14 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No steps yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Click the button above to capture your first step</p>
          <Button onClick={capture} className="gap-2 bg-[#463176] hover:bg-[#5a3f91]">
            <Plus className="w-4 h-4" /> Capture First Step
          </Button>
        </div>
      )}
    </div>
  );
}
