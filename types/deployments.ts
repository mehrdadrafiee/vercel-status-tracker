export type DeploymentProps = {
  uid:                 string;
  name:                string;
  url:                 string;
  created:             number;
  source?:             Source;
  state:               string;
  readyState:          string;
  readySubstate?:      string;
  type:                string;
  creator:             Creator;
  inspectorURL:        string;
  meta:                Meta;
  target:              string | null;
  aliasError?:         null;
  aliasAssigned:       number | null;
  isRollbackCandidate: boolean;
  createdAt:           number;
  buildingAt:          number;
  ready:               number;
}

export type Creator = {
  uid:         string;
  email:       string;
  username:    string;
  githubLogin: string;
}

export type Meta = {
  githubCommitAuthorName:  string;
  githubCommitMessage:     string;
  githubCommitOrg:         string;
  githubCommitRef:         string;
  githubCommitRepo:        string;
  githubCommitSha:         string;
  githubDeployment:        string;
  githubOrg:               string;
  githubRepo:              string;
  githubRepoOwnerType:     string;
  githubCommitRepoID:      string;
  githubRepoID:            string;
  githubRepoVisibility:    string;
  githubCommitAuthorLogin: string;
  branchAlias:             string;
  action?:                 Source;
  originalDeploymentID?:   string;
  githubPRID?:             string;
}

export enum Source {
  Git = "git",
  Import = "import",
  Redeploy = "redeploy",
}

export enum GithubCommitRef {
  Dev = "dev",
  Main = "main",
}

export enum GithubRepoVisibility {
  Private = "private",
  Public = "public",
}
