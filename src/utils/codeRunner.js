// Simple JS code runner for coding questions
// - Evaluates provided code and returns function by name
// - Runs provided tests and returns results array

export function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === "object") {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++)
        if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    const ak = Object.keys(a);
    const bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    for (const k of ak) if (!deepEqual(a[k], b[k])) return false;
    return true;
  }
  // NaN equality
  if (typeof a === "number" && typeof b === "number") {
    return Number.isNaN(a) && Number.isNaN(b);
  }
  return false;
}

export function runJsCode({ code, functionName, tests }) {
  const results = [];
  let fn;
  try {
    // Evaluate user code and extract function
    // Note: This is a simple in-browser evaluator for practice only.
    // It runs in the page context; do NOT use with untrusted code in production.
    // eslint-disable-next-line no-new-func
    fn = new Function(
      `${code}; return typeof ${functionName} === 'function' ? ${functionName} : undefined;`
    )();
  } catch (e) {
    return tests.map((t) => ({
      pass: false,
      expected: t.expected,
      received: undefined,
      desc: t.desc,
      error: String(e),
    }));
  }
  if (typeof fn !== "function") {
    return tests.map((t) => ({
      pass: false,
      expected: t.expected,
      received: undefined,
      desc: t.desc,
      error: `Function ${functionName} not found`,
    }));
  }

  for (const t of tests) {
    try {
      const received = Array.isArray(t.args) ? fn(...t.args) : fn(t.args);
      const pass = deepEqual(received, t.expected);
      results.push({ pass, expected: t.expected, received, desc: t.desc });
    } catch (e) {
      results.push({
        pass: false,
        expected: t.expected,
        received: undefined,
        desc: t.desc,
        error: String(e),
      });
    }
  }
  return results;
}

export function summarizeResults(results) {
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  return { total, passed, allPassed: passed === total };
}
