"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

export function StatsSection() {
  const stats = [
    { number: "50K+", label: "Active Users", description: "Supporting their mental wellness" },
    { number: "1M+", label: "Mood Entries", description: "Tracked and analyzed" },
    { number: "95%", label: "User Satisfaction", description: "Rate our platform highly" },
    { number: "24/7", label: "AI Support", description: "Always available for you" },
  ]

  return (
    <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6">Making a Real Impact</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how Zenium is transforming mental wellness for thousands of users worldwide.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center h-full">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-xl font-semibold mb-2">{stat.label}</div>
                  <div className="text-muted-foreground text-sm">{stat.description}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
