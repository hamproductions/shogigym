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
  orbit: 'M12 5c5 0 9 3.1 9 7s-4 7-9 7-9-3.1-9-7 4-7 9-7zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 3l2 2-2 2',
  fullscreen: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5',
  exitFullscreen: 'M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5',
  tilt: 'M6.5 5h11l3.5 14H3zM10.2 5l-1.4 14M13.8 5l1.4 14M4.8 10.5h14.4M3.9 14.5h16.2',
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
  gear: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
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
