import BlackWhiteListInterface, { Mode } from "./BlackWhiteListInterface";
import { injectable } from "inversify";
import regexParser from "regex-parser";

@injectable()
export default class BlackWhiteList implements BlackWhiteListInterface {
    private mode: Mode = "black";
    private list: string[] = [];

    private get default(): boolean {
        return this.mode === "black";
    }

    private static parseRegex(item: string): RegExp | null {
        if (!/^\/.*\/[gimsuy]*$/.test(item)) {
            return null;
        }
        try {
            return regexParser(item);
        } catch {
            return null;
        }
    }

    isFileAllowed(path: string): boolean {
        if (this.list.length === 0) {
            return true;
        }

        for (const item of this.list) {
            const regex = BlackWhiteList.parseRegex(item);
            const matched = regex ? regex.test(path) : path.startsWith(item);
            if (matched) {
                return this.mode === "white";
            }
        }
        return this.default;
    }

    setMode(mode: Mode): void {
        this.mode = mode;
    }

    setList(list: string[]): void {
        this.list = [...list];
    }
}
