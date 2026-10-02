import { useRef, useState } from 'react';

// Combobox simples: digita pra filtrar a lista, clica pra alternar
// (multi-seleção); os itens já selecionados aparecem como tags removíveis
// acima do campo.
export default function SearchableMultiSelect({ options, selected, onToggle, placeholder }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const blurTimer = useRef(null);

  const filtered = options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()));

  function handleBlur() {
    blurTimer.current = setTimeout(() => setOpen(false), 150);
  }

  function handleOptionMouseDown(e) {
    e.preventDefault();
    if (blurTimer.current) clearTimeout(blurTimer.current);
  }

  return (
    <div className="searchable-select">
      {selected.size > 0 && (
        <div className="searchable-select-tags">
          {[...selected].map((s) => (
            <span key={s} className="searchable-select-tag">
              {s}
              <button type="button" onClick={() => onToggle(s)}>×</button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onChange={(e) => setQuery(e.target.value)}
      />
      {open && (
        <div className="searchable-select-dropdown">
          {filtered.length === 0 ? (
            <div className="searchable-select-empty">Nenhuma opção encontrada.</div>
          ) : (
            filtered.map((o) => (
              <div
                key={o}
                className={'searchable-select-option' + (selected.has(o) ? ' active' : '')}
                onMouseDown={handleOptionMouseDown}
                onClick={() => onToggle(o)}
              >
                {o}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
