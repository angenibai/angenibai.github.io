import styles from "@/styles/components/ProjectModal.module.css";
import buttonStyles from "@/styles/components/Button.module.css";
import { ProjectContent } from "@/types";
import { MouseEvent, MouseEventHandler } from "react";
import Image from "next/image";

interface ProjectModalProps {
  content: ProjectContent;
  onClose: MouseEventHandler<HTMLDivElement>;
  isOpen?: boolean;
}

const ProjectModal = (props: ProjectModalProps) => {
  const { content, onClose, isOpen } = props;

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose(event);
    }
  };

  return (
    <div
      className={`${styles.modalOverlay} ${isOpen && styles.modalOpen}`}
      onClick={handleOverlayClick}
    >
      <div className={styles.modalPanel}>
        <div className={styles.modalHeader}>
          <div className={styles.projectTitle}>
            <h2 className="invertColor">{content.name}</h2>
          </div>
          <div
            className={`${buttonStyles.button} ${styles.modalCloseButton}`}
            onClick={onClose}
          >
            <span className={styles.modalCloseIcon}>&times;</span>
          </div>
        </div>
        {content.imgSrc && (
          <div className={styles.projectImageDiv}>
            <Image
              className={styles.projectImage}
              src={content.imgSrc}
              alt={`${content.name} image`}
              width={400}
              height={300}
              sizes="400px"
            />
          </div>
        )}
        {content.longDescription && (
          <>
            <div className={styles.detailHeading}>
              <h3 className="invertColor">Detail</h3>
            </div>
            <div
              className={styles.projectDetail}
              dangerouslySetInnerHTML={{
                __html: content.longDescription,
              }}
            />
          </>
        )}
        {content.links && (
          <>
            <div className={styles.detailHeading}>
              <h3 className="invertColor">Links</h3>
            </div>
            <div className={styles.projectLinks}>
              {content.links?.map((link, idx) => (
                <div
                  className={styles.projectLinkRow}
                  key={`project-link-${idx}`}
                >
                  <div className={styles.projectLinkLabel}>
                    <p>{link.label}</p>
                  </div>
                  <div className={styles.projectLinkText}>
                    <p>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.text}
                      </a>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectModal;
