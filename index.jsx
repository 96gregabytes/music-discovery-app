import React, { useState } from "react";

export default function HomePage() {
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const startRecording = async () => {
    setIsListening(true);
    const dummyTranscript = "I want moody ambient music like Burial but less dark";
    setTranscript(dummyTranscript);
    fetchGPTResponse(dummyTranscript);
  };

  const fetchGPTResponse = async (text) => {
    const res = await fetch("/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    setResponse(data.reply);
    setAudioUrl(data.audioUrl);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎵 Music Discovery Guide</h1>

      <button onClick={startRecording} disabled={isListening} className="bg-blue-500 text-white px-4 py-2 rounded">
        {isListening ? "Listening..." : "🎙️ Speak Your Request"}
      </button>

      {transcript && (
        <div className="mt-4">
          <p className="font-semibold">You said:</p>
          <p>{transcript}</p>
        </div>
      )}

      {response && (
        <div className="mt-4">
          <p className="font-semibold">Music Guide says:</p>
          <p>{response}</p>
          {audioUrl && <audio controls src={audioUrl} className="mt-2" />}
        </div>
      )}
    </div>
  );
}
