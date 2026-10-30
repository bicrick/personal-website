/**
 * Port of consumer/web/pen_sound.js for the React site demo.
 * Recorded-pen grains (Freesound 499189, CC0). Nothing is fetched or created
 * until unlock() runs inside a user gesture.
 */
import bankUrl from './sound/pen-bank.mp3';
import tapDown0 from './sound/tap-down0.wav';
import tapDown1 from './sound/tap-down1.wav';
import tapDown2 from './sound/tap-down2.wav';
import tapDown3 from './sound/tap-down3.wav';
import tapLift0 from './sound/tap-lift0.wav';
import tapLift1 from './sound/tap-lift1.wav';
import tapLift2 from './sound/tap-lift2.wav';
import tapLift3 from './sound/tap-lift3.wav';

export const PEN_SOUND = {
  P: {
    gate_tau: 0.004,
    v_ref: 70,
    master_lp: 8000,
    grain_len: 0.07,
    grain_hop: 0.025,
    grain_rate_lo: 0.85,
    grain_rate_span: 0.3,
    grain_floor: 0.12,
    glide_curve: 1.6,
    stroke_jitter: 0.25,
    level: 1.714 * 0.5,
  },
  bank: bankUrl,
  taps: {
    down: [tapDown0, tapDown1, tapDown2, tapDown3],
    lift: [tapLift0, tapLift1, tapLift2, tapLift3],
  },
};

export class PenSound {
  constructor(cfg = PEN_SOUND) {
    this.cfg = cfg;
    this.P = cfg.P;
    this.ctx = null;
    this.on = true;
    this.down = 0;
    this.ready = null;
  }

  vn(v) {
    return 1 - Math.exp(-v / this.P.v_ref);
  }

  /** Call inside a user gesture; builds the graph once, lazy-loads the clips. */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return Promise.resolve();
      try {
        if (navigator.audioSession) navigator.audioSession.type = 'playback';
      } catch (e) { /* iOS silent switch */ }
      this.ctx = new AC({ latencyHint: 'interactive' });
      this.ready = this.build().catch(() => {
        this.bank = null;
      });
    }
    if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
    return this.ready;
  }

  async load(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${url}: ${r.status}`);
    const b = await r.arrayBuffer();
    return new Promise((ok, no) => this.ctx.decodeAudioData(b, ok, no));
  }

  async build() {
    const c = this.ctx;
    const P = this.P;
    this.mute = c.createGain();
    this.mute.gain.value = this.on ? 1 : 0;
    const lim = c.createWaveShaper();
    {
      const n = 2048;
      const k = new Float32Array(n);
      for (let i = 0; i < n; i += 1) {
        const x = (i / (n - 1)) * 2 - 1;
        const a = Math.abs(x);
        k[i] = Math.sign(x) * (a < 0.7 ? a : 0.7 + 0.3 * Math.tanh((a - 0.7) / 0.3));
      }
      lim.curve = k;
    }
    this.mute.connect(lim).connect(c.destination);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = P.master_lp;
    lp.Q.value = 0.707;
    const hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 120;
    hp.Q.value = 0.5;
    const level = c.createGain();
    level.gain.value = P.level;
    lp.connect(hp).connect(level).connect(this.mute);
    this.bus = lp;
    this.gate = c.createGain();
    this.gate.gain.value = 0;
    this.gate.connect(this.bus);
    this.nextGrain = 0;
    const T = this.cfg.taps;
    const [bank, ...taps] = await Promise.all(
      [this.cfg.bank, ...T.down, ...T.lift].map((u) => this.load(u)),
    );
    this.taps = { down: taps.slice(0, T.down.length), lift: taps.slice(T.down.length) };
    this.bank = bank;
  }

  setOn(on) {
    this.on = on;
    if (this.mute && this.ctx) {
      this.mute.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.02);
    }
    if (!on) this.silence();
  }

  silence() {
    if (this.down || this.nextGrain) this.update({ down: 0, v: 0 });
  }

  tap(kind) {
    if (!this.ctx || !this.on || !this.taps || this.ctx.state !== 'running') return;
    const list = this.taps[kind];
    const s = this.ctx.createBufferSource();
    const g = this.ctx.createGain();
    s.buffer = list[(Math.random() * list.length) | 0];
    g.gain.value = kind === 'down' ? 0.7 + 0.45 * Math.random() : 0.6 + 0.5 * Math.random();
    s.connect(g).connect(this.bus);
    s.start();
    if (typeof window !== 'undefined' && window.__SCRIBE_SOUND_LOG) {
      window.__SCRIBE_SOUND_LOG.taps.push({ kind, t: performance.now() });
    }
  }

  update(st) {
    if (!this.ctx || !this.gate) return;
    const P = this.P;
    const c = this.ctx;
    const t = c.currentTime;
    if (!this.down && st.down) this.press = 1 + P.stroke_jitter * (2 * Math.random() - 1);
    this.down = st.down ? 1 : 0;
    const d = st.down ? this.press || 1 : 0;
    const vn = this.vn(st.v);
    this.gate.gain.setTargetAtTime(this.bank && this.on ? d : 0, t, P.gate_tau);
    if (typeof window !== 'undefined' && window.__SCRIBE_SOUND_LOG && st.down) {
      window.__SCRIBE_SOUND_LOG.updates.push({
        down: st.down,
        v: st.v,
        t: performance.now(),
        ctx: c.state,
      });
    }
    if (!this.bank || !st.down || !this.on || c.state !== 'running') {
      this.nextGrain = 0;
      return;
    }
    if (this.nextGrain < t) this.nextGrain = t + 0.005;
    const bank = this.bank;
    const L = P.grain_len;
    const rate = P.grain_rate_lo + P.grain_rate_span * vn;
    const amp = (P.grain_floor + (1 - P.grain_floor) * vn ** P.glide_curve) / 0.9;
    while (this.nextGrain < t + 0.1) {
      const s = c.createBufferSource();
      const g = c.createGain();
      const at = this.nextGrain;
      s.buffer = bank;
      s.playbackRate.value = rate;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(amp, at + L / 2);
      g.gain.linearRampToValueAtTime(0, at + L);
      s.connect(g).connect(this.gate);
      s.start(at, Math.random() * (bank.duration - L * rate - 0.01), L * rate);
      this.nextGrain += P.grain_hop;
    }
  }
}
