import { createGreenApiClient } from '@green/api-client';
import { getApiBaseUrl } from '@green/config';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SanctionsPage() {
  const client = createGreenApiClient({ baseUrl: getApiBaseUrl(process.env) });
  const sanctions = await client.sanctions();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 1080, margin: '0 auto' }}>
      <Link href="/" style={{ color: '#047857', textDecoration: 'none' }}>← 대시보드</Link>
      <h1 style={{ fontSize: 30, margin: '16px 0 8px' }}>제재 이력</h1>
      <p style={{ color: '#64748b', marginTop: 0 }}>경고, 정지, 밴 처리를 감사 가능한 형태로 기록합니다.</p>

      <div style={{ overflowX: 'auto', border: '1px solid #d1d5db', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={cellStyle}>유저</th>
              <th style={cellStyle}>종류</th>
              <th style={cellStyle}>사유</th>
              <th style={cellStyle}>처리 시각</th>
            </tr>
          </thead>
          <tbody>
            {sanctions.map((sanction) => (
              <tr key={sanction.id}>
                <td style={cellStyle}>{sanction.userId}</td>
                <td style={cellStyle}>{sanction.type}</td>
                <td style={cellStyle}>{sanction.reason}</td>
                <td style={cellStyle}>{new Date(sanction.createdAt).toLocaleString('ko-KR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const cellStyle = {
  padding: '12px 14px',
  borderBottom: '1px solid #e5e7eb',
  verticalAlign: 'top'
} as const;
