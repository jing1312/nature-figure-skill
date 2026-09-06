/**
 * FigureForge — Day/Night Theme Transition
 *
 * Full-screen sunrise/sunset animation played while the editor theme flips,
 * ported from 88lin/HeoLume commit 5d4a5be (heo dayNightTransition).
 * Sequence: sky fades in → day/night gradients crossfade while sun and moon
 * sweep along an arc (they swap opacity at the arc midpoint, when both are
 * out of view) → a meteor streaks on the way to night → sky holds, the
 * actual theme flip happens while the page is fully covered → sky fades out.
 */
const DayNight = (function () {
  const FADE_IN = 380;
  const ARC = 1600;
  const CROSS_DELAY = 260;
  const CROSSFADE = 1150;
  /** Sun/moon swap duration and timing: pinned to the arc midpoint while
      both orbs are outside the viewport, so you see one set and the other
      rise instead of an in-place morph. */
  const SWAP = 320;
  const SWAP_AT = ARC / 2 - SWAP / 2;
  /** A meteor streaks only on the way into night, filling the gap while
      both orbs are out of sight. */
  const METEOR = 850;
  const METEOR_AT = 880;
  /** How long the new sun/moon lingers at the apex before the page is
      unveiled, and how long the sky takes to fade away. */
  const HOLD_OUT = 240;
  const LEAVE_AT = ARC + HOLD_OUT;
  const FADE_OUT = 700;
  /** The theme flips while the sky fully covers the page. */
  const SWITCH_AT = FADE_IN + 140;
  const CSS_VARS = {
    '--ff-dn-fade-in': FADE_IN,
    '--ff-dn-cross-delay': CROSS_DELAY,
    '--ff-dn-cross': CROSSFADE,
    '--ff-dn-arc': ARC,
    '--ff-dn-swap-delay': SWAP_AT,
    '--ff-dn-swap': SWAP,
    '--ff-dn-meteor-delay': METEOR_AT,
    '--ff-dn-meteor': METEOR,
    '--ff-dn-fade-out': FADE_OUT,
  };

  const SKY_HTML = `
    <div class="ff-daynight__layer ff-daynight__layer--day"></div>
    <div class="ff-daynight__layer ff-daynight__layer--night">
      <span class="ff-daynight__stars ff-daynight__stars--far"></span>
      <span class="ff-daynight__stars ff-daynight__stars--mid"></span>
      <span class="ff-daynight__stars ff-daynight__stars--near"></span>
      <span class="ff-daynight__spark ff-daynight__spark--a"></span>
      <span class="ff-daynight__spark ff-daynight__spark--b"></span>
      <span class="ff-daynight__spark ff-daynight__spark--c"></span>
      <span class="ff-daynight__meteor"></span>
    </div>
    <div class="ff-daynight__orbit">
      <div class="ff-daynight__orb ff-daynight__orb--sun"></div>
      <div class="ff-daynight__orb ff-daynight__orb--moon"></div>
    </div>`;

  let active = null;

  function endActive() {
    if (!active) return;
    active.timers.forEach(id => clearTimeout(id));
    active.sky.remove();
    active = null;
  }

  function prefersReducedMotion() {
    return typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Play the transition. onSwitch runs while the sky covers the page.
   * @param {boolean} toDark true = sunset into dark theme, false = sunrise
   * @param {() => void} onSwitch theme flip callback
   */
  function play(toDark, onSwitch) {
    if (prefersReducedMotion()) { onSwitch && onSwitch(); return; }
    if (active) {
      if (!active.switched) return; // mid-flight: don't restart, don't flip
      endActive();
    }
    const sky = document.createElement('div');
    sky.className = 'ff-daynight ff-daynight--' + (toDark ? 'to-dark' : 'to-light');
    sky.setAttribute('aria-hidden', 'true');
    Object.entries(CSS_VARS).forEach(([name, value]) => {
      sky.style.setProperty(name, value + 'ms');
    });
    sky.innerHTML = SKY_HTML;
    document.body.appendChild(sky);

    const current = { sky, timers: [], switched: false };
    active = current;

    // Two frames so the initial opacity 0 is committed before transitioning
    requestAnimationFrame(() => {
      sky.classList.add('is-visible');
      requestAnimationFrame(() => sky.classList.add('is-shifting'));
    });

    current.timers.push(setTimeout(() => {
      current.switched = true;
      onSwitch && onSwitch();
    }, SWITCH_AT));

    current.timers.push(setTimeout(() => {
      sky.classList.remove('is-visible');
      sky.classList.add('is-leaving');
    }, LEAVE_AT));

    current.timers.push(setTimeout(() => {
      if (active === current) endActive();
    }, LEAVE_AT + FADE_OUT));
  }

  return { play };
})();
window.DayNight = DayNight;
