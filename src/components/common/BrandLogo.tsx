type BrandLogoProps = {
  className?: string;
  heightClassName?: string;
  showCaption?: boolean;
};

export default function BrandLogo({
  className = '',
  heightClassName = 'h-10 sm:h-12',
  showCaption = false,
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/pwn-shakti-main-logo.svg"
        alt="PWN SHAKTI"
        className={`${heightClassName} w-auto object-contain select-none drop-shadow-[0_0_14px_rgba(109,40,217,0.35)]`}
        draggable={false}
      />
      {showCaption && (
        <span className="sr-only">PWN SHAKTI - AI Powered Cyber Defense</span>
      )}
    </div>
  );
}
