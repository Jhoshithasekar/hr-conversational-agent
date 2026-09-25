import { Search } from 'lucide-react'

function FilterBar({
  tabs = [],
  activeTab,
  onTabChange,
  selectOptions = [],
  selectValue,
  onSelectChange,
  selectLabel = 'Filter',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  children,
}) {
  return (
    <div className="filter-bar-panel">
      {/* Tabs */}
      {tabs.length > 0 && (
        <div className="tab-group" role="tablist">
          {tabs.map((tab) => {
            const isActive = String(activeTab).toLowerCase() === String(tab.value).toLowerCase()
            return (
              <button
                className={`tab-btn${isActive ? ' active' : ''}`}
                key={tab.value}
                onClick={() => onTabChange && onTabChange(tab.value)}
                role="tab"
                type="button"
              >
                {tab.label}
                {tab.count !== undefined && <span className="tab-count">{tab.count}</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Optional dropdown select */}
      {selectOptions.length > 0 && (
        <div className="filter-select-wrap">
          <select
            aria-label={selectLabel}
            className="filter-select"
            onChange={(e) => onSelectChange && onSelectChange(e.target.value)}
            value={selectValue}
          >
            {selectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Search Input */}
      {onSearchChange !== undefined && (
        <div className="search-field" style={{ flex: 1, minWidth: '200px' }}>
          <Search aria-hidden="true" size={16} />
          <input
            aria-label={searchPlaceholder}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            type="search"
            value={searchValue || ''}
          />
        </div>
      )}

      {children}
    </div>
  )
}

export default FilterBar
