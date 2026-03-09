import SEO from '../SEO';

export default function SEOExample() {
  return (
    <div className="p-6">
      <SEO
        title="Profit Margin Calculator - TymFlo Hub"
        description="Calculate profit margins quickly and easily with our free tool."
        canonical="https://tymflohub.com/tools/profit-margin"
      />
      <p className="text-sm text-muted-foreground">
        SEO component applied (check document title and meta tags in DevTools)
      </p>
    </div>
  );
}
