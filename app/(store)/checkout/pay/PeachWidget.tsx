'use client'

import { useEffect, useRef } from 'react'

interface Props {
  scriptUrl: string
  resultUrl: string
}

export default function PeachWidget({ scriptUrl, resultUrl }: Props) {
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true

    const script = document.createElement('script')
    script.src = scriptUrl
    script.async = false
    document.body.appendChild(script)

    return () => {
      // Only clean up if still present (strict-mode double-invoke guard)
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [scriptUrl])

  return (
    <div>
      <form
        action={resultUrl}
        className="paymentWidgets"
        data-brands="VISA MASTER AMEX"
      />
      <p className="mt-6 text-center text-xs text-gray-400">
        Powered by Peach Payments · 256-bit SSL encryption
      </p>
    </div>
  )
}
