import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useUser } from "@/hooks/use-user";

export default function Home() {
  const { user } = useUser();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-6">
          Morocco's Digital Freight Network
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Connect with trusted carriers and shippers across Morocco. Streamline your logistics operations with real-time tracking and competitive rates.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="text-lg">
              {user?.userType === 'shipper' ? 'Post a Load' : 'Find Loads'}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-4">Real-time Tracking</h3>
            <p className="text-muted-foreground">Monitor your shipments in real-time across Morocco's road network.</p>
          </div>
          <div className="p-6 rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-4">Instant Booking</h3>
            <p className="text-muted-foreground">Book loads with verified carriers in just a few clicks.</p>
          </div>
          <div className="p-6 rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-4">Competitive Rates</h3>
            <p className="text-muted-foreground">Get the best rates for your freight with our transparent pricing.</p>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Trusted by Leading Companies in Morocco</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-card rounded-lg">
              <p className="italic mb-4">"This platform has revolutionized how we manage our freight operations."</p>
              <p className="font-semibold">- Mohammed Alami, Logistics Manager</p>
            </div>
            <div className="p-6 bg-card rounded-lg">
              <p className="italic mb-4">"Finding reliable carriers has never been easier."</p>
              <p className="font-semibold">- Fatima Benali, Supply Chain Director</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}