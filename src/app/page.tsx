'use client';

import Image from 'next/image';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {BarChart3, Search, TrendingUp, ChevronRight} from 'lucide-react';
import {LoginForm} from '../components/login-form';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {landingPageOptimization} from '@/ai/flows/landing-page-optimization';
import {useState} from "react";
import {useToast} from "@/hooks/use-toast";

const placeholderImageUrl = 'https://picsum.photos/800/600';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Awaited<ReturnType<typeof landingPageOptimization>> | null>(null);
  const {toast} = useToast();

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const optimizationResult = await landingPageOptimization({
        pageTitle: "BlueKaktus Analytics: Actionable Insights",
        pageDescription: "Turn customer reviews into actionable insights",
        heroHeadline: "Unlock the Power of Customer Insights",
        heroDescription: "Transform your customer reviews into actionable strategies with BlueKaktus Analytics. Understand trends, improve satisfaction, and drive growth.",
        featureHighlights: [
          "AI-Powered Sentiment Analysis",
          "Automated Trend Detection",
          "Customizable Reporting Dashboards",
        ],
        callToAction: "Start Your Free Trial",
      });
      setSuggestions(optimizationResult);
      toast({
        title: "Optimization Suggestions Ready!",
        description: "Review the AI-powered suggestions to enhance your landing page.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Optimization Failed",
        description: error.message || "Failed to generate optimization suggestions.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold text-blue-600">
            BlueKaktus Analytics
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/features" className="text-gray-700 hover:text-blue-600">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-blue-600">
              Pricing
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">
              Contact
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">
        <section className="container mx-auto py-24 px-6 md:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
                Turn Customer Reviews into Actionable Insights
              </h1>
              <p className="text-gray-700 text-lg mb-8">
                Unlock the power of AI to understand customer sentiment, identify key trends, and improve your
                business strategy.
              </p>
              <Button onClick={handleOptimize} disabled={loading} className="bg-teal-500 text-white hover:bg-teal-700">
                {loading ? "Optimizing..." : "Optimize Landing Page"}
              </Button>

              {suggestions && (
                <details className="mt-4">
                  <summary className="text-blue-600 cursor-pointer">View Optimization Suggestions</summary>
                  <Card className="mt-2">
                    <CardHeader>
                      <CardTitle>Improved Headline</CardTitle>
                      <CardDescription>{suggestions.improvedHeadline}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p><strong>Original:</strong> Turn Customer Reviews into Actionable Insights</p>
                    </CardContent>
                  </Card>
                  <Card className="mt-2">
                    <CardHeader>
                      <CardTitle>Improved Description</CardTitle>
                      <CardDescription>{suggestions.improvedDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p><strong>Original:</strong> Unlock the power of AI to understand customer sentiment, identify key trends, and improve your business strategy.</p>
                    </CardContent>
                  </Card>
                  <Card className="mt-2">
                    <CardHeader>
                      <CardTitle>Improved Feature Highlights</CardTitle>
                      {suggestions.improvedFeatureHighlights.map((feature, index) => (
                        <CardDescription key={index}>- {feature}</CardDescription>
                      ))}
                    </CardHeader>
                    <CardContent>
                      <p><strong>Original:</strong>
                        AI-Powered Sentiment Analysis, Automated Trend Detection, Customizable Reporting Dashboards
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="mt-2">
                    <CardHeader>
                      <CardTitle>Improved Call to Action</CardTitle>
                      <CardDescription>{suggestions.improvedCallToAction}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p><strong>Original:</strong> Start Your Free Trial</p>
                    </CardContent>
                  </Card>
                  <Card className="mt-2">
                    <CardHeader>
                      <CardTitle>Layout Suggestions</CardTitle>
                      <CardDescription>{suggestions.layoutSuggestions}</CardDescription>
                    </CardHeader>
                  </Card>
                </details>
              )}

            </div>
            <div className="md:block hidden">
              <Image
                src={placeholderImageUrl}
                alt="Analytics Dashboard"
                width={800}
                height={600}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>

        <section className="container mx-auto py-16 px-6 md:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <BarChart3 className="text-blue-600 h-10 w-10 mb-3"/>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-600 text-center">
                Harness the power of artificial intelligence to extract deep insights from customer reviews.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <TrendingUp className="text-blue-600 h-10 w-10 mb-3"/>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Identify Key Trends</h3>
              <p className="text-gray-600 text-center">
                Automatically detect emerging trends and patterns in customer feedback to stay ahead of the competition.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Search className="text-blue-600 h-10 w-10 mb-3"/>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Improve Business Strategy</h3>
              <p className="text-gray-600 text-center">
                Transform insights into actionable strategies to improve customer satisfaction and drive business growth.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto py-16 px-6 md:px-0 bg-gray-100 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-extrabold text-blue-900 mb-4">Ready to Transform Your Business?</h2>
              <p className="text-gray-700 text-lg mb-8">
                Join BlueKaktus Analytics today and start turning your customer reviews into a competitive advantage.
              </p>
              <Button className="bg-teal-500 text-white hover:bg-teal-700">
                Get Started Now <ChevronRight className="ml-2"/>
              </Button>
            </div>
            <div className="order-1 md:order-2">
              <LoginForm/>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-0">
          <div>
            <h4 className="text-white font-semibold mb-4">About BlueKaktus</h4>
            <p>
              BlueKaktus Analytics is a leading provider of AI-powered customer review analytics. We help businesses
              understand customer sentiment, identify key trends, and improve their business strategy.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="hover:text-blue-400">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-blue-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Connect With Us</h4>
            <p>
              Stay up to date with the latest news and insights from BlueKaktus Analytics.
            </p>
            <div className="flex space-x-4 mt-4">
              <Link href="#" className="hover:text-blue-400">
                Facebook
              </Link>
              <Link href="#" className="hover:text-blue-400">
                Twitter
              </Link>
              <Link href="#" className="hover:text-blue-400">
                LinkedIn
              </Link>
            </div>
          </div>
        </div>
        <div className="text-center mt-8">
          &copy; {new Date().getFullYear()} BlueKaktus Analytics. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
