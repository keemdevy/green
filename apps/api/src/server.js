import http from 'node:http';

const port = Number(process.env.PORT || 17120);

const now = new Date();
const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

const users = [
  {
    id: 'female-001',
    displayName: '민지',
    gender: 'female',
    status: 'active',
    passVerified: true,
    greenFlagsCount: 0,
    redFlagsCount: 0,
    subscriptionTier: 'free',
    createdAt: '2026-05-01T09:00:00.000Z'
  },
  {
    id: 'male-001',
    displayName: '준호',
    gender: 'male',
    status: 'pending',
    passVerified: true,
    greenFlagsCount: 2,
    redFlagsCount: 0,
    subscriptionTier: 'free',
    createdAt: '2026-05-01T10:30:00.000Z'
  },
  {
    id: 'male-002',
    displayName: '도윤',
    gender: 'male',
    status: 'active',
    passVerified: true,
    greenFlagsCount: 4,
    redFlagsCount: 0,
    subscriptionTier: 'basic',
    createdAt: '2026-05-02T08:15:00.000Z'
  },
  {
    id: 'male-003',
    displayName: '시우',
    gender: 'male',
    status: 'suspended',
    passVerified: true,
    greenFlagsCount: 3,
    redFlagsCount: 2,
    subscriptionTier: 'premium',
    createdAt: '2026-05-02T11:20:00.000Z'
  }
];

const profiles = [
  {
    userId: 'male-001',
    age: 31,
    location: '서울 마포구',
    bio: '주말에는 러닝과 전시를 다니고, 평일엔 스타트업에서 제품을 만듭니다.',
    interests: ['러닝', '전시', '커피', '기획', '여행'],
    photos: []
  },
  {
    userId: 'male-002',
    age: 34,
    location: '경기 성남시',
    bio: '약속과 대화를 중요하게 생각합니다. 반려식물 키우는 개발자입니다.',
    interests: ['요리', '식물', '개발', '독서', '재즈'],
    photos: []
  }
];

const greenFlags = [
  {
    id: 'green-001',
    fromUserId: 'female-001',
    toUserId: 'male-001',
    reasons: ['말투가 정중함', '자기소개가 구체적'],
    createdAt: '2026-05-02T12:00:00.000Z'
  },
  {
    id: 'green-002',
    fromUserId: 'female-001',
    toUserId: 'male-002',
    reasons: ['프로필이 진솔함', '관계 의도가 분명함'],
    createdAt: '2026-05-02T13:00:00.000Z'
  }
];

const matches = [
  {
    id: 'match-001',
    femaleUserId: 'female-001',
    maleUserId: 'male-002',
    status: 'active',
    expiresAt: in24Hours,
    createdAt: now.toISOString()
  }
];

const reports = [
  {
    id: 'report-001',
    reporterUserId: 'female-001',
    targetUserId: 'male-003',
    status: 'open',
    reason: '약속 미준수',
    memo: '만남 이후 평가에서 신고로 전환됨. 24시간 내 확인 필요.',
    createdAt: '2026-05-03T03:20:00.000Z'
  }
];

const sanctions = [
  {
    id: 'sanction-001',
    userId: 'male-003',
    type: 'suspension',
    reason: '레드플래그 누적 및 운영 검토',
    createdAt: '2026-05-03T04:00:00.000Z'
  }
];

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.url === '/health') {
    sendJson(res, 200, { ok: true, service: 'green-api' });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/review-pool') {
    const candidates = profiles.map((profile) => ({
      user: users.find((user) => user.id === profile.userId),
      profile,
      greenFlagReasons: ['말투가 정중함', '프로필이 진솔함', '자기소개가 구체적']
    }));
    sendJson(res, 200, candidates);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/green-flags') {
    readJson(req)
      .then((body) => {
        const created = {
          id: `green-${String(greenFlags.length + 1).padStart(3, '0')}`,
          fromUserId: body.fromUserId,
          toUserId: body.toUserId,
          reasons: body.reasons || [],
          createdAt: new Date().toISOString()
        };
        greenFlags.push(created);
        sendJson(res, 201, created);
      })
      .catch(() => sendJson(res, 400, { error: 'Invalid JSON body' }));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/matches') {
    sendJson(res, 200, matches);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/admin/summary') {
    sendJson(res, 200, {
      pendingMen: users.filter((user) => user.gender === 'male' && user.status === 'pending').length,
      activeMen: users.filter((user) => user.gender === 'male' && user.status === 'active').length,
      openReports: reports.filter((report) => report.status === 'open').length,
      appeals: 0
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/admin/users') {
    sendJson(res, 200, users);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/admin/reports') {
    sendJson(res, 200, reports);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/admin/sanctions') {
    sendJson(res, 200, sanctions);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(port, () => {
  console.log(`green api listening on ${port}`);
});
