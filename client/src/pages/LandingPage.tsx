import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TbTruckDelivery } from "react-icons/tb";
import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Sophisticated Animated Background */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-drift" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-drift-slow" />
      <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[80px] animate-float" />

      {/* Hero Section - Enhanced */}
      <section className="py-32 px-4 md:px-6 lg:px-8 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="relative inline-block">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/50 to-primary/30 blur-2xl opacity-30 animate-pulse-slow" />
              <TbTruckDelivery className="w-24 h-24 mx-auto text-primary relative animate-float" />
            </div>
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-fade-in">
                Revolutionizing
                <br />
                Freight Logistics
              </h1>
              <p className="text-2xl md:text-3xl font-light text-muted-foreground/80 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
                Experience the future of logistics in Morocco through our sophisticated digital ecosystem
              </p>
            </div>
            <div className="flex gap-6 justify-center items-center animate-fade-in-up pt-8">
              <Link href="/register">
                <Button size="lg" className="text-lg px-10 py-7 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all duration-300 rounded-xl">
                  Begin Your Journey
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 hover:bg-primary/5 transition-all duration-300 rounded-xl border-2">
                  Discover More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant Stats Section */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { number: "500+", label: "Active Carriers", suffix: "" },
              { number: "10", label: "Cities Covered", suffix: "K+" },
              { number: "98", label: "Delivery Success", suffix: "%" },
              { number: "24/7", label: "Premium Support", suffix: "" }
            ].map((stat, index) => (
              <div key={index} className="group hover:scale-105 transition-transform duration-300 ease-out">
                <div className="text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all">
                  <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3">
                    {stat.number}{stat.suffix}
                  </div>
                  <div className="text-muted-foreground/80 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sophisticated Features Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Premium Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Intelligent Tracking",
                description: "Advanced real-time GPS tracking with predictive ETA and smart notifications",
                icon: "📍"
              },
              {
                title: "AI-Powered Matching",
                description: "Sophisticated algorithms ensure perfect carrier-shipper partnerships",
                icon: "🤖"
              },
              {
                title: "Dynamic Pricing",
                description: "Market-responsive rates with advanced analytics and optimization",
                icon: "💎"
              }
            ].map((feature, index) => (
              <Card key={index} className="group p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-b from-background to-primary/5 border-primary/10">
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground/80 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Elegant Testimonials */}
      <section className="py-32 bg-gradient-to-b from-primary/5 to-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Client Excellence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-8 backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all duration-300 border-primary/10">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mr-4" />
                  <div>
                    <h4 className="font-semibold text-lg">Executive Leader</h4>
                    <p className="text-sm text-primary/60">Global Enterprise</p>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground/80 italic leading-relaxed">
                  "A revolutionary platform that has elevated our logistics operations to unprecedented heights."
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Call to Action */}
      <section className="py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
        <div className="container mx-auto max-w-4xl text-center relative">
          <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Transform Your Logistics Today
          </h2>
          <p className="text-2xl text-muted-foreground/80 mb-12 leading-relaxed">
            Join the elite network of businesses revolutionizing freight transportation in Morocco.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-xl px-12 py-8 bg-primary hover:bg-primary/90 shadow-xl hover:shadow-primary/25 transition-all duration-300 rounded-xl animate-pulse-slow">
              Elevate Your Operations
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}