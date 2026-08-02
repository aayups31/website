"use client";

import { useEffect, useRef } from "react";
import type { WorldId } from "./experience-store";

const frequencies: Record<WorldId, number> = {
  prologue: 42,
  football: 55,
  racing: 73,
  psychological: 38,
  archive: 64,
  contact: 48,
};

type AudioGraph = {
  context: AudioContext;
  master: GainNode;
  tone: OscillatorNode;
  overtone: OscillatorNode;
};

export function useProceduralAudio(enabled: boolean, world: WorldId) {
  const graphRef = useRef<AudioGraph | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (enabled && !graphRef.current) {
      const context = new window.AudioContext();
      const master = context.createGain();
      const tone = context.createOscillator();
      const overtone = context.createOscillator();
      const filter = context.createBiquadFilter();

      master.gain.value = 0;
      tone.type = "sine";
      overtone.type = "triangle";
      tone.frequency.value = frequencies[world];
      overtone.frequency.value = frequencies[world] * 2.01;
      filter.type = "lowpass";
      filter.frequency.value = 210;
      filter.Q.value = 0.7;

      tone.connect(filter);
      overtone.connect(filter);
      filter.connect(master);
      master.connect(context.destination);
      tone.start();
      overtone.start();
      graphRef.current = { context, master, tone, overtone };
    }

    const graph = graphRef.current;
    if (!graph) return;
    const now = graph.context.currentTime;
    graph.master.gain.cancelScheduledValues(now);
    graph.master.gain.setTargetAtTime(enabled ? 0.018 : 0, now, enabled ? 0.08 : 0.04);
    if (enabled && !document.hidden) void graph.context.resume();
  }, [enabled, world]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    const now = graph.context.currentTime;
    graph.tone.frequency.setTargetAtTime(frequencies[world], now, 0.18);
    graph.overtone.frequency.setTargetAtTime(frequencies[world] * 2.01, now, 0.18);
  }, [world]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const graph = graphRef.current;
      if (!graph) return;
      if (document.hidden) void graph.context.suspend();
      else if (enabledRef.current) void graph.context.resume();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(
    () => () => {
      const graph = graphRef.current;
      if (!graph) return;
      graph.tone.stop();
      graph.overtone.stop();
      void graph.context.close();
      graphRef.current = null;
    },
    [],
  );
}
