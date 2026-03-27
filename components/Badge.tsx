const variants: Record<string, React.CSSProperties> = {
  default: { background:'#dcfce7', color:'#15803d', border:'1px solid #bbf7d0' },
  solid:   { background:'#16a34a', color:'#fff' },
  outline: { background:'transparent', color:'#15803d', border:'1px solid #16a34a' },
  urgent:  { background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca' },
  muted:   { background:'#f4f4f5', color:'#71717a', border:'1px solid #e4e4e7' },
  yellow:  { background:'#fefce8', color:'#a16207', border:'1px solid #fde68a' },
};
export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: string }) {
  return (
    <span style={{ ...variants[variant] || variants.default, display:'inline-flex', alignItems:'center', padding:'2px 10px', borderRadius:99, fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>
      {children}
    </span>
  );
}
