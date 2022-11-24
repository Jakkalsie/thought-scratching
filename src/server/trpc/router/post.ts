import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

// https://random.imagecdn.app/960/560
// get the image from the cdn and return the url
const getRandomImageUrl = async (width: number, height: number) => {
  const imageRes = await fetch(`https://random.imagecdn.app/${width}/${height}`);
  const imageUrl = imageRes.url;
  return imageUrl;
};

export const postRouter = router({
  getOne: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.prisma.post.findUnique({
      where: { id: input.id },
      include: {
        author: true,
      },
    });
  }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany({
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  createPost: protectedProcedure.input(z.object({ title: z.string(), content: z.string() })).mutation(async ({ ctx, input }) => {
    const image = await getRandomImageUrl(960, 560);
    return ctx.prisma.post.create({
      data: {
        title: input.title,
        content: input.content,
        author: {
          connect: {
            id: ctx.session.user.id,
          },
        },
        image,
      },
    });
  }),
  updatePost: protectedProcedure.input(z.object({ id: z.string(), title: z.string(), content: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.prisma.post.update({
      where: { id: input.id },
      data: {
        title: input.title,
        content: input.content,
      },
    });
  }),
  refetchImage: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const image = await getRandomImageUrl(960, 560);
    return ctx.prisma.post.update({
      where: { id: input.id },
      data: {
        image,
      },
    });
  }),

  deletePost: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.prisma.post.delete({
      where: { id: input.id },
    });
  }),
});
