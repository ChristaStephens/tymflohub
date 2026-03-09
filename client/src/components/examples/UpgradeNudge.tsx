import { useState } from 'react';
import UpgradeNudge from '../UpgradeNudge';
import { Button } from '@/components/ui/button';

export default function UpgradeNudgeExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)}>Show Upgrade Dialog</Button>
      <UpgradeNudge open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
