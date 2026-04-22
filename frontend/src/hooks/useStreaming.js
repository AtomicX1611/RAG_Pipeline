import { useState, useEffect, useRef, useCallback } from 'react';
import { STREAM_SPEED_MS } from '../utils/constants';

/**
 * Simulates streaming text output, yielding characters progressively.
 * @param {string} fullText - the complete text to stream
 * @param {boolean} shouldStream - whether to activate streaming
 * @returns {{ displayedText: string, isStreaming: boolean, skipToEnd: () => void }}
 */
export function useStreaming(fullText, shouldStream = true) {
  const [displayedText, setDisplayedText] = useState('');
  const [isActive, setIsActive] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  /** Start streaming when fullText changes and shouldStream is true */
  useEffect(() => {
    if (!fullText || !shouldStream) {
      setDisplayedText(fullText || '');
      return;
    }

    setDisplayedText('');
    setIsActive(true);
    indexRef.current = 0;

    timerRef.current = setInterval(() => {
      indexRef.current += 1;

      if (indexRef.current >= fullText.length) {
        setDisplayedText(fullText);
        setIsActive(false);
        clearInterval(timerRef.current);
      } else {
        setDisplayedText(fullText.slice(0, indexRef.current));
      }
    }, STREAM_SPEED_MS);

    return () => clearInterval(timerRef.current);
  }, [fullText, shouldStream]);

  /** Skip to end instantly */
  const skipToEnd = useCallback(() => {
    clearInterval(timerRef.current);
    setDisplayedText(fullText || '');
    setIsActive(false);
  }, [fullText]);

  return { displayedText, isStreaming: isActive, skipToEnd };
}
