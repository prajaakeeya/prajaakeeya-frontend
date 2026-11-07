import { useEffect } from 'react';

/** Fade out and remove the #preloader splash rendered by index.html. */
export function dismissPreloader(): void {
    const el = document.getElementById('preloader');
    if (!el) return;
    el.classList.add('exit');
    setTimeout(() => el.remove(), 750);
}

/**
 * Mount near the top of the app tree. Skips the web splash inside the
 * React Native WebView, which has its own native splash screen.
 */
export default function Preloader(): null {
    useEffect(() => {
        if (/ReactNative/i.test(navigator.userAgent)) {
            document.getElementById('preloader')?.remove();
        }
    }, []);

    return null;
}
