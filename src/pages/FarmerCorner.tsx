import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sprout, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award, 
  Calendar,
  MessageCircle,
  Video,
  FileText,
  ArrowRight
} from "lucide-react";

const FarmerCorner = () => {
  const { t } = useLanguage();

  const tips = [
    {
      id: 1,
      title: "Organic Farming Best Practices",
      description: "Learn sustainable methods to grow healthier crops without chemicals.",
      category: "Organic",
      readTime: "5 min read",
    },
    {
      id: 2,
      title: "Seasonal Crop Planning",
      description: "Maximize your yield by planning crops according to seasons.",
      category: "Planning",
      readTime: "8 min read",
    },
    {
      id: 3,
      title: "Water Conservation Techniques",
      description: "Save water and reduce costs with modern irrigation methods.",
      category: "Resources",
      readTime: "6 min read",
    },
    {
      id: 4,
      title: "Pest Management Without Pesticides",
      description: "Natural ways to protect your crops from pests.",
      category: "Organic",
      readTime: "7 min read",
    },
  ];

  const events = [
    {
      id: 1,
      title: "Farmers Meet 2024",
      date: "Jan 15, 2024",
      location: "Community Hall, Delhi",
      type: "Meetup",
    },
    {
      id: 2,
      title: "Organic Certification Workshop",
      date: "Jan 20, 2024",
      location: "Online",
      type: "Workshop",
    },
    {
      id: 3,
      title: "AgriTech Expo",
      date: "Feb 5, 2024",
      location: "Expo Center, Mumbai",
      type: "Expo",
    },
  ];

  const successStories = [
    {
      id: 1,
      name: "Ramesh Kumar",
      location: "Punjab",
      story: "Increased income by 40% after switching to organic farming methods.",
      image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      name: "Sunita Devi",
      location: "Maharashtra",
      story: "Built a successful vegetable supply chain to urban markets.",
      image: "https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=100&h=100&fit=crop",
    },
  ];

  const stats = [
    { label: "Active Farmers", value: "5,000+", icon: Users },
    { label: "Products Listed", value: "25,000+", icon: Sprout },
    { label: "Monthly Revenue", value: "₹50L+", icon: TrendingUp },
    { label: "Success Stories", value: "500+", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-8 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4" variant="secondary">
                <Sprout className="w-3 h-3 mr-1" />
                Farmer Community
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Farmer Corner
              </h1>
              <p className="text-muted-foreground text-base md:text-lg mb-6">
                Your one-stop destination for farming resources, tips, community support, and growth opportunities.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button size="lg" className="gap-2">
                  <Video className="w-4 h-4" />
                  Watch Tutorials
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Join Community
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center border-none shadow-sm bg-muted/30">
                  <CardContent className="pt-6 pb-4">
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="tips" className="w-full">
              <TabsList className="w-full md:w-auto flex overflow-x-auto mb-6">
                <TabsTrigger value="tips" className="flex-1 md:flex-none gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Tips & Guides</span>
                  <span className="sm:hidden">Tips</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="flex-1 md:flex-none gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Events</span>
                  <span className="sm:hidden">Events</span>
                </TabsTrigger>
                <TabsTrigger value="stories" className="flex-1 md:flex-none gap-2">
                  <Award className="w-4 h-4" />
                  <span className="hidden sm:inline">Success Stories</span>
                  <span className="sm:hidden">Stories</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tips" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2">
                  {tips.map((tip) => (
                    <Card key={tip.id} className="group hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {tip.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{tip.readTime}</span>
                            </div>
                            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {tip.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {tip.description}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Button variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    View All Guides
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="events" className="mt-0">
                <div className="grid gap-4">
                  {events.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-primary/10 rounded-lg p-3 text-center shrink-0">
                              <Calendar className="w-6 h-6 text-primary mx-auto" />
                            </div>
                            <div>
                              <Badge variant="outline" className="mb-2 text-xs">
                                {event.type}
                              </Badge>
                              <h3 className="font-semibold text-foreground">{event.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {event.date} • {event.location}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" className="w-full sm:w-auto">
                            Register
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="stories" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2">
                  {successStories.map((story) => (
                    <Card key={story.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start gap-4">
                          <img
                            src={story.image}
                            alt={story.name}
                            className="w-16 h-16 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <h3 className="font-semibold text-foreground">{story.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{story.location}</p>
                            <p className="text-sm text-foreground">{story.story}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Button variant="outline">View All Stories</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 md:py-12 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Grow Your Farm Business?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join thousands of farmers who are already benefiting from our platform.
            </p>
            <Button size="lg" className="gap-2">
              Start Selling Today
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FarmerCorner;
