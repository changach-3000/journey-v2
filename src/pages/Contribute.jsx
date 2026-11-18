import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RouteCover from '../components/RouteCover.jsx';
import { Check, Upload } from '../components/Icons.jsx';
import { HAS_CONVEX, useSubmitRoute } from '../lib/data.jsx';
import { parseGpx } from '../lib/export.js';
import { encodePolyline, lengthKm, previewLine, simplifyLine } from '../lib/geo.js';
import { ACTIVITY } from '../lib/tone.js';
import { SITE } from '../siteConfig.js';

const clean = (e) => (e?.message || 'Something went wrong. Please try again.').replace(/^.*Uncaught Error:\s*/s, '').split('\n')[0];

export default function Contribute() {
  const submit = useSubmitRoute();
  const [f, setF] = useState({ title: '', region: '', country: 'Kenya', activity: 'road-trip', summary: '', story: '', tips: '', name: '', website: '' });
  const [gpx, setGpx] = useState(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | done

  useEffect(() => {
    document.title = `Add a route · ${SITE.name}`;
  }, []);
  const on = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const readFile = async (file) => {
    setError('');
    if (!file) return;
    try {
      const { name, coords, waypoints } = parseGpx(await file.text());
      const line = simplifyLine(coords, 0.0003);
      const first = coords[0];
      const last = coords[coords.length - 1];
      const stops = (waypoints.length
        ? waypoints
        : [
            { name: 'Start', lat: first[1], lng: first[0] },
            { name: 'Finish', lat: last[1], lng: last[0] },
          ]
      ).slice(0, 60);
      setGpx({ fileName: file.name, path: encodePolyline(line), preview: encodePolyline(previewLine(coords)), distanceKm: Math.round(lengthKm(coords)), stops, points: coords.length });
      if (name && !f.title) setF((s) => ({ ...s, title: name }));
    } catch (e) {
      setGpx(null);
      setError(e.message);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (f.website) return; // hidden field: only bots fill it in
    if (!gpx) return setError('Please add your route as a GPX file first.');
    setError('');
    setState('sending');
    try {
      await submit({
        title: f.title,
        region: f.region,
        country: f.country,
        activity: f.activity,
        summary: f.summary,
        story: f.story || undefined,
        path: gpx.path,
        preview: gpx.preview,
        distanceKm: gpx.distanceKm,
        stops: gpx.stops,
        tips: f.tips.split('\n').map((t) => t.trim()).filter(Boolean),
        submittedBy: f.name.trim() || undefined,
      });
      setState('done');
    } catch (err) {
      setError(clean(err));
      setState('idle');
    }
  };

  if (state === 'done') {
    return (
      <div className="wrap" style={{ paddingBlock: '3rem' }}>
        <div className="success">
          <span className="sticker sticker--tilt sticker--lake"><Check width={14} height={14} /> Received</span>
          <h2>Thank you!</h2>
          <p>Your route is in the review queue. Once it’s been checked it will appear in the collection.{!HAS_CONVEX && ' (Backend not connected yet, so this was saved in your browser only.)'}</p>
          <Link to="/routes" className="btn">Back to the routes</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="page-head">
        <p className="eyebrow">Contribute</p>
        <h1>Add your route.</h1>
        <p>Share a journey you’ve actually travelled. Upload the GPX from your phone or watch, tell us what it was like, and we’ll review it before it goes live.</p>
      </div>

      <form className="form" onSubmit={onSubmit} noValidate>
        <div className="field">
          <span className="label">Your route (GPX file)</span>
          <label
            className={`drop${over ? ' is-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); readFile(e.dataTransfer.files?.[0]); }}
          >
            <Upload width={28} height={28} />
            <strong>{gpx ? gpx.fileName : 'Drop a .gpx file here, or tap to choose'}</strong>
            <span className="hint">Most tracking apps (Strava, Komoot, AllTrails, Google Earth, Garmin) can export GPX.</span>
            <input type="file" accept=".gpx,application/gpx+xml,.xml" className="visually-hidden" onChange={(e) => readFile(e.target.files?.[0])} />
          </label>
        </div>

        {gpx && (
          <div className="preview">
            <RouteCover route={{ title: f.title || 'Your route', path: gpx.path, preview: gpx.preview, color: 'sun' }} detailed />
            <div>
              <p style={{ font: '800 1.5rem/1.1 var(--display)' }}>{gpx.distanceKm.toLocaleString('en-GB')} km</p>
              <p className="hint">{gpx.points.toLocaleString('en-GB')} points · {gpx.stops.length} named {gpx.stops.length === 1 ? 'place' : 'places'}</p>
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor="title">Route name</label>
          <input id="title" className="input" value={f.title} onChange={on('title')} placeholder="e.g. Lake Bogoria at sunset" required />
        </div>

        <div className="row2">
          <div className="field">
            <label htmlFor="region">Region</label>
            <input id="region" className="input" value={f.region} onChange={on('region')} placeholder="e.g. Rift Valley" required />
          </div>
          <div className="field">
            <label htmlFor="country">Country</label>
            <input id="country" className="input" value={f.country} onChange={on('country')} required />
          </div>
        </div>

        <div className="field">
          <span className="label">Type of route</span>
          <div className="filters__row" role="radiogroup" aria-label="Type of route">
            {Object.entries(ACTIVITY).map(([k, label]) => (
              <button key={k} type="button" role="radio" aria-checked={f.activity === k} className="chip" aria-pressed={f.activity === k} onClick={() => setF((s) => ({ ...s, activity: k }))}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="summary">The short version <span className="hint">(1–2 sentences)</span></label>
          <textarea id="summary" className="textarea" style={{ minHeight: 90 }} value={f.summary} onChange={on('summary')} maxLength={2000} required />
        </div>
        <div className="field">
          <label htmlFor="story">The story <span className="hint">(optional; leave a blank line between paragraphs)</span></label>
          <textarea id="story" className="textarea" style={{ minHeight: 180 }} value={f.story} onChange={on('story')} />
        </div>
        <div className="field">
          <label htmlFor="tips">Tips for the next person <span className="hint">(optional; one per line)</span></label>
          <textarea id="tips" className="textarea" value={f.tips} onChange={on('tips')} placeholder={'Fuel up before the last stretch\nThe road gets rough after the gate'} />
        </div>
        <div className="field">
          <label htmlFor="name">Your name or handle <span className="hint">(optional)</span></label>
          <input id="name" className="input" value={f.name} onChange={on('name')} />
        </div>
        <p className="hint">Photos and video are coming soon; for now we’ll get in touch if we’d like to feature yours.</p>

        <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={f.website} onChange={on('website')} />

        {error && <p className="error" role="alert">{error}</p>}
        <div>
          <button className="btn" type="submit" disabled={state === 'sending' || !f.title || !f.summary || !f.region}>
            {state === 'sending' ? 'Sending…' : 'Submit for review'}
          </button>
        </div>
      </form>
    </div>
  );
}
