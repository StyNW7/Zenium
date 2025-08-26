"use client"

import { motion } from "framer-motion"

export function MarqueeSection() {
  const partners = [
    "Mental Health Foundation",
    "Wellness Institute",
    "AI Research Lab",
    "Digital Health Alliance",
    "Mindfulness Center",
    "Therapy Network",
    "Healthcare Innovation",
    "Wellness Technology",
    "Mental Wellness Hub",
  ]

  return (
    <section className="py-16 bg-card overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-2xl font-bold text-center text-muted-foreground">
          Trusted by Leading Mental Health Organizations
        </h2>
      </div>

      <div className="relative">
        <motion.div
          className="flex space-x-8 whitespace-nowrap"
          animate={{ x: [0, -1000] }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          {[...partners, ...partners].map((partner, index) => (
            <div
              key={index}
              className="flex-shrink-0 text-xl font-semibold text-muted-foreground/60 hover:text-primary transition-colors"
            >
              {partner}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
