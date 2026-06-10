import SiteHeader, { type SiteHeaderProps } from '@/components/SiteHeader';

export type NavbarProps = SiteHeaderProps;

export default function Navbar(props: NavbarProps) {
  return <SiteHeader {...props} />;
}
