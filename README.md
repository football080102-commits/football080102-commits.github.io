# pira · GitHub Pages 정적 사이트

`pira/` 폴더를 루트로 하는 정적 사이트입니다. GitHub Pages로 자동 배포되도록 구성되어 있습니다.

## 배포 흐름
- `main` 브랜치에 푸시하면 GitHub Actions가 사이트를 빌드 없이 그대로 업로드합니다.
- 결과는 리포지토리의 Pages 환경(`Settings > Pages`)에서 확인할 수 있습니다.

## 구조
```
.
├── index.html
├── 404.html
├── assets/
│   ├── css/styles.css
│   ├── js/main.js
│   └── favicon.svg
├── .nojekyll
├── CNAME               # 커스텀 도메인 사용 시 편집
└── .github/workflows/deploy.yml
```

## 사용 방법
1. GitHub에 새 리포지토리를 생성하고, 이 폴더를 루트로 푸시합니다.
2. 첫 배포를 위해 `main` 브랜치에 아무 커밋이나 푸시합니다.
3. 리포지토리 `Settings > Pages`에서 배포 URL을 확인합니다.
4. 커스텀 도메인 사용 시 `CNAME` 파일의 내용을 도메인으로 바꾸고, DNS에서 `CNAME`을 `username.github.io`로 지정합니다.

## 로컬 미리보기
로컬에서 브라우저로 `index.html`을 직접 열어도 되고, 간단한 서버를 띄워 상대 경로를 점검할 수 있습니다.

```bash
# 파이썬 3
python3 -m http.server 5173
# 또는 Node
npx serve . -l 5173 --single
```

열린 후 `http://localhost:5173` 접속.

## 라이선스
MIT
