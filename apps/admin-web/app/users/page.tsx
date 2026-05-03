import { createGreenApiClient } from '@green/api-client';
import { getApiBaseUrl } from '@green/config';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const client = createGreenApiClient({ baseUrl: getApiBaseUrl(process.env) });
  const users = await client.users();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 1080, margin: '0 auto' }}>
      <Link href="/" style={{ color: '#047857', textDecoration: 'none' }}>← 대시보드</Link>
      <h1 style={{ fontSize: 30, margin: '16px 0 8px' }}>유저 관리</h1>
      <p style={{ color: '#64748b', marginTop: 0 }}>본인인증, 활성화 조건, 구독 상태를 함께 확인합니다.</p>

      <div style={{ overflowX: 'auto', border: '1px solid #d1d5db', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={cellStyle}>이름</th>
              <th style={cellStyle}>성별</th>
              <th style={cellStyle}>상태</th>
              <th style={cellStyle}>본인인증</th>
              <th style={cellStyle}>그린</th>
              <th style={cellStyle}>레드</th>
              <th style={cellStyle}>구독</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={cellStyle}>{user.displayName}</td>
                <td style={cellStyle}>{user.gender}</td>
                <td style={cellStyle}>{user.status}</td>
                <td style={cellStyle}>{user.passVerified ? '완료' : '대기'}</td>
                <td style={cellStyle}>{user.greenFlagsCount}</td>
                <td style={cellStyle}>{user.redFlagsCount}</td>
                <td style={cellStyle}>{user.subscriptionTier}</td>
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
