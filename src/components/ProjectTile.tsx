import styles from "@/styles/components/ProjectGrid.module.css";
import { ProjectContent } from "@/types";
import { MouseEventHandler } from "react";
import ButtonLink from "./ButtonLink";
import Image from "next/image";

interface ProjectPanelTileProps {
  content: ProjectContent;
  isExpanded: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
  close: MouseEventHandler<HTMLDivElement>;
}

const defaultTileContent = {
  name: "a project i did",
  shortDescription: "this is a short description on the project i did",
  longDescription: "Stack:\n- Next.js",
  tags: ["web-dev"],
};

const ProjectTile = (props: ProjectPanelTileProps) => {
  const { content, isExpanded, onClick } = props;

  // TODO: tag section, image for expanded, more buttons for expanded, close button, animation for expansion and contraction

  return (
    <>
      <div
        className={`${styles.projectTile} ${isExpanded && styles.isSelected}`}
        onClick={onClick}
      >
        <div className={styles.tileContent}>
          <div className={styles.tileHeader}>
            <h2>{content.name}</h2>
          </div>
          <div className={styles.tileDescription}>
            <p>{content.shortDescription}</p>
          </div>
        </div>
      </div>
      <div
        className={`${styles.fullWidthTile} ${
          !isExpanded && styles.displayNone
        }`}
      >
        <div className={styles.tileContent}>
          <div className={styles.fullWidthHeader}>
            <h2>{content.name}</h2>
          </div>
          {content.imgSrc && (
            <div className={styles.tileImageDiv}>
              <Image
                src={content.imgSrc}
                alt={`${content.name} image`}
                width={300}
                height={170}
              />
            </div>
          )}
          {content.longDescription && (
            <div
              className={styles.fullWidthDescription}
              dangerouslySetInnerHTML={{ __html: content.longDescription }}
            ></div>
          )}
          <div className={styles.fullWidthFooter}>
            {content.siteLink && (
              <ButtonLink href={content.siteLink} external={true}>
                Site
              </ButtonLink>
            )}
            {content.repoLink && (
              <ButtonLink href={content.repoLink} external={true}>
                Repo
              </ButtonLink>
            )}
            {content.blogLink && (
              <ButtonLink href={content.blogLink}>Blog</ButtonLink>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectTile;
