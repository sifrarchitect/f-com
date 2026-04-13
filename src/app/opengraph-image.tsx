import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'F-Manager — Bangladesh\'s F-Commerce Platform'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0A0A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#FAFAFA',
            letterSpacing: '-0.02em',
            marginBottom: 16,
          }}
        >
          F·Manager
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#888888',
            maxWidth: 600,
            textAlign: 'center',
          }}
        >
          Bangladesh&apos;s F-Commerce Platform
        </div>
      </div>
    ),
    { ...size }
  )
}
