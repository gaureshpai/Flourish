"use client"

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight, Leaf, Code, Palette, Zap, Users, GitMerge, Menu, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  // Client-side only state
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Refs for sections
  const heroRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const contactFormRef = useRef<HTMLFormElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  // Scroll to section function
  const scrollToSection = (ref: any) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  // Handle form change
  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleFormSubmit = async (e: any) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      // Using the existing API endpoint
      const response = await fetch('/api/mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormSubmitted(true);
        setFormData({ name: "", email: "", subject:"", message: "" });
      } else {
        console.error('Form submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setFormSubmitting(false);
    }
  };

  useEffect(() => {
    // Mark component as mounted
    setMounted(true);

    // Improved loading animation with progress that looks like a real loader
    const startTime = Date.now();
    const duration = 2500; // 2.5 seconds

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration * 100, 100);

      // Easing function to make loading feel more natural
      const easedProgress = progress < 50
        ? 2 * Math.pow(progress / 100, 2) * 100
        : (1 - Math.pow(-2 * (progress / 100) + 2, 2) / 2) * 100;

      setLoadingProgress(easedProgress);

      if (progress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        setTimeout(() => setIsLoading(false), 200);
      }
    };

    requestAnimationFrame(updateProgress);

    // Import GSAP dynamically
    if (typeof window !== 'undefined') {
      const setupGSAP = async () => {
        try {
          const gsapModule = await import('gsap');
          const { ScrollTrigger } = await import('gsap/ScrollTrigger');

          const gsap = gsapModule.default;
          gsap.registerPlugin(ScrollTrigger);

          // Wait until component is mounted and loading is complete
          if (mounted && !isLoading) {
            initAnimations(gsap, ScrollTrigger);
          }
        } catch (error) {
          console.error("Failed to load GSAP:", error);
        }
      };

      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        setupGSAP();
      }, 100);

      return () => {
        clearTimeout(timer);
        if (typeof window !== 'undefined') {
          import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
            ScrollTrigger.getAll().forEach(t => t.kill());
          }).catch(err => console.error("Error cleaning up ScrollTrigger:", err));
        }
      };
    }
  }, [mounted, isLoading]);

  // Animation initialization
  const initAnimations = (gsap:any, ScrollTrigger:any) => {
    // Hero section animations
    gsap.fromTo(
      ".hero-title",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );

    gsap.fromTo(
      ".hero-subtitle",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.4 }
    );

    gsap.fromTo(
      ".hero-cta",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.6 }
    );

    // Improved plant/leaf animations
    const leaves = document.querySelectorAll('.floating-leaf');
    if (leaves.length > 0) {
      leaves.forEach((leaf, index) => {
        // Random initial positions within viewport
        gsap.set(leaf, {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 1
        });

        // Create floating animation with unique timing for each leaf
        gsap.to(leaf, {
          x: `+=${Math.random() * 200 - 100}`,
          y: `+=${Math.random() * 200 - 100}`,
          rotation: `+=${Math.random() * 180 - 90}`,
          scale: 0.5 + Math.random() * 1,
          duration: 5 + Math.random() * 10,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: index * 0.2
        });
      });
    }

    // Services section - reveal cards as user scrolls
    const serviceCards = document.querySelectorAll(".service-card");
    if (serviceCards.length > 0) {
      gsap.fromTo(
        serviceCards,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: servicesRef.current,
            start: "top 75%",
          }
        }
      );
    }

    // Benefits section - staggered reveal
    const benefitItems = document.querySelectorAll(".benefit-item");
    if (benefitItems.length > 0) {
      gsap.fromTo(
        benefitItems,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: benefitsRef.current,
            start: "top 75%",
          }
        }
      );
    }

    // CTA section - fade in and up
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
          }
        }
      );
    }

    // Footer animation
    const footerContent = document.querySelector(".footer-content");
    if (footerContent) {
      gsap.fromTo(
        footerContent,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "footer",
            start: "top 90%",
          }
        }
      );
    }

    // Interactive hover effects for cards
    const cards = document.querySelectorAll(".service-card");
    cards.forEach(card => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          y: -10,
          duration: 0.3,
          ease: "power2.out",
          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.2)"
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          y: 0,
          duration: 0.3,
          ease: "power2.out",
          boxShadow: "none"
        });
      });
    });
  };

  // Improved Loading screen component with animated progress bar
  const LoadingScreen = () => {
    if (!mounted || !isLoading) return null;

    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-50">
        <div className="relative">
          <Leaf className="h-20 w-20 text-emerald-500 animate-bounce" />
          <div className="absolute -inset-2 border-4 border-emerald-500/20 rounded-full animate-ping"></div>
        </div>
        <h2 className="text-2xl font-bold text-emerald-500 mt-4 mb-8">Flourish</h2>
        <div className="w-64 h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
            style={{ width: `${loadingProgress}%`, transition: "width 0.3s ease" }}
          ></div>
        </div>
        <p className="text-zinc-400 mt-4 text-sm">Loading experience...</p>
      </div>
    );
  };

  // Render loading placeholder if not mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <Leaf className="h-12 w-12 text-emerald-500 animate-pulse" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 overflow-hidden">
      {/* Loading Screen */}
      <LoadingScreen />

      {/* Navigation - fixed with working scroll */}
      <nav className="fixed top-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-sm z-40 py-4">
        <div className="container max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Leaf className="h-6 w-6 text-emerald-500 mr-2" />
            <span className="text-xl font-bold text-white">Flourish</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection(heroRef)} className="text-zinc-300 hover:text-emerald-500 cursor-pointer transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection(servicesRef)} className="text-zinc-300 hover:text-emerald-500 cursor-pointer transition-colors">
              Services
            </button>
            <button onClick={() => scrollToSection(benefitsRef)} className="text-zinc-300 hover:text-emerald-500 cursor-pointer transition-colors">
              Benefits
            </button>
            <button onClick={() => scrollToSection(ctaRef)} className="text-zinc-300 hover:text-emerald-500 cursor-pointer transition-colors">
              Contact
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            className="md:hidden text-zinc-300 hover:text-emerald-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-zinc-950/80 py-4 px-4">
            <div className="flex flex-col space-y-4">
              <button onClick={() => scrollToSection(heroRef)} className="text-zinc-300 hover:text-emerald-500 transition-colors py-2">
                Home
              </button>
              <button onClick={() => scrollToSection(servicesRef)} className="text-zinc-300 hover:text-emerald-500 transition-colors py-2">
                Services
              </button>
              <button onClick={() => scrollToSection(benefitsRef)} className="text-zinc-300 hover:text-emerald-500 transition-colors py-2">
                Benefits
              </button>
              <button onClick={() => scrollToSection(ctaRef)} className="text-zinc-300 hover:text-emerald-500 transition-colors py-2">
                Contact
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Floating leaves with better animation */}
      {mounted && Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute opacity-20 z-0 floating-leaf pointer-events-none"
        >
          <Leaf
            className="text-emerald-500"
            size={Math.random() * 20 + 15}
          />
        </div>
      ))}

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 pt-24 overflow-hidden"
      >
        <div className="container max-w-5xl p-12 mx-auto text-center z-10">
          <h1 className="hero-title text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-600">
            Supercharge Your Product Development with a Custom Design System
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-zinc-300 mb-8 max-w-3xl mx-auto">
            Save on hiring. Ship faster. Stay consistent. Build a scalable foundation for your product's UI.
          </p>
          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white group"
              onClick={() => scrollToSection(ctaRef)}
            >
              Schedule a Free Consultation
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-emerald-600 text-emerald-500 hover:bg-emerald-950"
              onClick={() => scrollToSection(servicesRef)}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <Button
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 animate-bounce"
          onClick={() => scrollToSection(servicesRef)}
          aria-label="Scroll down"
        >
          <div className="h-10 w-6 border-2 border-emerald-500 rounded-full flex items-start justify-center p-1">
            <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
          </div>
        </Button>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-zinc-900 to-transparent z-10"></div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="relative py-20 px-4 bg-zinc-950">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-emerald-500">
            What We Deliver <span className="text-white">🚀</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="service-card bg-zinc-900 border-zinc-800 shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-900/30 flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle className="text-xl text-white">Figma-Based Design System</CardTitle>
              </CardHeader>
              <CardContent className="text-zinc-400">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Component libraries designed for your brand</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Tokens for colors, typography, spacing, etc.</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Auto-layout, variants, and interactive states</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="service-card bg-zinc-900 border-zinc-800 shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-900/30 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle className="text-xl text-white">Developer-Ready Component Library</CardTitle>
              </CardHeader>
              <CardContent className="text-zinc-400">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Built with React + TailwindCSS (or your preferred stack)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Published as an NPM package for easy installation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Fully typed with TypeScript for safety</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="service-card bg-zinc-900 border-zinc-800 shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-900/30 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle className="text-xl text-white">Storybook UI Documentation</CardTitle>
              </CardHeader>
              <CardContent className="text-zinc-400">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Interactive component previews for developers</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Clear usage guidelines & best practices</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Accessible components with WCAG compliance</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="service-card bg-zinc-900 border-zinc-800 shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-900/30 flex items-center justify-center mb-4">
                  <GitMerge className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle className="text-xl text-white">CI/CD Pipeline for Figma → Code Sync</CardTitle>
              </CardHeader>
              <CardContent className="text-zinc-400">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Automated updates between Figma and codebase</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>No more outdated components—design & code stay in sync</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Continuous integration for seamless updates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="relative py-20 px-4 bg-zinc-900">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-emerald-500">
            Why Build a Custom Design System?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            <div className="benefit-item">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-emerald-900/30 flex items-center justify-center mr-4 benefit-icon">
                  <Zap className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Reduces Design & Dev Costs</h3>
              </div>
              <p className="text-zinc-400 pl-14">
                Save hundreds of dollars by eliminating redundant work and streamlining your design and development
                process.
              </p>
            </div>

            <div className="benefit-item">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-emerald-900/30 flex items-center justify-center mr-4 benefit-icon">
                  <ArrowRight className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Accelerates Development</h3>
              </div>
              <p className="text-zinc-400 pl-14">
                Pre-built components speed up feature releases, allowing your team to focus on innovation rather than
                rebuilding UI elements.
              </p>
            </div>

            <div className="benefit-item">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-emerald-900/30 flex items-center justify-center mr-4 benefit-icon">
                  <Check className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Ensures Consistency</h3>
              </div>
              <p className="text-zinc-400 pl-14">
                Keep your UI pixel-perfect across products & platforms with a unified design language that scales with
                your business.
              </p>
            </div>

            <div className="benefit-item">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-emerald-900/30 flex items-center justify-center mr-4 benefit-icon">
                  <Users className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Enhances Collaboration</h3>
              </div>
              <p className="text-zinc-400 pl-14">
                A single source of truth for designers & developers improves workflow and reduces miscommunication
                between teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Section */}
      <section className="py-20 px-4 bg-zinc-950 relative overflow-hidden">
        <div className="container max-w-5xl mx-auto z-10 relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-emerald-500">
            See the Difference
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 relative">
              <h3 className="text-xl font-semibold text-white mb-4">Without a Design System</h3>
              <div className="h-64 bg-zinc-800 rounded-lg flex items-center justify-center relative">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-4">
                  <div className="bg-red-500 rounded"></div>
                  <div className="bg-blue-500 rounded"></div>
                  <div className="bg-green-500 rounded"></div>
                  <div className="bg-yellow-500 rounded"></div>
                  <div className="bg-purple-500 rounded"></div>
                  <div className="bg-pink-500 rounded"></div>
                  <div className="bg-orange-500 rounded"></div>
                  <div className="bg-teal-500 rounded"></div>
                  <div className="bg-indigo-500 rounded"></div>
                </div>
                <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center">
                  <p className="text-white text-center">Inconsistent colors, spacing, and components</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 relative">
              <h3 className="text-xl font-semibold text-white mb-4">With Our Design System</h3>
              <div className="h-64 bg-zinc-800 rounded-lg flex items-center justify-center relative">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-4">
                  <div className="bg-emerald-500 rounded"></div>
                  <div className="bg-emerald-600 rounded"></div>
                  <div className="bg-emerald-700 rounded"></div>
                  <div className="bg-emerald-500 rounded"></div>
                  <div className="bg-emerald-600 rounded"></div>
                  <div className="bg-emerald-700 rounded"></div>
                  <div className="bg-emerald-500 rounded"></div>
                  <div className="bg-emerald-600 rounded"></div>
                  <div className="bg-emerald-700 rounded"></div>
                </div>
                <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center">
                  <p className="text-white text-center">Cohesive design language and consistent components</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Is This For Section */}
      <section className="py-20 px-4 bg-zinc-950">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-emerald-500">Who Is This For?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <Card className="bg-zinc-900 border-zinc-800 shadow-lg transition-all duration-300 hover:bg-zinc-800">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-emerald-900/30 flex items-center justify-center mb-4 mx-auto">
                  <Check className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-white text-center mb-4">Startups</h3>
                <p className="text-zinc-400 text-center">
                  Build a scalable design foundation from day one and avoid technical debt as you grow.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 shadow-lg transition-all duration-300 hover:bg-zinc-800">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-emerald-900/30 flex items-center justify-center mb-4 mx-auto">
                  <Check className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-white text-center mb-4">Scale-ups</h3>
                <p className="text-zinc-400 text-center">
                  Unify your growing product suite with a cohesive design language that supports rapid iteration.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 shadow-lg transition-all duration-300 hover:bg-zinc-800">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-emerald-900/30 flex items-center justify-center mb-4 mx-auto">
                  <Check className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-white text-center mb-4">Enterprise</h3>
                <p className="text-zinc-400 text-center">
                  Simplify complex UI ecosystems and streamline your design-to-development workflow.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 px-4 bg-zinc-900 relative">
        <div className="container max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-emerald-500">Ready to Elevate Your Product?</h2>
          <p className="text-xl text-zinc-300 mb-12 max-w-2xl mx-auto">
            Schedule a free consultation to discuss how a custom design system can solve your specific challenges.
          </p>

          <Card className="bg-zinc-800 border-zinc-700 mx-auto max-w-xl relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Get In Touch</CardTitle>
              <CardDescription className="text-zinc-400">
                We'll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form ref={contactFormRef} onSubmit={handleFormSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Your name"
                    className="bg-zinc-900 border-zinc-700 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="your.email@example.com"
                    className="bg-zinc-900 border-zinc-700 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-zinc-300">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleFormChange}
                    placeholder="Tell us about your project needs"
                    className="bg-zinc-900 border-zinc-700 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-zinc-300">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    placeholder="Tell us about your project needs"
                    className="bg-zinc-900 border-zinc-700 focus:border-emerald-500 focus:ring-emerald-500 min-h-[120px]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>

              {formSubmitted && (
                <div className="mt-6 p-4 bg-emerald-900/50 text-emerald-300 rounded-lg flex items-center">
                  <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>Thank you for your message! We'll be in touch soon.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Background plant animations */}
        <div className="absolute -bottom-4 left-0 w-full h-64 overflow-hidden opacity-20 pointer-events-none">
          <div className="w-full h-full relative">
            {mounted && Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`plant-${i}`}
                className="absolute bottom-0 plant-animation"
                style={{
                  left: `${i * 12 + Math.random() * 10}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${8 + Math.random() * 4}s`
                }}
              >
                <Leaf
                  className="text-emerald-600 transform rotate-45"
                  size={Math.random() * 30 + 20}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 py-12 px-4">
        <div className="container max-w-6xl mx-auto footer-content">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Leaf className="h-6 w-6 text-emerald-500 mr-2" />
              <span className="text-xl font-bold text-white">Flourish</span>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 text-zinc-400">
              <button onClick={() => scrollToSection(heroRef)} className="hover:text-emerald-500 cursor-pointer transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection(servicesRef)} className="hover:text-emerald-500 cursor-pointer transition-colors">
                Services
              </button>
              <button onClick={() => scrollToSection(benefitsRef)} className="hover:text-emerald-500 cursor-pointer transition-colors">
                Benefits
              </button>
              <button onClick={() => scrollToSection(ctaRef)} className="hover:text-emerald-500 cursor-pointer transition-colors">
                Contact
              </button>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-zinc-500 text-sm">
            © {new Date().getFullYear()} Flourish. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Custom CSS for plant animations */}
      <style jsx global>{`
        @keyframes growPlant {
          0% {
            transform: translateY(100%) scale(0.5);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        .plant-animation {
          animation: growPlant 8s ease-in-out infinite alternate;
        }
        
        @keyframes floatLeaf {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }
        
        .floating-leaf {
          animation: floatLeaf 8s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}