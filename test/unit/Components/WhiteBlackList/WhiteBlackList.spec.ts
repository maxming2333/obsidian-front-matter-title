import { Mode } from "@src/Components/BlackWhiteList/BlackWhiteListInterface";
import BlackWhiteList from "@src/Components/BlackWhiteList/BlackWhiteList";

describe("Test without list", () => {
    test("Should return true by default", () => {
        const list = new BlackWhiteList();
        expect(list.isFileAllowed("path")).toBeTruthy();
    });
    test("Should return true with black mode", () => {
        const list = new BlackWhiteList();
        list.setMode("black");
        expect(list.isFileAllowed("path")).toBeTruthy();
    });
    test("Should return true with white mode", () => {
        const list = new BlackWhiteList();
        list.setMode("white");
        expect(list.isFileAllowed("path")).toBeTruthy();
    });
});

describe("Black-White List test", () => {
    const path = ["foo", "bar/subbar"];
    const items: { path: string; mode: Mode; expected: boolean }[] = [
        { path: "foo/test.md", mode: "black", expected: false },
        { path: "foo/subfoo/test.md", mode: "black", expected: false },
        { path: "bar/subbar/test.md", mode: "black", expected: false },
        { path: "bar/subfoobar/test.md", mode: "black", expected: true },
        { path: "test.md", mode: "black", expected: true },

        { path: "foo/test.md", mode: "white", expected: true },
        { path: "foo/subfoo/test.md", mode: "white", expected: true },
        { path: "bar/subbar/test.md", mode: "white", expected: true },
        { path: "bar/subfoobar/test.md", mode: "white", expected: false },
        { path: "test.md", mode: "white", expected: false },
    ];
    const list = new BlackWhiteList();
    list.setList(path);
    for (const item of items) {
        test(`Path "${item.path}" is expected to be ${item.expected.toString()} [${item.mode} mode]`, () => {
            list.setMode(item.mode);
            expect(list.isFileAllowed(item.path)).toBe(item.expected);
        });
    }
});

describe("Regex support in Black-White List", () => {
    const regexItems: { desc: string; listItems: string[]; path: string; mode: Mode; expected: boolean }[] = [
        // 黑名单 - 正则匹配命中 -> 拒绝
        {
            desc: "black mode: regex matches path -> false",
            listItems: ["/^foo\\/.*/"],
            path: "foo/test.md",
            mode: "black",
            expected: false,
        },
        // 黑名单 - 正则不匹配 -> 允许
        {
            desc: "black mode: regex does not match path -> true",
            listItems: ["/^foo\\/.*/"],
            path: "bar/test.md",
            mode: "black",
            expected: true,
        },
        // 白名单 - 正则匹配命中 -> 允许
        {
            desc: "white mode: regex matches path -> true",
            listItems: ["/^foo\\/.*/"],
            path: "foo/test.md",
            mode: "white",
            expected: true,
        },
        // 白名单 - 正则不匹配 -> 拒绝
        {
            desc: "white mode: regex does not match path -> false",
            listItems: ["/^foo\\/.*/"],
            path: "bar/test.md",
            mode: "white",
            expected: false,
        },
        // 正则带 i flag - 大小写不敏感匹配
        {
            desc: "black mode: case-insensitive regex flag matches uppercase path -> false",
            listItems: ["/^notes\\//i"],
            path: "Notes/test.md",
            mode: "black",
            expected: false,
        },
        // 正则匹配文件扩展名
        {
            desc: "black mode: regex matches file extension -> false",
            listItems: ["/\\.secret\\.md$/"],
            path: "folder/file.secret.md",
            mode: "black",
            expected: false,
        },
        {
            desc: "black mode: regex does not match different extension -> true",
            listItems: ["/\\.secret\\.md$/"],
            path: "folder/file.md",
            mode: "black",
            expected: true,
        },
        // 混合列表：正则 + 普通前缀，普通前缀命中
        {
            desc: "black mode: mixed list, prefix match hits -> false",
            listItems: ["/^private\\//", "drafts/"],
            path: "drafts/note.md",
            mode: "black",
            expected: false,
        },
        // 混合列表：正则 + 普通前缀，正则命中
        {
            desc: "black mode: mixed list, regex match hits -> false",
            listItems: ["/^private\\//", "drafts/"],
            path: "private/note.md",
            mode: "black",
            expected: false,
        },
        // 无效正则 - 降级为前缀匹配，字面值不是前缀则允许
        {
            desc: "black mode: invalid regex falls back to prefix, no match -> true",
            listItems: ["/[invalid/"],
            path: "foo/test.md",
            mode: "black",
            expected: true,
        },
        // 无效正则 - 降级为前缀匹配，字面值是前缀则拒绝
        {
            desc: "black mode: invalid regex falls back to prefix, prefix match -> false",
            listItems: ["/[invalid/"],
            path: "/[invalid/note.md",
            mode: "black",
            expected: false,
        },
    ];

    for (const item of regexItems) {
        test(item.desc, () => {
            const list = new BlackWhiteList();
            list.setMode(item.mode);
            list.setList(item.listItems);
            expect(list.isFileAllowed(item.path)).toBe(item.expected);
        });
    }
});
