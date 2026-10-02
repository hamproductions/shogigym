const paths = {
  study: 'M3 5.5C6 4 9 4 12 6c3-2 6-2 9-.5V19c-3-1.5-6-1.5-9 .5-3-2-6-2-9-.5zM12 6v13.5',
  spar: 'M5 4l9 9M4 9l5-5M15 13l-2 2 5 5 2-2zM19 4l-9 9M20 9l-5-5M9 13l2 2-5 5-2-2z',
  analyze: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L21 21',
  engine: 'M4 18a8 8 0 1 1 16 0M12 18l4-6M8 18h8',
  coach: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5',
  flow: 'M9 3h6v5H9zM3 16h6v5H3zM15 16h6v5h-6zM12 8v4M6 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2',
  moves: 'M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1',
  library: 'M4 4h4v16H4zM10 4h4v16h-4zM16 5l3.5-1 3 15.5-3.5 1z',
  flip: 'M7 4v16M4 7l3-3 3 3M17 20V4M14 17l3 3 3-3',
  tilt: 'M3 17l9 4 9-4M3 17l3-11h12l3 11M8 6l-2 15M16 6l2 15',
  command: 'M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z',
  first: 'M6 5v14M18 5l-9 7 9 7z',
  prev: 'M16 5l-9 7 9 7z',
  next: 'M8 5l9 7-9 7z',
  last: 'M18 5v14M6 5l9 7-9 7z',
  play: 'M7 4l13 8-13 8z',
  pause: 'M7 4h3v16H7zM14 4h3v16h-3z',
  review: 'M5 4h11v14H5zM8 8h5M8 11h5M19 7v14H8',
  tsume: 'M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2 8 12.7 4 8.8l5.5-.8z',
  escape: 'M12 3l3 3h-2v4h-2V6H9zM3 12l3-3v2h4v2H6v2zM21 12l-3 3v-2h-4v-2h4V9zM12 21l-3-3h2v-4h2v4h2z',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1L15 3.5h-4l-.3 2.5a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.5 7.5 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.4z',
  reset: 'M4 12a8 8 0 1 0 2.5-5.8M4 4v5h5',
  panel: 'M3 4h18v16H3zM15 4v16',
}

export type IconName = keyof typeof paths

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}
