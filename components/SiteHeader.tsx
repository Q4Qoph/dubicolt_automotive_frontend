import { MarketingHeader } from '@/components/dubicolt/marketing-shell';

export interface SiteHeaderProps {
  className?: string;
}

export default function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <div className={className}>
      <MarketingHeader />
    </div>
  );
}

export { MarketingHeader };
