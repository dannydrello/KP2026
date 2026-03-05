
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { XCircle, ArrowLeft, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const PaymentFailurePage = () => {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || 'The payment could not be processed at this time.';

  return (
    <>
      <Helmet>
        <title>{`Payment Failed - Kitchen Pastries`}</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow pt-32 pb-16 bg-background flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-lg">
            <Card className="rounded-2xl shadow-soft-xl border-border overflow-hidden border-t-4 border-t-destructive">
              <CardContent className="p-8 sm:p-12 text-center space-y-6">
                
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <XCircle className="w-12 h-12 text-destructive" />
                </div>
                
                <h1 className="text-3xl font-bold text-foreground">Payment Failed</h1>
                
                <div className="bg-secondary rounded-lg p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Reason for failure:</p>
                  <p>{decodeURIComponent(reason)}</p>
                </div>

                <p className="text-muted-foreground">
                  Don't worry, no charges were made to your account. You can try again with a different payment method.
                </p>

                <div className="flex flex-col gap-3 pt-6">
                  <Link to="/checkout" className="w-full">
                    <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft transition-smooth">
                      <RefreshCcw className="mr-2 w-5 h-5" /> Retry Payment
                    </Button>
                  </Link>
                  <Link to="/cart" className="w-full">
                    <Button variant="outline" size="lg" className="w-full">
                      <ArrowLeft className="mr-2 w-5 h-5" /> Return to Cart
                    </Button>
                  </Link>
                </div>

              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PaymentFailurePage;
