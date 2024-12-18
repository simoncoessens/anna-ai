"use client";

import { useState, useRef, useEffect } from "react";
import { Message } from "@/types/message";
import { Send } from "react-feather";
import LoadingDots from "@/components/LoadingDots";
import { AuroraBackground } from "@/components/core/aurora-background"; // Import the AuroraBackground
import Markdown from "react-markdown";

export default function PDFViewerWithChat() {
  const [message, setMessage] = useState<string>("");
  const [history, setHistory] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hello! I'm Anna, your AI assistant here to help you.",
    },
  ]);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = () => {
    if (message === "") return;
    setHistory((oldHistory) => [
      ...oldHistory,
      { role: "user", content: message },
    ]);
    setMessage("");
    setLoading(true);
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: message, history: history }),
    })
      .then(async (res) => {
        const r = await res.json();
        setHistory((oldHistory) => [...oldHistory, r]);
        setLoading(false);
      })
      .catch((err) => {
        alert(err);
      });
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  return (
    <div className="relative h-screen">
      <AuroraBackground>
        <div className="flex h-full">
          {/* Left Side - PDF Viewer Section (2/3 of the page) */}
          <div className="flex-[2] flex flex-col justify-center items-center p-8 overflow-auto z-50">
            <div
              className="w-full h-auto overflow-y-scroll border rounded-lg p-6 shadow-lg"
              style={{ maxWidth: "2000px" }} // Adjust as needed
            >
              {/* Display PDF using iframe */}
              <iframe
                src="https://v2-embednotion.com/141d3f5793cd805194a1dbba929831ee"
                style={{
                  width: "1000px",
                  height: "1000px", // Adjust as needed
                  border: "2px solid #ccc",
                  borderRadius: "10px",
                }}
              ></iframe>
            </div>
          </div>

          {/* Right Side - Chatbot Section (1/3 of the page) */}
          <div className="flex-[1] flex flex-col items-center justify-center p-8 z-10">
            <form
              className="w-[500px] h-[600px] rounded-3xl border border-gray-200 flex flex-col bg-white bg-opacity-100 overflow-clip shadow-md p-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleClick();
              }}
            >
              <div className="overflow-y-scroll flex flex-col gap-5 h-full">
                {history.map((message, idx) => {
                  const isLastMessage = idx === history.length - 1;
                  return (
                    <div
                      key={idx}
                      className={`flex gap-2 ${
                        message.role === "user" ? "self-end" : ""
                      }`}
                      ref={isLastMessage ? lastMessageRef : null}
                    >
                      {message.role === "assistant" && (
                        <img
                          src="images/anna.webp"
                          className="h-10 w-10 rounded-full"
                          alt="assistant avatar"
                        />
                      )}
                      <div
                        className={`w-auto max-w-xl break-words bg-white rounded-xl p-4 shadow-lg ${
                          message.role === "user"
                            ? "rounded-tl-xl rounded-br-none"
                            : "rounded-tr-xl rounded-bl-none"
                        }`}
                      >
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          {message.role === "user" ? "You" : "Anna"}
                        </p>
                        <div className="prose">
                          <section>
                            <Markdown>{message.content}</Markdown>
                          </section>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {loading && (
                  <div className="flex gap-2">
                    <img
                      src="images/anna.webp"
                      className="h-10 w-10 rounded-full"
                      alt="assistant avatar"
                    />
                    <div className="w-auto max-w-xl break-words bg-white rounded-xl p-4 shadow-lg">
                      <p className="text-sm font-medium text-gray-700 mb-4">
                        Anna
                      </p>
                      <LoadingDots />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex sticky bottom-0 w-full px-4 py-4">
                <div className="w-full relative">
                  <textarea
                    aria-label="chat input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message"
                    className="w-full h-12 resize-none rounded-full border border-gray-300 bg-white pl-4 pr-16 py-3 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleClick();
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleClick();
                    }}
                    className="flex w-10 h-10 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-900 absolute right-2 bottom-3"
                    type="submit"
                    aria-label="Send"
                    disabled={!message || loading}
                  >
                    <Send />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </AuroraBackground>
    </div>
  );
}
