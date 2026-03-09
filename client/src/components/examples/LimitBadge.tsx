import LimitBadge from '../LimitBadge';

export default function LimitBadgeExample() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center gap-4">
        <span className="text-sm">Normal usage:</span>
        <LimitBadge current={2} limit={5} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">Near limit:</span>
        <LimitBadge current={4} limit={5} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">At limit:</span>
        <LimitBadge current={5} limit={5} />
      </div>
    </div>
  );
}
