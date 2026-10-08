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
