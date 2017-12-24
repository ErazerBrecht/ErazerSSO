import { Ng1StateDeclaration } from 'angular-ui-router';

export class FooterComponent implements ng.IComponentOptions {
    controller: ng.IControllerConstructor;
    template: string;

    constructor() {
        this.controller = FooterController;
        this.template = require('./footer.template.html');
    }
}

class FooterController implements ng.IComponentController {
    constructor() {
        "ngInject";
    }

    $onInit() {
       
    }
}