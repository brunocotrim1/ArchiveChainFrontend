import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-personal-photo',
  template: `
    <div class="photo-container">
      <img src="/assets/images/FotoBruno.png" alt="Bruno Cotrim" class="personal-photo">
      <div class="name-and-link">
        <span class="name-text">Bruno Cotrim</span>
        <a href="https://www.linkedin.com/in/brunocotrim1/" target="_blank" class="linkedin-link">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" class="linkedin-icon">
        </a>
      </div>
      <span class="title-text">MSc. Student Software Engineering at FCUL</span>
    </div>
  `,
  styles: [`
    .photo-container {
      display: flex;
      flex-direction: column; /* Stack items vertically */
      align-items: center;
      justify-content: center;
      background: #FAFAFA;
      border: 1px solid #E5E7EB;
      padding: 1rem; /* Keep padding for a clean look */
      width: 250px; /* Narrow rectangle */
      margin: 0 auto; /* Center horizontally */
      border-radius: 8px; /* Slight rounding */
    }

    .personal-photo {
      width: 150px;
      height: 150px;
      border-radius: 50%; /* Circular photo */
      object-fit: cover;
      margin-bottom: 0.5rem; /* Space below photo */
    }

    .name-and-link {
      display: flex;
      flex-direction: row; /* Name and icon side by side */
      align-items: center;
      justify-content: center;
      gap: 0.75rem; /* Space between name and icon */
      margin-bottom: 0.25rem; /* Space below name/icon row */
    }

    .name-text {
      font-size: 1.2rem;
      font-family: 'Roboto', sans-serif;
      color: #424242;
      font-weight: 500;
    }

    .linkedin-link {
      display: flex;
      align-items: center;
      text-decoration: none;
    }

    .linkedin-icon {
      width: 20;
      height: 20px;
      transition: transform 0.2s ease;
    }

    .linkedin-link:hover .linkedin-icon {
      transform: scale(1.1); /* Hover effect */
    }

    .title-text {
      font-size: 0.9rem; /* Smaller size for title */
      font-family: 'Roboto', sans-serif;
      color: #666666; /* Slightly lighter color for contrast */
      font-weight: 400;
      text-align: center;
    }

    @media (max-width: 768px) {
      .photo-container {
        width: 220px; /* Slightly smaller width */
        padding: 0.75rem;
      }

      .personal-photo {
        width: 120px;
        height: 120px;
        margin-bottom: 0.4rem;
      }

      .name-text {
        font-size: 1.1rem;
      }

      .linkedin-icon {
        width: 20;
        height: 20px;
      }

      .name-and-link {
        gap: 0.6rem;
        margin-bottom: 0.2rem;
      }

      .title-text {
        font-size: 0.85rem;
      }
    }

    @media (max-width: 480px) {
      .photo-container {
        width: 180px; /* Even smaller width */
        padding: 0.5rem;
      }

      .personal-photo {
        width: 100px;
        height: 100px;
        margin-bottom: 0.3rem;
      }

      .name-text {
        font-size: 1rem;
      }

      .linkedin-icon {
        width: 20;
        height: 20px;
      }

      .name-and-link {
        gap: 0.5rem;
        margin-bottom: 0.15rem;
      }

      .title-text {
        font-size: 0.8rem;
      }
    }
  `]
})
export class PersonalPhotoComponent {}