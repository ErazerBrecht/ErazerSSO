import { Component, OnInit, ElementRef, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    private sidebarVisible: boolean;
    private isBrowser: boolean;
    private toggleButton?: Element;

    constructor(@Inject(PLATFORM_ID) private platformId: Object, private renderer: Renderer2, private element: ElementRef) {
        this.sidebarVisible = false;
        this.isBrowser = isPlatformBrowser(this.platformId);
        this.toggleButton = undefined;
    }

    ngOnInit() {
        if (this.isBrowser) {
            const el: HTMLElement = this.element.nativeElement;
            this.toggleButton = el.getElementsByClassName('navbar-toggler')[0];
            const navbar = el.getElementsByTagName('nav')[0];

            this.renderer.listen('window', 'scroll', () => {
                const number = window.scrollY;
                if (number > 150 || window.pageYOffset > 150) {
                    // add logic
                    navbar.classList.remove('navbar-transparent');
                }
                else {
                    // remove logic
                    navbar.classList.add('navbar-transparent');
                }
            });
        }
    }

    sidebarOpen() {
        const html = document.getElementsByTagName('html')[0];

        setTimeout(() => {
            this.toggleButton?.classList.add('toggled');
        }, 500);
        
        html.classList.add('nav-open');
        this.sidebarVisible = true;
    }

    sidebarClose() {
        const html = document.getElementsByTagName('html')[0];
        this.toggleButton?.classList.remove('toggled');
        this.sidebarVisible = false;
        html.classList.remove('nav-open');
    }

    sidebarToggle() {
        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
    }
}
