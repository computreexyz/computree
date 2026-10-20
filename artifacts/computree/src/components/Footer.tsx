import { ComputreeLogo } from './ComputreeLogo';

const groups = [
  { title: 'PRODUCT', links: [['How It Works', '#how-it-works'], ['Compute', '#compute'], ['Infrastructure', '#infrastructure'], ['Dashboard', '#transparency']] },
  { title: 'DEVELOPERS', links: [['Documentation', '/docs'], ['API Reference', '/docs'], ['Examples', '#applications'], ['GitHub', 'https://github.com/computreexyz']] },
  { title: 'NETWORK', links: [['Staking', '#ctree'], ['Treasury', '#treasury'], ['Providers', '#providers'], ['Compute', '#compute']] },
  { title: 'RESOURCES', links: [['Status', '#resources'], ['FAQ', '#resources'], ['Terms', '#resources'], ['Privacy', '#resources']] },
];

export function Footer() {
  return (
    <footer className="site-footer" id="resources">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <a href="#top" aria-label="Computree home" data-testid="link-footer-home"><ComputreeLogo /></a>
            <p>GPU compute access infrastructure.</p>
            <a className="footer-description" href="#product" data-testid="link-footer-product">Access NVIDIA GPU compute through a programmable API.</a>
          </div>
          {groups.map((group) => (
            <div className="footer-group" key={group.title}>
              <h2>{group.title}</h2>
              {group.links.map(([label, href], index) => <a key={`${label}-${index}`} href={href} data-testid={`link-footer-${group.title.toLowerCase()}-${index}`}>{label}</a>)}
            </div>
          ))}
          <div className="footer-group footer-social">
            <h2>FOLLOW</h2>
            <a href="https://x.com/computreexyz" target="_blank" rel="noreferrer" data-testid="link-footer-x">X</a><a href="#resources" data-testid="link-footer-discord">Discord</a><a href="https://github.com/computreexyz" target="_blank" rel="noreferrer" data-testid="link-footer-github">GitHub</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Computree. All rights reserved.</span>
          <span className="footer-bottom-note">GPU compute access infrastructure.</span>
          <a href="#top" data-testid="link-footer-top">BACK TO TOP <span aria-hidden="true">↑</span></a>
        </div>
      </div>
    </footer>
  );
}
