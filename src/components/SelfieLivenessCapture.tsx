/**
 * SelfieLivenessCapture
 *
 * A self-contained React component that:
 *  - Opens the front camera (with a front/back toggle)
 *  - Lets the user capture a square centre-cropped JPEG selfie
 *  - Exports the JPEG File and calls onCaptured(file)
 *  - Cleans up the camera stream on unmount
 *
 * Note: face-detection / liveness gating (MediaPipe) has been removed — the
 * capture button is enabled as soon as the camera is ready. All processing is
 * client-side.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ─────────────────────────────────────────────────────────── types ───────────

export interface SelfieLivenessCaptureProps {
    /** Called with the captured JPEG File (e.g. selfie_<timestamp>.jpg). */
    onCaptured: (file: File) => void;
    /** Called when the user clicks "Skip". Default label: "Skip for Now →" */
    onSkip?: () => void;
    /** Label for the skip button. Default: "Skip for Now →" */
    skipLabel?: string;
    /** Called on camera permission errors or export failures. */
    onError?: (message: string) => void;
}

type CaptureStatus = 'idle' | 'camera-loading' | 'ready';

// ─────────────────────────────────────────────────────────── component ────────

export default function SelfieLivenessCapture({
    onCaptured,
    onSkip,
    skipLabel = 'Skip for Now →',
    onError,
}: SelfieLivenessCaptureProps) {

    const { t } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [cameraOn, setCameraOn] = useState(false);
    const [status, setStatus] = useState<CaptureStatus>('camera-loading');
    const [capturing, setCapturing] = useState(false);
    const [showSkip, setShowSkip] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const facingModeRef = useRef<'user' | 'environment'>('user'); // stable ref for callbacks
    const skipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mountedRef = useRef(true);

    // ── 1. Start camera (front or back) ──────────────────────────────────────
    const startCamera = useCallback(async (requestedFacing?: 'user' | 'environment') => {
        const facing = requestedFacing ?? facingModeRef.current;
        setStatus('camera-loading');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facing,
                    width: { ideal: 640 },
                    height: { ideal: 640 },
                },
                audio: false,
            });

            // Component unmounted while waiting for getUserMedia — stop tracks and bail
            if (!mountedRef.current) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }

            streamRef.current = stream;
            facingModeRef.current = facing;
            setFacingMode(facing);

            const video = videoRef.current;
            if (video) {
                video.srcObject = stream;
                try {
                    await video.play();
                } catch (playErr) {
                    // play() was interrupted because the element was removed from the DOM
                    // (e.g. React Strict Mode remount or user closed the dialog). Not a
                    // real camera error — just bail silently.
                    if ((playErr as DOMException).name === 'AbortError') {
                        return;
                    }
                    throw playErr;
                }
            }

            if (!mountedRef.current) return;

            setCameraOn(true);
            setStatus('ready');
        } catch (err) {
            if (!mountedRef.current) return;
            setStatus('idle');
            onError?.(`Camera access denied: ${(err as Error).message}`);
        }
    }, [onError]);

    // ── 1a. Auto-start camera on mount ───────────────────────────────────────
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { void startCamera(); }, []);

    // ── 1b. Camera switch ─────────────────────────────────────────────────────
    const switchCamera = useCallback(async () => {
        const next: 'user' | 'environment' = facingModeRef.current === 'user' ? 'environment' : 'user';
        setCameraOn(false);
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        await startCamera(next);
    }, [startCamera]);

    // ── 1c. Show "Skip" button after 5 seconds ────────────────────────────────
    useEffect(() => {
        if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
        skipTimerRef.current = setTimeout(() => {
            if (mountedRef.current) setShowSkip(true);
        }, 5000);
        return () => {
            if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
        };
    }, []);

    // ── 2. Cleanup on unmount ─────────────────────────────────────────────────
    useEffect(() => {
        mountedRef.current = true; // reset on remount (React Strict Mode)
        return () => {
            mountedRef.current = false;
            streamRef.current?.getTracks().forEach(track => track.stop());
        };
    }, []);

    // ── 3. Capture ────────────────────────────────────────────────────────────
    const handleCapture = useCallback(() => {
        if (status !== 'ready' || capturing) return;

        const video = videoRef.current;
        if (!video) return;

        setCapturing(true);

        // Square centre-crop from the raw (unmirrored) stream
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const side = Math.min(vw, vh);
        const sx = (vw - side) / 2;
        const sy = (vh - side) / 2;

        const cvs = document.createElement('canvas');
        cvs.width = side;
        cvs.height = side;
        cvs.getContext('2d')!.drawImage(video, sx, sy, side, side, 0, 0, side, side);

        cvs.toBlob(
            (blob) => {
                setCapturing(false);
                if (!blob) {
                    onError?.('Image export failed — please try again.');
                    return;
                }
                const file = new File(
                    [blob],
                    `selfie_${Date.now()}.jpg`,
                    { type: 'image/jpeg' },
                );
                onCaptured(file);
            },
            'image/jpeg',
            0.9,
        );
    }, [status, capturing, onCaptured, onError]);

    // ── Derived ───────────────────────────────────────────────────────────────
    const isReady = status === 'ready';

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 16,
            userSelect: 'none', fontFamily: 'inherit',
        }}>

            {/* ── Video frame ─────────────────────────────────────────────── */}
            <div style={{
                position: 'relative',
                width: '100%', maxWidth: 320,
                aspectRatio: '1 / 1',
                borderRadius: 16,
                overflow: 'hidden',
                background: '#0d0d0d',
                boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
            }}>
                {/* Live video — CSS-mirrored for front camera selfie UX. */}
                <video
                    ref={videoRef}
                    muted
                    playsInline
                    autoPlay
                    style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                        opacity: cameraOn ? 1 : 0,
                        transition: 'opacity 0.4s',
                    }}
                />
            </div>

            {/* ── Camera switch button ─────────────────────────────────────── */}
            {cameraOn && (
                <button
                    onClick={switchCamera}
                    title={facingMode === 'user' ? 'Switch to back camera' : 'Switch to front camera'}
                    style={{
                        width: 260,
                        padding: '11px 0',
                        borderRadius: 28,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#D92D20',
                        fontWeight: 700,
                        fontSize: 14,
                        border: '1px solid rgba(120,113,108,0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        letterSpacing: '0.3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                    }}
                >
                    🔄 {facingMode === 'user' ? t('forms.aspirant.livePhoto.backCamera', { defaultValue: 'Back Camera' }) : t('forms.aspirant.livePhoto.frontCamera', { defaultValue: 'Front Camera' })}
                </button>
            )}

            {/* ── Capture button ───────────────────────────────────────────── */}
            <button
                onClick={handleCapture}
                disabled={!isReady || capturing}
                style={{
                    width: 260,
                    padding: '11px 0',
                    borderRadius: 28,
                    background: isReady
                        ? '#15803d'
                        : 'rgba(255,255,255,0.07)',
                    color: isReady ? '#fff' : '#555',
                    fontWeight: 700,
                    fontSize: 14,
                    border: `1px solid ${isReady ? '#22c55e55' : '#ffffff14'}`,
                    cursor: isReady && !capturing ? 'pointer' : 'not-allowed',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease',
                    letterSpacing: '0.3px',
                }}
            >
                {capturing ? `⏳ ${t('forms.aspirant.livePhoto.capturing', { defaultValue: 'Capturing…' })}` : `📸 ${t('forms.aspirant.livePhoto.captureSelfie', { defaultValue: 'Capture Selfie' })}`}
            </button>

            {/* ── Skip button — appears after 5s ───────────────────────────── */}
            {showSkip && onSkip && (
                <button
                    onClick={onSkip}
                    style={{
                        padding: '9px 32px',
                        borderRadius: 28,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#D92D20',
                        fontWeight: 700,
                        fontSize: 13,
                        border: '1px solid rgba(120,113,108,0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        letterSpacing: '0.3px',
                    }}
                >
                    {skipLabel}
                </button>
            )}
        </div>
    );
}
