"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useLazyQuery } from "@apollo/client";
import { GET_REPOSITORY } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  GitFork,
  Star,
  Pin,
  ChevronDown,
  File,
  Folder,
  Search,
  Plus,
  Code,
  Check,
  Clipboard,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fragment, useState } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getFileIcon } from "@/lib/utils/file-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { MapPin } from "lucide-react";
import { StarButton } from "@/components/star-button";
import { FileSearch } from "@/components/file-search";

type GitTreeEntry = {
  name: string;
  type: "blob" | "tree";
  oid: string;
  path: string;
};

export type GitTreeEntryDetail = {
  file: string;
  name: string;
  type: "blob" | "tree";
  oid: string;
  path: string;
  size?: number;
  msg?: string;
  date?: string;
};

type User = {
  name: string;
  username: string;
  avatar: string;
  location: string;
  bio: string;
};

type Repository = {
  id: string;
  name: string;
  description: string;
  slug: string;
  gitUrl: string;
  createdAt: string;
  updatedAt: string;
  tree: GitTreeEntry[];
  treeEntryDetails: GitTreeEntryDetail[];
  fileContent?: string;
  user: User;
  starsCount: number;
  stargazers: User[];
  isStarredByMe: boolean;
};

export default function RepositoryView() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  const repositorySlug = params.repositorySlug as string;
  const pathParams = (params.path as string[]) || [];
  const currentPath = pathParams.join("/");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const { loading, error, data } = useQuery(GET_REPOSITORY, {
    variables: {
      username,
      slug: repositorySlug,
      path: currentPath,
      ref: "main",
    },
  });

  if (loading) return null;

  const repository: Repository = data?.repositories[0];
  console.log("repository", repository);

  if ((!repository && !loading) || error) {
    console.log(error);
    router.push("/404");
    return null;
  }

  const copyToClipboard = (text: string, command: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const CommandBlock = ({
    children,
    commandName,
  }: {
    children: React.ReactNode;
    commandName: string;
  }) => (
    <div className="relative">
      <pre className="bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto">
        {children}
      </pre>
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 right-2"
        onClick={() => copyToClipboard(children as string, commandName)}
      >
        {copiedCommand === commandName ? (
          <Check className="h-4 w-4" />
        ) : (
          <Clipboard className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  const isRepositoryEmpty = repository.tree.length === 0;
  const lastUpdated = new Date(repository.updatedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const FileTreeView = ({ entries }: { entries: GitTreeEntryDetail[] }) => {
    return (
      <div className="divide-y">
        {currentPath && (
          <div
            className="flex items-center px-3 py-2 hover:bg-accent cursor-pointer"
            onClick={() => {
              const parentPath = currentPath.split("/").slice(0, -1).join("/");
              router.push(`/${username}/${repositorySlug}/${parentPath}`);
            }}
          >
            <div className="flex items-center flex-1">
              <img
                src="/icons/folder-blue.svg"
                className="h-5 w-5 mr-2"
                alt=""
              />
              <span className="text-sm font-medium">..</span>
            </div>
          </div>
        )}
        {entries.map((entry: GitTreeEntryDetail, index: number) => (
          <div
            key={entry.path}
            className={`flex flex-col ${
              index === entries.length - 1 && !currentPath ? "rounded-b-lg" : ""
            }`}
          >
            <Link
              href={`/${username}/${repositorySlug}/${entry.path}`}
              className={`flex items-center px-3 py-2 hover:bg-accent cursor-pointer group ${
                index === entries.length - 1 ? "rounded-b-lg" : ""
              }`}
            >
              <div className="flex items-center w-full">
                <img
                  src={getFileIcon(entry.file, entry.type === "tree")}
                  className={`${
                    entry.type === "tree" ? "h-5 w-5" : "h-4 w-4"
                  } mr-2`}
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {entry.file}
                  </span>
                </div>
                {entry.msg && (
                  <div className="flex items-center justify-between flex-1 min-w-0 px-4">
                    <span className="text-xs text-muted-foreground truncate">
                      {entry.msg.split("\n")[0]}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {entry.date &&
                        new Date(entry.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    );
  };

  // Check if current path points to a file
  const isFile = repository.fileContent != null;

  const BreadcrumbNav = () => {
    const pathParts = currentPath.split("/");

    return (
      <div className="flex items-center space-x-2">
        <Link className="flex items-center" href={`/${username}`}>
          <Avatar className="size-6">
            <AvatarImage src={repository.user.avatar} alt={username} />
            <AvatarFallback>
              {username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        {/* <HoverCard openDelay={250}>
          <HoverCardTrigger asChild>
            <Link className="flex items-center" href={`/${username}`}>
              <Avatar className="size-6">
                <AvatarImage src={repository.user.avatar} alt={username} />
                <AvatarFallback>
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="flex flex-col gap-2">
              <Link href={`/${username}`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={repository.user.avatar} />
                  <AvatarFallback>
                    {username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h4 className="text-sm font-semibold">
                  {repository.user.name || username}
                </h4>
              </Link>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {repository.user.username}
                </p>
                {repository.user.bio && (
                  <p className="text-sm text-muted-foreground">
                    {repository.user.bio}
                  </p>
                )}
                {repository.user.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-3 w-3" />
                    {repository.user.location}
                  </div>
                )}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard> */}
        <span className="text-muted-foreground">/</span>
        <Link
          href={`/${username}/${repositorySlug}`}
          className={`text-lg ${
            currentPath ? "text-blue-500 hover:text-blue-600" : ""
          }`}
        >
          {repository.name}
        </Link>
        {pathParts.map((part, index) => (
          <Fragment key={index}>
            <span className="text-muted-foreground">/</span>
            <Link
              href={`/${username}/${repositorySlug}/${pathParts
                .slice(0, index + 1)
                .join("/")}`}
              className={`text-lg ${
                index < pathParts.length - 1
                  ? "text-blue-500 hover:text-blue-600"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {part}
            </Link>
          </Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <BreadcrumbNav />
        <div className="flex items-center space-x-2">
          <StarButton
            repositoryId={repository.id}
            starsCount={repository.starsCount}
            isStarred={repository.isStarredByMe}
            showCount={true}
          />
        </div>
      </div>

      <div className="border rounded-lg bg-background">
        <div className="border-b p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="space-x-2">
                <span>main</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="space-x-2">
                <span>2 Branches</span>
              </Button>
              <Button variant="ghost" size="sm" className="space-x-2">
                <span>3 Tags</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              {pathParams.length === 0 && (
                <div className="hidden lg:flex items-center space-x-2">
                  <FileSearch
                    username={username}
                    repositorySlug={repositorySlug}
                  />
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className="space-x-2">
                    <Code className="h-4 w-4" />
                    <span>Code</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px]">
                  <div className="p-2">
                    <h3 className="font-semibold mb-2">Clone</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <Input
                        value={repository.gitUrl}
                        readOnly
                        className="flex-grow"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(repository.gitUrl, "git-url")
                        }
                      >
                        {copiedCommand === "git-url" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Clipboard className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(
                        `https://github.dev/${username}/${repositorySlug}`,
                        "_blank"
                      )
                    }
                  >
                    Open with Visual Studio Code
                  </DropdownMenuItem>
                  <DropdownMenuItem>Download ZIP</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {isRepositoryEmpty && !isFile ? (
          <div className="p-6 space-y-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Quick setup</h2>
              <CommandBlock commandName="git-url">
                {repository.gitUrl}
              </CommandBlock>
            </div>

            <Tabs defaultValue="push-existing">
              <TabsList>
                <TabsTrigger value="push-existing">
                  Push an existing repository
                </TabsTrigger>
                <TabsTrigger value="create-new">
                  Create a new repository
                </TabsTrigger>
              </TabsList>
              <TabsContent value="push-existing">
                <div className="space-y-4">
                  <p>
                    If you have an existing repository on your computer, push it
                    with these commands:
                  </p>
                  <CommandBlock commandName="push-existing">{`git remote add origin ${repository.gitUrl}
git branch -M main
git push -u origin main`}</CommandBlock>
                </div>
              </TabsContent>
              <TabsContent value="create-new">
                <div className="space-y-4">
                  <p>
                    To create a new repository and push it to Blame.fun, follow
                    these steps:
                  </p>
                  <CommandBlock commandName="create-new">{`echo "# ${repository.name}" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin ${repository.gitUrl}
git push -u origin main`}</CommandBlock>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div>
            <div className="px-3 py-2 text-sm border-b">
              <div className="text-muted-foreground">
                Last updated on {lastUpdated}
              </div>
            </div>
            {isFile ? (
              <div className="p-4">
                <pre className="overflow-x-auto">
                  <code>{repository.fileContent}</code>
                </pre>
              </div>
            ) : (
              <FileTreeView entries={repository.treeEntryDetails} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
