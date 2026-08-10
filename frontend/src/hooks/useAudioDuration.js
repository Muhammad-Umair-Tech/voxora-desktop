import { useEffect, useState } from "react";

// Resolves the duration (in seconds) of a library audio item. Prefers a
// `duration` field already on the item; otherwise probes the audio URL
// directly with a throwaway <audio> element. Shared by AudioPlacementRange
// (the placement slider) and AddAudioButton (the "too long" check) so both
// always agree on the same number for the same track.
export default function useAudioDuration(selectedAudio) {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!selectedAudio) {
      setDuration(0);
      return;
    }

    if (selectedAudio.duration && !isNaN(selectedAudio.duration)) {
      setDuration(Number(selectedAudio.duration));
      return;
    }

    const audioUrl = selectedAudio.audio_url || selectedAudio.url;
    if (!audioUrl) {
      setDuration(0);
      return;
    }

    const tempAudio = new Audio(audioUrl);

    const handleLoadedMetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setDuration(tempAudio.duration);
      }
    };

    tempAudio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      tempAudio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [selectedAudio]);

  return duration;
}
