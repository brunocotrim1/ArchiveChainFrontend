import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-footer',
  template: `
<footer class="footer">
  <div class="footer-content">
    <div class="footer-row">
      <span class="footer-text">Este projeto contém informação extraída do:</span>
      <a href="https://arquivo.pt" target="_blank" class="footer-link">
        <img src="/assets/images/arquivo-pt-logo.png" alt="Arquivo.pt" class="footer-logo">
      </a>
    </div>
    <div class="footer-row">
      <span class="footer-text">
        Projeto desenvolvido em 2025 por 
        <a href="https://www.linkedin.com/in/brunocotrim1/" target="_blank" class="name-link">Bruno Cotrim</a>,  
        <a href="https://www.di.fc.ul.pt/~blferreira/" target="_blank" class="name-link">Bernardo Ferreira</a>,
        <a href="https://miguelmatos.me/" target="_blank" class="name-link">Miguel Matos</a>
        para o Prémio Arquivo.pt 2025
      </span>
    </div>
  </div>
</footer>

  `,
  styles: [`
    .footer {
      background: #FAFAFA;
      border-top: 1px solid #E5E7EB;
      padding: 0.5rem 1rem; /* Further reduced from 1rem 2rem to 0.5rem 1rem */
      font-family: 'Roboto', sans-serif;
      color: #424242;
      bottom: 0;
      width: 100%;
      z-index: 1000;
      box-sizing: border-box;
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem; /* Further reduced from 0.75rem to 0.25rem */
    }

    .footer-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem; /* Reduced from 1rem to 0.5rem to bring text closer */
    }

    .footer-text {
      font-size: 0.85rem; /* Further reduced from 1rem to 0.85rem */
      font-weight: 400;
    }

    .footer-link {
      display: flex;
      align-items: center;
      text-decoration: none;
    }

    .footer-logo {
      height: 80px; /* Unchanged */
      width: auto;
      transition: transform 0.2s ease;
    }

    .footer-link:hover .footer-logo {
      transform: scale(1.05);
    }

    .name-link {
      color: #66BB6A;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .name-link:hover {
      color: #81C784;
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .footer {
        padding: 0.4rem 1rem; /* Further reduced from 0.75rem 1.5rem */
      }

      .footer-text {
        font-size: 0.8rem; /* Further reduced from 0.95rem */
      }

      .footer-logo {
        height: 60px; /* Unchanged */
      }

      .footer-content {
        gap: 0.2rem; /* Further reduced from 0.5rem */
      }

      .footer-row {
        gap: 0.4rem; /* Reduced from default to bring text closer */
      }
    }

    @media (max-width: 480px) {
      .footer {
        padding: 0.3rem 0.75rem; /* Further reduced from 0.5rem 1rem */
      }

      .footer-content {
        gap: 0.15rem; /* Further reduced from 0.25rem */
      }

      .footer-row {
        flex-direction: column;
        text-align: center;
        gap: 0.3rem; /* Reduced from 0.5rem */
      }

      .footer-text {
        font-size: 0.75rem; /* Further reduced from 0.85rem */
      }

      .footer-logo {
        height: 48px; /* Unchanged */
      }
    }
  `]
})
export class FooterComponent {}