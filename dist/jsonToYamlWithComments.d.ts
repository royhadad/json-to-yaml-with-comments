import { DumpOptions } from "js-yaml";
declare type Entry = [string, unknown];
declare type ShouldCommentOutProperty = (entry: Entry) => boolean;
export declare function jsonToYamlWithComments(input: Entry, shouldCommentOutProperty: ShouldCommentOutProperty, dumpOptions: DumpOptions): string;
export {};
