// AI checkarea glyphs for the Checklist tab (Figma node 22:81091). The checked
// state carries the AI orange gradient + white check ("AI-verified" signal, not
// a plain checkbox); no Spring Icon equivalent exists for that gradient glyph,
// so it is extracted directly from Figma as a static SVG. The unchecked state
// is a plain outlined circle, redrawn locally to match the extracted asset.
export const AiCheckAreaChecked = () => (
  <svg
    width='16'
    height='16'
    viewBox='0 0 16 16'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden
  >
    <circle cx='8' cy='8' r='8' fill='url(#ai-checkarea-gradient)' />
    <path
      d='M6.896 12.224L3.836 9.164L4.964 8.036L6.704 9.776L10.9577 3.932L12.2417 4.868L6.896 12.224Z'
      fill='white'
    />
    <defs>
      <linearGradient
        id='ai-checkarea-gradient'
        x1='0'
        y1='0'
        x2='16'
        y2='16'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#E54800' />
        <stop offset='0.5' stopColor='#FE8624' />
        <stop offset='1' stopColor='#FFAB64' />
      </linearGradient>
    </defs>
  </svg>
);

export const AiCheckAreaUnchecked = () => (
  <svg
    width='16'
    height='16'
    viewBox='0 0 16 16'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden
  >
    <circle cx='8' cy='8' r='7.25' stroke='#c1c3c8' strokeWidth='1.5' />
  </svg>
);
