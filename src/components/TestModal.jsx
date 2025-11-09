import React, { useEffect, useRef, useState } from "react";
import HeaderBar from "./HeaderBar";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import Calculator from "./Calculator";
import { fetchQuestions, saveAttempt } from "../firebase";
import { shuffle } from "../utils/shuffle";

const FIXED_WIDTH = 1200;
const FIXED_HEIGHT = 700;

export default function TestModal({ onClose }) {
  const [questions, setQuestions] = useState([]); // questions for active section
  const [current, setCurrent] = useState(0);
  const [statuses, setStatuses] = useState({});
  const [showCalc, setShowCalc] = useState(false);
  const [warning, setWarning] = useState("");
  const [sectionIndex, setSectionIndex] = useState(0);
  const [config, setConfig] = useState(null);
  const [allPools, setAllPools] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [globalElapsed, setGlobalElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [completedSections, setCompletedSections] = useState([]);
  const tabSwitchCount = useRef(0);
  const sectionStartTime = useRef(Date.now());
  const globalStartTime = useRef(Date.now());
  const stateKey = useRef("tcs-nqt-exam-state-v2");

  // Initial load: config & pools
  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.BASE_URL || "/";
    // Helper to optionally load a generated pool and merge it
    const loadPools = async () => {
      const core = await fetch(`${base}sample-data/questions.json`).then((r) =>
        r.json()
      );
      try {
        const gen = await fetch(
          `${base}sample-data/questions.generated.json`
        ).then((r) => (r.ok ? r.json() : null));
        if (!gen) return core;
        const out = { ...core };
        for (const k of Object.keys(gen)) {
          const a = Array.isArray(core[k]) ? core[k] : [];
          const b = Array.isArray(gen[k]) ? gen[k] : [];
          out[k] = [...a, ...b];
        }
        return out;
      } catch {
        return core;
      }
    };

    Promise.all([
      fetch(`${base}examConfig.json`).then((r) => r.json()),
      loadPools(),
    ]).then(([cfg, pools]) => {
      if (!mounted) return;
      setConfig(cfg);
      setAllPools(pools);
      const saved = localStorage.getItem(stateKey.current);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Validate saved questions shape; if invalid, discard saved state
          const savedQs = Array.isArray(parsed.questions)
            ? parsed.questions
            : [];
          const looksValid =
            savedQs.length > 0 &&
            savedQs.every(
              (q) =>
                q && typeof q.question === "string" && Array.isArray(q.options)
            );
          setSectionIndex(parsed.sectionIndex || 0);
          setGlobalElapsed(parsed.globalElapsed || 0);
          setTimeLeft(
            parsed.timeLeft ||
              cfg.sequence[parsed.sectionIndex || 0].durationSec
          );
          if (looksValid) {
            setStatuses(parsed.statuses || {});
            setQuestions(savedQs);
            setCurrent(
              typeof parsed.current === "number" && parsed.current >= 0
                ? parsed.current
                : 0
            );
            sectionStartTime.current =
              Date.now() - (parsed.sectionElapsed || 0) * 1000;
            globalStartTime.current =
              Date.now() - (parsed.globalElapsed || 0) * 1000;
            applyBodyLocks(true);
            enterFullscreen();
            return;
          } else {
            // Stale/bad save; clear and start fresh
            localStorage.removeItem(stateKey.current);
          }
        } catch {}
      }
      prepareSection(cfg, pools, 0);
      applyBodyLocks(true);
      enterFullscreen();
    });
    return () => {
      mounted = false;
    };
  }, []);

  function prepareSection(cfg, pools, idx) {
    const section = cfg.sequence[idx];
    const pool = pools[section.key] || [];
    // Avoid recently used question IDs to increase variety across runs
    const recentKey = `tcs-recent-${section.key}`;
    const recent = (() => {
      try {
        const arr = JSON.parse(localStorage.getItem(recentKey) || "[]");
        return Array.isArray(arr) ? new Set(arr) : new Set();
      } catch {
        return new Set();
      }
    })();
    const withIds = pool.map((q, i) => ({
      __id: q.id || `${(q.question || "").slice(0, 50)}#${i}`,
      ...q,
    }));
    let candidates = withIds.filter((q) => !recent.has(q.__id));
    if (candidates.length < section.count) candidates = withIds; // fallback if pool too small
    const sliced = shuffle(candidates)
      .slice(0, section.count)
      .map((q, i) => ({
        ...q,
        // Ensure structure always present to avoid undefined in MainContent
        options: Array.isArray(q.options)
          ? q.options
          : ["Option A", "Option B"],
        question: q.question || `Question ${i + 1}`,
      }));
    // Update recent ring buffer (cap 300 per category)
    try {
      const ring = Array.from(recent);
      ring.unshift(...sliced.map((q) => q.__id));
      const capped = ring.slice(0, 300);
      localStorage.setItem(recentKey, JSON.stringify(capped));
    } catch {}
    setQuestions(sliced);
    const map = {};
    for (let i = 0; i < sliced.length; i++) map[i] = "not-visited";
    setStatuses(map);
    setCurrent(0);
    setTimeLeft(section.durationSec);
    sectionStartTime.current = Date.now();
  }

  // timers
  useEffect(() => {
    if (!config) return;
    const tick = setInterval(() => {
      if (!paused) {
        setTimeLeft((t) => t - 1);
        setGlobalElapsed(
          Math.floor((Date.now() - globalStartTime.current) / 1000)
        );
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [config, paused]);

  useEffect(() => {
    if (!config) return;
    if (timeLeft <= 0) {
      if (sectionIndex < config.sequence.length - 1) {
        appendSectionSummary();
        const nextIdx = sectionIndex + 1;
        setSectionIndex(nextIdx);
        prepareSection(config, allPools, nextIdx);
      } else {
        handleSubmit();
      }
    }
  }, [timeLeft, sectionIndex, config, allPools]);

  function formatTime(total) {
    if (total < 0) total = 0;
    const hh = String(Math.floor(total / 3600)).padStart(2, "0");
    const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const ss = String(total % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  function handleAnswer(qIndex, choice, meta) {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex] = { ...copy[qIndex], selected: choice, ...(meta || {}) };
      return copy;
    });
    setStatuses((s) => ({
      ...s,
      [qIndex]: s[qIndex] === "marked" ? "answered-review" : "answered",
    }));
  }

  function goTo(index) {
    // Guard against out-of-range indexes due to stale localStorage or palette mismatch
    setCurrent((prev) => {
      if (index < 0) return 0;
      if (index >= questions.length) return prev; // ignore invalid forward navigation
      return index;
    });
    setStatuses((s) => {
      if (index < 0 || index >= questions.length) return s;
      return {
        ...s,
        [index]: s[index] === "not-visited" ? "visited" : s[index],
      };
    });
  }

  function toggleMark(index) {
    setStatuses((s) => {
      const cur = s[index];
      const isAnswered =
        questions[index] && questions[index].selected !== undefined;
      if (cur === "marked")
        return { ...s, [index]: isAnswered ? "answered" : "visited" };
      if (cur === "answered") return { ...s, [index]: "answered-review" };
      if (cur === "answered-review") return { ...s, [index]: "answered" };
      return { ...s, [index]: "marked" };
    });
  }

  function buildSummary(includeCurrent = true) {
    if (!config) return null;
    const list = [...completedSections];
    if (includeCurrent) {
      list.push({
        key: config.sequence[sectionIndex].key,
        name: config.sequence[sectionIndex].name,
        part: config.sequence[sectionIndex].part,
        total: questions.length,
        answered: Object.values(statuses).filter(
          (v) => v === "answered" || v === "answered-review"
        ).length,
        correct: questions.filter(
          (q) => typeof q.correct === "number" && q.selected === q.correct
        ).length,
        wrong: questions.filter(
          (q) =>
            typeof q.correct === "number" &&
            q.selected !== undefined &&
            q.selected !== q.correct
        ).length,
        skipped: questions.filter((q) => q.selected === undefined).length,
        timeUsed: Math.floor((Date.now() - sectionStartTime.current) / 1000),
        questions,
      });
    }
    // Aggregate totals
    const agg = list.reduce(
      (a, s) => {
        a.total += s.total;
        a.answered += s.answered;
        a.correct += s.correct || 0;
        a.wrong += s.wrong || 0;
        a.skipped += s.skipped || 0;
        return a;
      },
      { total: 0, answered: 0, correct: 0, wrong: 0, skipped: 0 }
    );
    return {
      sections: list,
      globalElapsed,
      totalTimeUsed: globalElapsed,
      aggregate: agg,
    };
  }

  function appendSectionSummary() {
    const summary = buildSummary(true);
    if (!summary) return;
    const last = summary.sections[summary.sections.length - 1];
    setCompletedSections((prev) => [...prev, last]);
  }

  function submitSectionAndNext() {
    if (!config) return;
    if (sectionIndex >= config.sequence.length - 1) return;
    appendSectionSummary();
    const nextIdx = sectionIndex + 1;
    setSectionIndex(nextIdx);
    prepareSection(config, allPools, nextIdx);
  }

  function handleSubmit() {
    const summary = buildSummary(true);
    try {
      saveAttempt("demoUser", summary);
    } catch {}
    try {
      localStorage.setItem("tcs-last-summary", JSON.stringify(summary));
    } catch {}
    localStorage.removeItem(stateKey.current);
    cleanupBodyLocks();
    exitFullscreen();
    onClose(summary);
  }

  // Keyboard shortcuts and locking behaviour
  useEffect(() => {
    const handleKey = (e) => {
      if (e.altKey) {
        const k = e.key.toLowerCase();
        if (k === "n") {
          e.preventDefault();
          goTo(Math.min(questions.length - 1, current + 1));
        }
        if (k === "p") {
          e.preventDefault();
          goTo(Math.max(0, current - 1));
        }
        if (k === "m") {
          e.preventDefault();
          toggleMark(current);
        }
        if (k === "c") {
          e.preventDefault();
          setShowCalc((s) => !s);
        }
      }
    };
    const onVis = () => {
      if (document.hidden) {
        tabSwitchCount.current += 1;
        setWarning("You have switched tabs. Please return to your test.");
        if (
          config &&
          tabSwitchCount.current > (config.settings.allowedTabSwitches || 1)
        ) {
          setPaused(true);
        }
      }
    };
    const onCtx = (e) => e.preventDefault();
    const onPaste = (e) => e.preventDefault();
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setWarning("You exited fullscreen! Please return to exam mode.");
        if (config?.settings.pauseTimerOnFullscreenExit) setPaused(true);
      }
    };

    window.addEventListener("keydown", handleKey);
    document.addEventListener("visibilitychange", onVis);
    document.addEventListener("contextmenu", onCtx);
    document.addEventListener("paste", onPaste);
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.removeEventListener("visibilitychange", onVis);
      document.removeEventListener("contextmenu", onCtx);
      document.removeEventListener("paste", onPaste);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [current]);

  // Autosave to localStorage
  useEffect(() => {
    const payload = {
      questions,
      current,
      statuses,
      sectionIndex,
      timeLeft,
      globalElapsed,
      sectionElapsed: Math.floor(
        (Date.now() - sectionStartTime.current) / 1000
      ),
    };
    localStorage.setItem(stateKey.current, JSON.stringify(payload));
  }, [questions, current, statuses, sectionIndex, timeLeft, globalElapsed]);

  useEffect(() => {
    const interval = setInterval(() => {
      const payload = {
        questions,
        current,
        statuses,
        sectionIndex,
        timeLeft,
        globalElapsed,
        sectionElapsed: Math.floor(
          (Date.now() - sectionStartTime.current) / 1000
        ),
      };
      localStorage.setItem(stateKey.current, JSON.stringify(payload));
    }, 10000);
    return () => clearInterval(interval);
  }, [questions, current, statuses, sectionIndex, timeLeft, globalElapsed]);

  // Helpers for fullscreen and body locks
  function applyBodyLocks(lock) {
    if (lock) document.body.style.overflow = "hidden";
  }
  function cleanupBodyLocks() {
    document.body.style.overflow = "";
  }
  function enterFullscreen() {
    if (document.fullscreenElement) return;
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
  }
  function exitFullscreen() {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div
        className="bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
        style={{ width: `${FIXED_WIDTH}px`, height: `${FIXED_HEIGHT}px` }}
      >
        <HeaderBar
          sectionName={
            config ? config.sequence[sectionIndex].name : "Loading..."
          }
          partName={config ? config.sequence[sectionIndex].part : ""}
          timeLeft={formatTime(timeLeft)}
          globalElapsed={formatTime(globalElapsed)}
          candidateId={"TCS123456"}
          onToggleCalc={() => setShowCalc((s) => !s)}
        />

        <div className="flex flex-1">
          <Sidebar
            count={questions.length}
            current={current}
            statuses={statuses}
            onSelect={goTo}
          />

          <MainContent
            question={questions[current]}
            qIndex={current}
            onAnswer={(choice, meta) => handleAnswer(current, choice, meta)}
            onPrev={() => goTo(Math.max(0, current - 1))}
            onNext={() => goTo(current + 1)}
            onMark={() => toggleMark(current)}
          />

          <aside className="w-[220px] p-4 border-l">
            <div className="flex flex-col gap-3">
              <button className="px-3 py-2 bg-gray-200 rounded">
                Question Paper
              </button>
              <div className="text-sm text-gray-600">Legend</div>
              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 palette-not-visited rounded-full"></div>
                <span className="text-xs">Not Visited</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 palette-answered rounded-full"></div>
                <span className="text-xs">Answered</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 palette-mark-review rounded-full"></div>
                <span className="text-xs">Marked</span>
              </div>
            </div>
          </aside>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-3 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            {config
              ? `${config.sequence[sectionIndex].part} • Section ${
                  sectionIndex + 1
                } of ${config.sequence.length}: ${
                  config.sequence[sectionIndex].name
                } — Questions 1-${questions.length}`
              : "Loading section..."}
          </div>
          <div className="flex gap-4 items-center">
            {config && sectionIndex < config.sequence.length - 1 && (
              <button
                onClick={submitSectionAndNext}
                className="px-4 py-2 bg-[#0077C8] text-white rounded"
              >
                Submit Section & Next
              </button>
            )}
            {config && sectionIndex === config.sequence.length - 1 && (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#0077C8] text-white rounded"
              >
                Submit Test
              </button>
            )}
            {paused && (
              <button
                onClick={() => setPaused(false)}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Resume
              </button>
            )}
          </div>
        </div>

        {showCalc && <Calculator onClose={() => setShowCalc(false)} />}
        {warning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-md shadow p-6 w-[420px] text-center">
              <div className="font-semibold mb-3">Attention</div>
              <div className="text-sm text-gray-700 mb-4">{warning}</div>
              <button
                onClick={() => setWarning("")}
                className="px-4 py-2 bg-[#0077C8] text-white rounded"
              >
                Continue Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
