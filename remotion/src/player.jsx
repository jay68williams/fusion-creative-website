import React from 'react';
import { createRoot } from 'react-dom/client';
import { Player } from '@remotion/player';
import { DashboardAd } from './DashboardAd';

function DashboardAdPlayer() {
  return React.createElement(Player, {
    component: DashboardAd,
    durationInFrames: 1650,
    compositionWidth: 1920,
    compositionHeight: 1080,
    fps: 30,
    autoPlay: true,
    loop: true,
    controls: false,
    style: {
      width: '100%',
      aspectRatio: '16/9',
    },
  });
}

function mount() {
  const el = document.getElementById('remotion-player');
  if (el) {
    const root = createRoot(el);
    root.render(React.createElement(DashboardAdPlayer));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
