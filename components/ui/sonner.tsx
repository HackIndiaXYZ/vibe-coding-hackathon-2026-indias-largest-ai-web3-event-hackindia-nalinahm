"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "rgba(15, 23, 42, 0.8)",
          "--normal-text": "#f8fafc",
          "--normal-border": "rgba(255, 255, 255, 0.08)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
