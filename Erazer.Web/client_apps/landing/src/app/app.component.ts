import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    //@ViewChild(NavbarComponent) navbar: NavbarComponent;

    constructor() { }

    ngOnInit() {
        // var navbar: HTMLElement = this.element.nativeElement.children[0].children[0];

        // this.renderer.listenGlobal('window', 'scroll', (event) => {
        //     const number = window.scrollY;
        //     if (number > 150 || window.pageYOffset > 150) {
        //         // add logic
        //         navbar.classList.remove('navbar-transparent');
        //     } else {
        //         // remove logic
        //         navbar.classList.add('navbar-transparent');
        //     }
        // });
    }
}
