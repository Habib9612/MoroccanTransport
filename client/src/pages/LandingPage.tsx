import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiTruckersmp } from "react-icons/si";
import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <SiTruckersmp className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Revolutionizing Freight Logistics in Morocco
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Connect with reliable carriers, track shipments in real-time, and optimize your logistics operations with our intelligent digital ecosystem.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Real-Time Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your shipments in real-time with advanced GPS tracking and instant updates.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Smart Matching</h3>
              <p className="text-muted-foreground">
                Our AI-powered system matches you with the most suitable carriers for your specific needs.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Dynamic Pricing</h3>
              <p className="text-muted-foreground">
                Get competitive rates with our dynamic pricing system based on real-time market conditions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Logistics?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join our platform and experience the future of freight transportation in Morocco.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg">
              Start Shipping Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
