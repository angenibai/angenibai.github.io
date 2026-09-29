import styles from "@/styles/components/BioPanel.module.css";
import { BioContent } from "@/types";
import Image from "next/image";

interface BioPanelProps {
  content: BioContent;
}

const BioPanel = ({ content }: BioPanelProps) => {
  return (
    <div className={styles.bioPanel}>
      <div className={styles.bioPanelContent}>
        <div
          className={`${styles.bioPanelHeader} ${styles.bioPanelTitleHeader}`}
        >
          <h2 className="invertColor">{content.heading}</h2>
        </div>
        <div className={styles.bioPanelImgFrame}>
          {content.img ? (
            <Image src={content.img} alt={content.heading} placeholder="blur" />
          ) : (
            <div className={styles.bioPanelImgPlaceholder}>
              <p>{"loading..."}</p>
            </div>
          )}
        </div>
        {content.sections.map((section, idx) => {
          return (
            <div className={styles.bioPanelSection} key={`section-${idx}`}>
              {section.title && (
                <div
                  className={`${styles.bioPanelHeader} ${styles.bioPanelSectionHeader}`}
                >
                  <h3 className="invertColor">{section.title}</h3>
                </div>
              )}
              <div className={styles.bioPanelSectionContent}>
                {section.entries.map((entry, idx) => {
                  return (
                    <div
                      className={styles.bioPanelSectionEntry}
                      key={`entry-${idx}`}
                    >
                      <div className={styles.bioPanelSectionEntryLabel}>
                        <p>{entry.label}</p>
                      </div>
                      <div className={styles.bioPanelSectionEntryValue}>
                        <p dangerouslySetInnerHTML={{ __html: entry.value }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BioPanel;

