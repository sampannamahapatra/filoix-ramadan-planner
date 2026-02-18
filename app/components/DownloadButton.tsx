'use client';

import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';
import { useCallback } from 'react';

export default function DownloadButton({ targetId }: { targetId: string }) {
    const handleDownload = useCallback(() => {
        const node = document.getElementById(targetId);
        if (!node) return;

        toPng(node, {
            cacheBust: true,
            backgroundColor: '#022c22',
            pixelRatio: 2
        })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'ramadan-schedule.png';
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error('Failed to download image', err);
            });
    }, [targetId]);

    return (
        <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors text-sm font-medium"
        >
            <Download size={16} />
            ছবি হিসেবে সেভ করুন
        </button>
    );
}
