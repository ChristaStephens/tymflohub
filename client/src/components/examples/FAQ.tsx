import FAQ from '../FAQ';

export default function FAQExample() {
  const faqItems = [
    {
      question: 'How does the profit margin calculator work?',
      answer: 'Simply enter your cost price and selling price, and the calculator will automatically compute your profit margin, markup percentage, and profit amount.',
    },
    {
      question: 'Is this tool really free?',
      answer: 'Yes! You can use up to 5 tools per day for free. Upgrade to Pro for unlimited access.',
    },
    {
      question: 'Do you store my calculation data?',
      answer: 'No, all calculations are performed in your browser. We do not store or track your input data.',
    },
  ];

  return (
    <div className="p-6 max-w-2xl">
      <FAQ items={faqItems} />
    </div>
  );
}
