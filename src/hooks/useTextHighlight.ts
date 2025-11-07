import { useState, useCallback, useEffect, useRef } from 'react'

interface HighlightRange {
  id: string
  start: number
  end: number
  text: string
}

export const useTextHighlight = (elementId: string) => {
  const [highlights, setHighlights] = useState<HighlightRange[]>([])
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    elementRef.current = document.getElementById(elementId)
  }, [elementId])

  const getTextNodes = (node: Node): Text[] => {
    const textNodes: Text[] = []
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node as Text)
    } else {
      for (let child of Array.from(node.childNodes)) {
        textNodes.push(...getTextNodes(child))
      }
    }
    return textNodes
  }

  const getTextOffset = (container: Node, offset: number): number => {
    if (!elementRef.current) return 0
    
    const textNodes = getTextNodes(elementRef.current)
    let totalOffset = 0
    
    for (const textNode of textNodes) {
      if (textNode === container || textNode.contains(container)) {
        if (textNode === container) {
          return totalOffset + offset
        }
        // If container is a child of textNode, find the offset within it
        const range = document.createRange()
        range.setStart(elementRef.current, 0)
        range.setEnd(container, offset)
        return range.toString().length
      }
      totalOffset += textNode.textContent?.length || 0
    }
    
    return totalOffset
  }

  const toggleHighlight = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || !elementRef.current) return

    const range = selection.getRangeAt(0)
    const selectedText = selection.toString().trim()
    
    if (!selectedText || selectedText.length < 2) return

    // Check if selection is within our element
    if (!elementRef.current.contains(range.commonAncestorContainer)) return

    // Calculate offsets using Range API
    const elementRange = document.createRange()
    elementRange.selectNodeContents(elementRef.current)
    elementRange.setEnd(range.startContainer, range.startOffset)
    const startOffset = elementRange.toString().length
    
    elementRange.setEnd(range.endContainer, range.endOffset)
    const endOffset = elementRange.toString().length

    // Check if this range overlaps with existing highlights
    const overlappingHighlight = highlights.find(
      h => (startOffset >= h.start && startOffset < h.end) ||
           (endOffset > h.start && endOffset <= h.end) ||
           (startOffset <= h.start && endOffset >= h.end)
    )

    if (overlappingHighlight) {
      // Remove overlapping highlight
      setHighlights(prev => prev.filter(h => h.id !== overlappingHighlight.id))
    } else {
      // Add new highlight
      const newHighlight: HighlightRange = {
        id: `highlight-${Date.now()}-${Math.random()}`,
        start: startOffset,
        end: endOffset,
        text: selectedText
      }
      setHighlights(prev => [...prev, newHighlight].sort((a, b) => a.start - b.start))
    }

    // Clear selection
    selection.removeAllRanges()
  }, [highlights])

  const clearAllHighlights = useCallback(() => {
    setHighlights([])
  }, [])

  const renderHighlightedText = useCallback((text: string): React.ReactNode => {
    if (highlights.length === 0) return text

    // Sort highlights by start position
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start)
    
    const parts: React.ReactNode[] = []
    let lastIndex = 0

    sortedHighlights.forEach((highlight) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        parts.push(text.slice(lastIndex, highlight.start))
      }

      // Add highlighted text
      parts.push(
        <mark
          key={highlight.id}
          className="bg-yellow-200 text-yellow-900 px-0.5 rounded cursor-pointer hover:bg-yellow-300 transition-colors"
          title={highlight.text}
        >
          {text.slice(highlight.start, highlight.end)}
        </mark>
      )

      lastIndex = highlight.end
    })

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts
  }, [highlights])

  return {
    highlights,
    toggleHighlight,
    clearAllHighlights,
    renderHighlightedText
  }
}

