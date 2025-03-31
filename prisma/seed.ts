/* eslint-disable max-len */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.image.deleteMany();
  await prisma.lib.deleteMany();
  await prisma.project.deleteMany();

  // Create projects
  const personalSite = await prisma.project.create({
    data: {
      name: 'Personal Website',
      description: 'My personal website built with Astro, React, and Tailwind CSS. Features a blog, projects showcase, and a chatbot.',
      subheader: 'A modern personal website with a focus on performance and developer experience',
      url: 'https://fer.dev',
      repoUrl: 'https://github.com/fertostado/fer-personal-site',
      tags: 'Astro, React, Tailwind CSS, TypeScript, Prisma',
      relevance: 100,
      images: {
        create: [
          {
            path: 'projects/personal-site.png',
            alt: 'Personal Website Screenshot',
          },
          {
            path: 'projects/personal-site-mobile.png',
            alt: 'Personal Website Mobile Screenshot',
          },
        ],
      },
      libs: {
        create: [
          {
            name: 'Astro',
            url: 'https://astro.build',
          },
          {
            name: 'React',
            url: 'https://react.dev',
          },
          {
            name: 'Tailwind CSS',
            url: 'https://tailwindcss.com',
          },
          {
            name: 'Prisma',
            url: 'https://www.prisma.io',
          },
        ],
      },
    },
  });

  const devToIntegration = await prisma.project.create({
    data: {
      name: 'Dev.to Integration',
      description: 'Integration with Dev.to API to fetch and display my blog posts. Built with TypeScript and Node.js.',
      subheader: 'A seamless integration with Dev.to for blog post management',
      url: 'https://dev.to/fertostado',
      repoUrl: 'https://github.com/fertostado/dev-to-integration',
      tags: 'TypeScript, Node.js, API Integration, React',
      relevance: 90,
      images: {
        create: [
          {
            path: 'projects/devto.png',
            alt: 'Dev.to Integration Screenshot',
          },
        ],
      },
      libs: {
        create: [
          {
            name: 'TypeScript',
            url: 'https://www.typescriptlang.org',
          },
          {
            name: 'Node.js',
            url: 'https://nodejs.org',
          },
          {
            name: 'React',
            url: 'https://react.dev',
          },
        ],
      },
    },
  });

  console.log('Seed data created:', { personalSite, devToIntegration });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
