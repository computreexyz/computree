import { useEffect } from 'react';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import {
  ApiSection,
  ApplicationSection,
  ArchitectureSection,
  CTREEAllocation,
  ComputeFlow,
  DailyReset,
  ExpansionSection,
  FinalCTA,
  Hero,
  InfrastructureIntro,
  InfrastructureSection,
  IntroductionSection,
  ModelSection,
  NvidiaSection,
  ProviderNetwork,
  TokenFlowSection,
  TransparencySection,
  TreasurySection,
  WorkloadSection,
} from '@/components/LandingSections';

function App() {
  useEffect(() => {
    const isProtectedMedia = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest('img, svg, canvas, video, [data-protect-media]'));
    const preventMediaContextMenu = (event: MouseEvent) => {
      if (isProtectedMedia(event.target)) event.preventDefault();
    };
    const preventMediaDrag = (event: DragEvent) => {
      if (isProtectedMedia(event.target)) event.preventDefault();
    };

    document.addEventListener('contextmenu', preventMediaContextMenu, true);
    document.addEventListener('dragstart', preventMediaDrag, true);
    return () => {
      document.removeEventListener('contextmenu', preventMediaContextMenu, true);
      document.removeEventListener('dragstart', preventMediaDrag, true);
    };
  }, []);

  return (
    <div className="page">
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        <Hero />
        <IntroductionSection />
        <InfrastructureIntro />
        <ComputeFlow />
        <CTREEAllocation />
        <DailyReset />
        <ApplicationSection />
        <ApiSection />
        <InfrastructureSection />
        <NvidiaSection />
        <ProviderNetwork />
        <TransparencySection />
        <TreasurySection />
        <WorkloadSection />
        <ArchitectureSection />
        <TokenFlowSection />
        <ExpansionSection />
        <ModelSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
