function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}




export function renderVaultPage(state) {
  // Grab assets/notes
  const notes = (state?.data?.assets && state.data.assets.length > 0) 
    ? state.data.assets 
    : (state?.data?.notes || []);

  // Filter based on search
  const query = (state.noteSearchQuery || '').toLowerCase();
  const filteredNotes = notes.filter(note => {
    const title = (note.title || '').toLowerCase();
    const content = (note.content || note.description || '').toLowerCase();
    return title.includes(query) || content.includes(query);
  });

  // Cycle through your CSS color classes automatically
  const noteColors = ['note-yellow', 'note-blue', 'note-pink', 'note-green', 'note-purple', 'note-orange'];

  return `
    <div class="notepad-container" style="padding: 24px; padding-bottom: 110px; max-width: 600px; margin: 0 auto; min-height: 100vh;">
      
      <!-- Top Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
        <div>
          <h1 style="font-size: 2.2rem; font-weight: 800; color: rgba(255, 255, 255, 0.9); margin: 0; line-height: 1.2;">Notepad</h1>
          <span style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.5);">${notes.length} saved</span>
        </div>
        
        <button data-action="toggle-notepad-search" style="width: 48px; height: 48px; border-radius: 50%; background: #ffffff; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <svg width="22" height="22" fill="none" stroke="#3b82f6" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>
      </div>

      <!-- Search Bar -->
      <div style="margin-bottom: 24px; ${state.notepadSearchOpen ? 'display: block;' : 'display: none;'}">
        <input type="text" data-action="notepad-search-input" value="${escapeHtml(state.noteSearchQuery || '')}" placeholder="Search notes..." style="width: 100%; padding: 16px 20px; border-radius: 12px; border: none; outline: none; font-size: 1rem; color: #1e293b; background: #ffffff; box-sizing: border-box;" />
      </div>

      <!-- Notes Grid -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${filteredNotes.length === 0 ? `<div style="text-align:center; color:rgba(255,255,255,0.4); padding: 40px 0;">No notes found.</div>` : ''}
        ${filteredNotes.map((note, index) => {
          
          const noteDate = note.createdAt ? new Date(note.createdAt) : new Date();
          const formattedDate = [String(noteDate.getDate()).padStart(2, '0'), String(noteDate.getMonth() + 1).padStart(2, '0'), noteDate.getFullYear()].join('/');
          const noteId = note.id || note._id;
          
          // Assigns a unique color class from your CSS stylesheet in order
          const colorClass = noteColors[index % noteColors.length];

          return `
            <div class="${colorClass}" style="border-radius: 16px; padding: 20px; position: relative;">
              
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <h3 style="font-weight: 800; font-size: 1.15rem; margin: 0; padding-right: 80px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${escapeHtml(note.title || 'Untitled')}
                </h3>
                
                <div style="position: absolute; top: 16px; right: 16px; display: flex; gap: 8px;">
                  <button data-action="edit-note" data-note-id="${noteId}" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.6); border: none; cursor: pointer; display: grid; place-items: center; font-size: 14px;">✏️</button>
                  <button data-action="delete-note" data-note-id="${noteId}" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.6); border: none; cursor: pointer; display: grid; place-items: center; font-size: 14px;">🗑️</button>
                </div>
              </div>
              
              <p style="font-size: 0.95rem; margin: 0 0 16px 0; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(note.content || note.description || '')}</p>
              
              <div style="display: flex; align-items: center; font-size: 0.85rem; font-weight: 500; opacity: 0.85;">
                <svg style="width: 16px; height: 16px; margin-right: 6px; opacity: 0.8;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                ${formattedDate}
              </div>

            </div>
          `;
        }).join('')}
      </div>
<!-- FLOATING ADD BUTTON (+) PRECISELY ALIGNED RIGHT INSIDE MOBILE FRAME -->
      <div style="position: sticky; bottom: 120px; display: flex; justify-content: flex-end; z-index: 50; margin-top: 20px; pointer-events: none;">
        <button data-action="open-add-entry" data-type="note" style="pointer-events: auto; width: 56px; height: 56px; border-radius: 50%; background: #6366f1; color: white; border: none; font-size: 28px; font-weight: 300; cursor: pointer; box-shadow: 0 4px 15px rgba(99,102,241,0.5); display: flex; align-items: center; justify-content: center;">
          +
        </button>
      </div>

    </div>
  `;
}

   