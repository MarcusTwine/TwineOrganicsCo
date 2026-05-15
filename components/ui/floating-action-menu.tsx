"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

type FloatingActionMenuProps = {
  options: {
    label: string
    onClick: () => void
    Icon?: React.ReactNode
    active?: boolean
  }[]
  className?: string
}

const FloatingActionMenu = ({ options, className }: FloatingActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className={cn("fixed bottom-8 right-8 z-50", className)}>
      <Button
        onClick={toggleMenu}
        className="h-12 w-12 rounded-full bg-forest shadow-lg hover:bg-forest"
        aria-label="Filter products"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut", type: "spring", stiffness: 300, damping: 20 }}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, y: 10, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 10, y: 10, filter: "blur(10px)" }}
            transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 22, delay: 0.05 }}
            className="absolute bottom-14 right-0 mb-2"
          >
            <div className="flex flex-col items-end gap-1.5">
              {options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                >
                  <Button
                    onClick={() => { option.onClick(); setIsOpen(false) }}
                    size="sm"
                    className={cn(
                      "flex items-center gap-2 rounded-xl border-none shadow-lg backdrop-blur-sm transition-colors",
                      option.active
                        ? "bg-forest text-white hover:bg-forest"
                        : "bg-[#11111198] text-white hover:bg-[#111111d1]",
                    )}
                  >
                    {option.Icon}
                    <span className="text-xs font-medium">{option.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FloatingActionMenu
