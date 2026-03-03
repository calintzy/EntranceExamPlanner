"""
네이버 카페 크롤러
- 브라우저 쿠키를 이용하여 가입 필수 카페의 글 목록 & 내용을 가져옵니다.
- 결과는 CSV 파일로 저장됩니다.

사용법:
1. 크롬 브라우저에서 네이버 카페에 로그인
2. 쿠키 추출 (아래 가이드 참고)
3. 이 스크립트의 설정값 수정 후 실행

쿠키 추출 방법:
  1) 크롬에서 네이버 카페 페이지 열기
  2) F12 → Network 탭 → 아무 요청 클릭
  3) Request Headers에서 'Cookie' 값 전체 복사
  4) 아래 COOKIE 변수에 붙여넣기
"""

import requests
import json
import csv
import time
import re
import os
from datetime import datetime
from html import unescape


# ============================================================
# 설정값 - 여기만 수정하세요
# ============================================================

# 1. 크롬에서 복사한 쿠키 (전체 문자열)
COOKIE = ""

# 2. 카페 정보
CAFE_ID = ""       # 카페 URL 주소 (예: "pythoncafe")
CLUB_ID = ""       # 카페 고유번호 (숫자, 아래 방법으로 확인)
MENU_ID = ""       # 게시판 메뉴 ID (숫자, 아래 방법으로 확인)

# 3. 크롤링 범위
START_PAGE = 1
END_PAGE = 5       # 가져올 페이지 수 (1페이지 = 약 50개 글)

# 4. 요청 간격 (초) - 너무 빠르면 차단될 수 있음
DELAY = 1.5

# 5. 결과 저장 경로
OUTPUT_DIR = "data/cafe_crawl"

# ============================================================
# CLUB_ID, MENU_ID 확인 방법:
#   카페 게시판에 접속 → F12 → Network 탭 → 아무 글 클릭
#   요청 URL에서 clubid=XXXXX, menuid=XXXXX 확인
#
#   또는 카페 메인 페이지 소스에서:
#   "clubid" 검색하면 숫자 ID를 찾을 수 있음
# ============================================================


class NaverCafeCrawler:
    """네이버 카페 크롤러"""

    BASE_URL = "https://apis.naver.com/cafe-web/cafe2"
    ARTICLE_URL = "https://apis.naver.com/cafe-web/cafe-articleapi/v2.2"

    def __init__(self, cookie: str, cafe_id: str, club_id: str):
        self.session = requests.Session()
        self.cafe_id = cafe_id
        self.club_id = club_id

        self.session.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/131.0.0.0 Safari/537.36"
            ),
            "Referer": f"https://cafe.naver.com/{cafe_id}",
            "X-Requested-With": "XMLHttpRequest",
            "Cookie": cookie,
        })

    def get_article_list(self, menu_id: str, page: int, per_page: int = 50) -> list:
        """게시판의 글 목록을 가져옵니다."""
        url = f"{self.BASE_URL}/ArticleList.json"
        params = {
            "search.clubid": self.club_id,
            "search.menuid": menu_id,
            "search.page": page,
            "search.perPage": per_page,
            "search.queryType": "lastArticle",
        }

        try:
            resp = self.session.get(url, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()

            result = data.get("message", {}).get("result", {})
            articles = result.get("articleList", [])

            article_list = []
            for article in articles:
                article_list.append({
                    "article_id": article.get("articleId"),
                    "title": article.get("subject", ""),
                    "writer": article.get("nickName", ""),
                    "date": article.get("addDate", ""),
                    "read_count": article.get("readCount", 0),
                    "comment_count": article.get("commentCount", 0),
                })

            return article_list

        except requests.exceptions.RequestException as e:
            print(f"[오류] 글 목록 가져오기 실패 (page={page}): {e}")
            return []

    def get_article_content(self, article_id: int) -> str:
        """개별 글의 본문 내용을 가져옵니다."""
        url = (
            f"{self.ARTICLE_URL}/cafes/{self.club_id}"
            f"/articles/{article_id}?useCafeId=true"
        )

        try:
            resp = self.session.get(url, timeout=10)
            resp.raise_for_status()
            data = resp.json()

            result = data.get("result", {})
            article = result.get("article", {})
            content_html = article.get("contentHtml", "")

            # HTML 태그 제거 → 텍스트만 추출
            text = self._html_to_text(content_html)
            return text

        except requests.exceptions.RequestException as e:
            print(f"[오류] 글 내용 가져오기 실패 (id={article_id}): {e}")
            return ""

    def _html_to_text(self, html: str) -> str:
        """HTML을 텍스트로 변환합니다."""
        if not html:
            return ""
        # <br> → 줄바꿈
        text = re.sub(r"<br\s*/?>", "\n", html)
        # 나머지 태그 제거
        text = re.sub(r"<[^>]+>", "", text)
        # HTML 엔티티 디코딩
        text = unescape(text)
        # 연속 공백 정리
        text = re.sub(r" +", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    def crawl(self, menu_id: str, start_page: int, end_page: int, delay: float = 1.5) -> list:
        """글 목록 + 내용을 한번에 크롤링합니다."""
        all_articles = []

        # 1단계: 글 목록 수집
        print(f"\n{'='*50}")
        print(f" 글 목록 수집 중 (page {start_page}~{end_page})")
        print(f"{'='*50}")

        for page in range(start_page, end_page + 1):
            articles = self.get_article_list(menu_id, page)
            all_articles.extend(articles)
            print(f"  페이지 {page}: {len(articles)}개 글 발견")
            time.sleep(delay)

        print(f"\n  총 {len(all_articles)}개 글 목록 수집 완료")

        # 2단계: 각 글의 본문 내용 수집
        print(f"\n{'='*50}")
        print(f" 글 내용 수집 중 ({len(all_articles)}개)")
        print(f"{'='*50}")

        for i, article in enumerate(all_articles):
            article_id = article["article_id"]
            content = self.get_article_content(article_id)
            article["content"] = content

            progress = f"[{i+1}/{len(all_articles)}]"
            title_preview = article["title"][:30]
            print(f"  {progress} {title_preview}...")
            time.sleep(delay)

        return all_articles


def save_to_csv(articles: list, output_path: str):
    """결과를 CSV로 저장합니다."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "article_id", "title", "writer", "date",
            "read_count", "comment_count", "content"
        ])
        writer.writeheader()
        writer.writerows(articles)

    print(f"\n CSV 저장 완료: {output_path}")
    print(f"   총 {len(articles)}개 글")


def save_to_json(articles: list, output_path: str):
    """결과를 JSON으로 저장합니다."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

    print(f" JSON 저장 완료: {output_path}")


def main():
    # 설정값 검증
    if not COOKIE:
        print("[오류] COOKIE 값을 설정해주세요!")
        print("  크롬 F12 → Network → 요청 선택 → Cookie 헤더값 복사")
        return

    if not CLUB_ID or not MENU_ID:
        print("[오류] CLUB_ID와 MENU_ID를 설정해주세요!")
        print("  카페 게시판 URL에서 clubid, menuid 확인")
        return

    # 크롤러 실행
    crawler = NaverCafeCrawler(COOKIE, CAFE_ID, CLUB_ID)
    articles = crawler.crawl(MENU_ID, START_PAGE, END_PAGE, DELAY)

    if not articles:
        print("\n[경고] 수집된 글이 없습니다. 쿠키나 카페 ID를 확인해주세요.")
        return

    # 저장
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_path = os.path.join(OUTPUT_DIR, f"cafe_{CAFE_ID}_{timestamp}.csv")
    json_path = os.path.join(OUTPUT_DIR, f"cafe_{CAFE_ID}_{timestamp}.json")

    save_to_csv(articles, csv_path)
    save_to_json(articles, json_path)

    print(f"\n{'='*50}")
    print(f" 크롤링 완료!")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
