'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, GitBranch, Zap, MessageCircle } from 'lucide-react'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">RP</span>
            </div>
            <span className="font-semibold text-foreground">RepoPilot</span>
          </div>
          <Link href="/analyze">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              Launch App <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-balance">
              Understand Code in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">Seconds</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stop wasting hours understanding unfamiliar repositories. RepoPilot AI analyzes your codebase, visualizes architecture, and answers your questions with AI.
            </p>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <Link href="/analyze">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-border hover:bg-card">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold">Powerful Analysis Tools</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to audit and understand code repositories</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <GitBranch className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Repository Analysis</h3>
            <p className="text-muted-foreground text-sm">
              Upload any repository or provide a GitHub URL. We instantly analyze file structure, dependencies, and architecture.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-card border border-border rounded-lg hover:border-accent/50 transition-colors">
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Architecture Visualization</h3>
            <p className="text-muted-foreground text-sm">
              See your codebase structure with interactive diagrams showing module relationships and dependencies.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Chat</h3>
            <p className="text-muted-foreground text-sm">
              Ask questions about your code. Claude AI understands your architecture and provides expert insights.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <h2 className="text-3xl font-bold text-center">Perfect For</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-semibold mb-2">Code Reviews & Audits</h4>
            <p className="text-sm text-muted-foreground">Quickly understand codebases before conducting security audits or code reviews.</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-semibold mb-2">Onboarding New Developers</h4>
            <p className="text-sm text-muted-foreground">Help new team members ramp up faster by understanding system architecture instantly.</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-semibold mb-2">Open Source Exploration</h4>
            <p className="text-sm text-muted-foreground">Navigate unfamiliar open source projects and understand how they&apos;re structured.</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-semibold mb-2">Technical Due Diligence</h4>
            <p className="text-sm text-muted-foreground">Analyze acquired codebases to assess quality, complexity, and maintainability.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center space-y-6">
        <h2 className="text-4xl font-bold">Start Analyzing Today</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload a repository or provide a GitHub URL to get instant insights into your code.
        </p>
        <Link href="/analyze">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            Launch RepoPilot <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center text-sm text-muted-foreground">
          <p>RepoPilot AI - Code Analysis & Review Tool</p>
          <p>Powered by Claude & Vercel</p>
        </div>
      </footer>
    </div>
  )
}
