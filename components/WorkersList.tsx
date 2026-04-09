/**
 * WorkersList.tsx
 * Displays workers filtered by category with modal for detailed view
 */

'use client';

import { useState } from 'react';
import WorkerCard from './WorkerCard';
import WorkerDetail from './WorkerDetail';
import { DEMO_WORKERS, CATEGORIES } from '@/lib/data';

interface WorkersListProps {
    categoryId?: string;
    onClose?: () => void;
}

export default function WorkersList({ categoryId, onClose }: WorkersListProps) {
    const [selectedWorker, setSelectedWorker] = useState<any>(null);

    // Filter workers by category or all verified
    const workers = categoryId && categoryId !== 'all'
        ? DEMO_WORKERS.filter((w) => w.cat === categoryId)
        : DEMO_WORKERS.filter((w) => w.verified);

    // Get category info
    const category = CATEGORIES.find((c) => c.id === categoryId);
    const categoryLabel = category?.label || (categoryId === 'all' ? 'All Verified Workers' : 'All Workers');

    if (!workers.length) {
        return (
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                    backdropFilter: 'blur(4px)',
                }}
                onClick={onClose}
            >
                <div
                    style={{
                        background: '#fff',
                        borderRadius: 24,
                        padding: '48px 32px',
                        textAlign: 'center',
                        maxWidth: 400,
                        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
                    }}
                >
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                    <div
                        style={{
                            fontWeight: 900,
                            color: '#0f172a',
                            fontSize: 18,
                            marginBottom: 8,
                        }}
                    >
                        No Workers Found
                    </div>
                    <div
                        style={{
                            color: '#64748b',
                            fontSize: 14,
                            lineHeight: 1.6,
                            marginBottom: 24,
                        }}
                    >
                        There are currently no workers available in this category. Check back soon!
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#16a34a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            padding: '12px 24px',
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                zIndex: 600,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                padding: 16,
                backdropFilter: 'blur(4px)',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: '24px 24px 0 0',
                    width: '100%',
                    maxWidth: 600,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: 'linear-gradient(135deg,#0f4c25,#16a34a)',
                        padding: '28px 24px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <div
                            style={{
                                color: 'rgba(255,255,255,0.75)',
                                fontSize: 12,
                                fontWeight: 600,
                                letterSpacing: '0.06em',
                                marginBottom: 6,
                            }}
                        >
                            {category?.icon || '👷'} {categoryLabel}
                        </div>
                        <div
                            style={{
                                fontWeight: 900,
                                color: '#fff',
                                fontSize: 20,
                            }}
                        >
                            {workers.length} Worker{workers.length !== 1 ? 's' : ''} Available
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: 8,
                            width: 36,
                            height: 36,
                            fontSize: 20,
                            cursor: 'pointer',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Workers Grid */}
                <div
                    style={{
                        padding: '24px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: 16,
                    }}
                >
                    {workers.map((worker) => (
                        <WorkerCard
                            key={worker.id}
                            worker={worker}
                            onViewDetails={setSelectedWorker}
                        />
                    ))}
                </div>

                {/* Bottom spacing */}
                <div style={{ height: 16 }} />
            </div>

            {/* Worker Detail Modal */}
            {selectedWorker && (
                <WorkerDetail
                    worker={selectedWorker}
                    onClose={() => setSelectedWorker(null)}
                />
            )}
        </div>
    );
}
