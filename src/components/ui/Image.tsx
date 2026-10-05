import {
  useState,
  useCallback,
  type ReactNode,
  type SyntheticEvent,
  type CSSProperties,
  type ImgHTMLAttributes,
} from 'react'
import { cn } from '@/lib/utils'

type ImageLayout = 'responsive' | 'fill' | 'fixed' | 'intrinsic'
type ImagePlaceholder = 'skeleton' | 'blur' | 'none'
type ImageRounded = false | 'sm' | 'md' | 'lg' | 'full'
type LoadStatus = 'loading' | 'loaded' | 'error'

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
  src: string
  alt: string
  layout?: ImageLayout
  aspectRatio?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  placeholder?: ImagePlaceholder
  blurDataURL?: string
  priority?: boolean
  fallbackSrc?: string
  fallback?: ReactNode
  rounded?: ImageRounded
  wrapperClassName?: string
}

export interface AvatarImageProps extends Omit<ImageProps, 'layout' | 'rounded' | 'objectFit'> {
  size?: number
}

const roundedMap: Record<Exclude<ImageRounded, false>, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

function imageLayoutStyles(
  layout: ImageLayout,
  width: ImageProps['width'],
  height: ImageProps['height'],
  aspectRatio: string | undefined
): { wrapperStyle: CSSProperties; sizeStyle: CSSProperties } {
  switch (layout) {
    case 'fill':
      return {
        wrapperStyle: { position: 'absolute', inset: 0 },
        sizeStyle: { width: '100%', height: '100%' },
      }
    case 'fixed':
      return {
        wrapperStyle: { display: 'inline-block', position: 'relative', width, height },
        sizeStyle: { width, height },
      }
    case 'intrinsic':
      return {
        wrapperStyle: { display: 'inline-block', position: 'relative', maxWidth: '100%' },
        sizeStyle: { width, height },
      }
    case 'responsive':
      return {
        wrapperStyle: {
          position: 'relative',
          width: '100%',
          aspectRatio: aspectRatio ?? (width && height ? `${width}/${height}` : undefined),
        },
        sizeStyle: { width: '100%', height: '100%' },
      }
  }
}

function ImagePlaceholderLayer({
  placeholder,
  blurDataURL,
  roundedClass,
  objectFit,
}: Pick<ImageProps, 'placeholder' | 'blurDataURL' | 'objectFit'> & { roundedClass: string }) {
  if (placeholder === 'skeleton') {
    return <span className={cn('absolute inset-0 animate-pulse bg-gray-200', roundedClass)} />
  }
  if (placeholder === 'blur' && blurDataURL) {
    return (
      <img
        src={blurDataURL}
        aria-hidden
        alt=""
        className={cn('absolute inset-0 h-full w-full scale-110 blur-xl', roundedClass)}
        style={{ objectFit }}
      />
    )
  }
  return null
}

const ImageContent = ({
  src,
  alt,
  layout = 'responsive',
  aspectRatio,
  objectFit = 'cover',
  objectPosition = 'center',
  placeholder = 'none',
  blurDataURL,
  priority = false,
  fallbackSrc,
  fallback,
  rounded = false,
  wrapperClassName,
  className,
  width,
  height,
  style,
  onLoad,
  onError,
  ...props
}: ImageProps) => {
  const [useFallback, setUseFallback] = useState(false)
  const [status, setStatus] = useState<LoadStatus>('loading')

  const currentSrc = useFallback && fallbackSrc ? fallbackSrc : src

  const imgCallbackRef = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) {
      setStatus('loaded')
    }
  }, [])

  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    setStatus('loaded')
    onLoad?.(e)
  }

  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    if (fallbackSrc && !useFallback) {
      setUseFallback(true)
      setStatus('loading')
    } else {
      setStatus('error')
    }
    onError?.(e)
  }

  const isLoading = status === 'loading'
  const isError = status === 'error'
  const roundedClass = rounded ? roundedMap[rounded] : ''

  if (isError && fallback) {
    return <>{fallback}</>
  }

  const { wrapperStyle, sizeStyle } = imageLayoutStyles(layout, width, height, aspectRatio)
  const imgStyle: CSSProperties = { objectFit, objectPosition, ...style, ...sizeStyle }

  return (
    <span
      className={cn('block overflow-hidden', roundedClass, wrapperClassName)}
      style={wrapperStyle}
    >
      {isLoading && (
        <ImagePlaceholderLayer
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          roundedClass={roundedClass}
          objectFit={objectFit}
        />
      )}
      <img
        ref={imgCallbackRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? undefined : 'lazy'}
        decoding={priority ? undefined : 'async'}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          roundedClass,
          className
        )}
        style={imgStyle}
        {...props}
      />
    </span>
  )
}

// A new source owns a fresh load lifecycle, including fallback and placeholder state.
const Image = (props: ImageProps) => <ImageContent key={props.src} {...props} />

const AvatarImage = ({ size = 40, width, height, ...props }: AvatarImageProps) => (
  <Image
    layout="fixed"
    rounded="full"
    objectFit="cover"
    width={width ?? size}
    height={height ?? size}
    {...props}
  />
)

const HeroImage = (
  props: Omit<ImageProps, 'layout' | 'aspectRatio' | 'priority' | 'objectFit'>
) => <Image layout="responsive" aspectRatio="16/9" priority objectFit="cover" {...props} />

const ThumbnailImage = (
  props: Omit<ImageProps, 'layout' | 'aspectRatio' | 'rounded' | 'objectFit'>
) => <Image layout="responsive" aspectRatio="16/9" rounded="md" objectFit="cover" {...props} />

export { Image, AvatarImage, HeroImage, ThumbnailImage }
