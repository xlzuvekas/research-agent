'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FileText, Microscope, TrendingUp, Code } from 'lucide-react'

interface WelcomeScreenProps {
  onStartResearch: (template: string) => void
}

const RESEARCH_TEMPLATES = [
  {
    icon: Microscope,
    title: 'Academic Research',
    description: 'Literature reviews, thesis research, scientific papers',
    prompt: 'Help me research recent advances in quantum computing',
  },
  {
    icon: TrendingUp,
    title: 'Market Analysis',
    description: 'Industry reports, competitive analysis, market trends',
    prompt: 'Analyze the current state of the electric vehicle market',
  },
  {
    icon: Code,
    title: 'Technical Documentation',
    description: 'API docs, architecture guides, technical specifications',
    prompt: 'Create comprehensive documentation for a REST API',
  },
  {
    icon: FileText,
    title: 'Investigative Report',
    description: 'In-depth analysis, fact-checking, investigative journalism',
    prompt: 'Investigate the impact of AI on job markets',
  },
]

export function WelcomeScreen({ onStartResearch }: WelcomeScreenProps) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative h-16 w-16 text-primary">
              <Image
                src="/simba-logo.svg"
                alt="Simba Research"
                width={64}
                height={64}
                className="text-primary"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Simba Research</h1>
          <p className="text-muted-foreground text-lg">
            Your AI-powered research assistant for comprehensive, professional documentation
          </p>
        </div>

        {/* Research Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {RESEARCH_TEMPLATES.map((template, index) => {
            const Icon = template.icon
            return (
              <Card
                key={index}
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onStartResearch(template.prompt)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{template.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Quick Start */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Or start with a blank canvas
          </p>
          <Button
            size="lg"
            onClick={() => onStartResearch('')}
            className="px-8"
          >
            Start New Research
          </Button>
        </div>
      </div>
    </div>
  )
}