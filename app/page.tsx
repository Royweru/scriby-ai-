'use client'
import React, { useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';

const N8N_WEBHOOK_URL = "http://localhost:5678/webhook-test/audio-upload"; 
const MEDIA_RECORDER_OPTIONS: MediaRecorderOptions = { mimeType: 'audio/webm; codecs=opus' };

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

const StatusBox = ({ message, isError = false }: { message: string | null, isError?: boolean }) => (
  <div className={`p-4 rounded-xl shadow-lg transition-all duration-300 ${isError ? 'bg-red-900/50 border-red-700' : 'bg-cyan-800/50 border-cyan-600'} border-l-4 mt-6 text-sm`}>
    <p className={`${isError ? 'text-red-300' : 'text-cyan-300'}`}>
      {message}
    </p>
  </div>
);

interface RecorderCardProps {
  isRecording: boolean;
  isUploading?: boolean;
  onStart: () => void;
  onStop: () => void;
  onUpload: () => void;
  audioUrl: string | null;
  statusMessage: string | null;
  onFileSelect: (file: File) => void;
}

const RecorderCard = ({ isRecording, onStart, onStop, onUpload, audioUrl, statusMessage, isUploading, onFileSelect }: RecorderCardProps) => {
  const [canRecord, setCanRecord] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (navigator.mediaDevices && window.MediaRecorder) {
      setCanRecord(true);
    }
  }, []);

  const handleAction = () => {
    if (!canRecord) {
      alert("Microphone access is required and MediaRecorder must be supported by your browser.");
      return;
    }
    isRecording ? onStop() : onStart();
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
      e.target.value = ''; 
    }
  };

  return (
    <div className="bg-gray-900 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-gray-700/50 w-full">
      <h2 className="text-2xl font-semibold text-white mb-4">Transcription Input</h2>
      <p className="text-gray-400 mb-6 text-sm">Record live or upload an audio file</p>

      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={handleAction}
          disabled={!canRecord || !!audioUrl || isUploading}
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
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isRecording || !!audioUrl || isUploading}
          className={`
            w-24 h-24 rounded-full flex flex-col items-center justify-center 
            transition-all duration-300 transform shadow-2xl text-xs
            ${audioUrl 
              ? 'bg-gray-800' 
              : 'bg-gray-700 hover:bg-gray-600 shadow-gray-500/30 hover:scale-105'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <FileIcon className="w-8 h-8 text-white" />
          <span className="mt-1 text-white font-medium">UPLOAD</span>
        </button>
      </div>

      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        style={{ display: 'none' }}
        disabled={isRecording || !!audioUrl || isUploading}
      />

      <div className="flex flex-col space-y-4">
        <button
          onClick={onUpload}
          disabled={!audioUrl || isRecording || isUploading}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 transition duration-200 text-white font-medium rounded-xl flex items-center justify-center space-x-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <UploadIcon className="w-5 h-5" />
              <span>{audioUrl ? 'Upload & Transcribe' : 'Record or Upload to Proceed'}</span>
            </>
          )}
        </button>

        {statusMessage && <StatusBox message={statusMessage} isError={statusMessage.includes('Error') || statusMessage.includes('denied')} />}

        {audioUrl && !isUploading && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-xl">
            <h3 className="text-sm font-medium text-cyan-400 mb-2 flex items-center space-x-2">
              <CheckIcon className="w-4 h-4" /> 
              <span>Audio Ready</span>
            </h3>
            <audio controls src={audioUrl} className="w-full rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("Your transcription will appear here");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);

  const startRecording = useCallback(async () => {
    setTranscript("Recording...");
    setAudioUrl(null);
    audioChunksRef.current = [];
    audioBlobRef.current = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, MEDIA_RECORDER_OPTIONS);
      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: MEDIA_RECORDER_OPTIONS.mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        audioBlobRef.current = audioBlob;
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatusMessage('Recording in progress...');
    } catch (err: any) {
      console.error('Recording error:', err);
      const errorName = err.name || 'Unknown Error';
      setStatusMessage(`Error: Could not access microphone (${errorName})`);
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
  
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('audio/')) {
      setStatusMessage(`Error: File must be audio type`);
      return;
    }
    setIsRecording(false);
    setTranscript(`File selected: ${file.name}`);
    setStatusMessage(`Audio file loaded successfully`);
    const audioBlob = new Blob([file], { type: file.type });
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    audioBlobRef.current = audioBlob;
  }, []);

  const handleUpload = useCallback(async () => {
    if (!audioBlobRef.current) {
      setStatusMessage('Error: No audio data to upload');
      return;
    }
    setStatusMessage('Uploading...');
    const formData = new FormData();
    formData.append('data', audioBlobRef.current, 'audio_input.bin'); 
    try {
      setIsUploading(true);
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const result = await response.json();
      if (result && result.transcript) {
        setTranscript(result.transcript);
        setStatusMessage('Transcription successful!');
      } else {
        setTranscript(JSON.stringify(result, null, 2));
        setStatusMessage('Workflow triggered successfully');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setStatusMessage(`Error: Failed to trigger workflow (${error.message})`);
    } finally {
      setIsUploading(false);
      setAudioUrl(null); 
      audioBlobRef.current = null;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col items-center pt-20 pb-12 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight">
          Cloud Voice AI: <span className="text-cyan-400">Next-Gen Transcription</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-400">Live Recording • N8N Workflow • Google STT</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl">
        <div className="w-full lg:w-1/2">
          <RecorderCard
            isRecording={isRecording}
            onStart={startRecording}
            onStop={stopRecording}
            isUploading={isUploading}
            onUpload={handleUpload}
            audioUrl={audioUrl}
            statusMessage={statusMessage}
            onFileSelect={handleFileSelect}
          />
        </div>

        <div className="w-full lg:w-1/2">
          <div className="bg-gray-900 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-gray-700/50 ">
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Transcription Result</h2>
            
            <div className="min-h-64 p-4 bg-gray-950 rounded-xl border border-gray-700 text-sm overflow-auto max-h-[70vh]">
              <pre className="whitespace-pre-wrap font-mono text-gray-300">
                {transcript}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;