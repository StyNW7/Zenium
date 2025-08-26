"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function TestimonialSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Mental Health Advocate",
      content:
        "Zenium and Melify have been game-changers in my wellness journey. The AI companion feels so natural and supportive.",
      rating: 5,
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Clinical Psychologist",
      content:
        "I recommend Zenium to my patients as a complementary tool. The mood tracking and insights are incredibly valuable.",
      rating: 5,
    },
    {
      name: "Emma Thompson",
      role: "College Student",
      content:
        "Having Melify during stressful times has been amazing. It's like having a caring friend who's always there for me.",
      rating: 5,
    },
  ]

  return (
    <section id="testimonials" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6">What Our Users Say</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real stories from people who have transformed their mental wellness with Zenium.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
