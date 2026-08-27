import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <main className="flex w-full flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-bold">Welcome to Next.js!</h1>
        <p className="mt-3 text-2xl">Get started by editing <code>src/app/page.tsx</code></p>
        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
          <a
            href="https://nextjs.org/docs"
            className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Documentation &rarr;</h3>
            <p className="mt-4 text-xl">Find in-depth information about Next.js features and API.</p>
          </a>
          <a
            href="https://nextjs.org/learn"
            className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Learn &rarr;</h3>
            <p className="mt-4 text-xl">Learn about Next.js in an interactive course with quizzes!</p>
          </a>
          <a
            href="https://vercel.com/templates/next.js"
            className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Templates &rarr;</h3>
            <p className="mt-4 text-xl">Discover and deploy boilerplate example Next.js projects.</p>
          </a>
          <a
            href="https://vercel.com/new"
            className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Deploy &rarr;</h3>
            <p className="mt-4 text-xl">Instantly deploy your Next.js site to a shareable URL with Vercel.</p>
          </a>
        </div>  
      </main>
    </div>
  );
}
