import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TbTruckDelivery } from "react-icons/tb";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-drift" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-drift-slow" />

      {/* Hero Section */}
      <section className="py-24 px-4 md:px-6 lg:px-8 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <TbTruckDelivery className="w-16 h-16 mx-auto text-primary animate-float" />
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              About Our Mission
            </h1>
            <p className="text-xl text-muted-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Transforming Morocco's logistics landscape through innovative technology and sustainable solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8 bg-gradient-to-b from-background to-primary/5 border-primary/10">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Our Vision
              </h2>
              <p className="text-lg text-muted-foreground/80 leading-relaxed">
                To become the leading digital freight network in Morocco, connecting businesses with reliable transportation solutions while promoting sustainability and efficiency in logistics.
              </p>
            </Card>
            <Card className="p-8 bg-gradient-to-b from-background to-primary/5 border-primary/10">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground/80 leading-relaxed">
                To revolutionize freight transportation through technology, creating a seamless ecosystem that benefits both carriers and shippers while contributing to Morocco's economic growth.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Innovation",
                description: "Continuously pushing boundaries with cutting-edge technology solutions",
                icon: "💡"
              },
              {
                title: "Reliability",
                description: "Delivering consistent, dependable service across our network",
                icon: "🎯"
              },
              {
                title: "Sustainability",
                description: "Committed to environmental responsibility in logistics",
                icon: "🌱"
              }
            ].map((value, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-all duration-300 bg-background/50 backdrop-blur-sm border-primary/10">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-muted-foreground/80">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Leadership Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 text-center hover:shadow-lg transition-all duration-300 bg-background/50 backdrop-blur-sm border-primary/10">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Executive Name</h3>
                <p className="text-primary/60 mb-4">Position</p>
                <p className="text-muted-foreground/80">
                  Experienced leader with a passion for innovation in logistics.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Join Our Journey
          </h2>
          <p className="text-xl text-muted-foreground/80 mb-12">
            Be part of the revolution in Morocco's freight logistics industry.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-10 py-6 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all duration-300 rounded-xl">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
