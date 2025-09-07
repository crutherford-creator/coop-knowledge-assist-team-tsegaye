import { useState, useEffect } from "react";

interface StreamingTextProps {
  text: string;
  speed?: number;
  isStreaming?: boolean;
  onComplete?: () => void;
}

export const StreamingText = ({ 
  text, 
  speed = 30, 
  isStreaming = true,
  onComplete 
}: StreamingTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
      return;
    }

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, isStreaming, onComplete]);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed">
      {displayedText}
      {isStreaming && currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  );
};