import { useRef } from 'react';
import { useAiState } from '@/context/ai-state-context';
import { useSubtitle } from '@/context/subtitle-context';
import { useChatHistory } from '@/context/chat-history-context';
import { audioTaskQueue } from '@/utils/task-queue';
import { useLive2DModel } from '@/context/live2d-model-context';
import { toaster } from '@/components/ui/toaster';

interface AudioTaskOptions {
  audioBase64: string
  volumes: number[]
  sliceLength: number
  text?: string | null
  expressions?: string[] | number[] | null
}

export const useAudioTask = () => {
  const { aiState } = useAiState();
  const { setSubtitleText } = useSubtitle();
  const { appendResponse, appendAIMessage } = useChatHistory();
  const { currentModel } = useLive2DModel();

  const stateRef = useRef({
    aiState,
    currentModel,
    setSubtitleText,
    appendResponse,
    appendAIMessage,
  });

  stateRef.current = {
    aiState,
    currentModel,
    setSubtitleText,
    appendResponse,
    appendAIMessage,
  };

  const handleAudioPlayback = (options: AudioTaskOptions, onComplete: () => void) => {
    const {
      aiState: currentAiState,
      currentModel: model,
      setSubtitleText: updateSubtitle,
      appendResponse: appendText,
      appendAIMessage: appendAI,
    } = stateRef.current;

    if (currentAiState === 'interrupted') {
      console.error('Audio playback blocked. State:', currentAiState);
      onComplete();
      return;
    }

    const { audioBase64, text, expressions } = options;

    if (text) {
      appendText(text);
      appendAI(text);
      if (audioBase64) {
        // Only update subtitle if there's audio
        updateSubtitle(text);
      }
    }

    if (!model) {
      console.error('Model not initialized');
      onComplete();
      return;
    }

    try {
      if (expressions?.[0] !== undefined) {
        model.expression(expressions[0]);
      }

      model.speak(`data:audio/wav;base64,${audioBase64}`, {
        onFinish: () => {
          console.log("Voiceline is over");
          onComplete();
        },
        onError: (error) => {
          console.error("Audio playback error:", error);
          onComplete();
        },
      });
    } catch (error) {
      console.error('Speak function error:', error);
      toaster.create({
        title: `Speak function error: ${error}`,
        type: "error",
        duration: 2000,
      });
      onComplete();
    }
  };

  const addAudioTask = async (options: AudioTaskOptions) => {
    const { aiState: currentState } = stateRef.current;

    if (currentState === 'interrupted') {
      console.log('Skipping audio task due to interrupted state');
      return;
    }

    console.log(`Adding audio task ${options.text} to queue`);

    audioTaskQueue.addTask(() => new Promise<void>((resolve) => {
      handleAudioPlayback(options, resolve);
    }).catch((error) => {
      console.log('Audio task error:', error);
    }));
  };

  return {
    addAudioTask,
    appendResponse,
  };
};
