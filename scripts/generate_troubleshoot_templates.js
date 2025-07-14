const fs = require('fs');
const path = require('path');

// 問題分類とトラブルシュートのマッピング
const troubleshootData = {
  // 共通の必須チェック項目
  common: [
    "ビルドガイドの'トラブルと対策'の項目を熟読した"
  ],
  
  // 問題分類とそれに対応するトラブルシュート項目
  categories: [
    {
      name: "キット内容の問題",
      items: [
        "部品が不足している",
        "部品が破損している",
        "はんだ済みの部品に問題がある",
        "組み立てに失敗したため、部品を追加購入したい",
        "その他のキット内容の問題"
      ],
      troubleshoot: [
        "BOOTHで連絡した <!-- ここをチェックする場合、issueは立てないでください -->"
      ]
    },
    {
      name: "ファームウェア書き込みの問題",
      items: [
        "ファームウェアが書き込めない",
        "その他のファームウェア書き込みの問題"
      ],
      troubleshoot: [
        "ZMKのドキュメント、FAQを確認した",
        "BMPのブートローダーが起動しているかどうか、ストレージのなかのINFO_UF2.TXTを確認してからファームウェアを書き込んだ"
      ]
    },
    {
      name: "キーボードの電源の問題",
      items: [
        "LEDが点灯しない",
        "LEDは点灯するがペアリングしない",
        "その他の電源の問題"
      ],
      troubleshoot: [
        "電源ONの状態で、電池ボックスの-側とBMPの0番ピン(ランドが四角いピンの1個上)の電圧が1V以上になっている",
        "電池ボックスとスイッチのはんだ付けを再確認した <!-- 画像を添付してください -->"
      ]
    },
    {
      name: "キー入力の問題",
      items: [
        "特定のキーが反応しない",
        "キーの反応が遅い",
        "その他のキー入力の問題"
      ],
      troubleshoot: [
        "ZMKのドキュメント、FAQを確認した",
        "central側にキーマップが設定されていることをzmk-studioで確認した",
        "キースイッチの足が折れ曲がっていないか確認した",
        "コンスルーの足が折れ曲がっていないか確認した",
        "BMPを取り付け直した",
        "BMPを左右で入れ替えて、メインの基板とBMPのどちらに問題があるか絞りこんだ"
      ]
    },
    {
      name: "トラックボールの問題",
      items: [
        "トラックボールがまったく反応しない",
        "トラックボールの動きがスムーズでない",
        "カーソルの動きが不規則",
        "その他のトラックボールの問題"
      ],
      troubleshoot: [
        "ケーブルの接続を再確認した",
        "センサーの取付位置を調整してみた",
        "組立中、ケースに取り付ける前にセンサーの動作確認を実施した",
        "トラックボールモジュールの仕様(最大速度24inch/s、最大加速度10G)について理解した"
      ]
    },
    {
      name: "ペアリングの問題",
      items: [
        "両手とも無線で入力できない",
        "片手（peripheral側が無線で入力できない）",
        "その他のペアリングの問題"
      ],
      troubleshoot: [
        "ZMKのFAQを確認し、関連するトラブルシュートを実施した(実施した内容を詳細説明に記載してください)"
      ]
    },
    {
      name: "無線接続中の入力の問題",
      items: [
        "ペアリングができない",
        "接続が頻繁に切れる、接続の遅延が大きい",
        "その他の無線接続中の入力の問題"
      ],
      troubleshoot: [
        "ZMKのFAQを確認し、関連するトラブルシュートを実施した(実施した内容を詳細説明に記載してください)",
        "ほかのデバイスに接続して動作確認した"
      ]
    },
    {
      name: "その他",
      items: [
        "その他"
      ],
      troubleshoot: []
    }
  ]
};

// マークダウンテンプレートを生成
function generateMarkdownTemplate() {
  let md = `---
name: トラブルシューティング
about: トラブルシューティング
title: "[トラブルシューティング]: "
labels: troubleshooting
assignees: ''
---

## torabo-tsukiのトラブルシューティング

このテンプレートを使用して、キーボードの問題に関する情報を提供してください。


組み立て関連の問題をチェックしたら、対応するトラブルシュートの項目をすべてチェックしてください。
  例：ファーム書き込みの問題のいずれかにチェックを入れた -> ファームウェア書き込みのトラブルシュートの項目をすべてチェックしてください

問題の詳細やチェックした結果を、詳細説明の項目で詳しく説明してください。

フォーマットにのっとっていない場合は自動的にIssueがクローズされます。修正してReopenしてください。

最後に、BOOTHのメッセージからIssueのURLを送信してください。購入者以外のサポートはしません。

`;

  // 共通の必須チェック項目を追加
  troubleshootData.common.forEach(item => {
    md += `- [ ] ${item}\n`;
  });

  md += `\n### 問題の分類\n\n`;

  // 各カテゴリーの問題項目を追加
  troubleshootData.categories.forEach(category => {
    md += `- ${category.name}\n`;
    
    if (category.items && category.items.length > 0) {
      category.items.forEach(item => {
        md += `  - [ ] ${item}\n`;
      });
    }
    
    if (category.subcategories) {
      category.subcategories.forEach(subcat => {
        md += `  - ${subcat.name}\n`;
        subcat.items.forEach(item => {
          md += `    - [ ] ${item}\n`;
        });
      });
    }
  });

  md += `\n### トラブルシュート\n\n`;

  // 各カテゴリーのトラブルシュート項目を追加
  troubleshootData.categories.forEach(category => {
    if (category.troubleshoot && category.troubleshoot.length > 0) {
      md += `- ${category.name.replace("問題", "トラブルシュート")}\n`;
      category.troubleshoot.forEach(item => {
        md += `  - [ ] ${item}\n`;
      });
    }
    
    if (category.subcategories) {
      category.subcategories.forEach(subcat => {
        md += `- ${subcat.name.replace("問題", "トラブルシュート")}\n`;
        subcat.troubleshoot.forEach(item => {
          md += `  - [ ] ${item}\n`;
        });
      });
    }
  });

  md += `
### 問題の詳細説明
<!-- 上記でチェックした問題について、詳しく説明してください -->

### トラブルシュートの詳細説明
<!-- 上記でチェックしたトラブルシュートの結果について、詳しく説明してください -->

### 環境情報
- ファームウェアバージョン:
- 接続方法（USB/Bluetooth/その他）:
- 接続しているデバイス（PC/Mac/その他）:
- OSとバージョン:

### 追加情報
<!-- 問題解決に役立つ可能性のあるその他の情報や画像を添付してください -->
`;

  return md;
}

// GitHub Actionsワークフローを生成
function generateWorkflow() {
  let workflow = `name: トラブルシューティングの検証
on:
  issues:
    types: [opened, edited]

# 権限設定を追加
permissions:
  issues: write
    
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Issueの内容を検証
        env:
          ISSUE_BODY: "\${{ github.event.issue.body }}"
          ISSUE_TITLE: "\${{ github.event.issue.title }}"
          ISSUE_LABELS: "\${{ toJson(github.event.issue.labels) }}"
        run: |
          # ラベルにtroubleshootingがある場合のみ処理を続行
          if [[ "\$ISSUE_LABELS" == *"troubleshooting"* ]]; then
            # テンプレートの使用確認（最低限のマーカーで判定）
            if [[ "\$ISSUE_BODY" != *"### 問題の分類"* ]] || [[ "\$ISSUE_BODY" != *"### トラブルシュート"* ]]; then
              gh issue comment \${{ github.event.issue.number }} --body "トラブルシューティングIssueテンプレートを使用してください。このIssueは自動的にクローズされます。"
              gh issue close \${{ github.event.issue.number }} -r "not planned"
              exit 0
            fi
            
            # 必須セクションの確認
            if [[ "\$ISSUE_BODY" != *"### 問題の詳細説明"* ]] || \\
               [[ "\$ISSUE_BODY" != *"### トラブルシュートの詳細説明"* ]] || \\
               [[ "\$ISSUE_BODY" != *"### 環境情報"* ]]; then
              gh issue comment \${{ github.event.issue.number }} --body "テンプレートの必須セクション（問題の詳細説明、トラブルシュートの詳細説明、環境情報）が削除されています。正しいテンプレートを使用してIssueを再作成してください。"
              gh issue close \${{ github.event.issue.number }} -r "not planned"
              exit 0
            fi
            
            # 環境情報の入力確認
            if [[ "\$ISSUE_BODY" == *"- ファームウェアバージョン:"\$'\\n' ]] && \\
               [[ "\$ISSUE_BODY" == *"- 接続方法（USB/Bluetooth/その他）:"\$'\\n' ]] && \\
               [[ "\$ISSUE_BODY" == *"- 接続しているデバイス（PC/Mac/その他）:"\$'\\n' ]] && \\
               [[ "\$ISSUE_BODY" == *"- OSとバージョン: "\$'\\n' ]]; then
              gh issue comment \${{ github.event.issue.number }} --body "環境情報が入力されていません。接続方法やOS情報は問題解決に重要です。環境情報を追記の上、Issueを再度開いてください。"
              gh issue close \${{ github.event.issue.number }} -r "not planned"
              exit 0
            fi
            
            # 必須チェック項目の確認
`;

  // 共通の必須チェック項目の検証を追加
  troubleshootData.common.forEach(item => {
    let escapedItem = item.replace(/`/g, '\\`');
    workflow += `            if [[ "\$ISSUE_BODY" != *"- [x] ${escapedItem}"* ]]; then\n`;
    workflow += `              gh issue comment \${{ github.event.issue.number }} --body "${item}してからIssueを再度開いてください。"\n`;
    workflow += `              gh issue close \${{ github.event.issue.number }} -r "not planned"\n`;
    workflow += `              exit 0\n`;
    workflow += `            fi\n\n`;
  });

  // 各カテゴリーの条件とトラブルシュートの検証を追加
  troubleshootData.categories.forEach(category => {
    // キット内容の問題は特別扱い（BOOTHで連絡）
    if (category.name === "キット内容の問題" && category.items) {
      workflow += `            # ${category.name}のチェックと対応するトラブルシュート\n`;
      workflow += `            if [[ `;
      
      let conditions = category.items.map(item => `"\$ISSUE_BODY" == *"- [x] ${item}"*`).join(' || \\\n               ');
      workflow += conditions;
      
      workflow += ` ]]; then\n`;
      workflow += `              gh issue comment \${{ github.event.issue.number }} --body "キット内容の問題はBOOTHで連絡してください。"\n`;
      workflow += `              gh issue close \${{ github.event.issue.number }} -r "not planned"\n`;
      workflow += `              exit 0\n`;
      workflow += `            fi\n\n`;
    } 
    else if (category.items && category.troubleshoot && category.troubleshoot.length > 0) {
      // 通常のカテゴリーの検証
      workflow += `            # ${category.name}のチェックと対応するトラブルシュート\n`;
      workflow += `            if [[ `;
      
      let conditions = category.items.map(item => `"\$ISSUE_BODY" == *"- [x] ${item}"*`).join(' || \\\n               ');
      workflow += conditions;
      
      workflow += ` ]]; then\n`;
      workflow += `              if [[ `;
      
      let troubleshootChecks = category.troubleshoot.map(item => {
        let escapedItem = item.split('<!--')[0].trim().replace(/`/g, '\\`');
        return `"\$ISSUE_BODY" != *"- [x] ${escapedItem}"*`;
      }).join(' || \\\n                 ');
      
      workflow += troubleshootChecks;
      
      workflow += ` ]]; then\n`;
      workflow += `                gh issue comment \${{ github.event.issue.number }} --body "${category.name}に関するトラブルシュートがすべて実施されていません。対応するトラブルシュートの項目をすべてチェックしてから再度Issueを開いてください。"\n`;
      workflow += `                gh issue close \${{ github.event.issue.number }} -r "not planned"\n`;
      workflow += `                exit 0\n`;
      workflow += `              fi\n`;
      workflow += `            fi\n\n`;
    }
    
    // サブカテゴリーの検証
    if (category.subcategories) {
      category.subcategories.forEach(subcat => {
        workflow += `            # ${subcat.name}のチェックと対応するトラブルシュート\n`;
        workflow += `            if [[ `;
        
        let conditions = subcat.items.map(item => `"\$ISSUE_BODY" == *"- [x] ${item}"*`).join(' || \\\n               ');
        workflow += conditions;
        
        workflow += ` ]]; then\n`;
        workflow += `              if [[ `;
        
        let troubleshootChecks = subcat.troubleshoot.map(item => {
          let escapedItem = item.split('<!--')[0].trim().replace(/`/g, '\\`');
          return `"\$ISSUE_BODY" != *"- [x] ${escapedItem}"*`;
        }).join(' || \\\n                 ');
        
        workflow += troubleshootChecks;
        
        workflow += ` ]]; then\n`;
        workflow += `                gh issue comment \${{ github.event.issue.number }} --body "${subcat.name}に関するトラブルシュートがすべて実施されていません。対応するトラブルシュートの項目をすべてチェックしてから再度Issueを開いてください。"\n`;
        workflow += `                gh issue close \${{ github.event.issue.number }} -r "not planned"\n`;
        workflow += `                exit 0\n`;
        workflow += `              fi\n`;
        workflow += `            fi\n\n`;
      });
    }
  });

  // 残りのワークフロー部分
  workflow += `            # 問題の詳細説明が単なるプレースホルダーではないことを確認
            ISSUE_DETAIL_SECTION=$(echo "\$ISSUE_BODY" | awk '/### 問題の詳細説明/{flag=1; next} /###/{flag=0} flag')
            TROUBLESHOOT_DETAIL_SECTION=$(echo "\$ISSUE_BODY" | awk '/### トラブルシュートの詳細説明/{flag=1; next} /###/{flag=0} flag')
            
            # 余分な空白と説明プレースホルダーテキストを削除して実際のコンテンツがあるか確認
            ISSUE_DETAIL_CONTENT=$(echo "\$ISSUE_DETAIL_SECTION" | sed 's/<!--.*-->//g' | tr -d '[:space:]')
            TROUBLESHOOT_DETAIL_CONTENT=$(echo "\$TROUBLESHOOT_DETAIL_SECTION" | sed 's/<!--.*-->//g' | tr -d '[:space:]')
            
            if [[ -z "\$ISSUE_DETAIL_CONTENT" ]] || [[ -z "\$TROUBLESHOOT_DETAIL_CONTENT" ]]; then
              gh issue comment \${{ github.event.issue.number }} --body "問題の詳細説明またはトラブルシュートの詳細説明が記入されていません。詳細な情報は問題解決に重要です。"
              gh issue close \${{ github.event.issue.number }} -r "not planned"
              exit 0
            fi
            
            echo "問題の分類とトラブルシュートの項目が正しくチェックされています。"
          else
            # トラブルシューティングが必要なタイトルやキーワードを含むIssueを検出
            if [[ "\$ISSUE_TITLE" == *"[トラブルシューティング]"* ]] || \\
               [[ "\$ISSUE_TITLE" == *"問題"* ]] || \\
               [[ "\$ISSUE_TITLE" == *"不具合"* ]] || \\
               [[ "\$ISSUE_TITLE" == *"動かない"* ]] || \\
               [[ "\$ISSUE_BODY" == *"問題"* ]] || \\
               [[ "\$ISSUE_BODY" == *"動かない"* ]] || \\
               [[ "\$ISSUE_BODY" == *"不具合"* ]] || \\
               [[ "\$ISSUE_BODY" == *"反応しない"* ]]; then
              gh issue comment \${{ github.event.issue.number }} --body "トラブルシューティングに関するIssueは、トラブルシューティングテンプレートを使用してください。このIssueは自動的にクローズされます。"
              gh issue close \${{ github.event.issue.number }} -r "not planned"
              exit 0
            fi
          fi
    env:
      GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;

  return workflow;
}

// ファイルパスの設定
const rootDir = path.resolve(__dirname, '..');
const templateDir = path.join(rootDir, '.github', 'ISSUE_TEMPLATE');
const workflowDir = path.join(rootDir, '.github', 'workflows');

// ディレクトリの存在確認と作成
if (!fs.existsSync(templateDir)) {
  fs.mkdirSync(templateDir, { recursive: true });
}
if (!fs.existsSync(workflowDir)) {
  fs.mkdirSync(workflowDir, { recursive: true });
}

// テンプレートファイルの生成
const markdownTemplate = generateMarkdownTemplate();
fs.writeFileSync(path.join(templateDir, 'troubleshoot.md'), markdownTemplate);
console.log('Generated: troubleshoot.md');

// ワークフローファイルの生成
const workflowYaml = generateWorkflow();
fs.writeFileSync(path.join(workflowDir, 'validate_troubleshoot.yml'), workflowYaml);
console.log('Generated: validate_troubleshoot.yml');

console.log('Template generation completed successfully');
