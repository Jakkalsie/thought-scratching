import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { trpc } from "../../../utils/trpc";
import type { Post } from "@prisma/client";
import TextareaAutosize from "react-textarea-autosize";

const Edit = () => {
  const { data: session } = useSession({ required: true });

  const router = useRouter();
  const id = router.query.id as string;

  const [post, setPost] = useState<Post | null>(null);

  const utils = trpc.useContext();
  useEffect(() => {
    if (!id || post) return;

    const initPost = async () => {
      const newPost = await utils.post.getOne.fetch({ id });
      setPost(newPost);
    };

    initPost();
  }, [id, post, utils.post.getOne]);

  const handlePostChange = async (newPost: { title?: string; content?: string }) => {
    setPost((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...newPost,
      };
    });
  };

  const updatePost = trpc.post.updatePost.useMutation();
  const handlePostUpdate = async () => {
    if (!post) return;

    await updatePost.mutateAsync({ id, title: post.title, content: post.content });
    router.push(`/posts/${id}`);
  };

  const deletePost = trpc.post.deletePost.useMutation();
  const handlePostDelete = async () => {
    if (!post) return;

    await deletePost.mutateAsync({ id });
    router.push("/");
  };

  return (
    <>
      <Head>
        <title>Blog | Dirk S Beukes</title>
        <meta name="description" content="A quick website to write down all Dirk's ideas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-light p-8">
        <nav className="mx-auto flex max-w-8xl justify-between">
          <Image src={session?.user?.image || "/fallback.webp"} width={40} height={40} className="rounded-full" alt="Profile Image" />
          <ul className="flex gap-8 text-sm font-medium text-secondary">
            <li>Home</li>
            <li className="text-accent underline underline-offset-8">Blog</li>
            <li>Scratches</li>
            <li>Projects</li>
          </ul>
        </nav>
        <article className="mx-auto mt-8 flex max-w-6xl flex-col gap-2">
          <div className="flex justify-between">
            <button className="text-sm font-medium text-secondary hover:text-accent" onClick={handlePostUpdate}>
              ← Back to post
            </button>
            {session?.user?.admin && (
              <button className="text-sm font-medium text-secondary hover:text-accent" onClick={handlePostDelete}>
                Delete
              </button>
            )}
          </div>
          <input
            type="text"
            className="bg-light text-5xl font-medium text-primary focus:outline-none xl:text-6xl "
            value={post?.title || ""}
            onChange={(e) => handlePostChange({ title: e.currentTarget.value })}
          />

          <TextareaAutosize
            className="prose max-w-full resize-none whitespace-pre-wrap bg-light focus:outline-none lg:prose-xl"
            value={post?.content || ""}
            onChange={(e) => handlePostChange({ content: e.currentTarget.value })}
          />
        </article>
      </main>
    </>
  );
};

export default Edit;
