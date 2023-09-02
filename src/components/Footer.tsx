import styles from "@/styles/components/Footer.module.css";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Footer = () => {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerBox}>
        <div className={styles.textBox}>
          <p>© angeni bai</p>
        </div>
        <div className={styles.linksBox}>
          <a href="https://github.com/angenibai" target="_blank">
            <FontAwesomeIcon icon={faGithub} className={styles.icon} />
          </a>
          <a href="https://linkedin.com/in/angeni-bai" target="_blank">
            <FontAwesomeIcon icon={faLinkedin} className={styles.icon} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
