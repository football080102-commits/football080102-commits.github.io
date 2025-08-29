(function () {
  console.log('[pira] boot');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /** State */
  let students = [];
  const usedIds = new Set();

  /** Elements */
  const startBtn = document.getElementById('start-btn');
  const resetBtn = document.getElementById('reset-btn');
  const statusEl = document.getElementById('status');

  const seqCurrent = document.getElementById('seq-current');

  const card = document.getElementById('winner-card');
  const cardGrade = document.getElementById('card-grade');
  const cardClass = document.getElementById('card-class');
  const cardName = document.getElementById('card-name');
  const ceremony = document.getElementById('ceremony');
  const ceremonyText = document.getElementById('ceremony-text');

  /** Utils */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function randInt(max) {
    return Math.floor(Math.random() * max);
  }

  function persistUsed() {
    try {
      const arr = Array.from(usedIds);
      localStorage.setItem('pira:used', JSON.stringify(arr));
    } catch (e) {}
  }

  function hideResults() {
    try {
      if (ceremony) ceremony.setAttribute('aria-hidden', 'true');
      if (ceremonyText) ceremonyText.textContent = '';
      if (card) {
        card.setAttribute('aria-hidden', 'true');
        card.classList.remove('reveal-card', 'glow');
      }
      if (seqCurrent) {
        seqCurrent.className = 'seq-item';
        seqCurrent.textContent = '';
        seqCurrent.style.opacity = '0';
      }
    } catch (_) {}
  }

  function loadUsed() {
    try {
      const raw = localStorage.getItem('pira:used');
      if (!raw) return;
      const arr = JSON.parse(raw);
      for (const id of arr) usedIds.add(id);
    } catch (e) {}
  }

  function computeId(s) {
    return `${s.grade}-${s.class}-${s.name}`;
  }

  async function fetchStudents() {
    try {
      const listUrl = new URL('./list.json', window.location.href).toString();
      const res = await fetch(listUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error('list.json load failed');
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid list.json');
      students = data.filter(Boolean);
      if (!students.length) throw new Error('Empty list.json');
    } catch (err) {
      console.error(err);
      statusEl && (statusEl.textContent = '데이터를 불러오지 못했습니다. list.json을 확인해주세요.');
      throw err;
    }
  }

  function pickRandomCandidate() {
    const available = students.filter(s => !usedIds.has(computeId(s)));
    if (available.length === 0) return null;
    const idx = randInt(available.length);
    return available[idx];
  }

  async function runSequence(student) {
    statusEl && (statusEl.textContent = '');

    // 순서: 학년 -> 반 -> 이름 (한 번에 하나만 화면 중앙 표시)
    const steps = [
      `${student.grade}학년`,
      `${student.class}반`,
      `${student.name}`
    ];

    seqCurrent.className = 'seq-item';
    seqCurrent.style.opacity = '0';
    seqCurrent.style.filter = 'blur(6px)';
    seqCurrent.style.transform = 'translateY(0) scale(.9)';
    void seqCurrent.offsetWidth;
    card.classList.remove('reveal-card');

    card.setAttribute('aria-hidden', 'true');
    await wait(150);
    for (let i = 0; i < steps.length; i++) {
      flashStage();
      seqCurrent.textContent = steps[i];
      // 가시성 강제 보장 (애니메이션 실패 대비)
      seqCurrent.className = 'seq-item show';
      void seqCurrent.offsetWidth;
      seqCurrent.classList.add('pop-one');
      await wait(2200);
      seqCurrent.className = 'seq-item';
      seqCurrent.style.opacity = '0';
      await wait(100);
    }

    await wait(400);
    cardGrade.textContent = `${student.grade}`;
    cardClass.textContent = `${student.class}`;
    cardName.textContent = `${student.name}`;
    card.setAttribute('aria-hidden', 'false');
    card.classList.add('reveal-card', 'glow');

    // Ceremony overlay: full line text (유지)
    if (ceremony && ceremonyText) {
      ceremonyText.textContent = `${student.grade}학년 ${student.class}반 ${student.name}`;
      ceremony.setAttribute('aria-hidden', 'false');
    }
  }

  function flashStage() {
    const stage = document.querySelector('.pack .pulse');
    if (!stage) return;
    stage.style.boxShadow = '0 0 90px rgba(244,212,122,.55), inset 0 0 60px rgba(52,211,153,.35)';
    setTimeout(() => { stage.style.boxShadow = 'none'; }, 180);
  }

  async function onStart() {
    if (!startBtn) return;
    startBtn.disabled = true;
    try {
      // 이전 결과 화면이 남아있지 않도록 정리
      hideResults();
      if (!students.length) await fetchStudents();
      const candidate = pickRandomCandidate();
      if (!candidate) {
        statusEl && (statusEl.textContent = '모든 인원이 이미 추첨되었습니다. RESET으로 초기화하세요.');
        return;
      }
      await runSequence(candidate);
      usedIds.add(computeId(candidate));
      persistUsed();
    } catch (e) {
      statusEl && (statusEl.textContent = '오류가 발생했습니다. 콘솔을 확인해 주세요.');
    } finally {
      startBtn.disabled = false;
    }
  }

  function onReset() {
    usedIds.clear();
    persistUsed();
    hideResults();
    statusEl && (statusEl.textContent = '초기화되었습니다.');
  }

  loadUsed();
  // 선로드 후 상태 표시
  fetchStudents().then(() => {
    console.log('[pira] list.json loaded', students.length);
    statusEl && (statusEl.textContent = '준비되었습니다. START를 눌러주세요.');
    // 첫 로드시 자동 리셋
    onReset();
  }).catch((e) => {
    console.log('[pira] list.json load failed', e);
    // 메시지는 fetchStudents 내부에서 설정됨
  });

  if (startBtn) startBtn.addEventListener('click', onStart);
  if (resetBtn) resetBtn.addEventListener('click', onReset);
})();


