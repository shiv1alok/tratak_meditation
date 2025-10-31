import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Upload, Eye, X } from 'lucide-react';

export default function TratakMeditationApp() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [flameOffset, setFlameOffset] = useState(0);
  const [flameLevel, setFlameLevel] = useState('beginner'); // --- NEW --- State for difficulty
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const sessionIntervalRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);

  // --- All helper functions (no changes here) ---

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      if (audioFile) {
        URL.revokeObjectURL(audioFile);
      }
      const url = URL.createObjectURL(file);
      setAudioFile(url);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    setIsSessionActive(true);
    setSessionTime(0);
    setShowControls(false);
    if (audioFile && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const endSession = useCallback(() => {
    setIsSessionActive(false);
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [audioRef]);


  // --- useEffect Hooks ---

  useEffect(() => {
    if (isSessionActive) {
      sessionIntervalRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
      }
    }
    return () => {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
      }
    };
  }, [isSessionActive]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSessionActive) {
        endSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSessionActive, endSession]);

  // --- MODIFIED --- Realistic flame animation
  useEffect(() => {
    const animateFlame = () => {
      const time = Date.now() / 1000;
      let offset = 0;

      switch (flameLevel) {
        case 'intermediate':
          // A bit faster and wider than beginner
          offset = Math.sin(time * 0.7) * 1.8 + Math.sin(time * 1.5) * 1.0;
          break;
        case 'professional':
          // More complex, faster, more "waves"
          offset = Math.sin(time * 2.5) * 2.5 + Math.sin(time * 5) * 1.2;
          break;
        case 'beginner':
        default:
          // The "closed room" slow one
          offset = Math.sin(time * 0.5) * 1.5 + Math.sin(time * 1.2) * 0.75;
          break;
      }
      
      setFlameOffset(offset);
    };
    
    const interval = setInterval(animateFlame, 50);
    return () => clearInterval(interval);
  }, [flameLevel]); // --- MODIFIED --- Re-run this effect when flameLevel changes

  // Handle mouse move in meditation mode
  const handleMouseMove = () => {
    if (isSessionActive) {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // --- NEW --- Styles for the level buttons
  const levelButtonStyle = {
    padding: '10px 20px',
    borderRadius: '50px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#4B5563',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const activeLevelButtonStyle = {
    ...levelButtonStyle,
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    border: '1px solid #4F46E5',
    boxShadow: '0 4px 10px -1px rgba(79, 70, 229, 0.3)',
  };

  // --- RETURN STATEMENT ---

  return (
    <>
      {/* Persistent audio element */}
      {audioFile && (
        <audio
          ref={audioRef}
          src={audioFile}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />
      )}

      {isSessionActive ? (
        // --- Meditation Mode (No changes here) ---
        <div
          onMouseMove={handleMouseMove}
          style={{
            minHeight: '100vh',
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: showControls ? 'default' : 'none'
          }}
        >
          {/* Candle Flame */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '150px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(255, 200, 87, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              position: 'absolute',
              top: '-50px',
              left: '50%',
              transform: 'translateX(-50%)',
              filter: 'blur(30px)',
              animation: 'glow 2s ease-in-out infinite'
            }}></div>
            <svg width="140" height="220" viewBox="0 0 140 220" style={{ position: 'relative', zIndex: 10 }}>
              <defs>
                <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#FCD34D', stopOpacity: 1}} />
                  <stop offset="40%" style={{stopColor: '#F59E0B', stopOpacity: 1}} />
                  <stop offset="80%" style={{stopColor: '#DC2626', stopOpacity: 0.9}} />
                  <stop offset="100%" style={{stopColor: '#991B1B', stopOpacity: 0.7}} />
                </linearGradient>
                <linearGradient id="innerFlameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#FFFBEB', stopOpacity: 1}} />
                  <stop offset="50%" style={{stopColor: '#FEF3C7', stopOpacity: 0.9}} />
                  <stop offset="100%" style={{stopColor: '#FCD34D', stopOpacity: 0.8}} />
                </linearGradient>
                <radialGradient id="coreGlow">
                  <stop offset="0%" style={{stopColor: '#FFFFFF', stopOpacity: 1}} />
                  <stop offset="50%" style={{stopColor: '#FEF3C7', stopOpacity: 0.8}} />
                  <stop offset="100%" style={{stopColor: 'transparent', stopOpacity: 0}} />
                </radialGradient>
              </defs>
              <path
                d={`M 70 30 Q ${55 + flameOffset * 0.5} 40, ${50 + flameOffset} 60 Q ${45 + flameOffset * 0.8} 80, 50 100 Q 55 110, 70 110 Q 85 110, 90 100 Q ${95 - flameOffset * 0.8} 80, ${90 - flameOffset} 60 Q ${85 - flameOffset * 0.5} 40, 70 30 Z`}
                fill="url(#flameGradient)"
              />
              <path
                d={`M 70 40 Q ${60 + flameOffset * 0.7} 50, ${58 + flameOffset * 0.9} 70 Q ${56 + flameOffset * 0.6} 85, 60 95 Q 65 100, 70 100 Q 75 100, 80 95 Q ${84 - flameOffset * 0.6} 85, ${82 - flameOffset * 0.9} 70 Q ${80 - flameOffset * 0.7} 50, 70 40 Z`}
                fill="url(#innerFlameGradient)"
                opacity="0.9"
              />
              <ellipse
                cx="70"
                cy={75 + flameOffset * 0.3}
                rx={8 + Math.abs(flameOffset) * 0.2}
                ry={18 + Math.abs(flameOffset) * 0.3}
                fill="url(#coreGlow)"
              />
              <line x1="70" y1="110" x2="70" y2="120" stroke="#1F2937" strokeWidth="2"/>
              <rect x="55" y="120" width="30" height="80" rx="3" fill="#E5E7EB" />
              <ellipse cx="70" cy="120" rx="15" ry="4" fill="#D1D5DB" />
              <path
                d="M 58 130 Q 57 135, 58 140 L 56 145"
                stroke="#D1D5DB"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />
            </svg>
          </div>

          {/* Exit button */}
          {showControls && (
            <button
              onClick={endSession}
              style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                zIndex: 1000
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <X size={24} />
            </button>
          )}

          <style>{`
            @keyframes glow {
              0%, 100% { opacity: 0.8; transform: translateX(-50%) scale(1); }
              50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
            }
          `}</style>
        </div>
      ) : (
        // --- Setup Mode (UI Changes here) ---
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #EEF2FF 0%, #F3E8FF 50%, #FCE7F3 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ maxWidth: '600px', width: '100%' }}>
            {/* Header (No changes) */}
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                <Eye size={32} color="#4F46E5" style={{ marginRight: '10px' }} />
                <h1 style={{ fontSize: '36px', fontWeight: '300', color: '#374151', margin: 0 }}>
                  Tratak Meditation
                </h1>
              </div>
              <p style={{ color: '#6B7280', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                Focus your gaze on the flame to calm the mind and deepen concentration
              </p>
            </div>

            {/* Main Card */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              padding: '50px',
              marginBottom: '30px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Candle Preview (No changes) */}
                <div style={{ position: 'relative', marginBottom: '30px' }}>
                  <div style={{
                    width: '120px',
                    height: '150px',
                    background: 'radial-gradient(circle, rgba(252, 211, 77, 0.4) 0%, transparent 70%)',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    filter: 'blur(20px)',
                    animation: 'glow 2s ease-in-out infinite'
                  }}></div>
                  <svg width="120" height="180" viewBox="0 0 120 180" style={{ position: 'relative', zIndex: 10 }}>
                    <defs>
                      <linearGradient id="flameGradientPreview" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#FCD34D', stopOpacity: 1}} />
                        <stop offset="40%" style={{stopColor: '#F59E0B', stopOpacity: 1}} />
                        <stop offset="80%" style={{stopColor: '#DC2626', stopOpacity: 0.9}} />
                        <stop offset="100%" style={{stopColor: '#991B1B', stopOpacity: 0.7}} />
                      </linearGradient>
                      <linearGradient id="innerFlameGradientPreview" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#FFFBEB', stopOpacity: 1}} />
                        <stop offset="50%" style={{stopColor: '#FEF3C7', stopOpacity: 0.9}} />
                        <stop offset="100%" style={{stopColor: '#FCD34D', stopOpacity: 0.8}} />
                      </linearGradient>
                    </defs>
                    <path
                      d={`M 60 25 Q ${48 + flameOffset * 0.5} 35, ${45 + flameOffset} 50 Q ${42 + flameOffset * 0.8} 65, 45 80 Q 50 88, 60 88 Q 70 88, 75 80 Q ${78 - flameOffset * 0.8} 65, ${75 - flameOffset} 50 Q ${72 - flameOffset * 0.5} 35, 60 25 Z`}
                      fill="url(#flameGradientPreview)"
                    />
                    <path
                      d={`M 60 33 Q ${52 + flameOffset * 0.7} 40, ${50 + flameOffset * 0.9} 55 Q ${48 + flameOffset * 0.6} 68, 52 76 Q 56 80, 60 80 Q 64 80, 68 76 Q ${72 - flameOffset * 0.6} 68, ${70 - flameOffset * 0.9} 55 Q ${68 - flameOffset * 0.7} 40, 60 33 Z`}
                      fill="url(#innerFlameGradientPreview)"
                      opacity="0.9"
                    />
                    <line x1="60" y1="88" x2="60" y2="95" stroke="#1F2937" strokeWidth="1.5"/>
                    <rect x="48" y="95" width="24" height="65" rx="2" fill="#E5E7EB" />
                    <ellipse cx="60" cy="95" rx="12" ry="3" fill="#D1D5DB" />
                  </svg>
                </div>

                {/* --- NEW --- Flame Level Selector */}
                <div style={{ marginBottom: '30px', width: '100%', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#4B5563', marginBottom: '15px', marginTop: 0 }}>
                    Choose Your Focus Level
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <button
                      onClick={() => setFlameLevel('beginner')}
                      style={flameLevel === 'beginner' ? activeLevelButtonStyle : levelButtonStyle}
                    >
                      Beginner
                    </button>
                    <button
                      onClick={() => setFlameLevel('intermediate')}
                      style={flameLevel === 'intermediate' ? activeLevelButtonStyle : levelButtonStyle}
                    >
                      Intermediate
                    </button>
                    <button
                      onClick={() => setFlameLevel('professional')}
                      style={flameLevel === 'professional' ? activeLevelButtonStyle : levelButtonStyle}
                    >
                      Professional
                    </button>
                  </div>
                </div>

                {/* Begin Meditation Button (No changes) */}
                <button
                  onClick={startSession}
                  style={{
                    padding: '15px 35px',
                    borderRadius: '50px',
                    backgroundColor: '#4F46E5',
                    color: 'white',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4338CA';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#4F46E5';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  Begin Meditation
                </button>
              </div>
            </div>

            {/* Audio Player (No changes) */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: '35px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#374151', marginBottom: '20px', textAlign: 'center', marginTop: 0 }}>
                Meditation Audio
              </h2>
              
              {!audioFile ? (
                <div style={{ textAlign: 'center' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="audio/*"
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '12px 25px',
                      backgroundColor: '#E0E7FF',
                      color: '#4338CA',
                      borderRadius: '50px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#C7D2FE';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#E0E7FF';
                    }}
                  >
                    <Upload size={20} style={{ marginRight: '8px' }} />
                    Upload Audio
                  </button>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '12px' }}>
                    Upload your meditation music or ambient sounds
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      height: '4px',
                      backgroundColor: '#E5E7EB',
                      borderRadius: '50px',
                      overflow: 'hidden'
                    }}>
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: '#4F46E5',
                          transition: 'width 0.1s linear',
                          width: `${(currentTime / duration) * 100 || 0}%`
                        }}
                      ></div>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#6B7280',
                      marginTop: '6px'
                    }}>
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    <button
                      onClick={togglePlayPause}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#4F46E5',
                        color: 'white',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4338CA';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#4F46E5';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
                    </button>
                    <button
                      onClick={() => {
                        if (audioFile) {
                          URL.revokeObjectURL(audioFile);
                        }
                        setAudioFile(null);
                        setIsPlaying(false);
                        setCurrentTime(0);
                        setDuration(0);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = null;
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        fontSize: '13px',
                        color: '#6B7280',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#374151';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#6B7280';
                      }}
                    >
                      Change Audio
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions (No changes) */}
            <div style={{
              marginTop: '30px',
              textAlign: 'center',
              fontSize: '13px',
              color: '#6B7280',
              maxWidth: '500px',
              margin: '30px auto 0'
            }}>
              <p style={{ lineHeight: '1.6', margin: 0 }}>
                Sit comfortably and gaze softly at the flame without blinking. 
                When your eyes tire, close them and visualize the flame in your mind's eye.
                You can open your eyes again when you feel better.
              </p>
            </div>
          </div>

          <style>{`
            @keyframes glow {
              0%, 100% { opacity: 0.8; transform: translateX(-50%) scale(1); }
              50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}