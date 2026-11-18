import { useState } from 'react';
import { ArrowUpRight, Download, Heart, Share } from './Icons.jsx';
import { downloadGpx, downloadKml, googleMapsUrl } from '../lib/export.js';
import { useSaved } from '../lib/saved.js';

/** Save, Open in Google Maps, GPX, KML, Share: everything someone needs to follow the route. */
export default function ExportPanel({ route }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(route.slug);
  const [copied, setCopied] = useState(false);
  const gmaps = googleMapsUrl(route);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: route.title, text: route.tagline || route.summary, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the share sheet was dismissed */
    }
  };

  return (
    <div className="actions">
      <button type="button" className={`btn ${saved ? 'btn--saved' : 'btn--ghost'}`} onClick={() => toggle(route.slug)} aria-pressed={saved}>
        <Heart filled={saved} /> {saved ? 'Saved' : 'Save'}
      </button>
      {gmaps && (
        <a className="btn btn--sun" href={gmaps} target="_blank" rel="noopener noreferrer">
          Open in Google Maps <ArrowUpRight />
        </a>
      )}
      <button type="button" className="btn btn--lake" onClick={() => downloadGpx(route)}>
        <Download /> GPX
      </button>
      <button type="button" className="btn btn--ghost" onClick={() => downloadKml(route)}>
        <Download /> KML
      </button>
      <button type="button" className="btn btn--ghost" onClick={share}>
        <Share /> {copied ? 'Link copied' : 'Share'}
      </button>
    </div>
  );
}
