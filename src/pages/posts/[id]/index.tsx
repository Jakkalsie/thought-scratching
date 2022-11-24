import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import { useSession } from "next-auth/react";
import { trpc } from "../../../utils/trpc";

const PostViewPage = ({ id }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { data: session } = useSession();
  const { data } = trpc.post.getOne.useQuery({ id });

  return (
    <>
      <Head>
        <title>Blog | Dirk S Beukes</title>
        <meta name="description" content={data?.title || "A quick website to write down all Dirk's ideas"} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-light p-8">
        <nav className="mx-auto flex max-w-8xl justify-between">
          {session?.user ? (
            <Image src={session?.user?.image || "/fallback.webp"} width={40} height={40} className="rounded-full" alt="Profile Image" />
          ) : (
            <Link href="/api/auth/signin">Sign In</Link>
          )}
          <ul className="flex gap-8 text-sm font-medium text-secondary">
            <li>Home</li>
            <li className="text-accent underline underline-offset-8">Blog</li>
            <li>Scratches</li>
            <li>Projects</li>
          </ul>
        </nav>
        <article className="mx-auto mt-8 flex max-w-6xl flex-col gap-2">
          <div className="flex justify-between">
            <Link href="/" className="text-sm font-medium text-secondary hover:text-accent">
              ← Back to home
            </Link>
            {session?.user?.admin && (
              <Link href={`/posts/${id}/edit`} className="text-sm font-medium text-secondary hover:text-accent">
                Edit
              </Link>
            )}
          </div>
          <h1 className="text-5xl font-medium text-primary xl:text-6xl">{data?.title}</h1>
          <span className="text-sm font-medium text-dark">
            {data?.author.name?.split(" ").at(0)} {data?.createdAt.toDateString()}
          </span>

          <div className="prose mt-8 max-w-full whitespace-pre-wrap lg:prose-xl">{data?.content}</div>
        </article>
      </main>
    </>
  );
};

import type { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "../../../server/trpc/router/_app";

import superjson from "superjson";
import { createContextInner } from "../../../server/trpc/context";
import { prisma } from "../../../server/db/client";

export const getStaticProps = async (context: GetStaticPropsContext<{ id: string }>) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({ session: null }),
    transformer: superjson,
  });

  const id = context.params?.id as string;
  await ssg.post.getOne.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
    },
  });

  return {
    paths: posts.map((post) => ({
      params: {
        id: post.id,
      },
    })),
    fallback: "blocking",
  };
};

export default PostViewPage;
