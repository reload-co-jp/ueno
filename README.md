# 上野地域メディア 情報収集・記事生成システム仕様

## 1. 目的

上野エリアの以下の情報をWebから自動収集し、店舗・施設・スポット・イベントなどの情報を構造化して記事を生成する。

- イベント
- 新店舗・閉店
- セール・キャンペーン
- POP UP
- 展示会
- 施設ニュース
- 地域ニュース

## 2. 情報源

### 公的情報・地域情報

- 東京都建設局・上野恩賜公園「イベント案内」
  - https://www.kensetsu.metro.tokyo.lg.jp/jimusho/toubuk/ueno/event
- 台東区公式サイト「イベント」
  - https://www.city.taito.lg.jp/bunka_kanko/sekaiisan/10kinen/gyoji.html
- 台東区公式観光情報サイト「TAITOおでかけナビ」
  - https://t-navi.city.taito.lg.jp/event?keyword=%E4%B8%8A%E9%87%8E

### プレスリリース

- PR TIMES「上野」
  - https://prtimes.jp/main/action.php?run=html&page=searchkey&search_word=%E4%B8%8A%E9%87%8E
- PR TIMES「上野マルイ」
  - https://prtimes.jp/topics/keywords/%E4%B8%8A%E9%87%8E%E3%83%9E%E3%83%AB%E3%82%A4

### 店舗情報

- 食べログ「上野の新規オープン」
  - https://tabelog.com/tokyo/C13106/C36324/rstLst/cond16-00-00/

### 上野の主要施設

- 東京都美術館
  - https://www.tobikan.jp/exhibition/
- 東京国立博物館
  - https://www.tnm.jp/modules/r_free_page/index.php?id=1255
- 国立科学博物館
  - https://www.kahaku.go.jp/tenji/exhibitions.html
- 上野動物園
  - https://www.tokyo-zoo.net/ueno/events/index.html
- 上野マルイ
  - https://www.0101.co.jp/058/event/?from=01_pc_st058_top_gnav-event
- エキュート上野
  - https://www.ecute.jp/ueno/campaign
  - https://www.ecute.jp/ueno/limitedshop
- 松坂屋上野店
  - https://www.matsuzakaya.co.jp/ueno/event/

## 情報源の優先順位

記事の事実確認では、原則として以下の優先順位で扱う。

1. 行政・公的機関
2. 店舗・施設の公式サイト
3. PR TIMES等の企業公式プレスリリース
4. イベントプラットフォーム
5. 食べログ・Google Maps等の店舗データベース
6. SNS
7. その他Webメディア

店舗の新規オープンやイベント開催日など重要な情報は、可能な限り公式サイトまたは公式プレスリリースで再確認する。

## 3. 情報収集フロー

```text
Webサイト
  ↓
スクレイピング
  ↓
Rawデータ保存
  ↓
情報抽出
  ↓
イベント・店舗・施設などに分類
  ↓
既存情報との重複チェック
  ↓
店舗・施設・スポットと紐付け
  ↓
記事生成
  ↓
確認
  ↓
公開
```

## 4. 情報カテゴリ

- `event` - イベント
- `new_opening` - 新規オープン
- `closing` - 閉店
- `renewal` - リニューアル
- `sale` - セール
- `campaign` - キャンペーン
- `popup` - POP UP
- `new_product` - 新商品
- `exhibition` - 展示会
- `facility_news` - 施設ニュース
- `local_news` - 地域ニュース

## 5. 管理する情報

### 店舗

- 名称
- カテゴリ
- 住所
- 緯度・経度
- 営業時間
- オープン日
- 公式サイト
- SNS
- 情報源

### 施設・スポット

- 名称
- 種類
- 住所
- 緯度・経度
- 公式サイト
- エリア

### イベント

- 名称
- 開催日時
- 開催場所
- 概要
- 料金
- 主催者
- 公式URL
- 情報源

### ニュース

- タイトル
- カテゴリ
- 公開日時
- 本文
- 情報源
- 関連店舗
- 関連施設
- 関連イベント

## 6. Entity管理

記事とは別に、店舗・施設・スポットをEntityとして管理する。

```text
上野マルイ
├── ゴンチャ 上野マルイ店
├── POP UPイベント
├── セール
└── その他ニュース
```

同じ店舗・施設について複数の情報源が存在しても、1つのEntityに統合する。

## 7. 重複管理

以下のような表記を同一店舗として認識する。

```text
ゴンチャ 上野マルイ店
ゴンチャ上野マルイ
Gong cha 上野マルイ
```

判定には以下を利用する。

- 店舗名
- 住所
- 電話番号
- URL
- 緯度・経度
- LLMによる判定

## 8. LLMによる情報抽出

スクレイピングした情報から構造化データを生成する。

```json
{
  "category": "new_opening",
  "title": "○○が上野にオープン",
  "area": "上野",
  "store": "○○",
  "place": "○○",
  "opening_date": "2026-08-01",
  "summary": "..."
}
```

## 9. 記事生成

Entityやイベント情報を元に記事を生成する。

### 新店舗

```text
【上野】○○が○月○日にオープン！

概要

店舗情報
- 店名
- 住所
- 営業時間
- オープン日
- アクセス
```

### イベント

```text
【上野】○○開催！○月○日から○○で

概要

イベント情報
- 開催期間
- 場所
- 料金
- アクセス
```

## 10. サイト構成

```text
/
├── 上野の最新情報
├── イベント
├── 新店舗
├── 閉店
├── セール
├── POP UP
├── 展示・アート
├── 店舗
├── 施設・スポット
└── エリア
```

### 特集ページ

- 今週の上野
- 今日の上野イベント
- 今週末の上野イベント
- 2026年8月の新店舗
- 現在開催中のセール

## 11. DB

静的JSONで保存する。
