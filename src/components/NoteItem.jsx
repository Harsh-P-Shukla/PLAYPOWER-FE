import React from 'react';

const NoteItem = ({ note, onClick, onDelete, onPin, active }) => {
  return (
    <div className={`note-item ${active ? 'active' : ''}`} onClick={onClick}>
      <strong>{note.title.length > 30 ? note.title.slice(0, 30) + '…' : note.title}</strong>
      <div className="note-actions">
        <button onClick={e => { e.stopPropagation(); onPin(); }}>
          {note.pinned ? '📌' : '📍'}
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(); }}>❌</button>
      </div>
    </div>
  );
};

export default NoteItem;
