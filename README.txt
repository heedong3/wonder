Wonder T Netlify 공동 저장 버전

1. ZIP을 풀고 안에 있는 4개 항목(public 폴더, netlify 폴더, netlify.toml, package.json)을 GitHub 저장소 최상위에 업로드합니다.
2. 기존 최상위 index.html은 삭제하세요. (새 화면은 public/index.html입니다.)
3. Netlify 프로젝트에서 GitHub 연결 자동 배포가 완료되었는지 확인하세요.
4. https://wonderschedule.netlify.app/.netlify/functions/schedule 주소에서 {"events":[]}가 나오면 서버가 정상입니다.
5. 휴대폰 2대로 접속해 한쪽에서 일정 추가/참석 선택 후 다른 쪽에서 10초 이내 반영되는지 확인하세요.

주의: 로그인/관리자 권한이 없으므로 주소를 아는 누구나 일정 추가/삭제, 참석 변경이 가능합니다.
기존 Firebase 저장 데이터는 자동 이전되지 않습니다.
