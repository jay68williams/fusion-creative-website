import { registerRoot, Composition } from 'remotion';
import { DashboardAd } from './DashboardAdV2';

function Root() {
  return (
    <Composition
      id="DashboardAd"
      component={DashboardAd}
      durationInFrames={1650}
      fps={30}
      width={1920}
      height={1080}
    />
  );
}

registerRoot(Root);
