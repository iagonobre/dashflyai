import { useState, useCallback, useRef } from "react";

interface StreamingState {
  text: string;
  isStreaming: boolean;
  error: string | null;
}

export function useStreamingContent() {
  const [state, setState] = useState<StreamingState>({
    text: "",
    isStreaming: false,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(async (url: string, initialText?: string) => {
    // Cancela stream anterior se houver
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setState({ text: initialText ?? "", isStreaming: true, error: null });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "text/event-stream",
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookieToken()}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body is null");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            accumulated += data;
            setState((prev) => ({ ...prev, text: accumulated }));
          }
        }
      }

      setState((prev) => ({ ...prev, isStreaming: false }));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        isStreaming: false,
        error: "Erro ao gerar conteúdo. Tente novamente.",
      }));
    }
  }, []);

  const reset = useCallback((text = "") => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setState({ text, isStreaming: false, error: null });
  }, []);

  return { ...state, stream, reset };
}

function getCookieToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}
