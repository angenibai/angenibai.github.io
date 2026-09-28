import { useRouter } from "next/router";
import ButtonLink from "./ButtonLink";
import styles from "@/styles/components/Nav.module.css";

interface NavLinksProps {
  className?: string;
}

const NavLinks = ({ className = styles.nav }: NavLinksProps) => {
  const { pathname } = useRouter();

  const getCurrentPage = (pathname: string) => {
    return pathname;
  };

  return (
    <nav className={className}>
      <ButtonLink href="/" isSelected={getCurrentPage(pathname) === "/"}>
        home
      </ButtonLink>
      <ButtonLink
        href="/projects"
        isSelected={getCurrentPage(pathname) === "/projects"}
      >
        projects
      </ButtonLink>
      <ButtonLink
        href="/posts"
        isSelected={getCurrentPage(pathname) === "/posts"}
      >
        posts
      </ButtonLink>
    </nav>
  );
};

export default NavLinks;
