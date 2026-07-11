import { useCallback, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  IDENTITÉ SONORE — 7 agents, 7 timbres + notes                      */
/* ------------------------------------------------------------------ */

const AGENT_FREQUENCIES: Record<string, number> = {
  'chief-of-staff': 523.25,    // C5 — sine clair, autorité
  'market-intel': 587.33,      // D5 — triangle, intelligence
  'content-strategist': 659.25, // E5 — soft square, créativité
  'scriptwriter': 698.46,      // F5 — sine pur, écriture
  'prompt-engineer': 783.99,   // G5 — sawtooth filtré, visuel
  'sales-lead-ops': 880.00,    // A5 — triangle métallique, conversion
  'proof-delivery': 987.77,    // B5 — pulse, validation
};

const AGENT_WAVEFORMS: Record<string, OscillatorType> = {
  'chief-of-staff': 'sine',
  'market-intel': 'triangle',
  'content-strategist': 'square',
  'scriptwriter': 'sine',
  'prompt-engineer': 'sawtooth',
  'sales-lead-ops': 'triangle',
  'proof-delivery': 'square',
};

/* ------------------------------------------------------------------ */
/*  SYNTHÈSE — Moteur audio Web Audio API                              */
/* ------------------------------------------------------------------ */

class BrandOSSynth {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  private isMuted = false;

  constructor() {
    this.isMuted = localStorage.getItem('mrz-audio-muted') === 'true';
  }

  get muted() { return this.isMuted; }

  setMuted(v: boolean) {
    this.isMuted = v;
    localStorage.setItem('mrz-audio-muted', String(v));
  }

  /* Doit être appelé après un geste utilisateur (click) */
  init() {
    if (this.ctx) return;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.12;
      this.masterGain.connect(this.ctx.destination);
    } catch {
      console.warn('Web Audio API non disponible');
    }
  }

  private ensure() {
    if (!this.ctx || this.ctx.state === 'suspended') {
      this.init();
      this.ctx?.resume();
    }
  }

  private playOsc(freq: number, type: OscillatorType, duration: number, gain = 0.3, detune = 0) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (detune) osc.detune.setValueAtTime(detune, t);

    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(gain, t + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  private playFilterSweep(freqStart: number, freqEnd: number, duration: number) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freqStart, t);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(4000, t + duration);
    filter.Q.value = 2;

    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.2, t + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  private playNoise(duration: number, filterFreq: number) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 1;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.15, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    noise.start(t);
    noise.stop(t + duration);
  }

  /* ---------------------------------------------------------------- */
  /*  SONS PUBLIC — un par événement                                    */
  /* ---------------------------------------------------------------- */

  /** Son d'activation d'un agent (quand le bouton Lancer est cliqué) */
  agentPulse(agentId: string) {
    this.ensure();
    const freq = AGENT_FREQUENCIES[agentId] || 440;
    const type = AGENT_WAVEFORMS[agentId] || 'sine';
    this.playOsc(freq, type, 0.08, 0.35);
    /* Double légèrement décalé pour rondeur */
    setTimeout(() => this.playOsc(freq * 1.5, 'sine', 0.06, 0.15, 10), 40);
  }

  /** Packet qui quitte un nœud */
  packetDepart() {
    this.ensure();
    this.playFilterSweep(150, 800, 0.15);
  }

  /** Packet qui arrive à destination */
  packetArrive() {
    this.ensure();
    this.playOsc(1200, 'sine', 0.06, 0.25);
    setTimeout(() => this.playOsc(1800, 'sine', 0.04, 0.12), 50);
  }

  /** Succès — accord majeur léger */
  success() {
    this.ensure();
    const t = this.ctx!.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.setValueAtTime(0, t + i * 0.03);
      g.gain.linearRampToValueAtTime(0.12, t + i * 0.03 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.03 + 0.25);
      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(t + i * 0.03);
      osc.stop(t + i * 0.03 + 0.3);
    });
  }

  /** Échec — buzz grave descendant */
  error() {
    this.ensure();
    const t = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const g = this.ctx!.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(g);
    g.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  /** Démarrage simulation — arpège montant */
  simulationStart() {
    this.ensure();
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00];
    notes.forEach((f, i) => {
      setTimeout(() => this.playOsc(f, 'triangle', 0.12, 0.2), i * 60);
    });
  }

  /** Step de simulation validé */
  simulationStep() {
    this.ensure();
    this.playNoise(0.05, 2500);
  }

  /** Toast / notification */
  toast() {
    this.ensure();
    this.playOsc(880, 'sine', 0.04, 0.15);
    setTimeout(() => this.playOsc(1100, 'sine', 0.04, 0.08), 60);
  }
}

/* ------------------------------------------------------------------ */
/*  HOOK REACT                                                         */
/* ------------------------------------------------------------------ */

let globalSynth: BrandOSSynth | null = null;

function getSynth() {
  if (!globalSynth) globalSynth = new BrandOSSynth();
  return globalSynth;
}

export function useSound() {
  const synth = useRef(getSynth());
  const [muted, setMutedState] = useState(() => synth.current.muted);

  const init = useCallback(() => {
    synth.current.init();
  }, []);

  const setMuted = useCallback((v: boolean) => {
    synth.current.setMuted(v);
    setMutedState(v);
  }, []);

  const toggle = useCallback(() => {
    const next = !muted;
    setMuted(next);
    if (!next) {
      /* Unmute = init pour déverrouiller si besoin */
      synth.current.init();
      synth.current.toast();
    }
  }, [muted, setMuted]);

  return {
    synth: synth.current,
    muted,
    setMuted,
    toggle,
    init,
  };
}

export type { BrandOSSynth };
