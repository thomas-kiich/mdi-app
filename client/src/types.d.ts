// Globale Typen
declare module 'streamdown' {
  const Streamdown: React.FC<{ children: string }>;
  export { Streamdown };
}

interface Window {
  webkitAudioContext: typeof AudioContext;
}
