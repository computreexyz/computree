import { useWallets } from '@privy-io/react-auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createWalletClient,
  custom,
  type Account,
  type Address,
  type CustomTransport,
  type Hash,
  type WalletClient,
} from 'viem';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { robinhoodChain } from '../chain';
import { FeatureBanner } from '../components/FeatureBanner';
import { StakingArt } from '../components/AppVisuals';
import { CountUp } from '../components/CountUp';
import { Panel } from '../components/StatusPill';
import { useAllocation, useDemoMode } from '../mock/hooks';
import {
  addressUrl,
  parseNvdaAmount,
  readStakingPosition,
  STAKE_TOKEN_ADDRESS,
  STAKE_VAULT_ADDRESS,
  stakeTokenAbi,
  stakingPublicClient,
  stakingVaultAbi,
  truncateAddress,
  txErrorReason,
  txUrl,
} from '../lib/staking';

type SigningClient = WalletClient<CustomTransport, typeof robinhoodChain, Account>;

type TxPhase = 'confirm' | 'pending';

interface TxStatus {
  action: string;
  step: string;
  phase: TxPhase;
  hash?: Hash;
}

function AddressLink({ address, label }: { address: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 28 }}>
      <span className="app-meta">{label}</span>
      <a
        className="mono"
        style={{ fontSize: 10, color: 'var(--asub)', textDecoration: 'none' }}
        href={addressUrl(address)}
        target="_blank"
        rel="noreferrer"
        data-testid={`link-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {truncateAddress(address)} ↗
      </a>
    </div>
  );
}

function AmountInput({
  value,
  onChange,
  onMax,
  testId,
}: {
  value: string;
  onChange: (v: string) => void;
  onMax: () => void;
  testId: string;
}) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        className="pg-select"
        style={{ height: 38, fontFamily: 'var(--app-font-mono)', fontSize: 12 }}
        type="text"
        inputMode="decimal"
        placeholder="0.0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testId}
      />
      <button className="app-filter-chip" onClick={onMax} data-testid={`${testId}-max`}>
        MAX
      </button>
    </div>
  );
}

export default function Stake() {
  const queryClient = useQueryClient();
  const { wallets } = useWallets();
  const [demo] = useDemoMode();
  const { data: allocation } = useAllocation();

  const wallet = wallets[0];
  const address = wallet?.address as Address | undefined;
  const readOnly = !address;

  const { data: position } = useQuery({
    queryKey: ['stake', 'position', address],
    queryFn: () => readStakingPosition(address as Address),
    enabled: !!address,
    refetchInterval: 30_000,
  });

  const staked = position?.stakedBalance ?? 0;
  const walletBalance = position?.walletBalance ?? 0;

  const [tx, setTx] = useState<TxStatus | null>(null);
  const [lastTx, setLastTx] = useState<{ label: string; hash: Hash } | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  const busy = tx !== null;

  const getWalletClient = useCallback(async (): Promise<SigningClient> => {
    if (!wallet) throw new Error('No wallet connected');
    const chainId = Number(wallet.chainId.split(':')[1]);
    if (chainId !== robinhoodChain.id) {
      await wallet.switchChain(robinhoodChain.id);
    }
    const provider = await wallet.getEthereumProvider();
    return createWalletClient({
      account: wallet.address as Address,
      chain: robinhoodChain,
      transport: custom(provider),
    });
  }, [wallet]);

  const runAction = useCallback(
    async (
      action: string,
      steps: Array<{ step: string; run: (client: SigningClient) => Promise<Hash> }>,
    ) => {
      if (busy) return;
      try {
        const client = await getWalletClient();
        let hash: Hash | undefined;
        for (const { step, run } of steps) {
          setTx({ action, step, phase: 'confirm' });
          hash = await run(client);
          setTx({ action, step, phase: 'pending', hash });
          const receipt = await stakingPublicClient.waitForTransactionReceipt({ hash });
          if (receipt.status !== 'success') throw new Error(`${step} reverted on-chain`);
        }
        if (hash) setLastTx({ label: action, hash });
        toast.success(`${action} confirmed`);
        queryClient.invalidateQueries({ queryKey: ['stake', 'position'] });
        queryClient.invalidateQueries({ queryKey: ['app', 'me'] });
        queryClient.invalidateQueries({ queryKey: ['app', 'allocation'] });
      } catch (err) {
        toast.error(txErrorReason(err));
      } finally {
        setTx(null);
      }
    },
    [busy, getWalletClient, queryClient],
  );

  const stake = useCallback(() => {
    const amount = parseNvdaAmount(stakeAmount);
    if (!amount) return;
    return runAction('Stake', [
      {
        step: 'approve',
        run: (client) =>
          client.writeContract({
            address: STAKE_TOKEN_ADDRESS,
            abi: stakeTokenAbi,
            functionName: 'approve',
            args: [STAKE_VAULT_ADDRESS, amount],
          }),
      },
      {
        step: 'stake',
        run: (client) =>
          client.writeContract({
            address: STAKE_VAULT_ADDRESS,
            abi: stakingVaultAbi,
            functionName: 'stake',
            args: [amount],
          }),
      },
    ]);
  }, [runAction, stakeAmount]);

  const unstake = useCallback(() => {
    const amount = parseNvdaAmount(unstakeAmount);
    if (!amount) return;
    return runAction('Unstake', [
      {
        step: 'unstake',
        run: (client) =>
          client.writeContract({
            address: STAKE_VAULT_ADDRESS,
            abi: stakingVaultAbi,
            functionName: 'unstake',
            args: [amount],
          }),
      },
    ]);
  }, [runAction, unstakeAmount]);

  const stakeParsed = parseNvdaAmount(stakeAmount);
  const stakeValid = stakeParsed !== null && Number(stakeParsed / 10n ** 16n) / 100 <= walletBalance;
  const unstakeParsed = parseNvdaAmount(unstakeAmount);
  const unstakeValid = unstakeParsed !== null && Number(unstakeParsed / 10n ** 16n) / 100 <= staked;

  const buttonLabel = (idle: string, step: string) => {
    if (tx && tx.step === step) {
      return tx.phase === 'confirm' ? `CONFIRM ${step.toUpperCase()}…` : `${step.toUpperCase()} PENDING…`;
    }
    if (tx) return 'WAITING…';
    return idle;
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <FeatureBanner
        feature="stake"
        title="Stake"
        meta="Your daily GPU allocation is always active — staking tokenized NVDA is optional"
      />

      {readOnly ? (
        <div className="app-panel app-panel-body" data-testid="banner-readonly">
          <span className="app-sub">
            Connect a wallet to stake — demo mode shows read-only data.
          </span>
        </div>
      ) : null}

      {/* --------------------------- position --------------------------- */}
      <section className="app-panel app-panel-hero app-card-dark" data-testid="card-position">
        <div className="ov-hero-art" aria-hidden="true"><StakingArt dark /></div>
        <div className="app-panel-body ov-hero-grid">
          <div>
            <span className="app-meta">Staked position</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
              <span className="app-big" style={{ fontSize: 42 }} data-testid="text-staked-balance">
                <CountUp value={staked} format={(n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 })} />
              </span>
              <span style={{ font: '500 15px var(--afont)', color: 'var(--ameta)' }}>NVDA staked</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <span className="status-pill" data-testid="pill-eligible">ALLOCATION ACTIVE</span>
            </div>
          </div>
          <div className="ov-hero-side">
            <div>
              <span className="app-meta">Wallet balance</span>
              <b data-testid="text-wallet-balance">{walletBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })} NVDA</b>
            </div>
            <div>
              <span className="app-meta">Daily allocation</span>
              <b>{allocation ? `${allocation.used} / ${allocation.total} CR used` : '—'}</b>
            </div>
            <div>
              <span className="app-meta">Total staked network-wide</span>
              <b className="mono">{(position?.totalStaked ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} NVDA</b>
            </div>
          </div>
        </div>
      </section>

      {lastTx ? (
        <div className="app-meta">
          LAST TX · {lastTx.label.toUpperCase()} ·{' '}
          <a className="mono" style={{ fontSize: 10, color: 'var(--asub)' }} href={txUrl(lastTx.hash)} target="_blank" rel="noreferrer" data-testid="link-last-tx">
            {truncateAddress(lastTx.hash)} ↗
          </a>
        </div>
      ) : null}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' }}>
        {/* ----------------------------- stake ----------------------------- */}
        <Panel title="Stake" flush={false}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="app-meta">AMOUNT · NVDA</span>
              <span className="app-meta">BALANCE {walletBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
            </div>
            <AmountInput
              value={stakeAmount}
              onChange={setStakeAmount}
              onMax={() => setStakeAmount(String(walletBalance))}
              testId="input-stake-amount"
            />
            <div>
              <button
                className="button button-dark"
                style={{ minHeight: 38 }}
                onClick={() => void stake()}
                disabled={readOnly || busy || !stakeValid}
                data-testid="button-stake"
              >
                {tx && (tx.step === 'approve' || tx.step === 'stake')
                  ? tx.phase === 'confirm'
                    ? `CONFIRM ${tx.step.toUpperCase()}…`
                    : `${tx.step.toUpperCase()} PENDING…`
                  : tx
                    ? 'WAITING…'
                    : 'Stake'}
              </button>
            </div>
            <div className="app-meta">APPROVE → STAKE · TWO WALLET CONFIRMATIONS</div>
          </div>

          <div style={{ borderTop: '1px solid var(--ahair)', margin: '14px 0' }} />

          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="app-meta">UNSTAKE · NVDA</span>
              <span className="app-meta">STAKED {staked.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
            </div>
            <AmountInput
              value={unstakeAmount}
              onChange={setUnstakeAmount}
              onMax={() => setUnstakeAmount(String(staked))}
              testId="input-unstake-amount"
            />
            <div>
              <button
                className="button button-outline"
                style={{ minHeight: 38 }}
                onClick={() => void unstake()}
                disabled={readOnly || busy || !unstakeValid}
                data-testid="button-unstake"
              >
                {buttonLabel('Unstake', 'unstake')}
              </button>
            </div>
          </div>
        </Panel>

        {/* -------------------------- how it works -------------------------- */}
        <Panel title="How it works" flush={false}>
          <div style={{ display: 'grid', gap: 0 }}>
            {[
              ['01', 'Connect a wallet', 'A daily 1,000 CR allocation activates automatically for every connected wallet — no minimum stake.'],
              ['02', 'Stake tokenized NVDA (optional)', 'Tokens move into the staking vault on Robinhood Chain mainnet — you can unstake any time.'],
              ['03', 'Spend credits anywhere', 'Playground, Images, Workloads, and the GPU API all draw from the same allocation.'],
            ].map(([num, title, body]) => (
              <div key={num} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--ahair)' }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ameta)', paddingTop: 2 }}>{num}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
                  <div className="app-meta" style={{ marginTop: 3 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'grid', gap: 2 }}>
            <AddressLink label="Token contract" address={STAKE_TOKEN_ADDRESS} />
            <AddressLink label="Staking vault" address={STAKE_VAULT_ADDRESS} />
          </div>
          <div className="mono" style={{ marginTop: 10, fontSize: 9, letterSpacing: '.06em', color: 'var(--ameta)' }}>
            POSITION IS READ FROM THE STAKING VAULT ON EVERY REQUEST
          </div>
        </Panel>
      </div>
    </div>
  );
}
