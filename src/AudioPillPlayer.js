import React, { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";

const AudioPillPlayer = () => {
  // State to manage the list of audio tracks
  const [tracks, setTracks] = useState([]);
  // State to keep track of the currently playing audio track
  const [playingTrackId, setPlayingTrackId] = useState(null);
  // State to store the playback time for resuming tracks
  const [playbackTime, setPlaybackTime] = useState(0);
  // State to manage the playback pause status
  const [paused, setPaused] = useState(false);
  // Reference to the audio element for playback control
  const audioRef = useRef(null);
  // State to manage the error message in case of invalid file upload
  const [errorMessage, setErrorMessage] = useState(null);

  // Callback to handle file drop (accepting all files, but checking if they are audio files)
  const onDrop = (acceptedFiles, rejectedFiles) => {
    // Process accepted files
    if (acceptedFiles && acceptedFiles.length > 0) {
      const newTrack = {
        id: new Date().getTime(),
        file: acceptedFiles[0],
      };
      setTracks([...tracks, newTrack]);
      setErrorMessage(null);
    }

    // Handle rejected files (non-audio files)
    if (rejectedFiles && rejectedFiles.length > 0) {
      const rejectedFileType = rejectedFiles[0].type;
      setErrorMessage(
        `Invalid file type '${rejectedFileType}'. Only audio files are accepted.`
      );
    }
  };

  // Callback to delete a track from the list
  const handleDeleteTrack = (id) => {
    const updatedTracks = tracks.filter((track) => track.id !== id);
    setTracks(updatedTracks);

    // Reset playback state when a track is deleted
    setPlayingTrackId(null);
    audioRef.current.pause();
    audioRef.current.src = null;
  };

  // Callback to handle playback of a specific track
  const handlePlayback = async (id) => {
    const selectedTrack = tracks.find((track) => track.id === id);

    if (selectedTrack && audioRef.current) {
      // Resume track if it's the same and was paused
      if (playingTrackId === id && paused) {
        audioRef.current.src = URL.createObjectURL(selectedTrack.file);
        await audioRef.current.load();
        audioRef.current.currentTime = playbackTime;
        setPaused(false);
      } else {
        // Start track from the beginning if it's a new track
        audioRef.current.src = URL.createObjectURL(selectedTrack.file);
        await audioRef.current.load();
        audioRef.current.currentTime = 0;
        setPlayingTrackId(id);
        setPaused(false);
      }

      // Start or resume playback
      audioRef.current.play();
    }
  };

  // Callback to handle pausing playback
  const handlePausePlayback = () => {
    if (audioRef.current) {
      // Store the current playback time for resuming
      setPlaybackTime(audioRef.current.currentTime);
      setPaused(true);
      audioRef.current.pause();
    }
  };

  // Dropzone configuration to accept only audio files
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles, rejectedFiles) => {
      const acceptedFile = acceptedFiles[0];

      if (acceptedFile) {
        const fileType = acceptedFile.type;
        const [mediaType] = fileType.split("/");

        if (mediaType !== "audio") {
          setErrorMessage(
            `Invalid file type '${fileType}'. Only audio files are accepted.`
          );
          return;
        }

        // Handle valid audio file
        onDrop(acceptedFiles);
      } else if (rejectedFiles && rejectedFiles.length > 0) {
        // Handle rejected files (non-audio files)
        const rejectedFileType = rejectedFiles[0].type;
        setErrorMessage(
          `Invalid file type '${rejectedFileType}'. Only audio files are accepted.`
        );
      }
    },
    accept: "audio/*",
  });

  return (
    <div>
      {/* Display error message above the dropzone */}
      {errorMessage && (
        <div style={{ color: "red", margin: "1em" }}>{errorMessage}</div>
      )}

      {/* Dropzone for file upload */}
      <div
        {...getRootProps()}
        style={{ ...dropzoneStyle, margin: "1em" }}
      >
        <input {...getInputProps()} />
        <p>Drag 'n' drop an audio file here, or click to select one</p>
      </div>

      {/* Display list of tracks with playback controls */}
      {tracks.map((track) => (
        <div style={{ margin: "1em" }}>
          <div
            key={track.id}
            className="flex items-center justify-between p-2 bg-white border border-gray-300 mb-2 rounded display-contents"
          >
            <span className="mr-4">{track.file.name}</span>
            <button
              onClick={() => handlePlayback(track.id)}
              disabled={playingTrackId === track.id && !paused}
              className={`play-button ${
                playingTrackId === track.id && !paused ? "disabled-button" : ""
              }`}
            >
              Play
            </button>
            <button
              onClick={() => handlePausePlayback(track.id)}
              disabled={playingTrackId !== track.id || paused}
              className={`pause-button ${
                playingTrackId !== track.id || paused ? "disabled-button" : ""
              }`}
            >
              Pause
            </button>
            <button
              onClick={() => handleDeleteTrack(track.id)}
              className="delete-button"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Audio element for playback */}
      <audio
        style={{ margin: "1em" }}
        ref={audioRef}
        controls
        onEnded={() => setPlayingTrackId(null)}
      >
        {tracks.map((track) => (
          <source
            key={track.id}
            src={URL.createObjectURL(track.file)}
            type="audio/wav"
          />
        ))}
      </audio>

      {/* Display currently playing track */}
      {playingTrackId !== null && (
        <div style={{ margin: "1em" }}>
          <strong>Now Playing:</strong>{" "}
          {tracks.find((track) => track.id === playingTrackId).file.name}
        </div>
      )}
    </div>
  );
};

// Styling for the dropzone
const dropzoneStyle = {
  border: "2px dashed #cccccc",
  borderRadius: "4px",
  padding: "20px",
  textAlign: "center",
  cursor: "pointer",
};

export default AudioPillPlayer;
