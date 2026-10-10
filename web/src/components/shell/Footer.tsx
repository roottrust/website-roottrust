import Image from "next/image";
import Link from "next/link";
import styles from "./shell.module.css";

export function Footer() {
  return <footer data-frame-cut="1" className={styles.footer}>
    <Image src="/assets/roottrust-horizontal-negativo.svg" width={130} height={28} alt="roottrust" />
    <p className={styles.slogan}>A base que sustenta o crescimento!</p>
    <span aria-hidden="true" className={styles.footerDivider} />
    <nav aria-label="Navegação do rodapé">
      <Link href="/#servicos">Serviços</Link><Link href="/#ferramentas">Ferramentas</Link><Link href="/#newsletter">Newsletter</Link><Link href="/privacidade" prefetch={false}>Privacidade</Link>
    </nav>
    <p className={styles.copyright}>© 2026 Root Trust. Todos os direitos reservados.</p>
  </footer>;
}
