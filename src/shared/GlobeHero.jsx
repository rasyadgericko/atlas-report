import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { f } from "./theme"

// ─── Country pin coordinates (capital / geographic center) ───
const COUNTRY_COORDS = {
  AR: { lat: -34.6, lng: -58.4 },
  AU: { lat: -25.3, lng: 133.8 },
  BR: { lat: -15.8, lng: -47.9 },
  CA: { lat:  56.1, lng: -106.3 },
  CN: { lat:  35.9, lng:  104.2 },
  EG: { lat:  26.8, lng:   30.8 },
  FR: { lat:  46.2, lng:    2.2 },
  DE: { lat:  51.2, lng:   10.5 },
  IN: { lat:  20.6, lng:   79.1 },
  ID: { lat:  -2.5, lng:  118.0 },
  IL: { lat:  31.0, lng:   34.9 },
  IT: { lat:  41.9, lng:   12.6 },
  JP: { lat:  36.2, lng:  138.3 },
  KE: { lat:   0.0, lng:   37.9 },
  MX: { lat:  23.6, lng: -102.6 },
  NG: { lat:   9.1, lng:    8.7 },
  PH: { lat:  12.9, lng:  121.8 },
  PL: { lat:  51.9, lng:   19.1 },
  SA: { lat:  23.9, lng:   45.1 },
  SG: { lat:   1.3, lng:  103.8 },
  ZA: { lat: -28.5, lng:   24.7 },
  KR: { lat:  35.9, lng:  127.8 },
  ES: { lat:  40.5, lng:   -3.7 },
  TR: { lat:  38.9, lng:   35.2 },
  AE: { lat:  23.4, lng:   53.8 },
  UA: { lat:  49.0, lng:   31.2 },
  GB: { lat:  55.4, lng:   -3.4 },
  US: { lat:  37.1, lng:  -95.7 },
}

// ─── Build per-theme color palette ───
function buildPalette(theme, isDark) {
  return isDark
    ? {
        ocean:        theme.bg,
        rim:          "rgba(232,228,221,0.12)",
        graticule:    "rgba(232,228,221,0.07)",
        landStroke:   "rgba(232,228,221,0.18)",
        landDot:      "rgba(200,194,184,0.40)",
        pin:          theme.accent,
        pinHover:     "#E8956D",
        pinGlow:      "rgba(196,106,106,0.40)",
        pinHoverGlow: "rgba(232,149,109,0.28)",
        pinStroke:    "rgba(255,210,210,0.70)",
        tooltip:      { bg: "rgba(20,19,18,0.94)", border: `rgba(196,106,106,0.45)` },
        badge:        { bg: "rgba(46,31,31,0.92)",  border: "rgba(196,106,106,0.35)" },
        badgeText:    theme.ink,
        hint:         "rgba(200,194,184,0.22)",
        loading:      "rgba(200,194,184,0.30)",
      }
    : {
        ocean:        theme.bg,
        rim:          "rgba(26,26,26,0.18)",
        graticule:    "rgba(26,26,26,0.06)",
        landStroke:   "rgba(26,26,26,0.22)",
        landDot:      "rgba(42,42,42,0.38)",
        pin:          theme.accent,
        pinHover:     "#A04040",
        pinGlow:      "rgba(122,46,46,0.32)",
        pinHoverGlow: "rgba(160,64,64,0.22)",
        pinStroke:    "rgba(122,46,46,0.50)",
        tooltip:      { bg: "rgba(247,245,242,0.97)", border: `rgba(122,46,46,0.40)` },
        badge:        { bg: "rgba(243,232,232,0.95)", border: "rgba(122,46,46,0.30)" },
        badgeText:    theme.accent,
        hint:         "rgba(26,26,26,0.20)",
        loading:      "rgba(26,26,26,0.28)",
      }
}

export default function GlobeHero({ countries, selectedCountry, onSelectCountry, theme, isDark, hideHint = false, panelOpen = false }) {
  const canvasRef  = useRef(null)
  const wrapRef    = useRef(null)
  const [isLoading, setIsLoading]     = useState(true)
  const [hoveredCode, setHoveredCode] = useState(null)
  const [tooltipPos, setTooltipPos]   = useState({ x: 0, y: 0 })

  // Mutable refs — read by the render loop without restarting the effect
  const paletteRef       = useRef(buildPalette(theme, isDark))
  const hoveredCodeRef   = useRef(null)
  const selectedCodeRef  = useRef(selectedCountry)
  const onSelectRef      = useRef(onSelectCountry)
  const projectedPinsRef = useRef([])
  const isDraggingRef    = useRef(false)
  const panelOpenRef     = useRef(panelOpen)
  const zoomedInRef      = useRef(false)   // true from pin click until zoom-out completes
  const zoomOutRef       = useRef(null)   // set by main effect, called when panel closes

  // Keep refs in sync with props
  useEffect(() => { selectedCodeRef.current = selectedCountry }, [selectedCountry])
  useEffect(() => { onSelectRef.current     = onSelectCountry }, [onSelectCountry])
  useEffect(() => { paletteRef.current      = buildPalette(theme, isDark) }, [theme, isDark])
  useEffect(() => { panelOpenRef.current    = panelOpen }, [panelOpen])

  // Trigger zoom-out when panel closes
  useEffect(() => {
    if (!panelOpen && zoomOutRef.current) zoomOutRef.current()
  }, [panelOpen])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const wrap   = wrapRef.current
    const W      = wrap.clientWidth  || 720
    const H      = wrap.clientHeight || Math.min(480, Math.max(260, W * 0.55))
    const radius = Math.min(W, H) / 2.05

    const dpr = window.devicePixelRatio || 1
    canvas.width  = W * dpr
    canvas.height = H * dpr
    canvas.style.width  = `${W}px`
    canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)

    const cx = W / 2, cy = H / 2

    const proj = d3.geoOrthographic()
      .scale(radius)
      .translate([cx, cy])
      .clipAngle(90)

    const path = d3.geoPath().projection(proj).context(ctx)

    // Build pins from countries prop
    const pins = countries
      .filter(c => c.code !== "ALL" && COUNTRY_COORDS[c.code])
      .map(c => ({ code: c.code, name: c.name, flag: c.flag, ...COUNTRY_COORDS[c.code] }))

    function isVisible(lng, lat) {
      const [λ, φ] = proj.rotate()
      return d3.geoDistance([lng, lat], [-λ, -φ]) < Math.PI / 2 - 0.05
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    function render() {
      const pal = paletteRef.current
      const scale = proj.scale()
      const sf    = scale / radius

      ctx.clearRect(0, 0, W, H)

      // Ocean
      ctx.beginPath()
      ctx.arc(cx, cy, scale, 0, 2 * Math.PI)
      ctx.fillStyle = pal.ocean
      ctx.fill()

      // Rim
      ctx.strokeStyle = pal.rim
      ctx.lineWidth   = 1.5 * sf
      ctx.stroke()

      if (landRef.current) {
        // Graticule
        ctx.beginPath()
        path(d3.geoGraticule()())
        ctx.strokeStyle = pal.graticule
        ctx.lineWidth   = 0.5 * sf
        ctx.stroke()

        // Land outlines
        ctx.beginPath()
        landRef.current.features.forEach(f => path(f))
        ctx.strokeStyle = pal.landStroke
        ctx.lineWidth   = 0.8 * sf
        ctx.stroke()

        // Land dots
        dotsRef.current.forEach(({ lng, lat }) => {
          const pt = proj([lng, lat])
          if (!pt || pt[0] < 0 || pt[0] > W || pt[1] < 0 || pt[1] > H) return
          ctx.beginPath()
          ctx.arc(pt[0], pt[1], 1.0 * sf, 0, 2 * Math.PI)
          ctx.fillStyle = pal.landDot
          ctx.fill()
        })
      }

      // Pins
      const newPins = []
      const hovCode = hoveredCodeRef.current
      const selCode = selectedCodeRef.current

      pins.forEach(pin => {
        if (!isVisible(pin.lng, pin.lat)) { newPins.push({ ...pin, visible: false }); return }
        const pt = proj([pin.lng, pin.lat])
        if (!pt) { newPins.push({ ...pin, visible: false }); return }
        const [px, py] = pt
        const isSel  = pin.code === selCode
        const isHov  = pin.code === hovCode
        const pinR   = (isSel ? 6 : isHov ? 5.5 : 4) * sf

        newPins.push({ ...pin, visible: true, x: px, y: py })

        // Glow
        if (isSel || isHov) {
          const glowR = pinR + (isSel ? 9 : 6) * sf
          const grad  = ctx.createRadialGradient(px, py, 0, px, py, glowR)
          grad.addColorStop(0, isSel ? pal.pinGlow : pal.pinHoverGlow)
          grad.addColorStop(1, "rgba(0,0,0,0)")
          ctx.beginPath()
          ctx.arc(px, py, glowR, 0, 2 * Math.PI)
          ctx.fillStyle = grad
          ctx.fill()
        }

        // Ripple rings for selected pin — two staggered radar-ping rings
        if (isSel) {
          for (let ri = 0; ri < 2; ri++) {
            const t     = ((performance.now() + ri * 1100) % 2200) / 2200  // 2.2s period, offset by half
            const ease  = 1 - Math.pow(1 - t, 2)                           // ease-out: fast expand, slow finish
            const ringR = pinR + ease * 16 * sf
            const alpha = (1 - t) * 0.42
            ctx.beginPath()
            ctx.arc(px, py, ringR, 0, 2 * Math.PI)
            ctx.strokeStyle = pal.pin
            ctx.globalAlpha = alpha
            ctx.lineWidth   = 1.6 * sf
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }

        // Pin fill
        ctx.beginPath()
        ctx.arc(px, py, pinR, 0, 2 * Math.PI)
        ctx.fillStyle = isSel ? pal.pin : isHov ? pal.pinHover : pal.pin
        ctx.globalAlpha = isSel ? 1 : isHov ? 1 : 0.72
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.strokeStyle = pal.pinStroke
        ctx.lineWidth   = 1.2 * sf
        ctx.stroke()
      })

      projectedPinsRef.current = newPins
    }

    // Data refs (persist across render calls)
    const landRef  = { current: null }
    const dotsRef  = { current: [] }

    // ─── Land dot helpers ─────────────────────────────────────────────────────
    function ptInPoly(p, poly) {
      let inside = false
      const [x, y] = p
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i], [xj, yj] = poly[j]
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
      }
      return inside
    }

    function ptInFeature(p, feature) {
      const geo = feature.geometry
      if (geo.type === "Polygon") {
        if (!ptInPoly(p, geo.coordinates[0])) return false
        for (let i = 1; i < geo.coordinates.length; i++)
          if (ptInPoly(p, geo.coordinates[i])) return false
        return true
      } else if (geo.type === "MultiPolygon") {
        for (const poly of geo.coordinates) {
          if (ptInPoly(p, poly[0])) {
            let hole = false
            for (let i = 1; i < poly.length; i++) if (ptInPoly(p, poly[i])) { hole = true; break }
            if (!hole) return true
          }
        }
      }
      return false
    }

    function generateDots(feature, spacing = 14) {
      const dots = []
      const [[mnLng, mnLat], [mxLng, mxLat]] = d3.geoBounds(feature)
      const step = spacing * 0.08
      for (let lng = mnLng; lng <= mxLng; lng += step)
        for (let lat = mnLat; lat <= mxLat; lat += step)
          if (ptInFeature([lng, lat], feature)) dots.push({ lng, lat })
      return dots
    }

    // ─── Load GeoJSON ─────────────────────────────────────────────────────────
    fetch("https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json")
      .then(r => r.json())
      .then(data => {
        landRef.current = data
        data.features.forEach(f => generateDots(f, 14).forEach(d => dotsRef.current.push(d)))
        setIsLoading(false)
        render()
      })
      .catch(() => setIsLoading(false))

    // ─── Smooth rotation system ────────────────────────────────────────────────
    // rotateSpeed lerps toward targetSpeed each frame for smooth pause/resume
    const rotation  = [0, -20, 0]
    let rotateSpeed = 0       // current speed (starts at 0, ramps up smoothly)
    let targetSpeed = 0.22    // desired speed

    const timer = d3.timer(() => {
      // Smooth lerp toward target speed — 0.09 feels snappy but not abrupt
      rotateSpeed += (targetSpeed - rotateSpeed) * 0.09
      const isSpinning = Math.abs(rotateSpeed) > 0.0008
      const hasSelection = selectedCodeRef.current && selectedCodeRef.current !== "ALL"
      if (isSpinning) {
        rotation[0] += rotateSpeed
        proj.rotate(rotation)
        render()
      } else if (hasSelection) {
        // Keep rendering for the pin pulse animation even when globe is still
        render()
      }
    })

    // ─── Zoom-in animation on pin click ───────────────────────────────────────
    let animTimer = null

    function animateToPin(pin) {
      // Stop rotation immediately (no lerp) — the animation itself controls rendering
      targetSpeed = 0
      rotateSpeed = 0
      zoomedInRef.current = true
      if (animTimer) { animTimer.stop(); animTimer = null }

      const startRot    = [...rotation]
      const startScale  = proj.scale()
      const targetScale = Math.min(radius * 2.5, startScale * 2.0)

      let dLng = -pin.lng - startRot[0]
      if (dLng >  180) dLng -= 360
      if (dLng < -180) dLng += 360
      const targetLng = startRot[0] + dLng
      const targetLat = -pin.lat
      const DURATION = 650

      animTimer = d3.timer(elapsed => {
        const t    = Math.min(elapsed / DURATION, 1)
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

        rotation[0] = startRot[0] + (targetLng  - startRot[0]) * ease
        rotation[1] = startRot[1] + (targetLat  - startRot[1]) * ease
        proj.rotate(rotation)
        proj.scale(startScale + (targetScale - startScale) * ease)
        render()

        if (t >= 1) {
          animTimer.stop()
          animTimer = null
          onSelectRef.current(pin.code)
        }
      })
    }

    // ─── Zoom-out animation when panel closes ─────────────────────────────────
    function animateZoomOut() {
      if (animTimer) { animTimer.stop(); animTimer = null }
      const startScale  = proj.scale()
      const targetScale = radius
      zoomedInRef.current = false
      if (Math.abs(startScale - targetScale) < 5) { targetSpeed = 0.22; return }

      const DURATION = 600
      animTimer = d3.timer(elapsed => {
        const t    = Math.min(elapsed / DURATION, 1)
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        proj.scale(startScale + (targetScale - startScale) * ease)
        render()
        if (t >= 1) {
          animTimer.stop()
          animTimer = null
          targetSpeed = 0.22  // resume auto-rotation after zoom out
        }
      })
    }
    zoomOutRef.current = animateZoomOut

    // ─── Interaction helpers ──────────────────────────────────────────────────
    function nearestPin(mx, my, threshold = 22) {
      let best = null, bestD = threshold
      for (const pin of projectedPinsRef.current) {
        if (!pin.visible) continue
        const d = Math.hypot(pin.x - mx, pin.y - my)
        if (d < bestD) { bestD = d; best = pin }
      }
      return best
    }

    function rectCoords(e) {
      const r = canvas.getBoundingClientRect()
      return [e.clientX - r.left, e.clientY - r.top]
    }

    // ─── Mouse ────────────────────────────────────────────────────────────────
    const onMouseDown = e => {
      targetSpeed = 0
      rotateSpeed = 0   // snap to stop while dragging
      isDraggingRef.current = true
      let moved  = false
      const [sx, sy] = [e.clientX, e.clientY]
      const [r0, r1] = [rotation[0], rotation[1]]

      const onMove = me => {
        const dx = me.clientX - sx, dy = me.clientY - sy
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true
        rotation[0] = r0 + dx * 0.38
        rotation[1] = Math.max(-80, Math.min(80, r1 - dy * 0.38))
        proj.rotate(rotation); render()
      }
      const onUp = ue => {
        document.removeEventListener("mousemove", onMove)
        document.removeEventListener("mouseup", onUp)
        isDraggingRef.current = false
        if (!moved) {
          const [mx, my] = rectCoords(ue)
          const pin = nearestPin(mx, my)
          if (pin) { animateToPin(pin); return }
        }
        // Resume rotation after idle drag — but not if panel is open or zoomed in
        setTimeout(() => { if (!panelOpenRef.current && !zoomedInRef.current) targetSpeed = 0.22 }, 2200)
      }
      document.addEventListener("mousemove", onMove)
      document.addEventListener("mouseup", onUp)
    }

    const onWheel = e => {
      e.preventDefault()
      const f = e.deltaY > 0 ? 0.91 : 1.09
      proj.scale(Math.max(radius * 0.55, Math.min(radius * 2.8, proj.scale() * f)))
      render()
    }

    const onMouseMove = e => {
      if (isDraggingRef.current) return
      const [mx, my] = rectCoords(e)
      const pin = nearestPin(mx, my)
      hoveredCodeRef.current = pin?.code ?? null
      setHoveredCode(pin?.code ?? null)
      setTooltipPos({ x: mx, y: my })
      canvas.style.cursor = pin ? "pointer" : "grab"
      // Smooth pause on hover, smooth resume when no pin — unless panel is open or zoomed in
      if (pin) {
        targetSpeed = 0
      } else if (!panelOpenRef.current && !zoomedInRef.current) {
        targetSpeed = 0.22
      }
      render()
    }

    const onMouseLeave = () => {
      hoveredCodeRef.current = null
      setHoveredCode(null)
      canvas.style.cursor = "grab"
      if (!panelOpenRef.current && !zoomedInRef.current) targetSpeed = 0.22
      render()
    }

    // ─── Touch ────────────────────────────────────────────────────────────────
    const onTouchStart = e => {
      if (e.touches.length !== 1) return
      targetSpeed = 0
      rotateSpeed = 0
      isDraggingRef.current = true
      const t0 = e.touches[0]
      const [sx, sy] = [t0.clientX, t0.clientY]
      const [r0, r1] = [rotation[0], rotation[1]]
      let moved = false

      const onTouchMove = te => {
        if (te.touches.length !== 1) return
        te.preventDefault()
        const t = te.touches[0]
        const dx = t.clientX - sx, dy = t.clientY - sy
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true
        rotation[0] = r0 + dx * 0.38
        rotation[1] = Math.max(-80, Math.min(80, r1 - dy * 0.38))
        proj.rotate(rotation); render()
      }
      const onTouchEnd = te => {
        canvas.removeEventListener("touchmove", onTouchMove)
        canvas.removeEventListener("touchend", onTouchEnd)
        isDraggingRef.current = false
        if (!moved && te.changedTouches.length) {
          const t   = te.changedTouches[0]
          const r   = canvas.getBoundingClientRect()
          const pin = nearestPin(t.clientX - r.left, t.clientY - r.top, 30)
          if (pin) { animateToPin(pin); return }
        }
        setTimeout(() => { if (!panelOpenRef.current && !zoomedInRef.current) targetSpeed = 0.22 }, 2200)
      }
      canvas.addEventListener("touchmove", onTouchMove, { passive: false })
      canvas.addEventListener("touchend", onTouchEnd)
    }

    canvas.addEventListener("mousedown",  onMouseDown)
    canvas.addEventListener("wheel",      onWheel,      { passive: false })
    canvas.addEventListener("mousemove",  onMouseMove)
    canvas.addEventListener("mouseleave", onMouseLeave)
    canvas.addEventListener("touchstart", onTouchStart, { passive: true })
    canvas.style.cursor = "grab"

    render()

    return () => {
      timer.stop()
      if (animTimer) animTimer.stop()
      canvas.removeEventListener("mousedown",  onMouseDown)
      canvas.removeEventListener("wheel",      onWheel)
      canvas.removeEventListener("mousemove",  onMouseMove)
      canvas.removeEventListener("mouseleave", onMouseLeave)
      canvas.removeEventListener("touchstart", onTouchStart)
    }
  }, [countries]) // stable — theme/selectedCountry/onSelect/panelOpen read via refs

  const pal            = buildPalette(theme, isDark)
  const hoveredCountry = countries.find(c => c.code === hoveredCode)
  const selectedBadge  = selectedCountry && selectedCountry !== "ALL"
    ? countries.find(c => c.code === selectedCountry) : null

  return (
    <div ref={wrapRef} style={{
      position: "relative",
      width: "100%", height: "100%",
      background: pal.ocean,
      overflow: "hidden",
      userSelect: "none",
    }}>
      {/* Canvas fades in from opacity 0 once land data is loaded */}
      <canvas ref={canvasRef} style={{
        display: "block", width: "100%", height: "100%",
        opacity: isLoading ? 0 : 1,
        transition: "opacity 1s ease",
      }} />

      {/* Loading overlay */}
      {isLoading && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <span style={{
            fontFamily: f.sans, fontSize: 10,
            color: pal.loading,
            letterSpacing: 2, textTransform: "uppercase",
          }}>
            Mapping the world…
          </span>
        </div>
      )}

      {/* Hover tooltip */}
      {hoveredCountry && (
        <div style={{
          position: "absolute",
          left: tooltipPos.x + 14,
          top: tooltipPos.y,
          transform: "translateY(-100%) translateY(-8px)",
          background: pal.tooltip.bg,
          border: `1px solid ${pal.tooltip.border}`,
          padding: "5px 11px",
          pointerEvents: "none",
          display: "flex", alignItems: "center", gap: 7,
          borderRadius: 2,
          whiteSpace: "nowrap",
          zIndex: 10,
        }}>
          <span style={{ fontSize: 15 }}>{hoveredCountry.flag}</span>
          <span style={{ fontFamily: f.sans, fontSize: 11, color: theme.ink, fontWeight: 500 }}>
            {hoveredCountry.name}
          </span>
          <span style={{ fontFamily: f.sans, fontSize: 9, color: theme.dim, letterSpacing: 0.4 }}>
            tap to filter
          </span>
        </div>
      )}

      {/* Selected badge */}
      {selectedBadge && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: pal.badge.bg,
          border: `1px solid ${pal.badge.border}`,
          padding: "4px 10px",
          display: "flex", alignItems: "center", gap: 6,
          borderRadius: 2,
        }}>
          <span style={{ fontSize: 13 }}>{selectedBadge.flag}</span>
          <span style={{ fontFamily: f.sans, fontSize: 10, color: pal.badgeText, fontWeight: 500 }}>
            {selectedBadge.name}
          </span>
        </div>
      )}

      {/* Hint — suppressed when parent provides its own instruction bar */}
      {!hideHint && (
        <div style={{
          position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
          fontFamily: f.sans, fontSize: 9, color: pal.hint,
          letterSpacing: 1.5, textTransform: "uppercase", whiteSpace: "nowrap",
          pointerEvents: "none",
        }}>
          drag · scroll to zoom · click a pin
        </div>
      )}
    </div>
  )
}
