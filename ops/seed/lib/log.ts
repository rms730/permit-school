export const log = {
  info: (...a: any[]) => console.log("[seed]", ...a),
  ok:   (...a: any[]) => console.log("✅", ...a),
  warn: (...a: any[]) => console.warn("⚠️", ...a),
  err:  (...a: any[]) => console.error("❌", ...a),
};
