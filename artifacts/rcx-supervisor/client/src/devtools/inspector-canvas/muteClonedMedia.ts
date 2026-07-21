/**
 * Force-mute every <video>/<audio> inside a cloned subtree.
 *
 * Why this exists: React applies the `muted` prop as a DOM *property* only —
 * it never writes a `muted` content attribute (long-standing React quirk,
 * facebook/react#10389). `cloneNode(true)` copies attributes, not properties,
 * so a clone of a muted autoplaying video keeps its `autoplay` attribute but
 * loses the mute → inspector preview/explode clones blast audio from every
 * tile at once.
 *
 * We keep autoplay (a silently-playing thumbnail is a feature) and just pin
 * the audio off: `muted` for the live property, `defaultMuted` so the
 * attribute is present too if the clone is ever re-cloned.
 */
export function muteClonedMedia(cloneRoot: Element): void {
  const media: HTMLMediaElement[] = [];
  if (cloneRoot instanceof HTMLMediaElement) media.push(cloneRoot);
  media.push(...Array.from(cloneRoot.querySelectorAll<HTMLMediaElement>('video, audio')));
  for (const el of media) {
    el.muted = true;
    el.defaultMuted = true;
    el.volume = 0;
  }
}
