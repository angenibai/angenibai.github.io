import styles from "@/styles/components/ProjectModal.module.css";
import buttonStyles from "@/styles/components/Button.module.css";
import { ProjectContent } from "@/types";
import { MouseEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";

const MAX_IMAGE_WIDTH = 400;
const MAX_IMAGE_HEIGHT = 300;

// Scales the image to fit the maximum size, so its frame is full size before
// the image loads.
const fitImage = (dimensions: ProjectContent["imgDimensions"]) => {
  if (!dimensions) {
    return { width: MAX_IMAGE_WIDTH, height: MAX_IMAGE_HEIGHT };
  }
  const { width, height } = dimensions;
  const scale = Math.min(1, MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height);

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
};

interface ProjectModalProps {
  content: ProjectContent;
  onClose: () => void;
  isOpen?: boolean;
}

const ProjectModal = (props: ProjectModalProps) => {
  const { content, onClose, isOpen } = props;

  const dialogRef = useRef<HTMLDialogElement>(null);

  // Tracks which image loaded, so switching projects shows the loading text again.
  const [loadedSrc, setLoadedSrc] = useState<string>();
  const isImageLoaded = loadedSrc === content.imgSrc;
  const imageDisplaySize = fitImage(content.imgDimensions);

  // Opens the dialog with showModal(), which provides Escape, the focus trap and
  // an inert page behind it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      // Focus starts on the dialog, so Safari doesn't ring the close button.
      dialog.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Only a backdrop click targets the dialog itself, as everything inside it is
  // in .modalPanel.
  const handleDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    // Escape is the keyboard equivalent of a backdrop click, and calls onClose
    // through the dialog's close event.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      className={styles.modalOverlay}
      aria-labelledby="project-modal-title"
      tabIndex={-1}
      onClose={onClose}
      onClick={handleDialogClick}
    >
      <div className={styles.modalPanel}>
        <div className={styles.modalHeader}>
          <div className={styles.projectTitle}>
            <h2 id="project-modal-title" className="invertColor">
              {content.name}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            className={`${buttonStyles.button} ${styles.modalCloseButton}`}
            onClick={onClose}
          >
            <span className={styles.modalCloseIcon}>&times;</span>
          </button>
        </div>
        <div className={styles.modalBody}>
          {content.imgSrc && (
            <div className={styles.projectImageDiv}>
              <div className={styles.projectImageFrame}>
                <Image
                  key={content.imgSrc}
                  className={`${styles.projectImage} ${
                    isImageLoaded ? "" : styles.projectImageLoading
                  }`}
                  src={content.imgSrc}
                  alt={`${content.name} image`}
                  {...imageDisplaySize}
                  sizes={`${imageDisplaySize.width}px`}
                  onLoad={() => setLoadedSrc(content.imgSrc)}
                />
                {!isImageLoaded && (
                  <div className={styles.imageLoading} aria-hidden="true">
                    loading
                  </div>
                )}
              </div>
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
    </dialog>
  );
};

export default ProjectModal;
