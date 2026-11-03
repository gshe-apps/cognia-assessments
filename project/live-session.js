// Live session for the board demo: students hand in on their own desktops and the
// teacher's Results screen updates as each one arrives.
//
// Storage: Firebase Firestore when FIREBASE_CONFIG is filled in, otherwise this browser's
// localStorage (works across tabs on one computer, handy for rehearsing).
// Only demo personas are stored. Never enter real student details.
window.CogniaLive = (() => {
  // ---------- Demo settings (edit these) ----------
  // Paste the config object from Firebase console > Project settings > Your apps.
  const FIREBASE_CONFIG = null;
  // Everyone enters the same session code.
  const SESSION_CODE = 'MATH-27';
  // Short link shown to students on the teacher's screen (e.g. a Bitly link). Leave empty to show the full address.
  const JOIN_LINK = '';
  // Each board member gets their own passcode. Names show on the teacher's Results screen.
  const ROSTER = [
    { passcode: '1104', name: 'Jamie Lee' },
    { passcode: '2267', name: 'Ava Patel' },
    { passcode: '3391', name: 'Noah Kim' },
    { passcode: '4458', name: 'Priya Shah' },
    { passcode: '5532', name: 'Luca Rossi' },
    { passcode: '6619', name: 'Zoe Martin' }
  ];
  // ---------- End of settings ----------

  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const KEY = 'cogniaLive:' + SESSION_CODE;
  const ME = 'cogniaLiveStudent';
  const clean = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Fractions check answer key: Q1 four blanks, Q2 four sums, Q3 and Q4 one choice each.
  const KEY_Q1 = [30, 100, 55, 55];
  const KEY_Q2 = ['67/100', '43/100', '25/100', '19/100'];
  const MAX = [4, 4, 1, 1];
  function score(s) {
    const q = [
      KEY_Q1.filter((v, i) => s.a0 && s.a0[i] === v).length,
      KEY_Q2.filter((v, i) => s.a1 && s.a1[i] === v).length,
      s.a2 === 2 ? 1 : 0,
      s.a3 === 2 ? 1 : 0
    ];
    return { marks: q.reduce((a, b) => a + b, 0), max: 10, byQuestion: q, maxByQuestion: MAX };
  }

  // ---------- Storage ----------
  let fire = null;
  function cloud() {
    if (!FIREBASE_CONFIG) return Promise.resolve(null);
    if (!fire) fire = Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-firestore.js')])
      .then(([app, fs]) => ({ fs, db: fs.getFirestore(app.initializeApp(FIREBASE_CONFIG)) }))
      .catch((err) => { console.warn('Live session: Firebase unavailable, using this browser only.', err); return null; });
    return fire;
  }
  const readLocal = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const writeLocal = (all) => { try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) {} };
  let channel = null;
  try { channel = new BroadcastChannel(KEY); } catch (e) {}
  const localListeners = new Set();
  const changed = () => { if (channel) channel.postMessage('change'); localListeners.forEach((fn) => fn()); };

  async function save(patch) {
    const me = current();
    if (!me) return;
    const record = Object.assign({ passcode: me.passcode, name: me.name, updatedAt: Date.now() }, patch);
    const c = await cloud();
    if (c) {
      try { await c.fs.setDoc(c.fs.doc(c.db, 'sessions', SESSION_CODE, 'students', me.passcode), record, { merge: true }); return; }
      catch (err) { console.warn('Live session: could not save to Firebase.', err); }
    }
    const all = readLocal();
    all[me.passcode] = Object.assign(all[me.passcode] || {}, record);
    writeLocal(all);
    changed();
  }

  // Calls back with { passcode: record } now and on every change. Returns a stop function.
  function watch(callback) {
    let stop = () => {};
    let live = true;
    cloud().then((c) => {
      if (!live) return;
      if (c) {
        stop = c.fs.onSnapshot(c.fs.collection(c.db, 'sessions', SESSION_CODE, 'students'), (snap) => {
          const all = {};
          snap.forEach((d) => { all[d.id] = d.data(); });
          callback(all);
        }, (err) => console.warn('Live session: listening failed.', err));
        return;
      }
      const push = () => callback(readLocal());
      const onStore = (e) => { if (e.key === KEY) push(); };
      window.addEventListener('storage', onStore);
      if (channel) channel.onmessage = push;
      localListeners.add(push);
      push();
      stop = () => { window.removeEventListener('storage', onStore); if (channel) channel.onmessage = null; localListeners.delete(push); };
    });
    return () => { live = false; stop(); };
  }

  async function reset() {
    const c = await cloud();
    if (c) {
      const snap = await c.fs.getDocs(c.fs.collection(c.db, 'sessions', SESSION_CODE, 'students'));
      await Promise.all(snap.docs.map((d) => c.fs.deleteDoc(d.ref)));
      return;
    }
    writeLocal({});
    changed();
  }

  // ---------- Student sign-in ----------
  const findStudent = (passcode) => ROSTER.find((s) => s.passcode === String(passcode || '').trim()) || null;
  const sessionMatches = (code) => clean(code) === clean(SESSION_CODE);
  function signIn(student) {
    try { sessionStorage.setItem(ME, JSON.stringify(student)); } catch (e) {}
    return save({ status: 'joined', joinedAt: Date.now() });
  }
  function current() { try { return JSON.parse(sessionStorage.getItem(ME)); } catch (e) { return null; } }

  return {
    SESSION_CODE, ROSTER, score, save, watch, reset, findStudent, sessionMatches, signIn, current,
    isCloud: () => !!FIREBASE_CONFIG,
    joinUrl: () => JOIN_LINK || new URL('STU2-SignIn.dc.html', location.href).href
  };
})();
