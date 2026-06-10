'use client';

import { DcMilestoneList, DcProgressBar } from '@/components/dubicolt/dashboard-ui';

export function OrderShipmentTracker({
  milestones,
  progressStep,
}: {
  milestones: { label: string; detail?: string; date?: string; done?: boolean; active?: boolean }[];
  progressStep?: number;
}) {
  return (
    <div className="space-y-5">
      {progressStep ? <DcProgressBar step={progressStep} /> : null}
      <DcMilestoneList milestones={milestones} />
    </div>
  );
}
