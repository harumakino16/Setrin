FROM node:18

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# ソースコードをコピー
COPY . .

# 開発サーバーのポートを開放
EXPOSE 3000

# 開発サーバー起動
CMD ["npm", "run", "dev"] npm install next-seo