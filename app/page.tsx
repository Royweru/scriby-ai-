'use client'
import React, { useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';

// --- Configuration ---
// IMPORTANT: Replace this with the actual URL of your n8n Webhook node (Step 1)
const N8N_WEBHOOK_URL = "http://localhost:5678/webhook-test/audio-upload"; 
// Define the specific MIME type for the MediaRecorder
const MEDIA_RECORDER_OPTIONS: MediaRecorderOptions = { mimeType: 'audio/webm; codecs=opus' };


// --- Inline SVG Icons (Simulating lucide-react for single-file requirement) ---
const MicIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const StopIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="10" height="10" x="7" y="7" rx="2" />
  </svg>
);

const UploadIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 3 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

const FileIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
    </svg>
);

const CheckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

// --- Component: Status Message Container ---
const StatusBox = ({ message, isError = false }: { message: string | null, isError?: boolean }) => (
  <div className={`p-4 rounded-xl shadow-lg transition-all duration-300 ${isError ? 'bg-red-900/50 border-red-700' : 'bg-cyan-800/50 border-cyan-600'} border-l-4 mt-6 text-sm`}>
    <p className={`${isError ? 'text-red-300' : 'text-cyan-300'}`}>
      {message}
    </p>
  </div>
);

// --- RecorderCard Props Interface ---
interface RecorderCardProps {
    isRecording: boolean;
    onStart: () => void;
    onStop: () => void;
    onUpload: () => void;
    audioUrl: string | null;
    statusMessage: string | null;
    onFileSelect: (file: File) => void;
}

// --- Component: Recording Interface Card ---
const RecorderCard = ({ isRecording, onStart, onStop, onUpload, audioUrl, statusMessage, onFileSelect }: RecorderCardProps) => {
  const [canRecord, setCanRecord] = useState(false);
  // Type the ref for the file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check for MediaRecorder support
    if (navigator.mediaDevices && window.MediaRecorder) {
      setCanRecord(true);
    }
  }, []);

  const handleAction = () => {
    if (!canRecord) {
      // Used alert minimally as per instructions, but ideally replaced with custom modal
      alert("Microphone access is required and MediaRecorder must be supported by your browser.");
      return;
    }
    isRecording ? onStop() : onStart();
  };
  
  // Type the event for file changes
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          onFileSelect(e.target.files[0]);
          // Clear file input value to allow the same file to be selected again if needed
          e.target.value = ''; 
      }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700/50 w-full max-w-lg mx-auto transition-transform duration-300 hover:shadow-cyan-500/10">
      <h2 className="text-2xl font-semibold text-white mb-4">Transcription Input</h2>
      <p className="text-slate-400 mb-6 text-sm">Choose between live recording or uploading a pre-recorded audio file.</p>

      {/* Recording and Upload Buttons Section */}
      <div className="flex justify-center mb-6 space-x-4">
        {/* Record Button */}
        <button
          onClick={handleAction}
          disabled={!canRecord || !!audioUrl} // Disable recording if a file is already selected/recorded
          className={`
            w-24 h-24 rounded-full flex flex-col items-center justify-center 
            transition-all duration-300 transform shadow-2xl text-xs
            ${isRecording
              ? 'bg-red-600 hover:bg-red-700 scale-105 ring-4 ring-red-400/50 animate-pulse'
              : 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/30 hover:scale-105'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isRecording ? (
            <>
              <StopIcon className="w-8 h-8 text-white" />
              <span className="mt-1 text-white font-medium">STOP</span>
            </>
          ) : (
            <>
              <MicIcon className="w-8 h-8 text-white" />
              <span className="mt-1 text-white font-medium">RECORD</span>
            </>
          )}
        </button>
        
        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isRecording || !!audioUrl} // Disable upload if recording or a file is present
          className={`
            w-24 h-24 rounded-full flex flex-col items-center justify-center 
            transition-all duration-300 transform shadow-2xl text-xs
            ${audioUrl 
                ? 'bg-gray-700' 
                : 'bg-slate-700 hover:bg-slate-600 shadow-slate-500/30 hover:scale-105'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
            <FileIcon className="w-8 h-8 text-white" />
            <span className="mt-1 text-white font-medium">UPLOAD</span>
        </button>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        style={{ display: 'none' }}
        disabled={isRecording || !!audioUrl}
      />

      <div className="flex flex-col space-y-4">
        {/* Main Action Button */}
        <button
          onClick={onUpload}
          disabled={!audioUrl || isRecording}
          className="w-full py-3 bg-gray-600 hover:bg-gray-700 transition duration-200 text-white font-medium rounded-xl flex items-center justify-center space-x-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <UploadIcon className="w-5 h-5" />
          <span>{audioUrl ? 'Upload & Transcribe' : 'Record or Upload to Proceed'}</span>
        </button>

        {statusMessage && <StatusBox message={statusMessage} isError={statusMessage.includes('Error') || statusMessage.includes('denied')} />}

        {audioUrl && (
          <div className="mt-4 p-4 bg-slate-700/50 rounded-xl">
            <h3 className="text-sm font-medium text-cyan-400 mb-2 flex items-center space-x-2">
                <CheckIcon className="w-4 h-4" /> 
                <span>Audio Ready for Upload</span>
            </h3>
            <audio controls src={audioUrl} className="w-full rounded-lg" />
            <p className="text-xs text-slate-400 mt-2">Ready to upload to your n8n workflow.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Application Component ---
const App = () => {
  // Use state types for clarity
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("Your transcribed text will appear here after successful upload and processing by the n8n workflow.");

  // Type refs for native browser APIs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);

  const startRecording = useCallback(async () => {
    setTranscript("Recording started. Please speak clearly...");
    setAudioUrl(null);
    audioChunksRef.current = [];
    audioBlobRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, MEDIA_RECORDER_OPTIONS);

      // Type MediaRecorder event data
      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: MEDIA_RECORDER_OPTIONS.mimeType });
        const url = URL.createObjectURL(audioBlob);
        
        setAudioUrl(url);
        audioBlobRef.current = audioBlob;
        
        // Stop all tracks on the stream to release the mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatusMessage('Recording in progress...');

    } catch (err: any) {
      console.error('Recording error:', err);
      // Use err.name if available from MediaRecorder error
      const errorName = err.name || 'Unknown Error';
      setStatusMessage(`Error: Could not access microphone. Ensure permissions are granted. (${errorName})`);
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatusMessage('Recording stopped. Ready to upload.');
    }
  }, []);
  
  // Handler for file uploads
  const handleFileSelect = useCallback((file: File) => {
      if (!file.type.startsWith('audio/')) {
          setStatusMessage(`Error: File must be an audio type. Got: ${file.type}`);
          return;
      }

      // Reset recording state
      setIsRecording(false);
      setTranscript(`File selected: ${file.name}. Ready to upload.`);
      setStatusMessage(`Audio file "${file.name}" loaded successfully.`);
      
      // Convert File to Blob and set state for processing
      const audioBlob = new Blob([file], { type: file.type });
      const url = URL.createObjectURL(audioBlob);

      setAudioUrl(url);
      audioBlobRef.current = audioBlob;

  }, []);

  const handleUpload = useCallback(async () => {
    if (!audioBlobRef.current) {
      setStatusMessage('Error: No audio data to upload.');
      return;
    }

    setStatusMessage('Uploading audio and triggering transcription workflow...');
    const formData = new FormData();
    // Send the Blob as a file field. The 'data' key is what the n8n Webhook node often uses by default.
    // Use a generic file name 'audio_input.bin' since it could be any uploaded file type (mp3, wav, etc.)
    formData.append('data', audioBlobRef.current, 'audio_input.bin'); 

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      // The n8n workflow's Respond to Webhook node should return JSON.
      if (!response.ok) {
        throw new Error(`HTTP Error: Failed to trigger n8n workflow. Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Assuming the n8n workflow returns the final transcript in a clean JSON format: { transcript: "..." }
      if (result && result.transcript) {
        setTranscript(result.transcript);
        setStatusMessage('Transcription successful! Result received from n8n.');
      } else {
        // If the workflow response structure is complex, show the raw JSON.
        setTranscript(JSON.stringify(result, null, 2));
        setStatusMessage('Workflow triggered successfully. Raw response received (check for transcript field).');
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      setStatusMessage(`Error: Failed to trigger workflow. Check N8N URL and workflow status. (${error.message})`);
    } finally {
      // Clean up local resources
      setAudioUrl(null);
      audioBlobRef.current = null;
    }
  }, []);


  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center pt-20 pb-12 overflow-x-hidden">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
          Cloud Voice AI: <span className="text-cyan-400">Next-Gen Transcription</span>
        </h1>
        <p className="text-xl text-slate-400">Live Recording $\rightarrow$ N8N Workflow $\rightarrow$ Google STT</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 w-full max-w-7xl px-4">
        
        {/* Left Column: Recorder Card */}
        <div className="flex justify-center lg:justify-end">
          <RecorderCard
            isRecording={isRecording}
            onStart={startRecording}
            onStop={stopRecording}
            onUpload={handleUpload}
            audioUrl={audioUrl}
            statusMessage={statusMessage}
            onFileSelect={handleFileSelect} // Pass the new handler
          />
        </div>

        {/* Right Column: Transcription Output */}
        <div className="lg:order-last order-first">
          <div className="bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-slate-700/50 h-full">
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Transcription Result</h2>
            
            <div className="min-h-64 p-4 bg-slate-900 rounded-xl border border-slate-700 text-sm overflow-auto max-h-[70vh]">
                <pre className="whitespace-pre-wrap font-mono text-slate-300">
                    {transcript}
                </pre>
            </div>

            <div className="mt-4 text-xs text-slate-500">
                <p>This result is the final JSON or plain text returned by 
                   n8n workflow's `Respond to Webhook` node.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;