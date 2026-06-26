let activeStop: (() => void) | null = null;

/** Solo un campo puede escuchar a la vez. */
export function claimVoiceInputSession(stop: () => void): () => void {
  activeStop?.();
  activeStop = stop;
  return () => {
    if (activeStop === stop) activeStop = null;
  };
}

export function releaseVoiceInputSession(stop: () => void): void {
  if (activeStop === stop) activeStop = null;
}
