import { registerRoot, Composition } from 'remotion';
import { DashboardAd } from './DashboardAdV2';
import { FusionCreativeShootDay } from './FusionCreativeShootDay';
import { InstagramBeforeAfter } from './InstagramBeforeAfter';
import { SmokedSmashedMenu } from './SmokedSmashedMenu';
import { SmokedSmashedMenuWide } from './SmokedSmashedMenuWide';
import { ARMenuPromo } from './ARMenuPromo';
import { NewGreekCaseStudyAd } from './NewGreekCaseStudyAd';
import { ARMenuAd } from './ARMenuAd';
import { ARMenuCarouselSlide1, ARMenuCarouselSlide2, ARMenuCarouselSlide3, ARMenuCarouselSlide4, ARMenuCarouselSlide5 } from './ARMenuCarousel';
import { NewGreekBakeryMenu } from './NewGreekBakeryMenu';
import { NewGreekBakeryPopupReminder } from './NewGreekBakeryPopupReminder';

function Root() {
  return (
    <>
      <Composition
        id="ARMenuAd"
        component={ARMenuAd}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ARMenuAd4x5"
        component={ARMenuAd}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1350}
      />
      <Composition id="ARCarousel1" component={ARMenuCarouselSlide1} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="ARCarousel2" component={ARMenuCarouselSlide2} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="ARCarousel3" component={ARMenuCarouselSlide3} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="ARCarousel4" component={ARMenuCarouselSlide4} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="ARCarousel5" component={ARMenuCarouselSlide5} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition
        id="ARMenuPromo"
        component={ARMenuPromo}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="NewGreekCaseStudy"
        component={NewGreekCaseStudyAd}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="NewGreekCaseStudySquare"
        component={NewGreekCaseStudyAd}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="NewGreekCaseStudy4x5"
        component={NewGreekCaseStudyAd}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1350}
      />
      <Composition
        id="ARMenuPromoSquare"
        component={ARMenuPromo}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="DashboardAd"
        component={DashboardAd}
        durationInFrames={1650}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FusionCreativeShootDay"
        component={FusionCreativeShootDay}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="InstagramBeforeAfter"
        component={InstagramBeforeAfter}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SmokedSmashedMenu"
        component={SmokedSmashedMenu}
        durationInFrames={1210}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="SmokedSmashedMenuWide"
        component={SmokedSmashedMenuWide}
        durationInFrames={1210}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="NewGreekBakeryMenu"
        component={NewGreekBakeryMenu}
        durationInFrames={810}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="NewGreekBakeryPopupReminder"
        component={NewGreekBakeryPopupReminder}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
}

registerRoot(Root);
