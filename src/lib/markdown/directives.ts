/**
 * Zenn / Qiita 互換の Markdown ディレクティブ記法を解釈する remark プラグイン。
 *
 * 対応記法:
 * - `:::message` / `:::message alert` / `:::message{kind=warn}` → `<aside class="msg msg-{kind}">`
 * - `:::note` / `:::note info` など → `<aside class="msg msg-{kind}">`
 * - `:::details <summary>` / `:::details[summary]` → `<details class="callout"><summary>...</summary>`
 *
 * 依存: `remark-directive` で生成される `containerDirective` ノードを前提とする。
 * remark-directive 標準の仕様では `:::name[label]` の括弧がラベルだが、
 * Zenn/Qiita は `:::details 作成された実行計画` のようにラベルを空白区切りで書く慣習がある。
 * そのため parser が `name` フィールドに「name 残り」を保持する挙動を観測し、
 * name が "details 作成された実行計画" のように空白を含む場合は先頭トークンを name、
 * 残りを summary として扱うフォールバックを実装している。
 */
import type { Paragraph, PhrasingContent, Root } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import { visit } from "unist-util-visit";

type MessageKind = "info" | "warn" | "alert";

type Handler = (node: ContainerDirective) => void;

type Plugin = () => (tree: Root) => void;

/** `alert` → `alert`, `warning` → `warn` など表記ゆれを正規化し、未知値は info にフォールバック */
function normalizeMessageKind(raw: string | null | undefined): MessageKind {
  if (!raw) return "info";
  const v = raw.trim().toLowerCase();
  if (v === "alert" || v === "danger" || v === "error") return "alert";
  if (v === "warn" || v === "warning" || v === "caution") return "warn";
  if (v === "info" || v === "note" || v === "tip") return "info";
  return "info";
}

/**
 * remark-directive が `name` に ":::details 作成された実行計画" のラベル部分を
 * 取り込んだ場合のフォールバック解析。
 * name 文字列を最初の空白で split して [head, rest] を返す。
 */
function splitNameAndRest(name: string): { head: string; rest: string | undefined } {
  const m = /^(\S+)\s+(.+)$/.exec(name);
  if (!m) return { head: name, rest: undefined };
  return { head: m[1]!, rest: m[2]!.trim() };
}

/** node.children[0] が `directiveLabel` を持つ paragraph ならその子を取得（= `:::name[label]` 記法） */
function extractDirectiveLabelChildren(
  node: ContainerDirective,
): PhrasingContent[] | undefined {
  const first = node.children[0];
  if (!first || first.type !== "paragraph") return undefined;
  const data = first.data;
  if (!data || data.directiveLabel !== true) return undefined;
  // paragraph.children は PhrasingContent[]。
  return first.children;
}

/** `:::message` / `:::note` を `<aside class="msg msg-{kind}">` に変換 */
const handleMessage: Handler = (node) => {
  // 優先順:
  //   1. attributes.kind / attributes.level（`:::message{kind=alert}`）
  //   2. name に空白を含む場合の rest（`:::message alert` → name="message alert"）
  //   3. directive label（`:::message[alert]`）
  const attrs = node.attributes ?? {};
  const attrKind = attrs.kind ?? attrs.level ?? attrs.type;

  const { rest: nameRest } = splitNameAndRest(node.name);

  let labelText: string | undefined;
  const labelChildren = extractDirectiveLabelChildren(node);
  if (labelChildren && labelChildren.length > 0) {
    const first = labelChildren[0];
    if (first && first.type === "text") labelText = first.value;
  }

  const kind = normalizeMessageKind(attrKind ?? nameRest ?? labelText);

  // `:::message alert` で name に rest が残っている場合、label paragraph は存在しないので
  // children はそのまま本文として使える。
  // `:::message[alert]` の場合、children[0] は directiveLabel 扱いなのでスキップが必要。
  if (labelChildren) {
    node.children = node.children.slice(1);
  }

  node.data = {
    ...(node.data ?? {}),
    hName: "aside",
    hProperties: { className: ["msg", `msg-${kind}`] },
  };
};

/** `:::details <summary>` / `:::details[summary]` を `<details class="callout"><summary>...</summary>` に変換 */
const handleDetails: Handler = (node) => {
  // summary 解決の優先順:
  //   1. directive label（`:::details[summary]`）
  //   2. attributes.summary
  //   3. name 空白 rest（`:::details 作成された実行計画`）
  //   4. "Details" フォールバック
  let summaryText = "Details";
  let bodyChildren = node.children;

  const labelChildren = extractDirectiveLabelChildren(node);
  if (labelChildren && labelChildren.length > 0) {
    const first = labelChildren[0];
    if (first && first.type === "text") summaryText = first.value;
    bodyChildren = node.children.slice(1);
  } else {
    const attrs = node.attributes ?? {};
    if (attrs.summary) {
      summaryText = attrs.summary;
    } else {
      const { rest } = splitNameAndRest(node.name);
      if (rest) summaryText = rest;
    }
  }

  // <details class="callout"><summary>{summaryText}</summary>{body}</details>
  // paragraph に hName="summary" をかぶせて <summary> 要素として出力する。
  const summaryNode: Paragraph = {
    type: "paragraph",
    data: { hName: "summary" },
    children: [{ type: "text", value: summaryText }],
  };
  node.children = [summaryNode, ...bodyChildren];
  node.data = {
    ...(node.data ?? {}),
    hName: "details",
    hProperties: { className: ["callout"] },
  };
};

const remarkZennQiitaDirectives: Plugin = () => {
  return (tree) => {
    visit(tree, "containerDirective", (node: ContainerDirective) => {
      const { head } = splitNameAndRest(node.name);
      switch (head) {
        case "message":
        case "note":
          handleMessage(node);
          return;
        case "details":
          handleDetails(node);
          return;
        default:
          // 未対応の directive はそのまま（remark-directive のデフォルト挙動に任せる）
          return;
      }
    });
  };
};

export default remarkZennQiitaDirectives;
