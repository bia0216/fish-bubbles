const VARIANTS: Record<string, { bg: string; stroke: string; eye: string }> = {
  coral: { bg: "#FFE3D6", stroke: "#FF6B35", eye: "#1B2A4A" },
  teal:  { bg: "#d3edf0", stroke: "#7FA8B0", eye: "#1B2A4A" },
  navy:  { bg: "#dfe6f0", stroke: "#1B2A4A", eye: "#FF6B35" },
  amber: { bg: "#FAEEDA", stroke: "#EF9F27", eye: "#1B2A4A" },
};

export default function Avatar({
  avatarUrl,
  size = 40,
}: {
  avatarUrl: string | null | undefined;
  size?: number;
}) {
  const isUpload = avatarUrl && !avatarUrl.startsWith("default:");

  if (isUpload) {
    return (
      <img
        src={avatarUrl!}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const key = avatarUrl?.startsWith("default:") ? avatarUrl.split(":")[1] : "teal";
  const v = VARIANTS[key] || VARIANTS.teal;

  return (
    <span
      className="rounded-full inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: v.bg }}
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 65 Q90 25 135 65 Q90 105 40 65 Z" fill="none" stroke={v.stroke} strokeWidth="13" strokeLinejoin="round" strokeLinecap="round"/>
        <path d="M135 65 L175 40 L175 90 Z" fill="none" stroke={v.stroke} strokeWidth="13" strokeLinejoin="round" strokeLinecap="round"/>
        <circle cx="68" cy="56" r="7" fill={v.eye}/>
      </svg>
    </span>
  );
}