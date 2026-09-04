'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Users, 
  Truck, 
  Building2, 
  Ship, 
  ArrowUpDown, 
  CornerDownLeft, 
  Sparkles,
  Command,
  ChevronDown,
  Navigation
} from 'lucide-react';

interface Member {
  id: string;
  type: 'member';
  name: string;
  handle: string;
  avatar: string;
  role: string;
}

interface Fleet {
  id: string;
  type: 'fleet';
  title: string;
  vehicleType: string;
  status: 'In service' | 'Out of service' | 'En route';
  warehouse: string;
  battery: number;
}

interface Warehouse {
  id: string;
  type: 'warehouse';
  name: string;
  location: string;
  capacity: string;
}

type SearchItem = Member | Fleet | Warehouse;

const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', type: 'member', name: 'Leslie Alexander', handle: '@leslie.a', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', role: 'Dispatch Lead' },
  { id: 'm2', type: 'member', name: 'Ronald Richards', handle: '@ronald.r27', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', role: 'Fleet Manager' },
  { id: 'm3', type: 'member', name: 'Esther Howard', handle: '@esther.howard', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80', role: 'Operations Lead' },
  { id: 'm4', type: 'member', name: 'Cameron Williamson', handle: '@cameron.w', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', role: 'Logistics Analyst' },
  { id: 'm5', type: 'member', name: 'Jenny Wilson', handle: '@jenny.wilson', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', role: 'Safety Director' },
  { id: 'm6', type: 'member', name: 'Guy Hawkins', handle: '@guy.hawk', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80', role: 'Route Supervisor' },
];

const INITIAL_FLEETS: Fleet[] = [
  { id: 'f1', type: 'fleet', title: 'Truck #001', vehicleType: 'Heavy Truck', status: 'In service', warehouse: 'Warehouse A', battery: 85 },
  { id: 'f2', type: 'fleet', title: 'Van #001', vehicleType: 'Express Van', status: 'Out of service', warehouse: 'Warehouse B', battery: 90 },
  { id: 'f3', type: 'fleet', title: 'Ship #001', vehicleType: 'Cargo Carrier', status: 'En route', warehouse: 'Warehouse C', battery: 70 },
  { id: 'f4', type: 'fleet', title: 'Truck #002', vehicleType: 'Electric Semi', status: 'In service', warehouse: 'Warehouse D', battery: 65 },
];

const INITIAL_WAREHOUSES: Warehouse[] = [
  { id: 'w1', type: 'warehouse', name: 'Warehouse A', location: 'Da Nang Hub (Central)', capacity: '88% Full' },
  { id: 'w2', type: 'warehouse', name: 'Warehouse B', location: 'Saigon Port (South)', capacity: '62% Full' },
  { id: 'w3', type: 'warehouse', name: 'Warehouse C', location: 'Hai Phong Terminal (North)', capacity: '45% Full' },
  { id: 'w4', type: 'warehouse', name: 'Warehouse D', location: 'Can Tho Station (Mekong)', capacity: '92% Full' },
];

// Helper: Escape Regex characters safely to prevent runtime errors
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Highlight component using React elements rather than dangerous innerHTML
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) {
    return <span>{text}</span>;
  }

  const escaped = escapeRegExp(query.trim());
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="search-highlight">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

export default function LiveSearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'clients' | 'fleet' | 'warehouse'>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce logic (300ms) to satisfy Bonus requirements
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Filter items
  const filteredData = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();

    const matches = (str: string) => str.toLowerCase().includes(q);

    let members = INITIAL_MEMBERS;
    let fleets = INITIAL_FLEETS;
    let warehouses = INITIAL_WAREHOUSES;

    if (q) {
      members = members.filter(m => matches(m.name) || matches(m.handle) || matches(m.role));
      fleets = fleets.filter(f => matches(f.title) || matches(f.vehicleType) || matches(f.status) || matches(f.warehouse));
      warehouses = warehouses.filter(w => matches(w.name) || matches(w.location));
    }

    if (activeTab === 'clients') return { members, fleets: [], warehouses: [] };
    if (activeTab === 'fleet') return { members: [], fleets, warehouses: [] };
    if (activeTab === 'warehouse') return { members: [], fleets: [], warehouses };

    return { members, fleets, warehouses };
  }, [debouncedQuery, activeTab]);

  // Flattened items for keyboard navigation
  const flatItems = useMemo(() => {
    return [
      ...filteredData.members,
      ...filteredData.fleets,
      ...filteredData.warehouses,
    ];
  }, [filteredData]);

  // Reset activeIndex when query or flatItems length changes
  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, activeTab]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (flatItems.length === 0 ? 0 : (prev + 1) % flatItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (flatItems.length === 0 ? 0 : (prev - 1 + flatItems.length) % flatItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[activeIndex]) {
        setSelectedItem(flatItems[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setQuery('');
      setDebouncedQuery('');
    }
  };

  const totalResults = flatItems.length;

  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-100 flex flex-col items-center justify-start p-4 sm:p-8 md:p-12">
      {/* Background Dashboard Mockup (Blurred backdrop like original Shiptrack) */}
      <div className="absolute inset-0 filter blur-md opacity-35 pointer-events-none p-6 select-none" aria-hidden="true">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="h-8 w-32 bg-slate-200 rounded"></div>
            <div className="flex gap-4">
              <div className="h-8 w-24 bg-slate-200 rounded"></div>
              <div className="h-8 w-8 bg-teal-500 rounded-full"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 h-32"></div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 h-32"></div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 h-32"></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 h-96"></div>
        </div>
      </div>

      {/* Main Central Command Palette Container */}
      <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col transition-all">
        {/* Top Header & Search Input */}
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-teal-600 transition-colors pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search members, fleet assets, warehouses, or statuses..."
              className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border-2 border-teal-600 focus:border-teal-600 rounded-xl text-slate-900 placeholder-slate-400 text-base font-medium outline-none transition-all shadow-sm"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setDebouncedQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/70 transition-all"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500 font-medium px-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Navigate</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono text-slate-600 shadow-xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono text-slate-600 shadow-xs">↓</kbd>
              <span className="text-slate-400 ml-2">Select</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono text-slate-600 shadow-xs">↵ Enter</kbd>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Clear</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono text-slate-600 shadow-xs">Esc</kbd>
            </div>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 overflow-x-auto text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            All Results
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'clients'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Clients ({filteredData.members.length})
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'fleet'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Fleet ({filteredData.fleets.length})
          </button>
          <button
            onClick={() => setActiveTab('warehouse')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'warehouse'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Warehouse ({filteredData.warehouses.length})
          </button>
        </div>

        {/* Selected Notification Toast */}
        {selectedItem && (
          <div className="bg-teal-50 border-b border-teal-100 px-5 py-2.5 flex items-center justify-between text-xs text-teal-800 animate-fadeIn">
            <span className="flex items-center gap-2">
              <CornerDownLeft className="w-4 h-4 text-teal-600" />
              Selected: <strong>{'name' in selectedItem ? selectedItem.name : selectedItem.title}</strong> ({selectedItem.type.toUpperCase()})
            </span>
            <button 
              onClick={() => setSelectedItem(null)} 
              className="text-teal-600 hover:text-teal-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Results Area with clean scrolling */}
        <div className="overflow-y-auto max-h-[55vh] min-h-[360px] p-3 sm:p-5 space-y-6 divide-y divide-slate-100 scroll-smooth">
          {totalResults === 0 ? (
            /* Empty State */
            <div className="py-14 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">No matching results found</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                We couldn't find anything matching &quot;<strong className="text-slate-700">{query}</strong>&quot;. Try checking for typos or searching with different keywords.
              </p>
            </div>
          ) : (
            <>
              {/* SECTION 1: MEMBERS */}
              {filteredData.members.length > 0 && (
                <div className="pt-2 first:pt-0">
                  <div className="flex items-center justify-between mb-2.5 px-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-teal-600" />
                      Member
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                      {filteredData.members.length}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {filteredData.members.map((member) => {
                      const itemIndex = flatItems.findIndex(i => i.id === member.id);
                      const isCurrentActive = itemIndex === activeIndex;

                      return (
                        <div
                          key={member.id}
                          onClick={() => setSelectedItem(member)}
                          onMouseEnter={() => setActiveIndex(itemIndex)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                            isCurrentActive
                              ? 'bg-slate-100/90 item-active ring-1 ring-slate-200'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                <HighlightedText text={member.name} query={debouncedQuery} />
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                <HighlightedText text={member.handle} query={debouncedQuery} /> • {member.role}
                              </p>
                            </div>
                          </div>
                          {isCurrentActive && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1 rounded-md">
                              Select <kbd className="font-mono">↵</kbd>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 2: FLEET */}
              {filteredData.fleets.length > 0 && (
                <div className="pt-4 first:pt-0">
                  <div className="flex items-center justify-between mb-2.5 px-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-teal-600" />
                      Fleet Assets
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                      {filteredData.fleets.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {filteredData.fleets.map((fleet) => {
                      const itemIndex = flatItems.findIndex(i => i.id === fleet.id);
                      const isCurrentActive = itemIndex === activeIndex;

                      const statusColors = {
                        'In service': 'bg-amber-50 text-amber-800 border-amber-200',
                        'Out of service': 'bg-rose-50 text-rose-800 border-rose-200',
                        'En route': 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      }[fleet.status];

                      return (
                        <div
                          key={fleet.id}
                          onClick={() => setSelectedItem(fleet)}
                          onMouseEnter={() => setActiveIndex(itemIndex)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                            isCurrentActive
                              ? 'bg-slate-100/90 item-active ring-1 ring-slate-200'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                              {fleet.title.includes('Truck') ? <Truck className="w-5 h-5" /> : fleet.title.includes('Ship') ? <Ship className="w-5 h-5" /> : <Navigation className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                <HighlightedText text={fleet.title} query={debouncedQuery} />
                              </p>
                              <p className="text-xs text-slate-500">
                                <HighlightedText text={fleet.vehicleType} query={debouncedQuery} /> •{' '}
                                <HighlightedText text={fleet.warehouse} query={debouncedQuery} />
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusColors}`}>
                              <HighlightedText text={fleet.status} query={debouncedQuery} />
                            </span>
                            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200">
                              <span>{fleet.battery}%</span>
                            </div>
                            {isCurrentActive && (
                              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1 rounded-md">
                                Select <kbd className="font-mono">↵</kbd>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 3: WAREHOUSE */}
              {filteredData.warehouses.length > 0 && (
                <div className="pt-4 first:pt-0">
                  <div className="flex items-center justify-between mb-2.5 px-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-600" />
                      Warehouse Network
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                      {filteredData.warehouses.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    {filteredData.warehouses.map((wh) => {
                      const itemIndex = flatItems.findIndex(i => i.id === wh.id);
                      const isCurrentActive = itemIndex === activeIndex;

                      return (
                        <div
                          key={wh.id}
                          onClick={() => setSelectedItem(wh)}
                          onMouseEnter={() => setActiveIndex(itemIndex)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isCurrentActive
                              ? 'bg-teal-50/50 border-teal-500 ring-2 ring-teal-200/50 item-active'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-6 h-6 rounded-md bg-teal-100/70 text-teal-700 flex items-center justify-center">
                              <Building2 className="w-3.5 h-3.5" />
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              <HighlightedText text={wh.name} query={debouncedQuery} />
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                            <HighlightedText text={wh.location} query={debouncedQuery} />
                          </p>
                          <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded w-fit">
                            {wh.capacity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            MemberFun Challenge #63 • <strong>Shiptrack Live Search</strong>
          </span>
          <span className="font-medium text-teal-700">
            {totalResults} result{totalResults !== 1 ? 's' : ''} available
          </span>
        </div>
      </div>
    </main>
  );
}
