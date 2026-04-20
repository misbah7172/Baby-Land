import { clsx } from 'clsx';
import Link from 'next/link';
import Image from 'next/image';

export function Button({ className, href, children, type = 'button', onClick, ...props }: any) {
  const classes = clsx(
    'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition',
    'bg-rosewood text-white shadow-soft hover:translate-y-[-1px] hover:bg-[#58342f]',
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
}

export function Card({ className, children }: any) {
  return <div className={clsx('rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-soft', className)}>{children}</div>;
}

export function SectionTitle({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-blush-700">{eyebrow}</p> : null}
      <h2 className="font-display text-3xl text-rosewood md:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-sm leading-7 text-stone-600 md:text-base">{description}</p> : null}
    </div>
  );
}

export function Price({ price, discountPrice }: { price: string; discountPrice: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg font-semibold text-rosewood">৳{discountPrice ?? price}</span>
      {discountPrice ? <span className="text-sm text-stone-400 line-through">৳{price}</span> : null}
    </div>
  );
}

export function ProductImageTile({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-blush-100">
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  );
}