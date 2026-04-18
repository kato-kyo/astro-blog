import { describe, it, expect } from "vitest";
import type { ContainerDirective } from "mdast-util-directive";
import type { Root } from "mdast";
import remarkZennQiitaDirectives from "../../src/lib/markdown/directives.js";

/**
 * handler は `node.data.hName` / `node.data.hProperties` / children を書き換えるので、
 * ContainerDirective を手作りして transform を走らせて結果を検証する（unified パイプライン不要）。
 */
function makeContainer(partial: Partial<ContainerDirective>): ContainerDirective {
  return {
    type: "containerDirective",
    name: "message",
    children: [],
    ...partial,
  } as ContainerDirective;
}

function runTransform(node: ContainerDirective): ContainerDirective {
  const tree: Root = { type: "root", children: [node] };
  const plugin = remarkZennQiitaDirectives();
  plugin(tree);
  return node;
}

describe("remarkZennQiitaDirectives (:::message / :::note)", () => {
  it(":::message 素のみは msg-info を付与", () => {
    const node = runTransform(
      makeContainer({
        name: "message",
        children: [
          { type: "paragraph", children: [{ type: "text", value: "hello" }] },
        ],
      }),
    );
    expect(node.data?.hName).toBe("aside");
    expect(node.data?.hProperties).toEqual({ className: ["msg", "msg-info"] });
  });

  it(":::message alert（name に rest がある場合）は msg-alert に正規化", () => {
    const node = runTransform(
      makeContainer({
        name: "message alert",
        children: [
          { type: "paragraph", children: [{ type: "text", value: "danger" }] },
        ],
      }),
    );
    expect(node.data?.hProperties).toEqual({ className: ["msg", "msg-alert"] });
  });

  it(":::note warning は msg-warn に正規化", () => {
    const node = runTransform(
      makeContainer({
        name: "note warning",
        children: [],
      }),
    );
    expect(node.data?.hProperties).toEqual({ className: ["msg", "msg-warn"] });
  });

  it("attributes.kind=alert は msg-alert", () => {
    const node = runTransform(
      makeContainer({
        name: "message",
        attributes: { kind: "alert" },
        children: [],
      }),
    );
    expect(node.data?.hProperties).toEqual({ className: ["msg", "msg-alert"] });
  });

  it("未知の kind 値は msg-info にフォールバック", () => {
    const node = runTransform(
      makeContainer({
        name: "message",
        attributes: { kind: "unknown-value" },
        children: [],
      }),
    );
    expect(node.data?.hProperties).toEqual({ className: ["msg", "msg-info"] });
  });

  it(":::message[alert] ラベル形式は msg-alert、label paragraph が children から除去される", () => {
    const node = runTransform(
      makeContainer({
        name: "message",
        children: [
          {
            type: "paragraph",
            data: { directiveLabel: true },
            children: [{ type: "text", value: "alert" }],
          },
          { type: "paragraph", children: [{ type: "text", value: "body" }] },
        ],
      }),
    );
    expect(node.data?.hProperties).toEqual({ className: ["msg", "msg-alert"] });
    expect(node.children).toHaveLength(1);
    const body = node.children[0];
    if (body && body.type === "paragraph") {
      const first = body.children[0];
      if (first && first.type === "text") {
        expect(first.value).toBe("body");
      } else {
        throw new Error("expected text node");
      }
    } else {
      throw new Error("expected paragraph");
    }
  });
});

describe("remarkZennQiitaDirectives (:::details)", () => {
  it(":::details 空白ラベル形式は summary を rest から抽出", () => {
    const node = runTransform(
      makeContainer({
        name: "details 作成された実行計画",
        children: [
          { type: "paragraph", children: [{ type: "text", value: "本文" }] },
        ],
      }),
    );
    expect(node.data?.hName).toBe("details");
    expect(node.data?.hProperties).toEqual({ className: ["callout"] });
    // children[0] が <summary> になっている
    const first = node.children[0];
    if (first && first.type === "paragraph") {
      expect(first.data?.hName).toBe("summary");
      const t = first.children[0];
      if (t && t.type === "text") {
        expect(t.value).toBe("作成された実行計画");
      } else {
        throw new Error("expected summary text");
      }
    } else {
      throw new Error("expected first child to be summary paragraph");
    }
    // 2つ目以降は元の本文
    expect(node.children).toHaveLength(2);
  });

  it(":::details[summary] 括弧ラベル形式も summary 反映", () => {
    const node = runTransform(
      makeContainer({
        name: "details",
        children: [
          {
            type: "paragraph",
            data: { directiveLabel: true },
            children: [{ type: "text", value: "bracket-summary" }],
          },
          { type: "paragraph", children: [{ type: "text", value: "body" }] },
        ],
      }),
    );
    const first = node.children[0];
    if (first && first.type === "paragraph" && first.children[0]?.type === "text") {
      expect(first.data?.hName).toBe("summary");
      expect(first.children[0].value).toBe("bracket-summary");
    } else {
      throw new Error("expected paragraph summary");
    }
  });

  it(":::details 無ラベルは summary が Details フォールバック", () => {
    const node = runTransform(
      makeContainer({
        name: "details",
        children: [
          { type: "paragraph", children: [{ type: "text", value: "body" }] },
        ],
      }),
    );
    const first = node.children[0];
    if (first && first.type === "paragraph" && first.children[0]?.type === "text") {
      expect(first.children[0].value).toBe("Details");
    } else {
      throw new Error("expected fallback summary");
    }
  });
});

describe("remarkZennQiitaDirectives (未対応)", () => {
  it("未対応 directive は data.hName を設定しない", () => {
    const node = runTransform(
      makeContainer({
        name: "custom",
        children: [],
      }),
    );
    expect(node.data?.hName).toBeUndefined();
  });
});
