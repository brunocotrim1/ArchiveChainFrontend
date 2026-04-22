import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../services/translation.service';

@Directive({
  selector: '[appAutoTranslate]',
  standalone: true
})
export class AutoTranslateDirective implements OnInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly translationService = inject(TranslationService);

  private readonly originalText = new WeakMap<Text, string>();
  private readonly originalAttributes = new WeakMap<Element, Map<string, string>>();

  private observer?: MutationObserver;
  private languageSubscription?: Subscription;
  private isApplyingTranslation = false;

  ngOnInit(): void {
    this.applyTranslations(document.body);

    this.languageSubscription = this.translationService.languageChanges.subscribe(() => {
      this.applyTranslations(document.body);
    });

    this.observer = new MutationObserver((mutations) => {
      if (this.isApplyingTranslation) {
        return;
      }

      if (mutations.length > 0) {
        this.applyTranslations(document.body);
      }
    });

    this.observer.observe(this.host.nativeElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-label', 'title', 'placeholder', 'alt']
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-label', 'title', 'placeholder', 'alt']
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.languageSubscription?.unsubscribe();
  }

  private applyTranslations(root: HTMLElement): void {
    this.isApplyingTranslation = true;

    try {
      this.translateTextNodes(root);
      this.translateElementAttributes(root);
    } finally {
      this.isApplyingTranslation = false;
    }
  }

  private translateTextNodes(root: HTMLElement): void {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let currentNode = walker.nextNode();

    while (currentNode) {
      const textNode = currentNode as Text;
      const parent = textNode.parentElement;

      if (parent && !['SCRIPT', 'STYLE'].includes(parent.tagName)) {
        const currentText = textNode.textContent ?? '';
        const currentTrimmed = currentText.trim();

        // Skip empty/non-linguistic nodes to avoid clobbering dynamic Angular bindings.
        if (!/[A-Za-z\u00C0-\u00FF]/.test(currentTrimmed)) {
          currentNode = walker.nextNode();
          continue;
        }

        if (!this.originalText.has(textNode)) {
          this.originalText.set(textNode, currentText);
        }

        const source = this.originalText.get(textNode) ?? currentText;

        const translated = this.translationService.translateText(source);

        if (translated !== currentText) {
          textNode.textContent = translated;
        }
      }

      currentNode = walker.nextNode();
    }
  }

  private translateElementAttributes(root: HTMLElement): void {
    const elements = root.querySelectorAll('*');

    elements.forEach((element) => {
      const attributesToTranslate = ['aria-label', 'title', 'placeholder', 'alt'];

      attributesToTranslate.forEach((attributeName) => {
        const attributeValue = element.getAttribute(attributeName);

        if (!attributeValue) {
          return;
        }

        let originalMap = this.originalAttributes.get(element);

        if (!originalMap) {
          originalMap = new Map<string, string>();
          this.originalAttributes.set(element, originalMap);
        }

        if (!originalMap.has(attributeName)) {
          originalMap.set(attributeName, attributeValue);
        }

        const source = originalMap.get(attributeName) ?? attributeValue;
        const translated = this.translationService.translateText(source);

        if (translated !== attributeValue) {
          element.setAttribute(attributeName, translated);
        }
      });
    });
  }
}
