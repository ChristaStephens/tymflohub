import { useState } from 'react';
import ResultPanel from '../ResultPanel';
import { Button } from '@/components/ui/button';

export default function ResultPanelExample() {
  const [hasResults, setHasResults] = useState(false);

  const results = [
    { label: 'Profit Margin', value: '33.33', unit: '%', primary: true },
    { label: 'Profit Amount', value: '$10.00' },
    { label: 'Markup', value: '50.00', unit: '%' },
  ];

  return (
    <div className="p-6 max-w-md">
      <div className="mb-4">
        <Button onClick={() => setHasResults(!hasResults)}>
          {hasResults ? 'Hide Results' : 'Show Results'}
        </Button>
      </div>
      <ResultPanel results={hasResults ? results : null} />
    </div>
  );
}
