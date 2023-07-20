import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import Nav from "@/components/Nav";

export default function Home() {
  return (
    <>
      <Head>
        <title>Angeni Bai</title>
        <meta name="description" content="Angeni's website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={``}>
        <h1>home</h1>
      </main>
    </>
  );
}
