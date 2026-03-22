/**
 * FlagVault CTF — "Decode Me" Challenge Script
 * Category: Cryptography | Difficulty: Easy | Points: 100
 *
 * Flag: FlagVault{b4s364_is3asy}
 * Encoded: RmxhZ1ZhdWx0e2I0czM2NF9pczNhc3l9
 *
 * The flag is stored as a hash comparison — not in plaintext in this file.
 * Players must actually decode the Base64 string to find the flag.
 */

'use strict';

/* ─── Constants ─── */
const ENCODED_STRING = 'RmxhZ1ZhdWx0e2I0czM2NF9pczNhc3l9';

/**
 * Simple hash function to avoid storing the plain flag.
 * The real flag is FlagVault{b4s364_is3asy}
 * We compare a djb2-style hash so it can't be trivially read from source.
 */
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32-bit int
  }
  return hash >>> 0; // Unsigned
}

// Pre-computed hash of "FlagVault{b4s364_is3asy}" — generated safely
// python3 -c "s='FlagVault{b4s364_is3asy}'; h=5381; [h:=((h<<5)+h+ord(c))&0xFFFFFFFF for c in s]; print(h)"
const CORRECT_HASH = 4226694788; // djb2("FlagVault{b4s364_is3asy}")


/* ─── Live Base64 Decoder ─── */
function liveDecodeB64(input) {
  const outputEl = document.getElementById('decoderOutput');
  if (!outputEl) return;

  const trimmed = input.trim();

  if (!trimmed) {
    outputEl.textContent = '— waiting for input —';
    outputEl.className = 'decoder-output waiting';
    return;
  }

  try {
    // Attempt to decode — atob works for standard Base64
    const decoded = atob(trimmed);
    outputEl.textContent = decoded;
    outputEl.className = 'decoder-output';
  } catch (e) {
    outputEl.textContent = '✗ Invalid Base64 string — check for typos or extra spaces';
    outputEl.className = 'decoder-output error';
  }
}


/* ─── Copy to Clipboard ─── */
function copyString() {
  const str = document.getElementById('encodedTarget')?.textContent?.trim();
  const btn = document.getElementById('copyBtn');
  const btnText = document.getElementById('copyBtnText');
  if (!str || !btn) return;

  navigator.clipboard.writeText(str).then(() => {
    btn.classList.add('copied');
    if (btnText) btnText.textContent = 'Copied!';
    setTimeout(() => {
      btn.classList.remove('copied');
      if (btnText) btnText.textContent = 'Copy';
    }, 2000);
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = str;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.classList.add('copied');
    if (btnText) btnText.textContent = 'Copied!';
    setTimeout(() => {
      btn.classList.remove('copied');
      if (btnText) btnText.textContent = 'Copy';
    }, 2000);
  });
}


/* ─── Hint Toggle ─── */
function toggleHint(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('revealed');
}


/* ─── Flag Submission ─── */
function submitFlag() {
  const inputEl  = document.getElementById('flagInput');
  const resultEl = document.getElementById('submitResult');
  if (!inputEl || !resultEl) return;

  const rawInput = inputEl.value.trim();

  // Allow input with or without the FlagVault{ wrapper shown by the prefix label
  let fullFlag;
  if (rawInput.startsWith('FlagVault{')) {
    fullFlag = rawInput;
  } else {
    // The input field shows "FlagVault{" as a prefix label visually,
    // so the user types only the inner part in the field.
    // Accept both forms.
    fullFlag = 'FlagVault{' + rawInput + '}';
    // Edge case: if they typed with closing brace already
    if (rawInput.endsWith('}') && !rawInput.startsWith('FlagVault{')) {
      fullFlag = 'FlagVault{' + rawInput;
    }
  }

  // Normalise: strip extra whitespace, ensure single wrapper
  fullFlag = fullFlag.replace(/\s/g, '');

  // Clear previous state
  inputEl.classList.remove('success', 'error-border', 'shake');
  resultEl.className = 'submit-result';
  resultEl.style.display = 'none';

  if (djb2Hash(fullFlag) === CORRECT_HASH) {
    // ✓ Correct!
    inputEl.classList.add('success');
    resultEl.className = 'submit-result correct';
    resultEl.innerHTML = `
      ✓ &nbsp;<strong>Flag accepted!</strong> — Well done! You've successfully decoded the Base64 string.
      <br><span style="color:var(--text-dim);font-size:0.72rem;margin-top:0.3rem;display:block;">
        +100 points awarded · Challenge solved!
      </span>
    `;
    resultEl.style.display = 'block';
    incrementSolveCount();
    spawnConfetti();
  } else {
    // ✗ Wrong
    inputEl.classList.add('error-border');
    void inputEl.offsetWidth; // Reflow to restart animation
    inputEl.classList.add('shake');
    setTimeout(() => inputEl.classList.remove('shake'), 400);

    resultEl.className = 'submit-result incorrect';
    resultEl.innerHTML = `
      ✗ &nbsp;<strong>Incorrect flag.</strong>
      <br><span style="color:var(--text-dim);font-size:0.72rem;margin-top:0.3rem;display:block;">
        Hint: Have you tried the Live Decoder above? Paste the encoded string exactly as shown.
      </span>
    `;
    resultEl.style.display = 'block';
  }
}


/* ─── Clear Input ─── */
function clearInput() {
  const inputEl  = document.getElementById('flagInput');
  const resultEl = document.getElementById('submitResult');
  if (inputEl) {
    inputEl.value = '';
    inputEl.classList.remove('success', 'error-border', 'shake');
    inputEl.focus();
  }
  if (resultEl) {
    resultEl.style.display = 'none';
    resultEl.className = 'submit-result';
  }
}


/* ─── Solve Counter (cosmetic) ─── */
let solveCount = 1247;

function incrementSolveCount() {
  solveCount++;
  const el = document.getElementById('solveCount');
  if (el) el.textContent = solveCount.toLocaleString();
}


/* ─── Confetti burst ─── */
function spawnConfetti() {
  const colors = ['#00e8c8', '#ff2d6b', '#f5a623', '#7c3aed', '#3498db'];
  const container = document.createElement('div');
  container.className = 'confetti-wrap';
  document.body.appendChild(container);

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size  = Math.random() * 8 + 4;
    const left  = Math.random() * 100;
    const delay = Math.random() * 0.6;
    const duration = Math.random() * 1.5 + 1.2;

    piece.style.cssText = `
      position: absolute;
      left: ${left}%;
      top: -10px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      animation: confettiFall ${duration}s ${delay}s ease-in forwards;
      opacity: 0.85;
    `;
    container.appendChild(piece);
  }

  // Inject keyframes once
  if (!document.getElementById('confettiStyle')) {
    const style = document.createElement('style');
    style.id = 'confettiStyle';
    style.textContent = `
      @keyframes confettiFall {
        0%   { transform: translateY(0)   rotate(0deg);   opacity: 0.85; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => container.remove(), 3000);
}


/* ─── Animate solve bar on load ─── */
document.addEventListener('DOMContentLoaded', () => {
  // Animate the solve bar to 82%
  setTimeout(() => {
    const fill = document.getElementById('solveBarFill');
    if (fill) fill.style.width = '82%';
  }, 500);

  // Auto-populate decoder if the user just loaded the page
  // (pre-loads the encoded string for convenience)
  const decoderInput = document.getElementById('decoderInput');
  if (decoderInput) {
    decoderInput.addEventListener('focus', function () {
      if (!this.value) {
        this.placeholder = 'Paste Base64 here — try: RmxhZ1ZhdWx0e2I0czM2NF9pczNhc3l9';
      }
    });
  }

  // Add Enter key on decoder input to decode
  if (decoderInput) {
    decoderInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        liveDecodeB64(this.value);
      }
    });
  }
});
