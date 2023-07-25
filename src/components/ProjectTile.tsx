import styles from "@/styles/components/ProjectGrid.module.css";
import { ProjectContent } from "@/types";
import { MouseEventHandler } from "react";

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
            {typeof content.shortDescription === "string" ? (
              <p>{content.shortDescription}</p>
            ) : (
              content.shortDescription
            )}
          </div>
        </div>
      </div>
      <div
        className={`${styles.fullWidthTile} ${!isExpanded && styles.isHidden}`}
      >
        <div className={styles.tileContent}>
          <div className={styles.fullWidthHeader}>
            <h2>{content.name}</h2>
          </div>
          <div className={styles.fullWidthDescription}>
            {typeof content.longDescription === "string" ? (
              <p>{content.longDescription}</p>
            ) : (
              content.longDescription
            )}
          </div>
          <div className={styles.fullWidthFooter}></div>
        </div>
      </div>
    </>
  );
};

export default ProjectTile;
