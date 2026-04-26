export interface StoredConfig {
  enterpriseUrl: string;
  tokenCipherText: string;
  tokenIv: string;
  tokenTag: string;
  updatedAt: string;
}

export interface RuntimeConfig {
  enterpriseUrl: string;
  token: string;
}

export type BranchKind = "local" | "remote";

export interface BranchInfo {
  name: string;
  kind: BranchKind;
  hash: string;
  committedAt: string;
  subject: string;
}

export interface PullRequestRequest {
  owner: string;
  repo: string;
  head: string;
  base: string;
  title: string;
  body: string;
}

export interface PullRequestResponse {
  number: number;
  html_url: string;
}
