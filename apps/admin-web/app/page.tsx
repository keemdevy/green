import { createGreenApiClient } from '@green/api-client';
import { getApiBaseUrl } from '@green/config';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const navItems = [
  { href: '/reports', label: '신고 큐', description: '24시간 내 처리해야 할 신고와 이의신청' },
  { href: '/users', label: '유저 관리', description: '검토 중/활성/제재 상태 확인' },
  { href: '/sanctions', label: '제재 이력', description: '경고, 정지, 밴 처리 내역' }
];

export default async function Page() {
  const client = createGreenApiClient({ baseUrl: getApiBaseUrl(process.env) });
  const summary = await client.adminSummary();
  const summaryItems = [
    ['검토 중 남성', summary.pendingMen],
    ['활성 남성', summary.activeMen],
    ['열린 신고', summary.openReports],
    ['이의신청', summary.appeals]
  ] as const;

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 1080, margin: '0 auto' }}>
      <header style={{ marginBottom: 32 }}>
        <p style={{ color: '#047857', fontWeight: 700, margin: 0 }}>Green Admin</p>
        <h1 style={{ fontSize: 34, margin: '8px 0' }}>운영 대시보드</h1>
        <p style={{ color: '#475569', margin: 0 }}>
          평판 매칭 서비스의 신고, 검토, 제재 흐름을 관리합니다.
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 32
        }}
      >
        {summaryItems.map(([label, value]) => (
          <div key={label} style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: 16 }}>
            <div style={{ color: '#64748b', fontSize: 14 }}>{label}</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{value}</div>
          </div>
        ))}
      </section>

      <nav style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: 8,
              padding: 18,
              color: '#0f172a',
              textDecoration: 'none'
            }}
          >
            <strong style={{ display: 'block', marginBottom: 8 }}>{item.label}</strong>
            <span style={{ color: '#64748b', lineHeight: 1.5 }}>{item.description}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
