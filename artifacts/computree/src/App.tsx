import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { Redirect, Route, Switch } from 'wouter';
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
import { AppShell } from '@/app/AppShell';
import { robinhoodChain } from '@/app/chain';
import { RequireAuth } from '@/app/RequireAuth';
import Docs from '@/pages/docs';
import Compute from '@/app/pages/Compute';
import Images from '@/app/pages/Images';
import Jobs from '@/app/pages/Jobs';
import Keys from '@/app/pages/Keys';
import Network from '@/app/pages/Network';
import Overview from '@/app/pages/Overview';
import Playground from '@/app/pages/Playground';
import Settings from '@/app/pages/Settings';
import Treasury from '@/app/pages/Treasury';
import Workloads from '@/app/pages/Workloads';

try {
  if (localStorage.getItem('ctree_reduced_motion') === '1') {
    document.documentElement.dataset.reducedMotion = 'true';
  }
} catch {
  /* storage unavailable */
}

const queryClient = new QueryClient();

const PRIVY_APP_ID =
  (import.meta.env.VITE_PRIVY_APP_ID as string | undefined) ?? 'cmvdv9wcc048g0fl0dlvz8b0c';

function Landing() {
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

function AppArea() {
  return (
    <RequireAuth>
      <AppShell>
        <Switch>
          <Route path="/app" component={Overview} />
          <Route path="/app/compute" component={Compute} />
          <Route path="/app/playground" component={Playground} />
          <Route path="/app/images" component={Images} />
          <Route path="/app/workloads" component={Workloads} />
          <Route path="/app/jobs" component={Jobs} />
          <Route path="/app/keys" component={Keys} />
          <Route path="/app/network" component={Network} />
          <Route path="/app/treasury" component={Treasury} />
          <Route path="/app/settings" component={Settings} />
          <Route>
            <Redirect to="/app" />
          </Route>
        </Switch>
      </AppShell>
    </RequireAuth>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          loginMethods: ['wallet', 'email'],
          appearance: { accentColor: '#151a21' },
          defaultChain: robinhoodChain,
          supportedChains: [robinhoodChain],
          embeddedWallets: {
            ethereum: { createOnLogin: 'users-without-wallets' },
          },
        }}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/docs" component={Docs} />
            <Route path="/app">
              <AppArea />
            </Route>
            <Route path="/app/:rest*">
              <AppArea />
            </Route>
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </ThemeProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
}

export default App;
