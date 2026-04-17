'use client'

export default function BrandLogo({
  className = '',
  compact = false,
  alt = 'Accessories Emporium logo',
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <img
        src="/assets/Image/logo.svg"
        alt={alt}
        className={compact ? 'h-9 w-auto' : 'h-10 w-auto sm:h-11'}
        loading="eager"
        decoding="async"
      />
    </div>
  )
}
