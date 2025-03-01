import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

type ButtonVariant = 'default' | 'primary' | 'outline' | 'danger' | 'link';
type ButtonSize = 'small' | 'medium' | 'large';

// https://primer-docs-preview.github.com/product/components/button
@Component({
  selector: 'app-button',
  imports: [NgClass],
  template: `
    <button [ngClass]="buttonClasses" [disabled]="disabled()" (click)="onClick($event)">
      <ng-content></ng-content>
    </button>
  `,
  styleUrl: './button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('default');
  size = input<ButtonSize>('medium');
  disabled = input<boolean>(false);

  clicked = output<Event>();

  get buttonClasses(): string {
    let baseClasses =
      'inline-flex items-center justify-center font-medium rounded transition duration-150 ease-in-out ' +
      'focus:outline-none focus:ring-2 focus:ring-offset-2';

    if (this.disabled()) {
      baseClasses += ' opacity-50 cursor-not-allowed';
    } else {
      baseClasses += ' cursor-pointer';
    }

    let variantClasses = '';
    switch (this.variant()) {
      case 'primary':
        variantClasses =
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 ' +
          'dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400';
        break;
      case 'outline':
        variantClasses =
          'border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-500 ' +
          'dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-gray-400';
        break;
      case 'danger':
        variantClasses =
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 ' +
          'dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-400';
        break;
      case 'link':
        variantClasses =
          'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 ' +
          'dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-gray-400';
        break;
      default:
        variantClasses = 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500';
        break;
    }

    let sizeClasses = '';
    switch (this.size()) {
      case 'small':
        sizeClasses = 'px-2 py-1 text-sm';
        break;
      case 'large':
        sizeClasses = 'px-6 py-3 text-lg';
        break;
      default:
        sizeClasses = 'px-4 py-2 text-base';
        break;
    }

    return `${baseClasses} ${variantClasses} ${sizeClasses}`;
  }

  onClick(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    this.clicked.emit(event);
  }
}
