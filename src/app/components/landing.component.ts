import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterModule],
  selector: 'app-landing-page',
  template: `
    <div class="landing-container">
      <!-- Seção de Logo -->
      <div class="logo-section">
        <img src="assets/images/logo.png" alt="Logo ArchiveChain" class="logo">
      </div>

      <!-- Seção de Descrição -->
      <div class="description-section">
        <h1>Arquivar o passado, impulsionar o futuro</h1>
        <p>
          Na era digital, preservar o conteúdo da web é essencial, mas as soluções atuais de blockchain, como o Bitcoin, consomem uma quantidade enorme de energia (164 TWh em 2024, três vezes o consumo de Portugal), contribuindo para a pegada de carbono. Outras, como o Chia, desperdiçam espaço em disco com dados inúteis. O ArchiveChain resolve este problema utilizando as páginas web do Arquivo.pt como prova de espaço útil, criando um blockchain sustentável que é 1000 vezes mais eficiente em termos energéticos do que o Bitcoin. Isto descentraliza o armazenamento, reduz os custos para o Arquivo.pt e recompensa os utilizadores com uma criptomoeda nativa por contribuírem com espaço em disco para arquivar a web, garantindo transparência e acessibilidade
        </p>
      </div>

      <!-- Seção de Opções -->
      <div class="options-section">
        <div class="option-column">
          <h2>Explore o ArchiveChain</h2>
          <p>Descubra como o ArchiveChain utiliza blockchain para arquivar a web de forma sustentável com o Arquivo.pt.</p>
          <a mat-raised-button color="primary" routerLink="/blocks">
            <img src="assets/images/loupe.png" alt="Magnifying Glass" class="magnifying-glass"> Explorar Agora
          </a>
        </div>
        <div class="option-column">
          <h2>Junte-se à Missão</h2>
          <p>Contribua para preservar o património digital juntando-se à nossa comunidade a partir do código aberto no GitHub.</p>
          <a mat-raised-button color="accent" href="https://github.com/brunocotrim1/ArchiveChain" target="_blank">
            <img src="assets/images/github-logo.png" alt="GitHub Logo" class="github-logo"> Participe no GitHub
          </a>
          <a mat-raised-button color="accent" href="https://github.com/brunocotrim1/ArchiveChain/releases/tag/ArchiveChain-1.0_windows" target="_blank" class="download-button">
            <img src="assets/images/windows_logo.png" alt="Linux Icon" class="linux-icon"> Download Windows
          </a>
          <a mat-raised-button color="accent" href="https://github.com/brunocotrim1/ArchiveChain/releases/tag/ArchiveChain-1.0_linux" target="_blank" class="download-button">
            <img src="assets/images/linux_logo.png" alt="Linux Icon" class="linux-icon">  Download Linux
          </a>
        </div>
      </div>

      <!-- Seção de Vídeo -->
      <div class="video-section">
        <h2>Assista à Nossa Apresentação</h2>
        <video controls class="presentation-video">
          <source src="assets/videos/presentation.mp4#t=1" type="video/mp4" poster="assets/images/poster.png" preload="metadata">
          Seu navegador não suporta a tag de vídeo.
        </video>
      </div>

      <!-- Seção de Contribuição -->
      <div class="contribution-section">
        <h2>Com o apoio de:</h2>
        <div class="logo-grid">
        <a href="https://www.fct.pt/" target="_blank">
          <img src="assets/images/fct_logo.png" alt="FCT Logo" class="contrib-logo">
        </a>
        <a href="https://www.ul.pt/" target="_blank">
          <img src="assets/images/ul_logo.png" alt="UL Logo" class="contrib-logo">
        </a>
        <a href="https://www.lasige.pt/" target="_blank">
          <img src="assets/images/lasige_logo.png" alt="LASIGE Logo" class="contrib-logo">
        </a>
        <a href="https://ciencias.ulisboa.pt/" target="_blank">
          <img src="assets/images/fcul_logo.png" alt="FCUL Logo" class="contrib-logo">
        </a>
        <a href="https://www.inesc-id.pt/" target="_blank">
          <img src="assets/images/inesc_logo.png" alt="INESC Logo" class="contrib-logo">
        </a>
        <a href="https://tecnico.ulisboa.pt/pt/" target="_blank">
          <img src="assets/images/ist_logo.png" alt="IST Logo" class="contrib-logo">
        </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Roboto', sans-serif;
      background: #F5F6F5;
      min-height: 100vh;
      padding: 2rem;
      box-sizing: border-box;
    }

    .landing-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3rem;
    }

    .contrib-logo[alt="IST Logo"],
    .contrib-logo[alt="INESC Logo"] {
      transform: scale(0.8);
    }

    .logo-section {
      text-align: center;
    }

    .logo {
      max-width: 600px;
      height: auto;
    }

    .description-section {
      text-align: justify;
      max-width: 800px;
    }

    .description-section h1 {
      font-size: clamp(1.5rem, 5vw, 2.5rem);
      color: rgb(77, 102, 91);
      margin-bottom: 1rem;
    }

    .description-section p {
      font-size: clamp(1rem, 3vw, 1.2rem);
      color: #4A4A4A;
      line-height: 1.6;
    }

    .options-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      width: 100%;
      max-width: 1000px;
    }

    .option-column {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s ease;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .option-column:hover {
      transform: translateY(-5px);
    }

    .option-column h2 {
      font-size: clamp(1.2rem, 4vw, 1.5rem);
      color: rgb(77, 102, 91);
      margin-bottom: 1rem;
    }

    .option-column p {
      font-size: clamp(0.9rem, 3vw, 1rem);
      color: #4A4A4A;
      margin-bottom: 1.5rem;
    }

    .option-column a[mat-raised-button] {
      font-size: clamp(0.8rem, 2.5vw, 0.9rem);
      padding: 0.5rem 1.5rem;
      transition: background-color 0.3s ease;
    }

    .option-column a[color="primary"] {
      background-color: #2F855A;
      color: #FFFFFF;
    }

    .option-column a[color="primary"]:hover {
      background-color: #38A169;
    }

    .option-column a[color="accent"] {
      background-color: #4A4A4A;
      color: #FFFFFF;
    }

    .option-column a[color="accent"]:hover {
      background-color: #6B7280;
    }

    .github-logo, .magnifying-glass, .linux-icon {
      width: 24px;
      height: 24px;
      vertical-align: middle;
      margin-right: 0.5rem;
    }

    .download-button {
      margin-top: 0.5rem;
    }

    .video-section {
      text-align: center;
      width: 100%;
      max-width: 800px;
    }

    .video-section h2 {
      font-size: clamp(1.2rem, 4vw, 1.5rem);
      color: rgb(77, 102, 91);
      margin-bottom: 1rem;
    }

    .presentation-video {
      width: 100%;
      max-width: 800px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .contribution-section {
      text-align: center;
      width: 100%;
      max-width: 1000px;
    }

    .contribution-section h2 {
      font-size: clamp(1.2rem, 4vw, 1.5rem);
      color: rgb(77, 102, 91);
      margin-bottom: 1.5rem;
    }

    .logo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 1.5rem;
      justify-items: center;
      align-items: center;
    }

    .contrib-logo {
      max-width: 160px;
      height: 100px;
      object-fit: contain;
    }

    @media (max-width: 768px) {
      :host {
        padding: 1rem;
      }

      .options-section {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .option-column {
        padding: 1.5rem;
      }

      .presentation-video {
        max-width: 100%;
      }

      .logo-grid {
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 1rem;
      }

      .contrib-logo {
        max-width: 100px;
      }
    }

    @media (max-width: 480px) {
      .logo {
        max-width: 200px;
      }

      .description-section h1 {
        font-size: clamp(1.2rem, 4vw, 1.8rem);
      }

      .description-section p {
        font-size: clamp(0.8rem, 3vw, 1rem);
      }

      .option-column h2 {
        font-size: clamp(1rem, 3.5vw, 1.2rem);
      }

      .option-column p {
        font-size: clamp(0.8rem, 2.5vw, 0.9rem);
      }

      .video-section h2 {
        font-size: clamp(1rem, 3.5vw, 1.2rem);
      }

      .contribution-section h2 {
        font-size: clamp(1rem, 3.5vw, 1.2rem);
      }

      .github-logo, .magnifying-glass, .linux-icon {
        width: 20px;
        height: 20px;
      }

      .logo-grid {
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 0.8rem;
      }

      .contrib-logo {
        max-width: 80px;
      }
    }
  `]
})
export class LandingPageComponent {}