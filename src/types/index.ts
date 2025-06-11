import type { Prisma, Image, Lib } from "@prisma/client";

// dev.to API response
export type Post<HasDetails extends boolean = false> = {
  type_of: string;
  id: number;
  title: string;
  description: string;
  readable_publish_date: string;
  slug: string;
  path: string;
  url: string;
  comments_count: number;
  positive_reactions_count: number;
  cover_image: string;
  social_image: string;
  canonical_url: string;
  created_at: string;
  edited_at: string;
  crossposted_at: string;
  published_at: string;
  last_comment_at: string;
  reading_time_minutes: number;
  tag_list: string[];
  tags: string;
  user: {
    name: string;
    username: string;
    twitter_username: string;
    github_username: string;
    website_url: string;
    profile_image: string;
    profile_image_90: string;
  };
} & (HasDetails extends true
  ? {
      body_html: string;
      body_markdown: string;
    }
  : {});

export type Project<HasTimeStamps extends boolean = true> = HasTimeStamps extends true
  ? Prisma.ProjectGetPayload<{
      include: {
        images: true;
        libs: true;
      };
    }>
  : Omit<
      Prisma.ProjectGetPayload<{
        include: {
          images: true;
          libs: true;
        };
      }>,
      "createdAt" | "updatedAt"
    > & {
      images: Omit<Image, "createdAt" | "updatedAt">[];
      libs: Omit<Lib, "createdAt" | "updatedAt">[];
    };

export type Doc = {
  id: string;
  name: string | null;
  createdAt: string | null;
  nameSpace: string | null;
  docs: {
    id: string;
    name: string | null;
    createdAt: string | null;
    metadata: string | null;
    pageContent: string | null;
    langChainDocsId: string | null;
  }[];
};

type Document<Metadata extends Record<string, any> = Record<string, any>> = {
    pageContent: string;
    metadata: Metadata;
}

export type ChatMessage = {
  type: "apiMessage" | "userMessage";
  message: string;
  isStreaming?: boolean;
  sourceDocs?: Document[];
};

export type ApiChatResponseBody = {
  response: {
    text: string;
    sourceDocuments: Document[];
  };
};

export type ApiChatResponse = ApiChatResponseBody | { error: string; status: number };
