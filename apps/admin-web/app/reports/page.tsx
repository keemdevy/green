import { createGreenApiClient } from '@green/api-client';
import { getApiBaseUrl } from '@green/config';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const client = createGreenApiClient({ baseUrl: getApiBaseUrl(process.env) });
  const reports = await client.reports();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 1080, margin: '0 auto' }}>
      <Link href="/" style={{ color: '#047857', textDecoration: 'none' }}>← 대시보드</Link>
      <h1 style={{ fontSize: 30, margin: '16px 0 8px' }}>신고 큐</h1>
      <p style={{ color: '#64748b', marginTop: 0 }}>명예훼손과 안전 리스크를 24시간 내 처리하는 운영 화면입니다.</p>

      <div style={{ overflowX: 'auto', border: '1px solid #d1d5db', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={cellStyle}>상태</th>
              <th style={cellStyle}>사유</th>
              <th style={cellStyle}>신고자</th>
              <th style={cellStyle}>대상</th>
              <th style={cellStyle}>메모</th>
              <th style={cellStyle}>접수</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td style={cellStyle}>{report.status}</td>
                <td style={cellStyle}>{report.reason}</td>
                <td style={cellStyle}>{report.reporterUserId}</td>
                <td style={cellStyle}>{report.targetUserId}</td>
                <td style={cellStyle}>{report.memo}</td>
                <td style={cellStyle}>{new Date(report.createdAt).toLocaleString('ko-KR')}</td>
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
