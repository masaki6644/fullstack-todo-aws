# ベースイメージ
FROM python:3.12-slim

# 作業ディレクトリ作成
WORKDIR /app

# 依存関係をコピー
COPY requirements.txt .

# パッケージインストール
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコピー
COPY . .

# ポート公開
EXPOSE 8000

# サーバ起動
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
