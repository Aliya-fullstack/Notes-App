// ── State & Storage ──
  let notes = JSON.parse(localStorage.getItem('notesApp_v1') || '[]');

  function save() {
    localStorage.setItem('notesApp_v1', JSON.stringify(notes));
  }

  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // ── DOM references ──
  const noteInput = document.getElementById('noteInput');
  const notesList = document.getElementById('notesList');
  const emptyState = document.getElementById('emptyState');
  const notesMeta = document.getElementById('notesMeta');
  const notesCount = document.getElementById('notesCount');

  // Auto-focus on load
  noteInput.focus();

  // Enter to submit (Shift+Enter for newline)
  noteInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  });

  // ── Toast ──
  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // ── Render ──
  function render() {
    notesList.innerHTML = '';
    const empty = notes.length === 0;
    emptyState.classList.toggle('visible', empty);
    notesMeta.style.display = empty ? 'none' : 'flex';
    notesCount.innerHTML = `Notes <span>${notes.length} saved</span>`;

    notes.forEach((note, i) => {
      const card = document.createElement('div');
      card.className = 'note-card';
      card.dataset.id = note.id;

      const escaped = escapeHtml(note.text);

      card.innerHTML = `
        <div class="note-corner">${formatDate(note.ts)}</div>
        <div class="note-text">${escaped}</div>
        <textarea class="note-edit-area">${escapeHtml(note.text)}</textarea>
        <div class="note-actions">
          <button class="btn-action btn-edit" onclick="startEdit(this)">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5l2 2L3 11H1V9l7.5-7.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
            </svg>
            Edit
          </button>
          <button class="btn-action btn-save" onclick="saveEdit(this)">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Save
          </button>
          <button class="btn-action btn-cancel" onclick="cancelEdit(this)">Cancel</button>
          <button class="btn-action btn-delete" onclick="deleteNote(this)">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 3h8M5 1h2M4 3v7M8 3v7M3 3l.5 7h5L9 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Delete
          </button>
        </div>
      `;
      notesList.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/\n/g,'<br>');
  }

  // ── CRUD ──
  function addNote() {
    const text = noteInput.value.trim();
    if (!text) {
      noteInput.focus();
      noteInput.style.borderColor = 'var(--accent)';
      setTimeout(() => noteInput.style.borderColor = '', 800);
      return;
    }
    notes.unshift({ id: Date.now(), text, ts: Date.now() });
    save();
    render();
    noteInput.value = '';
    noteInput.focus();
    showToast('✦ Note added');
  }

  function startEdit(btn) {
    const card = btn.closest('.note-card');
    card.classList.add('editing');
    const area = card.querySelector('.note-edit-area');
    // Convert <br> back to newlines for editing
    area.value = notes.find(n => n.id == card.dataset.id)?.text || '';
    area.focus();
    area.setSelectionRange(area.value.length, area.value.length);
  }

  function saveEdit(btn) {
    const card = btn.closest('.note-card');
    const area = card.querySelector('.note-edit-area');
    const newText = area.value.trim();
    if (!newText) return;
    const note = notes.find(n => n.id == card.dataset.id);
    if (note) { note.text = newText; note.ts = Date.now(); }
    save();
    render();
    showToast('✓ Note updated');
  }

  function cancelEdit(btn) {
    const card = btn.closest('.note-card');
    card.classList.remove('editing');
  }

  function deleteNote(btn) {
    const card = btn.closest('.note-card');
    card.classList.add('removing');
    setTimeout(() => {
      notes = notes.filter(n => n.id != card.dataset.id);
      save();
      render();
    }, 240);
    showToast('Note deleted');
  }

  function clearAll() {
    if (!notes.length) return;
    if (!confirm(`Delete all ${notes.length} notes? This can't be undone.`)) return;
    notes = [];
    save();
    render();
    showToast('All notes cleared');
  }

  // ── Initial render ──
  render();
