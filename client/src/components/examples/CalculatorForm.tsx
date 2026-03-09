import CalculatorForm from '../CalculatorForm';

export default function CalculatorFormExample() {
  const fields = [
    { name: 'cost', label: 'Cost Price', placeholder: '0.00', prefix: '$' },
    { name: 'price', label: 'Selling Price', placeholder: '0.00', prefix: '$' },
  ];

  return (
    <div className="p-6 max-w-md">
      <CalculatorForm
        fields={fields}
        onCalculate={(values) => console.log('Calculate:', values)}
      />
    </div>
  );
}
